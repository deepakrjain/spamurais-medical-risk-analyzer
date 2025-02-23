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