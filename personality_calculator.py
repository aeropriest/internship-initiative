#!/usr/bin/env python3
import requests
import json
import argparse
from typing import Dict, List, Any

# Configuration
API_TOKEN = "51ce36b3ac06f113f418f0e0f47391e7471090c7"
API_BASE_URL = "https://api.manatal.com/open/v3"

# Personality dimensions
DIMENSIONS = [
    "openness",
    "extraversion",
    "agreeableness",
    "conscientiousness",
    "emotionalstability"
]

def calculate_personality_scores(responses: Dict[str, int]) -> Dict[str, str]:
    """
    Calculate personality scores based on questionnaire responses.
    
    This is a simplified example. In a real application, you would implement
    your actual scoring algorithm based on your questionnaire design.
    
    Args:
        responses: Dictionary mapping question IDs to response values (typically 1-5)
        
    Returns:
        Dictionary with calculated scores for each personality dimension
    """
    # Example calculation (replace with your actual algorithm)
    # This assumes responses are grouped by dimension and we're taking averages
    scores = {}
    
    # Sample calculation - in reality, you'd map specific questions to dimensions
    # and apply appropriate scoring algorithms
    dimension_questions = {
        "openness": ["q1", "q6", "q11", "q16"],
        "extraversion": ["q2", "q7", "q12", "q17"],
        "agreeableness": ["q3", "q8", "q13", "q18"],
        "conscientiousness": ["q4", "q9", "q14", "q19"],
        "emotionalstability": ["q5", "q10", "q15", "q20"],
    }
    
    for dimension, questions in dimension_questions.items():
        # Get responses for this dimension's questions
        dimension_responses = [responses.get(q, 0) for q in questions if q in responses]
        
        # Calculate average if we have responses, otherwise default to 3.0
        if dimension_responses:
            avg_score = sum(dimension_responses) / len(dimension_responses)
        else:
            avg_score = 3.0
            
        # Format to 2 decimal places
        scores[dimension] = f"{avg_score:.2f}"
    
    return scores

def update_candidate_custom_fields(candidate_id: int, custom_fields: Dict[str, Any]) -> Dict:
    """
    Update a candidate's custom fields in Manatal.
    
    Args:
        candidate_id: The ID of the candidate to update
        custom_fields: Dictionary of custom fields to update
        
    Returns:
        API response as dictionary
    """
    url = f"{API_BASE_URL}/candidates/{candidate_id}/"
    
    headers = {
        "Authorization": f"Token {API_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    data = {
        "custom_fields": custom_fields
    }
    
    response = requests.patch(url, headers=headers, json=data)
    response.raise_for_status()  # Raise exception for HTTP errors
    
    return response.json()

def process_questionnaire(candidate_id: int, responses: Dict[str, int]) -> Dict:
    """
    Process questionnaire responses and update candidate in Manatal.
    
    Args:
        candidate_id: The ID of the candidate
        responses: Dictionary mapping question IDs to response values
        
    Returns:
        API response from updating the candidate
    """
    # Calculate personality scores
    scores = calculate_personality_scores(responses)
    
    # Prepare custom fields for Manatal
    custom_fields = {
        "quiz_completed": True,
        "application_flow": "Questionnaire Completed",
        "application_source": "Website",
    }
    
    # Add personality scores to custom fields
    for dimension in DIMENSIONS:
        custom_fields[f"personality_{dimension}"] = scores[dimension]
    
    # Update candidate in Manatal
    return update_candidate_custom_fields(candidate_id, custom_fields)

def main():
    parser = argparse.ArgumentParser(description="Process personality questionnaire and update Manatal")
    parser.add_argument("candidate_id", type=int, help="Manatal candidate ID")
    parser.add_argument("--responses", type=str, help="JSON string of question responses")
    parser.add_argument("--file", type=str, help="JSON file containing question responses")
    
    args = parser.parse_args()
    
    # Get responses from either command line or file
    if args.responses:
        responses = json.loads(args.responses)
    elif args.file:
        with open(args.file, 'r') as f:
            responses = json.load(f)
    else:
        # Example responses for testing
        responses = {
            "q1": 5, "q6": 4, "q11": 5, "q16": 5,  # openness
            "q2": 4, "q7": 5, "q12": 4, "q17": 5,  # extraversion
            "q3": 5, "q8": 5, "q13": 4, "q18": 5,  # agreeableness
            "q4": 4, "q9": 5, "q14": 4, "q19": 5,  # conscientiousness
            "q5": 4, "q10": 4, "q15": 4, "q20": 4  # emotional stability
        }
    
    # Process questionnaire and update candidate
    result = process_questionnaire(args.candidate_id, responses)
    
    # Print result
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
