'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import GradientButton from '../../../components/GradientButton';

// Define the question categories and questions - 6 questions per category (30 total)
const surveyQuestions = {
  extraversion: [
    "I enjoy networking with new people at career events.",
    "I feel energized after group discussions or team projects.",
    "I prefer leading conversations in meetings.",
    "I thrive in fast-paced, social work environments.",
    "I often initiate contact with colleagues for collaboration.",
    "I like presenting ideas publicly."
  ],
  agreeableness: [
    "I prioritize team harmony over individual wins.",
    "I offer help to colleagues without being asked.",
    "I value others' opinions in decision-making.",
    "I am patient when explaining concepts to peers.",
    "I avoid conflicts by finding common ground.",
    "I enjoy mentoring or supporting new team members."
  ],
  conscientiousness: [
    "I always meet deadlines for assignments.",
    "I plan my tasks meticulously before starting.",
    "I double-check my work for accuracy.",
    "I follow through on commitments reliably.",
    "I organize my workspace for efficiency.",
    "I set clear goals for my career development."
  ],
  openness: [
    "I enjoy learning new skills or technologies.",
    "I adapt quickly to changes in plans.",
    "I seek innovative solutions to problems.",
    "I am curious about different industries.",
    "I appreciate diverse perspectives in discussions.",
    "I experiment with new ideas in projects."
  ],
  emotionalStability: [
    "I stay calm during high-pressure deadlines.",
    "I manage anxiety well in uncertain situations.",
    "I bounce back quickly from setbacks.",
    "I maintain focus despite distractions.",
    "I handle criticism constructively.",
    "I remain positive in challenging environments."
  ]
};

// Define the trait categories for display
const traitCategories = {
  extraversion: "Extraversion (sociability and energy in groups)",
  agreeableness: "Agreeableness (cooperation and empathy)",
  conscientiousness: "Conscientiousness (organization and reliability)",
  openness: "Openness (creativity and adaptability)",
  emotionalStability: "Emotional Stability (resilience under stress)"
};

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Log when the survey page is loaded
  console.log(`🔍 Survey page loaded for candidate ID: ${candidateId}`);
  console.log(`📝 URL parameters:`, params);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Initialize answers state with empty values
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({
    extraversion: {},
    agreeableness: {},
    conscientiousness: {},
    openness: {},
    emotionalStability: {}
  });

  // Load candidate information from localStorage
  useEffect(() => {
    console.log(`🔍 Survey page useEffect triggered for candidate ID: ${candidateId}`);
    
    const loadCandidateInfo = () => {
      if (!candidateId) {
        console.error(`❌ No candidate ID provided`);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`📝 Attempting to load candidate info from localStorage for ID: ${candidateId}`);
        // Load candidate info from localStorage
        const candidateInfoStr = localStorage.getItem(`candidate_info_${candidateId}`);
        if (candidateInfoStr) {
          const info = JSON.parse(candidateInfoStr);
          console.log(`✅ Successfully loaded candidate info:`, info);
          setCandidateInfo(info);
        } else {
          console.warn(`⚠️ No candidate info found in localStorage for ID: ${candidateId}`);
        }
        setIsLoading(false);
      } catch (error) {
        console.error(`❌ Failed to load candidate information:`, error);
        setIsLoading(false);
      }
    };

    loadCandidateInfo();
  }, [candidateId]);

  // Initialize empty answers (removed prefilled answers for production)

  // Handle answer change
  const handleAnswerChange = (category: string, questionIndex: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [questionIndex]: value
      }
    }));
  };

  // Check if all questions are answered
  const isFormComplete = () => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    Object.keys(surveyQuestions).forEach(category => {
      const questions = surveyQuestions[category as keyof typeof surveyQuestions];
      totalQuestions += questions.length;
      
      const categoryAnswers = answers[category] || {};
      answeredQuestions += Object.keys(categoryAnswers).length;
    });

    return totalQuestions === answeredQuestions;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Calculate average scores for each trait
      const traitScores: Record<string, number> = {};
      
      Object.keys(surveyQuestions).forEach(category => {
        const questions = surveyQuestions[category as keyof typeof surveyQuestions];
        const categoryAnswers = answers[category] || {};
        
        const sum = questions.reduce((acc, _, index) => {
          return acc + (categoryAnswers[index] || 0);
        }, 0);
        
        traitScores[category] = sum / questions.length;
      });

      // Prepare data for submission
      const submissionData = {
        candidateId,
        name: candidateInfo?.name || '',
        email: candidateInfo?.email || '',
        position: candidateInfo?.position || '',
        answers,
        traitScores
      };

      // Submit survey data to API
      try {
        const response = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to submit survey');
        }
        
        console.log('Survey submitted successfully:', result);
      } catch (apiError) {
        console.error('Error submitting survey:', apiError);
        throw new Error('Failed to submit survey data');
      }

      // Save survey completion status to localStorage
      localStorage.setItem(`survey_completed_${candidateId}`, JSON.stringify({
        completed: true,
        timestamp: new Date().toISOString(),
        traitScores
      }));
      
      // Update the application status to Survey Completed
      localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
        status: 'Survey Completed', 
        timestamp: new Date().toISOString() 
      }));
      
      // Redirect to the interview page
      console.log(`🔄 Redirecting to interview page: /interview/${candidateId}`);
      router.push(`/interview/${candidateId}`);
      
    } catch (error) {
      console.error('Survey submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Your Survey</h2>
          <p className="text-gray-600">Please wait while we prepare your personality assessment...</p>
        </div>
      </div>
    );
  }

  // We don't need a success message anymore since we redirect immediately
  // Removed the success message block

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Personality Questionnaire</h1>
        <p className="text-gray-600 text-center mb-8">
          Please answer all 30 questions honestly to help us understand your personality traits.
        </p>

        {candidateInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><span className="font-medium">Name:</span> {candidateInfo.name}</p>
              <p><span className="font-medium">Email:</span> {candidateInfo.email}</p>
              {candidateInfo.position && (
                <p><span className="font-medium">Position:</span> {candidateInfo.position}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {Object.entries(surveyQuestions).map(([category, questions], categoryIndex) => (
            <div key={category} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {categoryIndex + 1}. {traitCategories[category as keyof typeof traitCategories]}
              </h2>
              <div className="space-y-6">
                {questions.map((question, questionIndex) => {
                  const questionNumber = categoryIndex * 6 + questionIndex + 1;
                  return (
                    <div key={questionIndex} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-700 mb-3">{questionNumber}. {question}</p>
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
                              name={`${category}-${questionIndex}`}
                              value={value}
                              checked={answers[category]?.[questionIndex] === value}
                              onChange={() => handleAnswerChange(category, questionIndex, value)}
                              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

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
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
