'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import GradientButton from '../../components/GradientButton';

// Default test data for pre-filling the questionnaire
const defaultTestData = {
  name: 'Jason Miller',
  email: 'jason.miller@example.com',
  manatalUrl: 'https://app.manatal.com/candidates/12345',
  hireflixUrl: 'https://app.hireflix.com/interviews/67890',
  answers: {
    // Extraversion (1-6)
    1: 4, // I enjoy meeting new people
    2: 3, // I feel comfortable leading a group
    3: 4, // I gain energy from social interactions
    4: 5, // I like to share my ideas with others
    5: 3, // I find it easy to start conversations
    6: 4, // I prefer being busy and surrounded by people
    // Agreeableness (7-12)
    7: 5, // I try to see things from others' perspectives
    8: 4, // I am quick to forgive others
    9: 5, // I enjoy helping people solve problems
    10: 3, // I value harmony over competition
    11: 4, // I'm compassionate toward others' feelings
    12: 5, // I find it easy to cooperate in teams
    // Conscientiousness (13-18)
    13: 4, // I plan my tasks before I start them
    14: 5, // I often set personal goals
    15: 3, // I like maintaining order and routine
    16: 4, // I fulfill my promises on time
    17: 5, // I pay attention to details
    18: 4, // I keep going until a task is fully completed
    // Openness (19-24)
    19: 3, // I enjoy exploring new ideas or hobbies
    20: 4, // I adapt easily to new situations
    21: 5, // I am curious about how things work
    22: 4, // I enjoy learning from experiences
    23: 3, // I try new approaches when solving problems
    24: 4, // I like diverse perspectives on issues
    // Emotional Stability (25-30)
    25: 3, // I remain calm under pressure
    26: 4, // I handle unexpected challenges well
    27: 3, // I recover quickly after setbacks
    28: 4, // I stay positive even in stressful situations
    29: 3, // I control my emotions in disagreements
    30: 4  // I rarely feel anxious or irritated
  }
};

// Define the questions with their trait categories
const questions = [
  // Extraversion (1-6)
  {
    id: 1,
    text: "I enjoy meeting new people.",
    trait: "extraversion"
  },
  {
    id: 2,
    text: "I feel comfortable leading a group.",
    trait: "extraversion"
  },
  {
    id: 3,
    text: "I gain energy from social interactions.",
    trait: "extraversion"
  },
  {
    id: 4,
    text: "I like to share my ideas with others.",
    trait: "extraversion"
  },
  {
    id: 5,
    text: "I find it easy to start conversations.",
    trait: "extraversion"
  },
  {
    id: 6,
    text: "I prefer being busy and surrounded by people.",
    trait: "extraversion"
  },
  // Agreeableness (7-12)
  {
    id: 7,
    text: "I try to see things from others' perspectives.",
    trait: "agreeableness"
  },
  {
    id: 8,
    text: "I am quick to forgive others.",
    trait: "agreeableness"
  },
  {
    id: 9,
    text: "I enjoy helping people solve problems.",
    trait: "agreeableness"
  },
  {
    id: 10,
    text: "I value harmony over competition.",
    trait: "agreeableness"
  },
  {
    id: 11,
    text: "I'm compassionate toward others' feelings.",
    trait: "agreeableness"
  },
  {
    id: 12,
    text: "I find it easy to cooperate in teams.",
    trait: "agreeableness"
  },
  // Conscientiousness (13-18)
  {
    id: 13,
    text: "I plan my tasks before I start them.",
    trait: "conscientiousness"
  },
  {
    id: 14,
    text: "I often set personal goals.",
    trait: "conscientiousness"
  },
  {
    id: 15,
    text: "I like maintaining order and routine.",
    trait: "conscientiousness"
  },
  {
    id: 16,
    text: "I fulfill my promises on time.",
    trait: "conscientiousness"
  },
  {
    id: 17,
    text: "I pay attention to details.",
    trait: "conscientiousness"
  },
  {
    id: 18,
    text: "I keep going until a task is fully completed.",
    trait: "conscientiousness"
  },
  // Openness (19-24)
  {
    id: 19,
    text: "I enjoy exploring new ideas or hobbies.",
    trait: "openness"
  },
  {
    id: 20,
    text: "I adapt easily to new situations.",
    trait: "openness"
  },
  {
    id: 21,
    text: "I am curious about how things work.",
    trait: "openness"
  },
  {
    id: 22,
    text: "I enjoy learning from experiences.",
    trait: "openness"
  },
  {
    id: 23,
    text: "I try new approaches when solving problems.",
    trait: "openness"
  },
  {
    id: 24,
    text: "I like diverse perspectives on issues.",
    trait: "openness"
  },
  // Emotional Stability (25-30)
  {
    id: 25,
    text: "I remain calm under pressure.",
    trait: "emotionalStability"
  },
  {
    id: 26,
    text: "I handle unexpected challenges well.",
    trait: "emotionalStability"
  },
  {
    id: 27,
    text: "I recover quickly after setbacks.",
    trait: "emotionalStability"
  },
  {
    id: 28,
    text: "I stay positive even in stressful situations.",
    trait: "emotionalStability"
  },
  {
    id: 29,
    text: "I control my emotions in disagreements.",
    trait: "emotionalStability"
  },
  {
    id: 30,
    text: "I rarely feel anxious or irritated.",
    trait: "emotionalStability"
  }
];

export default function PrefilledQuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  const autoSubmit = searchParams.get('autoSubmit') === 'true';
  
  const [formData, setFormData] = useState(defaultTestData);
  const [answers, setAnswers] = useState<Record<number, number>>(defaultTestData.answers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [status, setStatus] = useState('Ready to submit');
  const [countdown, setCountdown] = useState(5);

  // Handle auto-submit if enabled
  useEffect(() => {
    if (autoSubmit && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    if (autoSubmit && countdown === 0 && !isSubmitting && !submitSuccess) {
      handleSubmit();
    }
  }, [autoSubmit, countdown, isSubmitting, submitSuccess]);

  // Handle input change for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle answer change for questionnaire
  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setStatus('Submitting questionnaire...');

    try {
      // Calculate trait scores
      const traitScores: Record<string, { sum: number, count: number }> = {
        extraversion: { sum: 0, count: 0 },
        conscientiousness: { sum: 0, count: 0 },
        agreeableness: { sum: 0, count: 0 },
        openness: { sum: 0, count: 0 },
        emotionalStability: { sum: 0, count: 0 }
      };
      
      // Calculate sum and count for each trait
      questions.forEach(question => {
        const answer = answers[question.id];
        if (answer) {
          traitScores[question.trait].sum += answer;
          traitScores[question.trait].count += 1;
        }
      });
      
      // Calculate average for each trait
      const averageTraitScores: Record<string, number> = {};
      Object.entries(traitScores).forEach(([trait, { sum, count }]) => {
        averageTraitScores[trait] = count > 0 ? sum / count : 0;
      });

      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        email: formData.email,
        manatalUrl: formData.manatalUrl,
        hireflixUrl: formData.hireflixUrl,
        answers,
        traitScores: averageTraitScores
      };

      setStatus('Sending data to API...');
      
      // Submit to API
      const url = candidateId 
        ? `/api/questionnaire/submit?candidateId=${candidateId}` 
        : '/api/questionnaire/submit';
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit questionnaire');
      }

      setStatus('Submission successful!');
      
      // Show success message
      setSubmitSuccess(true);
      
      // If candidateId is provided, mark as completed in localStorage
      if (candidateId) {
        localStorage.setItem(`survey_completed_${candidateId}`, JSON.stringify({
          completed: true,
          timestamp: new Date().toISOString(),
          traitScores: averageTraitScores
        }));
        
        // Redirect after a delay
        setTimeout(() => {
          router.push(`/status/${candidateId}`);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Questionnaire submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setStatus('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-3xl text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Thank You for Completing the Questionnaire!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Your responses have been recorded successfully. We appreciate your participation!
          </p>
          <div className="mt-8 space-x-4">
            <GradientButton
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
            >
              Return to Home
            </GradientButton>
            {candidateId && (
              <GradientButton
                onClick={() => router.push(`/status/${candidateId}`)}
                variant="filled"
                size="lg"
              >
                View Application Status
              </GradientButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Pre-filled Questionnaire</h1>
        <p className="text-gray-600 text-center mb-4">
          This form is pre-filled for testing purposes.
        </p>
        
        {autoSubmit && countdown > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-800">
              Auto-submitting in {countdown} seconds...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label htmlFor="manatalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Manatal URL
                </label>
                <input
                  type="url"
                  id="manatalUrl"
                  name="manatalUrl"
                  value={formData.manatalUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label htmlFor="hireflixUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Hireflix Video Interview URL
                </label>
                <input
                  type="url"
                  id="hireflixUrl"
                  name="hireflixUrl"
                  value={formData.hireflixUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Questionnaire */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Personality Questions (Pre-filled - {questions.length} Questions)
            </h2>
            
            {/* Group questions by trait category */}
            <div className="space-y-8">
              {/* Extraversion */}
              <div className="border border-pink-200 rounded-xl p-5 bg-pink-50">
                <h3 className="text-lg font-semibold text-pink-800 mb-4 border-b border-pink-200 pb-2">
                  Extraversion (1-6)
                </h3>
                <div className="space-y-6">
                  {questions.filter(q => q.trait === "extraversion").map((question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-700 mb-3">{question.id}. {question.text}</p>
                      <div className="grid grid-cols-5 gap-2 text-sm text-center">
                        <div>Strongly Disagree</div>
                        <div>Disagree</div>
                        <div>Neutral</div>
                        <div>Agree</div>
                        <div>Strongly Agree</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={value}
                              checked={answers[question.id] === value}
                              onChange={() => handleAnswerChange(question.id, value)}
                              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Agreeableness */}
              <div className="border border-green-200 rounded-xl p-5 bg-green-50">
                <h3 className="text-lg font-semibold text-green-800 mb-4 border-b border-green-200 pb-2">
                  Agreeableness (7-12)
                </h3>
                <div className="space-y-6">
                  {questions.filter(q => q.trait === "agreeableness").map((question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-700 mb-3">{question.id}. {question.text}</p>
                      <div className="grid grid-cols-5 gap-2 text-sm text-center">
                        <div>Strongly Disagree</div>
                        <div>Disagree</div>
                        <div>Neutral</div>
                        <div>Agree</div>
                        <div>Strongly Agree</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={value}
                              checked={answers[question.id] === value}
                              onChange={() => handleAnswerChange(question.id, value)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Conscientiousness */}
              <div className="border border-blue-200 rounded-xl p-5 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                  Conscientiousness (13-18)
                </h3>
                <div className="space-y-6">
                  {questions.filter(q => q.trait === "conscientiousness").map((question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-700 mb-3">{question.id}. {question.text}</p>
                      <div className="grid grid-cols-5 gap-2 text-sm text-center">
                        <div>Strongly Disagree</div>
                        <div>Disagree</div>
                        <div>Neutral</div>
                        <div>Agree</div>
                        <div>Strongly Agree</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={value}
                              checked={answers[question.id] === value}
                              onChange={() => handleAnswerChange(question.id, value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Openness */}
              <div className="border border-purple-200 rounded-xl p-5 bg-purple-50">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 border-b border-purple-200 pb-2">
                  Openness (19-24)
                </h3>
                <div className="space-y-6">
                  {questions.filter(q => q.trait === "openness").map((question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-700 mb-3">{question.id}. {question.text}</p>
                      <div className="grid grid-cols-5 gap-2 text-sm text-center">
                        <div>Strongly Disagree</div>
                        <div>Disagree</div>
                        <div>Neutral</div>
                        <div>Agree</div>
                        <div>Strongly Agree</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={value}
                              checked={answers[question.id] === value}
                              onChange={() => handleAnswerChange(question.id, value)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Emotional Stability */}
              <div className="border border-amber-200 rounded-xl p-5 bg-amber-50">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 border-b border-amber-200 pb-2">
                  Emotional Stability (25-30)
                </h3>
                <div className="space-y-6">
                  {questions.filter(q => q.trait === "emotionalStability").map((question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium text-gray-700 mb-3">{question.id}. {question.text}</p>
                      <div className="grid grid-cols-5 gap-2 text-sm text-center">
                        <div>Strongly Disagree</div>
                        <div>Disagree</div>
                        <div>Neutral</div>
                        <div>Agree</div>
                        <div>Strongly Agree</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex justify-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={value}
                              checked={answers[question.id] === value}
                              onChange={() => handleAnswerChange(question.id, value)}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
              <div className="flex">
                <div className="py-1"><AlertTriangle className="h-5 w-5 text-red-500 mr-3" /></div>
                <div>
                  <p className="font-bold text-red-800">Submission Failed</p>
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-6">
            <GradientButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="filled"
              size="lg"
              className="w-full md:w-1/2"
            >
              {isSubmitting ? status : 'Submit Pre-filled Questionnaire'}
            </GradientButton>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            <strong>Note:</strong> This page is for testing purposes only. It pre-fills the questionnaire with sample data.
          </p>
          <div className="mt-4">
            <p className="text-gray-700 font-medium">Testing Options:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <a href="/prefilled-questionnaire?autoSubmit=true" className="text-sm text-blue-600 hover:text-blue-800 underline">
                Auto-submit
              </a>
              {candidateId ? (
                <a href={`/prefilled-questionnaire`} className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Remove candidateId
                </a>
              ) : (
                <a href={`/prefilled-questionnaire?candidateId=12345`} className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Add test candidateId
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
