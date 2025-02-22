import os
import google.generativeai as genai
from dataclasses import dataclass
import firebase_admin
from firebase_admin import credentials, db
import torch
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings('ignore')

# Firebase configuration (replace with your actual keys or use environment variables)
firebaseConfig = {
    "apiKey": "YOUR_FIREBASE_API_KEY",
    "authDomain": "medicalriskanalyzer.firebaseapp.com",
    "databaseURL": "https://medicalriskanalyzer-default-rtdb.firebaseio.com",
    "projectId": "medicalriskanalyzer",
    "storageBucket": "medicalriskanalyzer.firebasestorage.app",
    "messagingSenderId": "881100654362",
    "appId": "1:881100654362:web:5c28af9d55887a25c90ea3",
    "measurementId": "G-22NB19QB2H"
}

# Initialize Gemini
GEMINI_API_KEY = "AIzaSyBXhmG_ysIXPNDliA8EDWwRAO8FrUzMh7k"
genai.configure(api_key=GEMINI_API_KEY)
model_gemini = genai.GenerativeModel('gemini-pro')

# Initialize Firebase Admin SDK
cred = credentials.Certificate("C:\\Users\\Deepak\\Downloads\\medicalriskanalyzer-5c37e4bd5968.json")
try:
    firebase_admin.initialize_app(cred, {
        'databaseURL': firebaseConfig["databaseURL"]
    })
except ValueError:
    pass  # App already initialized

@dataclass
class ConsultationState:
    symptoms: list
    asked_questions: list
    current_focus: str
    risk_level: str

    def __init__(self):
        self.symptoms = []
        self.asked_questions = []
        self.current_focus = None
        self.risk_level = "low"

def get_healthcare_guidelines(symptoms: list):
    try:
        ref = db.reference('guidelines')
        guidelines = ref.order_by_child('symptoms').get()
        if not guidelines:
            return None
        matching_guidelines = [
            guid for guid in guidelines.values() 
            if any(symptom.lower() in [s.lower() for s in guid.get('symptoms', [])] for symptom in symptoms)
        ]
        return matching_guidelines[0] if matching_guidelines else None
    except Exception as e:
        print(f"Firebase error: {e}")
        return None

def generate_medical_response(text: str, state: ConsultationState):
    prompt = f"""As a medical AI assistant, analyze the following patient information and provide a brief assessment.
Remember this is for educational purposes only.

Patient symptoms and information: {text}
Previous symptoms: {', '.join(state.symptoms)}
Current medical focus: {state.current_focus}

Provide a concise medical assessment:"""
    try:
        response = model_gemini.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Generation error: {e}")
        return "Unable to generate assessment. Please consult a healthcare professional."

def generate_dynamic_question(state: ConsultationState):
    prompt = f"""As a medical professional, generate a relevant follow-up question based on:
Reported symptoms: {', '.join(state.symptoms)}
Previous questions asked: {', '.join(state.asked_questions)}
Current medical focus: {state.current_focus}
Risk level: {state.risk_level}

Generate only the question, without any additional text."""
    try:
        response = model_gemini.generate_content(prompt)
        question = response.text.strip()
        state.asked_questions.append(question)
        return question
    except Exception as e:
        print(f"Question generation error: {e}")
        return "Could you provide more details about your symptoms?"

def update_firebase_record(state: ConsultationState):
    try:
        db.reference('consultations').push({
            'symptoms': state.symptoms,
            'questions_asked': state.asked_questions,
            'risk_level': state.risk_level,
            'timestamp': {'.sv': 'timestamp'}
        })
    except Exception as e:
        print(f"Firebase update error: {e}")

def process_input(text: str, state: ConsultationState):
    if not text.strip():
        return "Please describe your symptoms.", "What symptoms are you experiencing?"
    
    state.symptoms.append(text.strip())
    guidelines = get_healthcare_guidelines(state.symptoms)
    if guidelines:
        state.current_focus = guidelines.get('category')
    
    assessment = generate_medical_response(text, state)
    next_question = generate_dynamic_question(state)
    update_firebase_record(state)
    
    return assessment, next_question

app = Flask(__name__)
CORS(app)

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    user_input = data.get('text')
    
    # Initialize or restore consultation state
    session_state = ConsultationState()
    if data.get('state'):
        session_state.symptoms = data['state'].get('symptoms', [])
        session_state.asked_questions = data['state'].get('askedQuestions', [])
        session_state.current_focus = data['state'].get('currentFocus')
        session_state.risk_level = data['state'].get('riskLevel', 'low')
    
    assessment, next_question = process_input(user_input, session_state)
    
    return jsonify({
        'assessment': assessment,
        'nextQuestion': next_question,
        'updatedState': {
            'symptoms': session_state.symptoms,
            'askedQuestions': session_state.asked_questions,
            'currentFocus': session_state.current_focus,
            'riskLevel': session_state.risk_level
        }
    })

if __name__ == '__main__':
    app.run(port=5000)

# (Place this after the existing route definitions)
@app.route('/', methods=['GET'])
def index():
    return "Medical Risk Analyzer API is running", 200