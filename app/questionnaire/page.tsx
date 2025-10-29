'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import GradientButton from '../../components/GradientButton';

// Define the questions with their trait categories
const questions = [
  {
    id: 1,
    text: "I enjoy meeting new people and networking at events.",
    trait: "extraversion"
  },
  {
    id: 2,
    text: "I always plan my tasks and meet deadlines ahead of time.",
    trait: "conscientiousness"
  },
  {
    id: 3,
    text: "I prefer collaborating with a team rather than working alone.",
    trait: "agreeableness"
  },
  {
    id: 4,
    text: "I like exploring new ideas and learning emerging technologies.",
    trait: "openness"
  },
  {
    id: 5,
    text: "I stay calm and focused during stressful situations.",
    trait: "emotionalStability"
  },
  {
    id: 6,
    text: "I take initiative to solve problems without being asked.",
    trait: "conscientiousness"
  },
  {
    id: 7,
    text: "I value feedback from others to improve my performance.",
    trait: "agreeableness"
  },
  {
    id: 8,
    text: "I adapt quickly to changes in plans or environments.",
    trait: "openness"
  },
  {
    id: 9,
    text: "I feel energized after social interactions at work.",
    trait: "extraversion"
  },
  {
    id: 10,
    text: "I manage my emotions well when facing criticism.",
    trait: "emotionalStability"
  }
];

export default function QuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    manatalUrl: '',
    hireflixUrl: ''
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(false);
  
  // Load candidate info if candidateId is provided
  useEffect(() => {
    if (candidateId) {
      setIsLoadingCandidate(true);
      // Try to load candidate info from localStorage first
      const candidateInfoStr = localStorage.getItem(`candidate_info_${candidateId}`);
      
      if (candidateInfoStr) {
        try {
          const candidateInfo = JSON.parse(candidateInfoStr);
          setFormData(prev => ({
            ...prev,
            name: candidateInfo.name || '',
            email: candidateInfo.email || ''
          }));
        } catch (error) {
          console.error('Error parsing candidate info:', error);
        }
      }
      
      setIsLoadingCandidate(false);
    }
  }, [candidateId]);

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

  // Check if all questions are answered
  const isFormComplete = () => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      Object.keys(answers).length === questions.length
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      setSubmitError('Please fill in all required fields and answer all questions.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

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
          <div className="mt-8">
            <GradientButton
              onClick={() => router.push('/')}
              variant="filled"
              size="lg"
            >
              Return to Home
            </GradientButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Personality Questionnaire</h1>
        <p className="text-gray-600 text-center mb-8">
          Please answer all 10 questions honestly to help us understand your personality traits.
        </p>

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
              Personality Questions
            </h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
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
              disabled={isSubmitting || !isFormComplete()}
              loading={isSubmitting}
              variant="filled"
              size="lg"
              className="w-full md:w-1/2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
