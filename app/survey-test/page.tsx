'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SurveyTestPage() {
  const router = useRouter();
  
  const handleClick = () => {
    const testCandidateId = '123456789';
    console.log(`🧪 Test: Redirecting to survey page for test candidate: ${testCandidateId}`);
    router.push(`/survey/${testCandidateId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Survey Route Test Page</h1>
      <p className="mb-8 text-gray-600">Click the button below to test the survey route</p>
      
      <button 
        onClick={handleClick}
        className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
      >
        Test Survey Route
      </button>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <p className="text-sm text-gray-700">
          This page tests if the survey route is working correctly. 
          When you click the button, it will try to navigate to /survey/123456789.
        </p>
      </div>
    </div>
  );
}
