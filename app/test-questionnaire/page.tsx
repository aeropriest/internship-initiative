'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

// Test data for pre-filling the questionnaire
const testData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  manatalUrl: 'https://app.manatal.com/candidates/12345',
  hireflixUrl: 'https://app.hireflix.com/interviews/67890',
  answers: {
    1: 4, // Extraversion - Networking
    2: 5, // Conscientiousness - Planning
    3: 4, // Agreeableness - Collaboration
    4: 5, // Openness - Learning
    5: 3, // Emotional Stability - Stress Management
    6: 4, // Conscientiousness - Initiative
    7: 5, // Agreeableness - Feedback
    8: 4, // Openness - Adaptability
    9: 3, // Extraversion - Social Energy
    10: 4  // Emotional Stability - Criticism
  }
};

export default function TestQuestionnairePage() {
  const router = useRouter();
  const [status, setStatus] = useState('Preparing test data...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const submitTestData = async () => {
      try {
        setStatus('Calculating trait scores...');
        
        // Calculate trait scores based on the test answers
        const traitScores: Record<string, { sum: number, count: number }> = {
          extraversion: { sum: 0, count: 0 },
          conscientiousness: { sum: 0, count: 0 },
          agreeableness: { sum: 0, count: 0 },
          openness: { sum: 0, count: 0 },
          emotionalStability: { sum: 0, count: 0 }
        };
        
        // Map questions to traits
        const questionTraits = {
          1: 'extraversion',
          2: 'conscientiousness',
          3: 'agreeableness',
          4: 'openness',
          5: 'emotionalStability',
          6: 'conscientiousness',
          7: 'agreeableness',
          8: 'openness',
          9: 'extraversion',
          10: 'emotionalStability'
        };
        
        // Calculate sum and count for each trait
        Object.entries(testData.answers).forEach(([questionIdStr, answer]) => {
          const questionId = parseInt(questionIdStr, 10);
          const trait = questionTraits[questionId as keyof typeof questionTraits];
          if (trait) {
            traitScores[trait].sum += answer;
            traitScores[trait].count += 1;
          }
        });
        
        // Calculate average for each trait
        const averageTraitScores: Record<string, number> = {};
        Object.entries(traitScores).forEach(([trait, { sum, count }]) => {
          averageTraitScores[trait] = count > 0 ? sum / count : 0;
        });

        // Prepare data for submission
        const submissionData = {
          name: testData.name,
          email: testData.email,
          manatalUrl: testData.manatalUrl,
          hireflixUrl: testData.hireflixUrl,
          answers: testData.answers,
          traitScores: averageTraitScores
        };

        setStatus('Submitting to API...');
        
        // Submit to API
        const response = await fetch('/api/questionnaire/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit questionnaire');
        }

        setStatus('Success! Test data submitted to Google Sheets.');
        
        // Redirect after a delay
        setTimeout(() => {
          router.push('/questionnaire');
        }, 3000);
        
      } catch (error) {
        console.error('Test submission error:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setStatus('Failed to submit test data.');
      }
    };

    // Start the submission process after a short delay
    const timer = setTimeout(() => {
      submitTestData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Questionnaire Test Mode</h1>
        
        <div className="mb-8">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-lg text-gray-600">{status}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Data Being Submitted:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        <p className="text-gray-600">
          This page automatically submits test data to the questionnaire API endpoint.
          You will be redirected to the questionnaire page shortly.
        </p>
      </div>
    </div>
  );
}
