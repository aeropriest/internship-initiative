#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from personality_calculator import process_questionnaire

app = Flask(__name__)

# Questionnaire definition - in a real app, this would likely be in a database
QUESTIONS = [
    {"id": "q1", "text": "I am the life of the party.", "dimension": "extraversion"},
    {"id": "q2", "text": "I feel little concern for others.", "dimension": "agreeableness", "reverse": True},
    {"id": "q3", "text": "I am always prepared.", "dimension": "conscientiousness"},
    {"id": "q4", "text": "I get stressed out easily.", "dimension": "emotionalstability", "reverse": True},
    {"id": "q5", "text": "I have a rich vocabulary.", "dimension": "openness"},
    {"id": "q6", "text": "I don't talk a lot.", "dimension": "extraversion", "reverse": True},
    {"id": "q7", "text": "I am interested in people.", "dimension": "agreeableness"},
    {"id": "q8", "text": "I leave my belongings around.", "dimension": "conscientiousness", "reverse": True},
    {"id": "q9", "text": "I am relaxed most of the time.", "dimension": "emotionalstability"},
    {"id": "q10", "text": "I have difficulty understanding abstract ideas.", "dimension": "openness", "reverse": True},
    {"id": "q11", "text": "I feel comfortable around people.", "dimension": "extraversion"},
    {"id": "q12", "text": "I insult people.", "dimension": "agreeableness", "reverse": True},
    {"id": "q13", "text": "I pay attention to details.", "dimension": "conscientiousness"},
    {"id": "q14", "text": "I worry about things.", "dimension": "emotionalstability", "reverse": True},
    {"id": "q15", "text": "I have a vivid imagination.", "dimension": "openness"},
    {"id": "q16", "text": "I keep in the background.", "dimension": "extraversion", "reverse": True},
    {"id": "q17", "text": "I sympathize with others' feelings.", "dimension": "agreeableness"},
    {"id": "q18", "text": "I make a mess of things.", "dimension": "conscientiousness", "reverse": True},
    {"id": "q19", "text": "I seldom feel blue.", "dimension": "emotionalstability"},
    {"id": "q20", "text": "I am not interested in abstract ideas.", "dimension": "openness", "reverse": True}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/questionnaire')
def questionnaire():
    return render_template('questionnaire.html', questions=QUESTIONS)

@app.route('/submit', methods=['POST'])
def submit():
    # Get form data
    data = request.form.to_dict()
    
    # Extract candidate ID
    candidate_id = int(data.get('candidate_id', 0))
    if candidate_id == 0:
        return jsonify({"error": "Invalid candidate ID"}), 400
    
    # Extract responses (convert string values to integers)
    responses = {}
    for key, value in data.items():
        if key.startswith('q') and value.isdigit():
            responses[key] = int(value)
    
    try:
        # Process questionnaire and update candidate in Manatal
        result = process_questionnaire(candidate_id, responses)
        
        # Save responses to file for reference
        with open(f"responses_{candidate_id}.json", 'w') as f:
            json.dump(responses, f, indent=2)
        
        return render_template('success.html', result=result)
    
    except Exception as e:
        return render_template('error.html', error=str(e))

@app.route('/create_candidate', methods=['GET', 'POST'])
def create_candidate():
    from personality_calculator import API_TOKEN, API_BASE_URL
    import requests
    
    if request.method == 'POST':
        # Get form data
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        
        # Create candidate in Manatal
        url = f"{API_BASE_URL}/candidates/"
        
        headers = {
            "Authorization": f"Token {API_TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        data = {
            "full_name": full_name,
            "email": email,
            "custom_fields": {
                "quiz_completed": False,
                "application_flow": "Registration",
                "application_source": "Website"
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            candidate = response.json()
            
            # Redirect to questionnaire with candidate ID
            return redirect(url_for('questionnaire') + f"?candidate_id={candidate['id']}")
        
        except Exception as e:
            return render_template('error.html', error=str(e))
    
    return render_template('create_candidate.html')

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True)
