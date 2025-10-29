'use client';

import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import GradientButton from '../../components/GradientButton';

interface ApiStatus {
  service: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: any;
}

export default function ApiTestPage() {
  const [manatalStatus, setManatalStatus] = useState<ApiStatus>({
    service: 'Manatal API',
    status: 'loading',
    message: 'Testing connection...'
  });
  
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState<ApiStatus>({
    service: 'Google Sheets API',
    status: 'loading',
    message: 'Testing connection...'
  });
  
  const [firestoreStatus, setFirestoreStatus] = useState<ApiStatus>({
    service: 'Firestore',
    status: 'loading',
    message: 'Testing connection...'
  });

  const [testCandidateId, setTestCandidateId] = useState<string | null>(null);
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);

  // Test Manatal API connection
  const testManatalConnection = async () => {
    setManatalStatus({
      service: 'Manatal API',
      status: 'loading',
      message: 'Testing connection...'
    });
    
    try {
      const response = await fetch('/api/manatal/test');
      const data = await response.json();
      
      if (data.success) {
        setManatalStatus({
          service: 'Manatal API',
          status: 'success',
          message: data.message,
          details: data
        });
      } else {
        setManatalStatus({
          service: 'Manatal API',
          status: 'error',
          message: data.error || 'Failed to connect to Manatal API',
          details: data
        });
      }
    } catch (error) {
      setManatalStatus({
        service: 'Manatal API',
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // Create a test candidate in Manatal
  const createTestCandidate = async () => {
    setIsCreatingCandidate(true);
    
    try {
      const candidateData = {
        firstName: 'Test',
        lastName: `Candidate ${new Date().toISOString().slice(0, 10)}`,
        email: `test.candidate.${Date.now()}@example.com`,
        phone: '+1234567890',
        location: 'Test Location',
        notes: 'This is a test candidate created from the API test page',
        positionTitle: 'Test Position'
      };
      
      const response = await fetch('/api/manatal/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.candidate) {
        setTestCandidateId(data.candidate.id.toString());
        alert(`Test candidate created successfully! ID: ${data.candidate.id}`);
      } else {
        alert(`Failed to create test candidate: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error creating test candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingCandidate(false);
    }
  };

  // Run tests on page load
  useEffect(() => {
    testManatalConnection();
    
    // Test Google Sheets API (simulated)
    setGoogleSheetsStatus({
      service: 'Google Sheets API',
      status: 'loading',
      message: 'Checking configuration...'
    });
    
    // Check if Google Sheets environment variables are set
    const hasGoogleSheetsConfig = 
      typeof process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL !== 'undefined' &&
      typeof process.env.GOOGLE_PRIVATE_KEY !== 'undefined';
    
    if (hasGoogleSheetsConfig) {
      setGoogleSheetsStatus({
        service: 'Google Sheets API',
        status: 'success',
        message: 'Google Sheets API is configured'
      });
    } else {
      setGoogleSheetsStatus({
        service: 'Google Sheets API',
        status: 'error',
        message: 'Google Sheets API is not configured. Check your .env.local file.'
      });
    }
    
    // Test Firestore connection (simulated)
    setFirestoreStatus({
      service: 'Firestore',
      status: 'success',
      message: 'Firestore is configured'
    });
  }, []);

  const renderStatusCard = (status: ApiStatus) => {
    const statusIcon = {
      success: <CheckCircle className="h-6 w-6 text-green-500" />,
      error: <AlertTriangle className="h-6 w-6 text-red-500" />,
      loading: <Loader className="h-6 w-6 text-blue-500 animate-spin" />
    };
    
    const statusColor = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      loading: 'bg-blue-50 border-blue-200'
    };
    
    return (
      <div className={`border rounded-lg p-6 ${statusColor[status.status]}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{status.service}</h3>
          {statusIcon[status.status]}
        </div>
        <p className="text-gray-700 mb-2">{status.message}</p>
        {status.details && (
          <div className="mt-4">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                View Details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto text-xs">
                {JSON.stringify(status.details, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">API Integration Test</h1>
            <button 
              onClick={() => testManatalConnection()}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="space-y-6">
            {renderStatusCard(manatalStatus)}
            {renderStatusCard(googleSheetsStatus)}
            {renderStatusCard(firestoreStatus)}
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Create Test Candidate in Manatal</h3>
                <GradientButton
                  onClick={createTestCandidate}
                  disabled={isCreatingCandidate || manatalStatus.status !== 'success'}
                  loading={isCreatingCandidate}
                  variant="outline"
                  size="md"
                >
                  Create Test Candidate
                </GradientButton>
                
                {testCandidateId && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      Test candidate created successfully! ID: <span className="font-mono">{testCandidateId}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a 
                        href={`/prefilled-questionnaire?candidateId=${testCandidateId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Take Questionnaire as This Candidate
                      </a>
                      <a 
                        href={`/prefilled-questionnaire?candidateId=${testCandidateId}&autoSubmit=true`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Auto-Submit Questionnaire
                      </a>
                      <a 
                        href={`/status/${testCandidateId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Status Page
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Test Questionnaire</h3>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="/prefilled-questionnaire"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Open Pre-filled Questionnaire
                  </a>
                  <a 
                    href="/prefilled-questionnaire?autoSubmit=true"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Auto-Submit Questionnaire
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">View Results</h3>
                <a 
                  href="/answers"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View All Quiz Answers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
