#!/usr/bin/env python3
import requests
import json
import argparse
from personality_calculator import calculate_personality_scores, update_candidate_custom_fields

def main():
    parser = argparse.ArgumentParser(description="Test updating a candidate's custom fields")
    parser.add_argument("candidate_id", type=int, help="Manatal candidate ID")
    
    args = parser.parse_args()
    
    # Sample questionnaire responses (simulating a completed questionnaire)
    responses = {
        "q1": 5, "q6": 4, "q11": 5, "q16": 5,  # openness
        "q2": 4, "q7": 5, "q12": 4, "q17": 5,  # extraversion
        "q3": 5, "q8": 5, "q13": 4, "q18": 5,  # agreeableness
        "q4": 4, "q9": 5, "q14": 4, "q19": 5,  # conscientiousness
        "q5": 4, "q10": 4, "q15": 4, "q20": 4  # emotional stability
    }
    
    # Calculate personality scores
    scores = calculate_personality_scores(responses)
    print("Calculated personality scores:")
    for dimension, score in scores.items():
        print(f"  {dimension}: {score}")
    
    # Prepare custom fields for Manatal
    custom_fields = {
        "quiz_completed": True,
        "application_flow": "Questionnaire Completed",
        "application_source": "Website",
    }
    
    # Add personality scores to custom fields
    for dimension, score in scores.items():
        custom_fields[f"personality_{dimension}"] = score
    
    print(f"\nUpdating candidate {args.candidate_id} with custom fields:")
    print(json.dumps(custom_fields, indent=2))
    
    # Update candidate in Manatal
    try:
        result = update_candidate_custom_fields(args.candidate_id, custom_fields)
        print("\nUpdate successful!")
        print("Updated candidate data:")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\nError updating candidate: {e}")

if __name__ == "__main__":
    main()
