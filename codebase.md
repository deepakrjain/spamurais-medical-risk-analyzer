# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

```

# backend\app.py

```py
import os
import json
import logging
import warnings
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, NamedTuple
from functools import lru_cache
import sys

import speech_recognition as sr
import google.generativeai as genai
import torch
import torch.nn.functional as F
import requests
import firebase_admin
from firebase_admin import credentials, db
from transformers import AutoTokenizer, AutoModel

from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings("ignore")

# ---------------------------
# Speech to Text Functionality
# ---------------------------
def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening... Please describe your symptoms.")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=10)
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return None
        except sr.RequestError:
            print("Could not request results, please check your internet connection.")
            return None

# ---------------------------
# Configuration
# ---------------------------
GEMINI_API_KEY = "AIzaSyBXhmG_ysIXPNDliA8EDWwRAO8FrUzMh7k"
FIREBASE_CRED_PATH = "C:\\Users\\Deepak\\Downloads\\medicalriskanalyzer-5c37e4bd5968.json"
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
FINAL_SYMPTOM_THRESHOLD = 5
CACHE_SIZE = 1024
QUANTIZE_MODEL = False

MEDICAL_APIS = {
    "cdc_guidelines": "https://data.cdc.gov/resource/9mfq-cb36.json",
    "who_guidelines": "https://ghoapi.azureedge.net/api/Indicator",
    "drug_search": "https://rxnav.nlm.nih.gov/REST/rxcui.json",
    "drug_interactions": "https://rxnav.nlm.nih.gov/REST/interaction/list.json"
}

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
gemini = genai.GenerativeModel("gemini-pro")

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred, {'databaseURL': 'https://medicalriskanalyzer-default-rtdb.firebaseio.com'})
logging.info("Firebase initialized successfully")

# ---------------------------
# Data Classes and Enums
# ---------------------------
class Severity(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class DiseaseProbability(NamedTuple):
    name: str
    probability: float
    description: str
    severity: Severity

    @classmethod
    def from_dict(cls, data: Dict) -> "DiseaseProbability":
        return cls(
            name=data["disease_name"],
            probability=float(data["probability"]),
            description=data["description"],
            severity=Severity(data["severity"].lower())
        )

@dataclass
class ConsultationState:
    symptoms: List[str] = field(default_factory=list)
    asked_questions: List[str] = field(default_factory=list)
    potential_diagnoses: List[Dict] = field(default_factory=list)
    risk_level: str = "low"
    confidence: float = 0.0
    clinical_context: Dict = field(default_factory=dict)
    patient_info: Dict = field(default_factory=dict)
    conversation_history: List[Dict] = field(default_factory=list)

    def add_symptom(self, symptom: str) -> None:
        cleaned = symptom.strip()
        self.symptoms.append(cleaned)
        logging.info(f"Added symptom: {cleaned}")

# ---------------------------
# Guideline Integrator
# ---------------------------
class GuidelineIntegrator:
    def __init__(self):
        self.guideline_cache = {}

    def get_cdc_guidelines(self, symptoms: List[str]) -> List[Dict]:
        try:
            response = requests.get(
                MEDICAL_APIS["cdc_guidelines"],
                params={"$where": f"LOWER(sex) LIKE '%{symptoms[0].lower()}%'"},
                timeout=10
            )
            return response.json()[:3] if response.ok else []
        except Exception as e:
            logging.error(f"CDC API Error: {e}")
            return []

    def get_who_guidelines(self, symptoms: List[str]) -> List[Dict]:
        try:
            response = requests.get(
                MEDICAL_APIS["who_guidelines"],
                params={"$filter": f"contains(IndicatorName, '{symptoms[0]}')"},
                timeout=15
            )
            return response.json().get("value", [])[:3] if response.ok else []
        except Exception as e:
            logging.error(f"WHO API Error: {e}")
            return []

    def get_rxcui(self, drug_name: str) -> Optional[str]:
        try:
            response = requests.get(
                MEDICAL_APIS["drug_search"],
                params={"name": drug_name},
                timeout=10
            )
            return response.json().get("idGroup", {}).get("rxnormId", [None])[0]
        except Exception as e:
            logging.error(f"RxNorm API Error: {e}")
            return None

    def check_drug_interactions(self, drugs: List[str]) -> Optional[Dict]:
        try:
            rxcuis = [self.get_rxcui(d) for d in drugs]
            valid_rxcuis = [r for r in rxcuis if r is not None]
            if not valid_rxcuis:
                return None
            response = requests.get(
                MEDICAL_APIS["drug_interactions"],
                params={"rxcuis": ",".join(valid_rxcuis)},
                timeout=15
            )
            return response.json() if response.ok else None
        except Exception as e:
            logging.error(f"Drug Interaction API Error: {e}")
            return None

# ---------------------------
# Medical Reasoner
# ---------------------------
class MedicalReasoner:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = self._load_quantized_model()
        self.model.eval()
        self.guideline_client = GuidelineIntegrator()
        self.condition_map = {
            "cardiac": [
                "chest pain/pressure", "shortness of breath (SOB)", "palpitations", 
                "diaphoresis", "radiating arm pain", "syncope", "orthopnea", "edema"
            ],
            "respiratory": [
                "productive cough", "hemoptysis", "wheezing", "tachypnea", 
                "pleuritic pain", "hypoxia", "cyanosis", "sputum production"
            ],
            "gastrointestinal": [
                "epigastric pain", "hematochezia", "melena", "dysphagia", 
                "jaundice", "abdominal distension", "rebound tenderness", 
                "blood in stool"
            ],
            "neurological": [
                "thunderclap headache", "photophobia", "hemiparesis", "ataxia",
                "aphasia", "vertigo", "tinnitus", "seizure activity"
            ],
            "endocrine": [
                "polyuria", "polydipsia", "heat intolerance", "cold intolerance",
                "unintended weight loss", "buffalo hump", "moon facies", 
                "extremity swelling"
            ],
            "musculoskeletal": [
                "joint erythema", "reduced ROM", "crepitus", "myalgia",
                "back stiffness", "trigger points", "joint instability", 
                "morning stiffness"
            ],
            "infectious": [
                "fever of unknown origin (FUO)", "night sweats", "lymphadenopathy",
                "purulent discharge", "malaise", "rigors", "travel history", 
                "animal exposure"
            ],
            "dermatological": [
                "erythema migrans", "target lesions", "petechiae", "urticaria",
                "vesicular rash", "pustules", "ecchymosis", "skin necrosis"
            ],
            "hematological": [
                "pallor", "easy bruising", "blood in urine", "menorrhagia",
                "fatigue", "splenomegaly", "petechiae", "bone pain"
            ]
        }

    def _load_quantized_model(self):
        model = AutoModel.from_pretrained(MODEL_NAME)
        if QUANTIZE_MODEL:
            model = torch.quantization.quantize_dynamic(
                model,
                {torch.nn.Linear},
                dtype=torch.qint8
            )
        return model.to(DEVICE)

    @lru_cache(maxsize=CACHE_SIZE)
    def _get_cached_embedding(self, text: str) -> torch.Tensor:
        inputs = self.tokenizer(
            text,
            max_length=64,
            padding='max_length',
            truncation=True,
            return_tensors="pt"
        ).to(DEVICE)
        with torch.no_grad(), torch.cuda.amp.autocast():
            outputs = self.model(**inputs)
        return F.max_pool1d(
            outputs.last_hidden_state.transpose(1, 2),
            kernel_size=outputs.last_hidden_state.size(1)
        ).squeeze()

    def get_relevant_guidelines(self, symptoms: List[str]) -> Dict:
        guidelines = {
            "cdc": self.guideline_client.get_cdc_guidelines(symptoms),
            "who": self.guideline_client.get_who_guidelines(symptoms),
            "drug_interactions": None
        }
        drugs = [s for s in symptoms if any(word in s for word in ["mg", "g", "ml", "tablet"])]
        if drugs:
            guidelines["drug_interactions"] = self.guideline_client.check_drug_interactions(drugs)
        return guidelines

    def calculate_confidence(self, symptoms: List[str], context: str) -> float:
        symptom_embeddings = [self._get_cached_embedding(s[:128]) for s in symptoms]
        if not symptom_embeddings:
            return 0.0
        avg_embedding = torch.mean(torch.stack(symptom_embeddings), dim=0)
        guideline_score = 0.4 if any(self.get_relevant_guidelines(symptoms).values()) else 0
        symptom_coherence = torch.std(avg_embedding).item()
        return min(
            0.4 * guideline_score +
            0.3 * (len(symptoms) / 5) +
            0.3 * (1 - symptom_coherence),
            1.0
        )

    def generate_differential(self, symptoms: List[str]) -> List[Dict]:
        symptom_embeddings = {s: self._get_cached_embedding(s) for s in symptoms}
        differentials = []
        for condition, keywords in self.condition_map.items():
            keyword_embeddings = [self._get_cached_embedding(k) for k in keywords]
            sim_matrix = torch.cdist(
                torch.stack(list(symptom_embeddings.values())),
                torch.stack(keyword_embeddings)
            )
            max_sim = torch.max(1 - sim_matrix).item()
            if max_sim > 0.6:
                differentials.append({
                    "condition": condition,
                    "confidence": min(max_sim * 1.2, 0.95),
                    "key_symptoms": [symptoms[i] for i in torch.argmin(sim_matrix, dim=0)]
                })
        return sorted(differentials, key=lambda x: x["confidence"], reverse=True)[:5]

# ---------------------------
# Medical Assistant
# ---------------------------
class MedicalAssistant:
    def __init__(self):
        self.reasoner = MedicalReasoner()
    
    def process_input(self, text: str, state: ConsultationState) -> Tuple[str, str, float, bool]:
        text = text.strip().lower()
        if not text:
            return "Please describe your symptoms.", "What symptoms are you experiencing?", 0.0, False
        state.add_symptom(text)
        state.potential_diagnoses = self.reasoner.generate_differential(state.symptoms)
        state.confidence = self.reasoner.calculate_confidence(state.symptoms, f"Symptoms: {state.symptoms}")
        if len(state.symptoms) >= FINAL_SYMPTOM_THRESHOLD:
            return self._generate_final_assessment(state), "", state.confidence, True
        else:
            return (
                self._generate_response(state),
                self._generate_question(state),
                state.confidence,
                False
            )

    def _generate_final_assessment(self, state: ConsultationState) -> str:
        guidelines = self.reasoner.get_relevant_guidelines(state.symptoms)
        prompt = f"""**Final Differential Diagnosis**
Patient: {state.patient_info['age']}yo {state.patient_info['gender']}
Symptoms: {', '.join(state.symptoms)}

Generate EXACTLY 4 diagnoses. For each diagnosis, provide an exact percentage risk between 1-100%.

Output Format:
• Diagnosis 1: {{Condition}} ({{X}}%)
  - Key Features: {{Features}}
• Diagnosis 2: {{Condition}} ({{Y}}%)
  - Key Features: {{Features}}
• Diagnosis 3: {{Condition}} ({{Z}}%)
  - Key Features: {{Features}}
• Diagnosis 4: {{Condition}} ({{W}}%)
  - Key Features: {{Features}}

Rules:
1. MUST provide exactly 4 diagnoses
2. Each diagnosis MUST include a numerical percentage
3. Percentages should sum to approximately 100%
4. Use medical abbreviations where appropriate
5. List most likely diagnosis first, descending order of probability
"""
        try:
            response = gemini.generate_content(prompt)
            return self._clean_response(response.text)
        except Exception as e:
            logging.error(f"Gemini Error: {e}")
            return "Critical: Requires immediate medical evaluation."

    def _generate_response(self, state: ConsultationState) -> str:
        guidelines = self.reasoner.get_relevant_guidelines(state.symptoms)
        prompt = f"""**Clinical Analysis Template**
Patient: {state.patient_info['age']}yo {state.patient_info['gender']}
Symptoms: {', '.join(state.symptoms[-3:])}

Required Output Format:
[LIKELY CONDITIONS]
1. {{Condition}} ({{confidence}}%)
2. {{Condition}} ({{confidence}}%)

[IMMEDIATE ACTIONS]
- {{Action}}
- {{Action}}

[RED FLAGS]
! {{Warning}}
! {{Warning}}

Guidelines:
- CDC: {json.dumps(guidelines['cdc'])[:300]}
- WHO: {json.dumps(guidelines['who'])[:300]}
"""
        try:
            response = gemini.generate_content(prompt)
            return self._clean_response(response.text)
        except Exception as e:
            logging.error(f"Gemini Error: {e}")
            return "Urgent: Consult a healthcare professional immediately."

    def _generate_question(self, state: ConsultationState) -> str:
        prompt = f"""Generate ONE follow-up question based on:
Symptoms: {state.symptoms}
Previous Questions: {state.asked_questions[-2:]}

Format: 
[QUESTION] {{Clear, concise clinical question}}"""
        try:
            response = gemini.generate_content(prompt)
            return self._clean_question(response.text)
        except Exception as e:
            logging.error(f"Gemini Error: {e}")
            return "Any additional symptoms?"

    def _clean_response(self, text: str) -> str:
        text = text.replace("**", "").replace("__", "").strip()
        lines = []
        counter = 0
        for line in text.split('\n'):
            if line.strip().startswith(('-', '•', '!', '[', '1.', '2.', '3.')):
                lines.append(line.strip())
                counter += 1
            if counter >= 6:
                break
        return '\n'.join(lines[:6])

    def _clean_question(self, text: str) -> str:
        if '[QUESTION]' in text:
            return text.split('[QUESTION]')[-1].strip().strip('"')
        return text.strip().strip('"')

# ---------------------------
# Flask API Endpoint (for React Integration)
# ---------------------------
app = Flask(__name__)
CORS(app)

assistant = MedicalAssistant()  # Global instance for API use

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    text = data.get("text", "")
    state_data = data.get("state", {})
    state = ConsultationState(
        symptoms=state_data.get("symptoms", []),
        asked_questions=state_data.get("asked_questions", []),
        potential_diagnoses=state_data.get("potential_diagnoses", []),
        risk_level=state_data.get("risk_level", "low"),
        confidence=state_data.get("confidence", 0.0),
        clinical_context=state_data.get("clinical_context", {}),
        patient_info=state_data.get("patient_info", {}),
        conversation_history=state_data.get("conversation_history", [])
    )
    response_text, question, conf, finalized = assistant.process_input(text, state)
    updated_state = {
        "symptoms": state.symptoms,
        "asked_questions": state.asked_questions,
        "potential_diagnoses": state.potential_diagnoses,
        "risk_level": state.risk_level,
        "confidence": state.confidence,
        "clinical_context": state.clinical_context,
        "patient_info": state.patient_info,
        "conversation_history": state.conversation_history
    }
    return jsonify({
        "assessment": response_text,
        "question": question,
        "confidence": conf,
        "finalized": finalized,
        "updatedState": updated_state
    })

# ---------------------------
# CLI Main Functionality
# ---------------------------
def main():
    print("Welcome to the Advanced Medical Assistant CLI")
    print("Type 'exit' to quit.\n")

    state = ConsultationState(
        symptoms=[],
        asked_questions=[],
        potential_diagnoses=[],
        risk_level="low",
        confidence=0.0,
        clinical_context={},
        patient_info={}
    )

    # Collect initial patient info with validation
    required_fields = {
        "age": lambda x: x.isdigit() and 0 <= int(x) <= 120,
        "gender": lambda x: x.lower() in ["male", "female", "other"],
        "medical_history": lambda x: len(x) > 0
    }

    for field, validator in required_fields.items():
        while True:
            value = input(f"{field.replace('_', ' ').title()}: ")
            if validator(value):
                state.patient_info[field] = value
                break
            print(f"Invalid {field}. Please try again.")

    assistant_cli = MedicalAssistant()

    while True:
        use_speech = input("Would you like to describe your symptoms using speech? (yes/no): ").strip().lower()
        if use_speech == "yes":
            user_input = speech_to_text()
            if user_input is None:
                continue
        else:
            user_input = input("\nDescribe your symptoms: ")
        if user_input.strip().lower() == "exit":
            print("Exiting. Stay safe!")
            break

        try:
            response, question, conf, finalized = assistant_cli.process_input(user_input, state)
            print("\nMedical Assessment:")
            print(response)
            if not finalized:
                print("\nFollow-Up Question:")
                print(question)
            print(f"\nAnalysis Confidence: {conf:.2f}")
            print("\nPotential Diagnoses:", state.potential_diagnoses)
            print("\n" + "-" * 80 + "\n")

            if finalized:
                print("Final assessment generated. Consultation complete.")
                break
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            print("An error occurred. Please try again.")

# ---------------------------
# Entry Point
# ---------------------------
if __name__ == "__main__":
    # Run in Flask server mode if "server" argument is provided, else run CLI
    if len(sys.argv) > 1 and sys.argv[1] == "server":
        app.run(port=5000, debug=True)
    else:
        main()
```

# index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

# package.json

```json
{
  "name": "medical-risk-analyzer",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^13.5.0",
    "apexcharts": "^4.5.0",
    "autoprefixer": "^10.4.20",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.475.0",
    "postcss": "^8.5.3",
    "react": "^19.0.0",
    "react-apexcharts": "^1.7.0",
    "react-dom": "^19.0.0",
    "react-icons": "^4.12.0",
    "react-router-dom": "^7.2.0",
    "recharts": "^2.15.1",
    "sass": "^1.85.0",
    "vite": "^4.4.9",
    "@vitejs/plugin-react": "^4.0.3",
    "tailwindcss": "^3.3.3",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest",
      "plugin:jsx-a11y/recommended"
    ],
    "rules": {
      "jsx-a11y/anchor-is-valid": "off"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.1.1"
  }
}
```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

# public\favicon.ico

This is a binary file of the type: Binary

# public\logo192.png

This is a binary file of the type: Image

# public\logo512.png

This is a binary file of the type: Image

# public\manifest.json

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```

# public\robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

# README.md

```md
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```

# src\App.css

```css
/* .App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
} */

```

# src\App.jsx

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Assessment from './components/Assessment';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

# src\App.test.js

```js
// import { render, screen } from '@testing-library/react';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

```

# src\components\Assessment.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../style.css";
import Navbar from './Navbar'; // Import Navbar component

// Function to parse text and replace *text* with <strong>text</strong>
const formatMessageContent = (content) => {
    const parts = content.split(/(\*[^*]+\*)/g); // Split by text between asterisks
    return parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            // Remove asterisks and wrap in <strong> for bold
            const boldText = part.slice(1, -1);
            return <strong key={index}>{boldText}</strong>;
        }
        return part; // Return non-bold parts as is
    });
};

const Assessment = () => {
    const [input, setInput] = useState('');
    const [conversation, setConversation] = useState([]);
    const [state, setState] = useState({
        symptoms: [],
        askedQuestions: [],
        riskLevel: 'low'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/process-input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: input,
                    state: state
                }),
            });

            const data = await response.json();

            setConversation(prev => [
                ...prev,
                { type: 'user', content: input },
                { type: 'assessment', content: data.assessment },
                { type: 'question', content: data.question }
            ]);

            setState(data.state);
            setInput('');
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="webcrumbs">
          <Navbar />

            {/* Title and Subtitle in a Blue Box */}
            <div className="heading-box mb-8">
                <h2>AI Symptom Assessment</h2>
                <p>Describe your symptoms for a personalized risk analysis</p>
            </div>

            {/* Main Content */}
            <main className="content-container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Fixed Current Risk Level Indicator */}
                <div className={`fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg text-center text-xl font-semibold ${state.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    state.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    Current Risk Level: <span className="capitalize">{state.riskLevel}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="conversation-container space-y-6 mb-6">
                        {conversation.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-lg">
                                Start by describing your symptoms below...
                            </div>
                        )}

                        {conversation.map((msg, index) => (
                            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-4 rounded-lg mb-4 ${msg.type === 'user'
                                    ? 'message-user bg-blue-600 text-white'
                                    : 'message-ai bg-gray-100 text-gray-800'
                                    }`}>
                                    {msg.type === 'assessment' && (
                                        <div className="mb-2 flex items-center gap-2 text-blue-600">
                                            <span className="material-symbols-outlined">clinical_notes</span>
                                            <span className="font-semibold">Assessment:</span>
                                        </div>
                                    )}
                                    {msg.type === 'question' && (
                                        <div className="mb-2 flex items-center gap-2 text-gray-600">
                                            <span className="material-symbols-outlined">contact_support</span>
                                            <span className="font-semibold">Follow-up Question:</span>
                                        </div>
                                    )}
                                    <p className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}>
                                        {formatMessageContent(msg.content)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="loading-indicator flex justify-start">
                                <div className="max-w-[70%] p-4 bg-gray-100 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <div className="animate-pulse">⚕️</div>
                                        <span>Analyzing your symptoms...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="input-container bg-gray-50 rounded-xl p-2 flex gap-2 shadow-md">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="input-field flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            placeholder="Describe your symptoms here..."
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="submit-button bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            disabled={isLoading}
                        >
                            <span className="material-symbols-outlined">send</span>
                            {isLoading ? 'Analyzing...' : 'Send'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Assessment;
```

# src\components\Dashboard.jsx

```jsx
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import Navbar from './Navbar'; // Import Navbar component
import { db } from '../firebase.js'; // Assume you have set up Firebase correctly
import "../style.css";

// Function to fetch data from Firebase
const fetchRiskData = async () => {
  try {
    const snapshot = await db.collection('riskData').get(); // Assuming you store your risk data in a 'riskData' collection
    const data = snapshot.docs.map(doc => doc.data());
    return data;
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    return [];
  }
};

export default function Dashboard() {
  const [riskData, setRiskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRiskData = async () => {
      const data = await fetchRiskData();
      setRiskData(data);
      setIsLoading(false);
    };
    getRiskData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
      },
    },
    xaxis: {
      categories: riskData.map(item => item.disease),
    },
    yaxis: {
      title: {
        text: 'Risk Percentage',
      },
    },
    colors: ['#2563eb'], // Blue color for the bars
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
  };

  const chartSeries = [
    {
      name: 'Risk Percentage',
      data: riskData.map(item => item.riskPercentage),
    },
  ];

  const handlePrintReport = () => {
    const reportContent = `
      Medical Risk Analyzer Report
      Date: ${new Date().toLocaleDateString()}
      Diseases and Risk Percentages:
      ${riskData.map(item => `${item.disease}: ${item.riskPercentage}%`).join('\n')}
    `;
    const printWindow = window.open();
    printWindow.document.write('<pre>' + reportContent + '</pre>');
    printWindow.print();
  };

  return (
    <div id="webcrumbs">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="dashboard-header mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Medical Risk Analyzer Dashboard</h1>
        </header>

        {/* Main Content */}
        <main className="dashboard-content space-y-6">
          {/* Risk Data Bar Chart */}
          <div className="card bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment by Disease</h2>
            {isLoading ? (
              <div className="loading-indicator text-center py-8 text-gray-500">Loading data...</div>
            ) : (
              <Chart
                type="bar"
                height={350}
                options={chartOptions}
                series={chartSeries}
              />
            )}
          </div>

          {/* Print Report Button */}
          <div className="card bg-white p-6 rounded-xl shadow-sm">
            <button
              onClick={handlePrintReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Print Last Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
```

# src\components\Home.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "../style.css";

export default function Home() {
  return (
    <div id="webcrumbs">
      <Navbar /> {/* Move Navbar outside the container */}
      <div className="w-[1280px] mx-auto font-sans relative overflow-hidden">
        <main className="px-8 py-12">

        <h1 className="text-2xl font-bold mb-8 text-center">What Do We Do?</h1>
          <section className="mt-2 grid grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">assessment</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Risk Assessment</h2>
              <p>Advanced AI algorithms analyze your health data to identify potential risks.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">analytics</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Health Analytics</h2>
              <p>Comprehensive analysis of your health metrics with detailed insights.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">medication</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Personalized Care</h2>
              <p>Tailored recommendations based on your unique health profile.</p>
            </div>
          </section>


          {/* New Section: How Does Our Model Work */}
          <section className="mt-20 text-center">
            <h1 className="text-2xl font-bold mb-8">How Does Our Model Work?</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto animate-slideUp">
              Our AI model works through a series of steps to assess your health risks and provide personalized insights.
            </p>

            <div className="grid grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">insert_emoticon</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 1: Enter Your Symptoms</h3>
                <p>Start by entering the symptoms you're currently experiencing. This helps us understand your health condition better.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">dynamic_form</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 2: Dynamic Questions</h3>
                <p>Our AI model processes your symptoms and asks dynamic follow-up questions based on the information you've entered.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">description</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 3: Generate Your Report</h3>
                <p>After gathering all the necessary information, our model generates a detailed report analyzing your health risks and making personalized recommendations.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
```

# src\components\Navbar.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";
import "../style.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/assessment" className="nav-link">
            Take Assessment
          </Link>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <button className="login-button">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

# src\components\ui\button.js

```js
export const Button = ({ className, children, ...props }) => (
    <button 
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
```

# src\firebase.js

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

# src\index.css

```css
/* body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
} */

```

# src\index.jsx

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

# src\logo.svg

This is a file of the type: SVG Image

# src\reportWebVitals.js

```js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

```

# src\setupTests.js

```js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

```

# src\style.css

```css
@import url(https://fonts.googleapis.com/css2?family=Poppins&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

/*! tailwindcss v3.4.11 | MIT License | https://tailwindcss.com*/
*,
:after,
:before {
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}
:after,
:before {
  --tw-content: "";
}
:host,
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family:
    Poppins,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -moz-tab-size: 4;
  tab-size: 4;
  -webkit-tap-highlight-color: transparent;
}
body {
  line-height: inherit;
  margin: 0;
}
hr {
  border-top-width: 1px;
  color: inherit;
  height: 0;
}
abbr:where([title]) {
  text-decoration: underline dotted;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}
a {
  color: inherit;
  text-decoration: inherit;
}
b,
strong {
  font-weight: bolder;
}
code,
kbd,
pre,
samp {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
  font-feature-settings: normal;
  font-size: 1em;
  font-variation-settings: normal;
}
small {
  font-size: 80%;
}
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}
sub {
  bottom: -0.25em;
}
sup {
  top: -0.5em;
}
table {
  border-collapse: collapse;
  border-color: inherit;
  text-indent: 0;
}
button,
input,
optgroup,
select,
textarea {
  color: inherit;
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 100%;
  font-variation-settings: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
}
button,
select {
  text-transform: none;
}
button,
input:where([type="button"]),
input:where([type="reset"]),
input:where([type="submit"]) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}
:-moz-focusring {
  outline: auto;
}
:-moz-ui-invalid {
  box-shadow: none;
}
progress {
  vertical-align: baseline;
}
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
::-webkit-search-decoration {
  -webkit-appearance: none;
}
::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}
summary {
  display: list-item;
}
blockquote,
dd,
dl,
figure,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
p,
pre {
  margin: 0;
}
fieldset {
  margin: 0;
}
fieldset,
legend {
  padding: 0;
}
menu,
ol,
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
dialog {
  padding: 0;
}
textarea {
  resize: vertical;
}
input::placeholder,
textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}
[role="button"],
button {
  cursor: pointer;
}
:disabled {
  cursor: default;
}
audio,
canvas,
embed,
iframe,
img,
object,
svg,
video {
  display: block;
  vertical-align: middle;
}
img,
video {
  height: auto;
  max-width: 100%;
}
[hidden] {
  display: none;
}
*,
:after,
:before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
#webcrumbs .absolute {
  position: absolute;
}
#webcrumbs .relative {
  position: relative;
}
#webcrumbs .sticky {
  position: sticky;
}
#webcrumbs .left-1\/2 {
  left: 50%;
}
#webcrumbs .top-0 {
  top: 0;
}
#webcrumbs .top-1\/2 {
  top: 50%;
}
#webcrumbs .z-50 {
  z-index: 50;
}
#webcrumbs .mx-auto {
  margin-left: auto;
  margin-right: auto;
}
#webcrumbs .mb-2 {
  margin-bottom: 8px;
}
#webcrumbs .mb-4 {
  margin-bottom: 16px;
}
#webcrumbs .mb-6 {
  margin-bottom: 24px;
}
#webcrumbs .mb-8 {
  margin-bottom: 32px;
}
#webcrumbs .mt-20 {
  margin-top: 80px;
}
#webcrumbs .mt-4 {
  margin-top: 16px;
}
#webcrumbs .mt-8 {
  margin-top: 32px;
}
#webcrumbs .flex {
  display: flex;
}
#webcrumbs .grid {
  display: grid;
}
#webcrumbs .h-5 {
  height: 20px;
}
#webcrumbs .h-\[800px\] {
  height: 800px;
}
#webcrumbs .h-full {
  height: 100%;
}
#webcrumbs .w-5 {
  width: 20px;
}
#webcrumbs .w-\[1280px\] {
  width: 1280px;
}
#webcrumbs .w-\[800px\] {
  width: 800px;
}
#webcrumbs .w-full {
  width: 100%;
}
#webcrumbs .max-w-2xl {
  max-width: 42rem;
}
#webcrumbs .-translate-x-1\/2 {
  --tw-translate-x: -50%;
}
#webcrumbs .-translate-x-1\/2,
#webcrumbs .-translate-y-1\/2 {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .-translate-y-1\/2 {
  --tw-translate-y: -50%;
}
#webcrumbs .translate-y-0 {
  --tw-translate-y: 0px;
}
#webcrumbs .transform,
#webcrumbs .translate-y-0 {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}


#webcrumbs .cursor-pointer {
  cursor: pointer;
}
#webcrumbs .grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
#webcrumbs .grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
#webcrumbs .flex-row {
  flex-direction: row;
}
#webcrumbs .items-center {
  align-items: center;
}
#webcrumbs .justify-between {
  justify-content: space-between;
}
#webcrumbs .gap-2 {
  gap: 8px;
}
#webcrumbs .gap-4 {
  gap: 16px;
}
#webcrumbs .gap-8 {
  gap: 32px;
}
#webcrumbs :is(.space-y-6 > :not([hidden]) ~ :not([hidden])) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(24px * var(--tw-space-y-reverse));
  margin-top: calc(24px * (1 - var(--tw-space-y-reverse)));
}
#webcrumbs .overflow-hidden {
  overflow: hidden;
}
#webcrumbs .rounded {
  border-radius: 12px;
}
#webcrumbs .rounded-2xl {
  border-radius: 48px;
}
#webcrumbs .rounded-full {
  border-radius: 9999px;
}
#webcrumbs .rounded-lg {
  border-radius: 24px;
}
#webcrumbs .rounded-xl {
  border-radius: 36px;
}
#webcrumbs .border {
  border-width: 1px;
}
#webcrumbs .border-b {
  border-bottom-width: 1px;
}
#webcrumbs .bg-blue-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}
#webcrumbs .bg-gray-50\/80 {
  background-color: rgba(249, 250, 251, 0.8);
}
#webcrumbs .bg-white\/80 {
  background-color: hsla(0, 0%, 100%, 0.8);
}
#webcrumbs .bg-white\/90 {
  background-color: hsla(0, 0%, 100%, 0.9);
}
#webcrumbs .bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}
#webcrumbs .from-blue-50 {
  --tw-gradient-from: #eff6ff var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(239, 246, 255, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
#webcrumbs .to-white {
  --tw-gradient-to: #fff var(--tw-gradient-to-position);
}
#webcrumbs .p-6 {
  padding: 24px;
}
#webcrumbs .p-8 {
  padding: 32px;
}
#webcrumbs .px-4 {
  padding-left: 16px;
  padding-right: 16px;
}
#webcrumbs .px-6 {
  padding-left: 24px;
  padding-right: 24px;
}
#webcrumbs .px-8 {
  padding-left: 32px;
  padding-right: 32px;
}
#webcrumbs .py-12 {
  padding-bottom: 48px;
  padding-top: 48px;
}
#webcrumbs .py-2 {
  padding-bottom: 8px;
  padding-top: 8px;
}
#webcrumbs .py-3 {
  padding-bottom: 12px;
  padding-top: 12px;
}
#webcrumbs .py-4 {
  padding-bottom: 16px;
  padding-top: 16px;
}
#webcrumbs .text-center {
  text-align: center;
}
#webcrumbs .font-sans {
  font-family:
    Poppins,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
}
#webcrumbs .text-2xl {
  font-size: 24px;
  line-height: 31.200000000000003px;
}
#webcrumbs .text-3xl {
  font-size: 30px;
  line-height: 36px;
}
#webcrumbs .text-5xl {
  font-size: 48px;
  line-height: 52.800000000000004px;
}
#webcrumbs .text-6xl {
  font-size: 60px;
  line-height: 66px;
}
#webcrumbs .text-lg {
  font-size: 18px;
  line-height: 27px;
}
#webcrumbs .text-xl {
  font-size: 20px;
  line-height: 28px;
}
#webcrumbs .font-bold {
  font-weight: 700;
}
#webcrumbs .font-semibold {
  font-weight: 600;
}
#webcrumbs .text-blue-600 {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs .text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
#webcrumbs .opacity-100 {
  opacity: 1;
}
#webcrumbs .shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
#webcrumbs .backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
}
#webcrumbs .backdrop-blur-md,
#webcrumbs .backdrop-blur-sm {
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
}
#webcrumbs .backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
}
#webcrumbs .transition-all {
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .transition-colors {
  transition-duration: 0.15s;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .transition-transform {
  transition-duration: 0.15s;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .duration-1000 {
  transition-duration: 1s;
}
#webcrumbs .duration-300 {
  transition-duration: 0.3s;
}
#webcrumbs .duration-500 {
  transition-duration: 0.5s;
}
#webcrumbs {
  font-family: Roboto !important;
  font-size: 16px !important;
}
#webcrumbs .hover\:-translate-y-0\.5:hover {
  --tw-translate-y: -2px;
}
#webcrumbs .hover\:-translate-y-0\.5:hover,
#webcrumbs .hover\:-translate-y-2:hover {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .hover\:-translate-y-2:hover {
  --tw-translate-y: -8px;
}
#webcrumbs .hover\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .hover\:border-blue-300:hover {
  --tw-border-opacity: 1;
  border-color: rgb(147 197 253 / var(--tw-border-opacity));
}
#webcrumbs .hover\:bg-blue-700:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(29 78 216 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:bg-gray-50:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:text-blue-600:hover {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs .hover\:shadow-2xl:hover {
  --tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
}
#webcrumbs .hover\:shadow-2xl:hover,
#webcrumbs .hover\:shadow-lg:hover {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .hover\:shadow-lg:hover {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
}
#webcrumbs .hover\:shadow-xl:hover {
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
    0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}
#webcrumbs .focus\:ring-blue-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
}
#webcrumbs :is(.group:hover .group-hover\:rotate-12) {
  --tw-rotate: 12deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs :is(.group:hover .group-hover\:scale-110) {
  --tw-scale-x: 1.1;
  --tw-scale-y: 1.1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs :is(.group:hover .group-hover\:text-blue-600) {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs :is(.group:hover .group-hover\:ring-2) {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}
#webcrumbs :is(.group:hover .group-hover\:ring-blue-300) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(147 197 253 / var(--tw-ring-opacity));
}

@import url(https://fonts.googleapis.com/css2?family=Lato&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Open+Sans&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

/*! tailwindcss v3.4.11 | MIT License | https://tailwindcss.com*/
*,
:after,
:before {
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}
:after,
:before {
  --tw-content: "";
}
:host,
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family:
    Open Sans,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -moz-tab-size: 4;
  tab-size: 4;
  -webkit-tap-highlight-color: transparent;
}
body {
  line-height: inherit;
  margin: 0;
}
hr {
  border-top-width: 1px;
  color: inherit;
  height: 0;
}
abbr:where([title]) {
  text-decoration: underline dotted;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}
a {
  color: inherit;
  text-decoration: inherit;
}
b,
strong {
  font-weight: bolder;
}
code,
kbd,
pre,
samp {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
  font-feature-settings: normal;
  font-size: 1em;
  font-variation-settings: normal;
}
small {
  font-size: 80%;
}
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}
sub {
  bottom: -0.25em;
}
sup {
  top: -0.5em;
}
table {
  border-collapse: collapse;
  border-color: inherit;
  text-indent: 0;
}
button,
input,
optgroup,
select,
textarea {
  color: inherit;
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 100%;
  font-variation-settings: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
}
button,
select {
  text-transform: none;
}
button,
input:where([type="button"]),
input:where([type="reset"]),
input:where([type="submit"]) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}
:-moz-focusring {
  outline: auto;
}
:-moz-ui-invalid {
  box-shadow: none;
}
progress {
  vertical-align: baseline;
}
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
::-webkit-search-decoration {
  -webkit-appearance: none;
}
::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}
summary {
  display: list-item;
}
blockquote,
dd,
dl,
figure,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
p,
pre {
  margin: 0;
}
fieldset {
  margin: 0;
}
fieldset,
legend {
  padding: 0;
}
menu,
ol,
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
dialog {
  padding: 0;
}
textarea {
  resize: vertical;
}
input::placeholder,
textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}
[role="button"],
button {
  cursor: pointer;
}
:disabled {
  cursor: default;
}
audio,
canvas,
embed,
iframe,
img,
object,
svg,
video {
  display: block;
  vertical-align: middle;
}
img,
video {
  height: auto;
  max-width: 100%;
}
[hidden] {
  display: none;
}
*,
:after,
:before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
#webcrumbs .absolute {
  position: absolute;
}
#webcrumbs .relative {
  position: relative;
}
#webcrumbs .-right-1 {
  right: -4px;
}
#webcrumbs .-top-1 {
  top: -4px;
}
#webcrumbs .right-0 {
  right: 0;
}
#webcrumbs .z-10 {
  z-index: 10;
}
#webcrumbs .col-span-4 {
  grid-column: span 4 / span 4;
}
#webcrumbs .col-span-8 {
  grid-column: span 8 / span 8;
}

#webcrumbs .block {
  display: block;
}
#webcrumbs .flex {
  display: flex;
}
#webcrumbs .grid {
  display: grid;
}

#webcrumbs .w-\[1200px\] {
  width: 1200px;
}
#webcrumbs .w-full {
  width: 100%;
}
#webcrumbs .transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .cursor-pointer {
  cursor: pointer;
}
#webcrumbs .grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
#webcrumbs .grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
#webcrumbs .flex-row {
  flex-direction: row;
}
#webcrumbs .items-center {
  align-items: center;
}
#webcrumbs .justify-center {
  justify-content: center;
}
#webcrumbs .justify-between {
  justify-content: space-between;
}
#webcrumbs :is(.space-y-2 > :not([hidden]) ~ :not([hidden])) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(8px * var(--tw-space-y-reverse));
  margin-top: calc(8px * (1 - var(--tw-space-y-reverse)));
}
#webcrumbs :is(.space-y-4 > :not([hidden]) ~ :not([hidden])) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(16px * var(--tw-space-y-reverse));
  margin-top: calc(16px * (1 - var(--tw-space-y-reverse)));
}
#webcrumbs :is(.space-y-6 > :not([hidden]) ~ :not([hidden])) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(24px * var(--tw-space-y-reverse));
  margin-top: calc(24px * (1 - var(--tw-space-y-reverse)));
}
#webcrumbs .rounded-full {
  border-radius: 9999px;
}
#webcrumbs .rounded-lg {
  border-radius: 24px;
}
#webcrumbs .rounded-xl {
  border-radius: 36px;
}
#webcrumbs .border {
  border-width: 1px;
}
#webcrumbs .bg-blue-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(219 234 254 / var(--tw-bg-opacity));
}
#webcrumbs .bg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(59 130 246 / var(--tw-bg-opacity));
}
#webcrumbs .bg-gray-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity));
}
#webcrumbs .bg-green-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(240 253 244 / var(--tw-bg-opacity));
}
#webcrumbs .bg-red-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 242 242 / var(--tw-bg-opacity));
}
#webcrumbs .bg-red-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(239 68 68 / var(--tw-bg-opacity));
}
#webcrumbs .bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}

#webcrumbs .text-2xl {
  font-size: 24px;
  line-height: 31.200000000000003px;
}
#webcrumbs .text-sm {
  font-size: 14px;
  line-height: 21px;
}
#webcrumbs .text-xl {
  font-size: 20px;
  line-height: 28px;
}
#webcrumbs .text-xs {
  font-size: 12px;
  line-height: 19.200000000000003px;
}
#webcrumbs .font-bold {
  font-weight: 700;
}
#webcrumbs .font-medium {
  font-weight: 500;
}
#webcrumbs .font-semibold {
  font-weight: 600;
}
#webcrumbs .outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
#webcrumbs .transition-all {
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs {
  font-family: Open Sans !important;
  font-size: 16px !important;
}
#webcrumbs .hover\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .hover\:bg-blue-600:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:bg-gray-100:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:bg-gray-50:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:shadow-lg:hover {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}


/* Base styles */
:root {
  --primary-color: #3B82F6;
  --primary-dark: #2563EB;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --background-gradient: linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 100%);
}

/* Centered box with blue border */
.heading-box {
  border: 2px solid grey; /* Blue border */
  border-radius: 8px; /* Rounded corners */
  padding: 24px; /* Padding inside the box */
  background-color: white; /* White background */
  max-width: 800px; /* Max width of the box */
  margin: 30px auto; /* Center the box horizontally */
  text-align: center; /* Center the text */

}

.heading-box h2 {
  font-size: 2rem; /* Title size */
  font-weight: bold; /* Bold title */
  color: #3b82f6; /* Blue color for title */
}

.heading-box p {
  font-size: 1.25rem; /* Subtitle size */
  margin-top: 10px; /* Add some space between title and subtitle */
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Main container styles */
.assessment-container {
  min-height: 100vh;
  background: var(--background-gradient);
  padding: 1.5rem;
}

/* Header styles */
.header-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(209, 213, 219, 0.3);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.header-logo {
  transition: transform 0.2s ease;
}

.header-logo:hover {
  transform: scale(1.05);
}

/* Main content area */
.content-container {
  max-width: 48rem;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.content-container:hover {
  transform: translateY(-2px);
}

/* Risk level indicator */
.risk-indicator {
  padding: 1rem;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.risk-indicator.low {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.risk-indicator.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.risk-indicator.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Conversation styles */
/* Subtle border for all boxes */
.bg-white, .input-container, .message-user, .message-ai, .conversation-container, .loading-indicator {
  border: 1px solid #e2e8f0; /* Light gray border */
  transition: all 0.3s ease;
}

/* Adding hover effect for message boxes */
.message-user:hover, .message-ai:hover {
  border-color: #2563eb; /* Blue border color on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add subtle shadow on hover */
}

/* Subtle border for the input container */
.input-container {
  border: 1px solid #e2e8f0; /* Subtle border for input container */
}

.input-container:hover {
  border-color: #2563eb; /* Blue border on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add subtle shadow */
}

/* Subtle border for the conversation container */
.conversation-container {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* Highlight message bubbles for the user and AI */
.message-user {
  border-radius: 10px;
  background-color: #2563eb;
  color: white;
}

.message-ai {
  border-radius: 10px;
  background-color: #f3f4f6;
  color: #1a202c;
}


/* Input area styles */
.input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(209, 213, 219, 0.3);
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading animation */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 0.75rem;
  margin: 1rem 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .content-container {
    padding: 1rem;
    margin: 1rem;
  }
  
  .message {
    max-width: 90%;
  }
  
  .input-container {
    flex-direction: column;
  }
  
  .submit-button {
    width: 100%;
    justify-content: center;
  }
}

/* Dashboard Container Styles */
.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 1.5rem;
}

/* Dashboard Header Styles */
.dashboard-header {
  @apply bg-white p-4 rounded-lg shadow-sm mb-6;
}

.dashboard-header h1 {
  @apply text-2xl font-bold text-gray-800;
}

.header-actions {
  @apply flex items-center gap-4;
}

.header-actions .notification {
  @apply relative cursor-pointer;
}

.header-actions .notification span {
  @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center;
}

.header-actions .user-info {
  @apply flex items-center gap-2;
}

.header-actions .user-info span {
  @apply font-medium text-gray-700;
}

/* Dashboard Grid Layout */
.dashboard-grid {
  @apply grid grid-cols-2 gap-6;
}

/* Card Styles */
.card {
  @apply bg-white p-6 rounded-xl shadow-sm;
}

.card-title {
  @apply text-xl font-semibold text-gray-800 mb-4;
}

/* Risk Assessment Cards */
.risk-card {
  @apply flex items-center gap-2 p-4 rounded-lg mb-4;
}

.risk-card.low {
  @apply bg-green-50 text-green-600;
}

.risk-card.high {
  @apply bg-red-50 text-red-600;
}

.risk-card .icon {
  @apply text-2xl;
}

.risk-card .content {
  @apply flex-1;
}

.risk-card .content p {
  @apply text-sm text-gray-600 mb-1;
}

.risk-card .content .value {
  @apply text-2xl font-bold;
}

/* Chart Card */
.chart-card {
  @apply mt-4;
}

/* Recent Patients Card */
.recent-patients-card {
  @apply p-4;
}

.recent-patient {
  @apply flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-2;
}

.recent-patient .avatar {
  @apply w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600;
}

.recent-patient .details h3 {
  @apply text-base font-medium text-gray-800;
}

.recent-patient .details p {
  @apply text-sm text-gray-500;
}

/* Quick Actions Card */
.quick-actions-card {
  @apply p-4;
}

.quick-action-button {
  @apply flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors;
}

.quick-action-button span {
  @apply text-2xl text-blue-600;
}

.quick-action-button .label {
  @apply text-sm text-gray-600;
}

/* Questionnaire Card */
.questionnaire-card {
  @apply p-4;
}

.questionnaire-card form {
  @apply space-y-4;
}

.questionnaire-card label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.questionnaire-card select,
.questionnaire-card textarea {
  @apply w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white;
  border-color: #d1d5db;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.questionnaire-card select:focus,
.questionnaire-card textarea:focus {
  @apply border-blue-500 ring-2 ring-blue-300;
}

.questionnaire-card button {
  @apply w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .dashboard-grid {
    @apply grid-cols-1;
  }

  .card,
  .recent-patients-card,
  .quick-actions-card,
  .questionnaire-card {
    @apply p-4;
  }

  .dashboard-header {
    @apply p-3;
  }
}

@media (max-width: 640px) {
  .dashboard-header h1 {
    @apply text-xl;
  }

  .header-actions {
    @apply gap-2;
  }

  .risk-card {
    @apply p-3;
  }

  .risk-card .content .value {
    @apply text-xl;
  }

  .quick-action-button {
    @apply p-3;
  }

  .questionnaire-card button {
    @apply py-2 px-4;
  }
}

/* Ensure full height for html and body */
html, body {
  height: 100%;
  margin: 0;
}

/* Adjust Dashboard Container to occupy full height */
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;  /* This will allow the content to grow and fill the screen */
  background: #f5f7fa;
  padding: 1.5rem;
}

/* Ensure Header is not shrinking and is aligned properly */
.dashboard-header {
  @apply bg-white p-4 rounded-lg shadow-sm mb-6;
  flex-shrink: 0;  /* Prevent header from shrinking */
}

/* Adjust main layout to take up the remaining space */
.dashboard-grid {
  @apply grid grid-cols-2 gap-6;
  flex-grow: 1; /* Ensure the grid layout takes up the remaining space */
}

/* Cards' Content */
.card {
  @apply bg-white p-6 rounded-xl shadow-sm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Ensure proper card size, especially for smaller screens */
.card-title {
  @apply text-xl font-semibold text-gray-800 mb-4;
}

/* Remove unnecessary margins/padding */
.chart-card {
  @apply mt-4;
}

.recent-patients-card, .quick-actions-card {
  @apply p-4;
}

/* Ensure the dashboard grid adjusts on smaller screens */
@media (max-width: 1024px) {
  .dashboard-grid {
    @apply grid-cols-1;  /* Make it one column on medium-sized screens */
  }

  .card,
  .recent-patients-card,
  .quick-actions-card,
  .questionnaire-card {
    @apply p-4;  /* More compact cards on smaller screens */
  }

  .dashboard-header {
    @apply p-3;
  }
}

/* On smaller screens, adjust font sizes */
@media (max-width: 640px) {
  .dashboard-header h1 {
    @apply text-xl;
  }

  .header-actions {
    @apply gap-2;
  }

  .risk-card {
    @apply p-3;
  }

  .risk-card .content .value {
    @apply text-xl;
  }

  .quick-action-button {
    @apply p-3;
  }

  .questionnaire-card button {
    @apply py-2 px-4;
  }
}

/* In your styles.css or relevant stylesheet */
.heading-container h2 {
  font-size: 2.5rem; /* For larger font size */
  font-weight: 800; /* Extra bold */
  color: #2d3748; /* Dark gray text */
  margin-bottom: 1.5rem; /* Space between heading and description */
}

.heading-container p {
  font-size: 1.125rem; /* Slightly larger than normal text */
  font-weight: 600; /* Semi-bold */
  color: #4a5568; /* Medium gray text */
}

/* navbar.css */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background-color: #F5F5DC;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #ddd;
  margin: 0; /* Ensure no margin */
  padding: 0; /* Remove default padding */
}

.nav-container {
  display: flex;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 0;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0 2rem;
  width: 100%;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  font-weight: bold;
  transition: color 0.3s, transform 0.3s;
  margin: 0 20px;
}

.nav-link:hover {
  color: #1d4ed8; /* Blue hover color */
  transform: translateY(-0.5px);
}

.login-button {
  background-color: #2563eb; /* Blue background */
  color: white;
  padding: 0.5rem 1.5rem;
  margin-left: 10px;
  border-radius: 9999px;
  font-weight: bold;
  transition: all 0.3s;
}

.login-button:hover {
  background-color: #1d4ed8; /* Darker blue hover color */
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.1);
  transform: scale(1.05);
}

/* Remove default body margins */
body {
  margin: 0;
  padding: 0;
}

/* Ensure full width for all pages */
#webcrumbs {
  width: 100%;
  margin: 0;
  padding: 0;
}
```

# tailwind.config.js

```js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

# vite.config.js

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
```

