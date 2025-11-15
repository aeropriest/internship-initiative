'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, X, Loader } from 'lucide-react';
import GradientButton from '../../../components/GradientButton';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const [interviewUrl, setInterviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Load interview URL from localStorage
  useEffect(() => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }
    
    const url = localStorage.getItem(`interview_url_${candidateId}`);
    if (url) {
      setInterviewUrl(url);
      console.log(`🎬 Loaded interview URL: ${url}`);
    } else {
      console.error(`❌ No interview URL found for candidate: ${candidateId}`);
    }
    
    setIsLoading(false);
  }, [candidateId]);
  
  // Poll for interview completion
  useEffect(() => {
    if (!candidateId || !interviewUrl) return;
    
    console.log(`🔍 Starting completion polling for candidate: ${candidateId}`);
    
    const pollForCompletion = async () => {
      try {
        const response = await fetch(`/api/interview-complete-signal?candidate_id=${candidateId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            console.log('🎯 Interview completed via polling, closing iframe...');
            handleInterviewComplete();
            return true; // Stop polling
          }
        }
      } catch (error) {
        console.error('Error polling for completion:', error);
      }
      return false; // Continue polling
    };
    
    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const shouldStop = await pollForCompletion();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);
    
    // Cleanup on unmount
    return () => {
      console.log('🔌 Stopping completion polling');
      clearInterval(interval);
    };
  }, [candidateId, interviewUrl]);
  
  // Handle interview completion
  const handleInterviewComplete = async () => {
    try {
      setIsCompleted(true);
      
      // Update localStorage with interview completion
      localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
        status: 'Interview Completed', 
        timestamp: new Date().toISOString()
      }));
      
      // Wait 2 seconds before redirecting to the status page
      setTimeout(() => {
        router.push(`/status/${candidateId}`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error handling interview completion:', error);
      router.push(`/status/${candidateId}`);
    }
  };
  
  const handleCloseInterview = () => {
    if (confirm('Are you sure you want to close the interview? Your progress may be lost.')) {
      router.push(`/status/${candidateId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <Loader className="h-12 w-12 animate-spin mb-4" />
        <p>Loading interview...</p>
      </div>
    );
  }
  
  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Completed!</h2>
          <p className="text-gray-600 mb-4">Thank you for completing your interview.</p>
          <p className="text-gray-600">Redirecting to the next step...</p>
        </div>
      </div>
    );
  }
  
  if (!interviewUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview URL Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your interview link.</p>
          <GradientButton
            onClick={() => router.push(`/status/${candidateId}`)}
            variant="filled"
            size="md"
          >
            Go to Application Status
          </GradientButton>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Video Interview</h2>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              🎬 Auto-close enabled
            </div>
            <GradientButton
              onClick={handleCloseInterview}
              variant="filled"
              size="sm"
              className="bg-red-500 hover:bg-red-600 border-red-500"
            >
              <X className="h-4 w-4 mr-2" />
              Close Interview
            </GradientButton>
          </div>
        </div>
        <div className="flex-1">
          <iframe
            src={interviewUrl}
            className="w-full h-full border-0"
            title="Hireflix Video Interview"
            allow="camera; microphone; display-capture"
          />
        </div>
      </div>
    </div>
  );
}
