from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app)

# Initialize Gemini
GEMINI_API_KEY = "AIzaSyBXhmG_ysIXPNDliA8EDWwRAO8FrUzMh7k"
genai.configure(api_key=GEMINI_API_KEY)
model_gemini = genai.GenerativeModel('gemini-pro')

# Initialize Firebase
cred = credentials.Certificate("C:\\Users\\Deepak\\Downloads\\medicalriskanalyzer-5c37e4bd5968.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://medicalriskanalyzer-default-rtdb.firebaseio.com'
})

# Add Firebase rules update function
def update_firebase_rules():
    try:
        ref = db.reference('/')
        rules = {
            "rules": {
                "guidelines": {
                    ".indexOn": ["symptoms"]
                }
            }
        }
        ref.set(rules)  # Changed from set_rules to set
    except Exception as e:
        print(f"Firebase rules error: {e}")

# Call rules update on startup
update_firebase_rules()

def initialize_state():
    return {
        "symptoms": [],
        "asked_questions": [],
        "current_focus": None,
        "risk_level": "low",
        "conversation_history": []
    }

def get_healthcare_guidelines(symptoms):
    try:
        ref = db.reference('guidelines')
        guidelines = ref.order_by_child('symptoms').get() or {}
        
        matching = [g for g in guidelines.values()
                   if any(s.lower() in [sg.lower() for sg in g.get('symptoms', [])]
                        for s in symptoms)]
        return matching[0] if matching else None
    except Exception as e:
        print(f"Firebase error: {e}")
        return None

def generate_medical_response(text, state):
    try:
        prompt = f"""As a medical AI assistant, analyze this:
        Current input: {text}
        Previous symptoms: {', '.join(state.get('symptoms', []))}
        Current focus: {state.get('current_focus', 'general')}
        Provide concise assessment:"""
        
        response = model_gemini.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Generation error: {e}")
        return "Please consult a healthcare professional."

def generate_dynamic_question(state):
    try:
        prompt = f"""Generate medical follow-up question based on:
        Symptoms: {', '.join(state.get('symptoms', []))}
        Previous questions: {', '.join(state.get('asked_questions', []))}
        Current focus: {state.get('current_focus', 'general')}
        Risk level: {state.get('risk_level', 'low')}
        Generate only the question:"""
        
        response = model_gemini.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Question error: {e}")
        return "Could you describe your symptoms in more detail?"

@app.route('/api/process-input', methods=['POST'])
def process_input():
    try:
        data = request.json
        user_input = data.get('text', '').strip()
        state = data.get('state', {})
        
        # Merge with default state
        default_state = initialize_state()
        for key in default_state:
            if key not in state:
                state[key] = default_state[key]
        
        if not user_input:
            return jsonify({
                "assessment": "Please describe your symptoms",
                "question": "What symptoms are you experiencing?",
                "state": state
            })
        
        # Update state
        state['symptoms'].append(user_input)
        
        # Get guidelines
        guidelines = get_healthcare_guidelines(state['symptoms'])
        if guidelines:
            state['current_focus'] = guidelines.get('category')
        
        # Generate responses
        assessment = generate_medical_response(user_input, state)
        question = generate_dynamic_question(state)
        
        # Update state
        state['asked_questions'].append(question)
        
        return jsonify({
            "assessment": assessment,
            "question": question,
            "state": state
        })
    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({
            "assessment": "System error. Please try again.",
            "question": "Could you repeat your symptoms?",
            "state": state
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)