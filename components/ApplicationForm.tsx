'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config';
import { createConfirmationEmailHtml } from '../services/email';
import { HireflixService, HireflixPosition, HireflixInterviewResponse } from '../services/hireflix';
import { ManatalService } from '../services/manatal';
import FileDropzone from './FileDropzone';


type FormState = 'idle' | 'submitting' | 'success' | 'error';

const ApplicationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [positions, setPositions] = useState<HireflixPosition[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [showInterviewIframe, setShowInterviewIframe] = useState(false);
  const [interviewUrl, setInterviewUrl] = useState('');
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const router = useRouter();

  // Load available positions on component mount
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const availablePositions = await HireflixService.getOpenPositions();
        setPositions(availablePositions);
      } catch (error) {
        console.error('Failed to load positions:', error);
      } finally {
        setLoadingPositions(false);
      }
    };

    loadPositions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    // Validation
    if (!name || !email || !location || !selectedPosition || !resumeFile) {
      setErrorMessage('Please fill in all required fields and upload your resume.');
      setFormState('error');
      return;
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || firstName;
    const selectedPositionData = positions.find(p => p.id === selectedPosition);

    try {
      // 1. Create candidate in Manatal
      const candidate = await ManatalService.createCandidate({
        firstName,
        lastName,
        email,
        phone,
        location,
        notes: message,
        positionTitle: selectedPositionData?.title,
      });

      const candidateId = candidate.id;

      // 2. Upload resume to Manatal
      await ManatalService.uploadResume(candidateId, resumeFile);

      // 3. Add candidate to position in Manatal
      await ManatalService.addCandidateToPosition(candidateId, selectedPosition);

      // 4. Create interview in Hireflix
      let interview;
      let interviewMessage = '';
      let showIframe = true;
      
      try {
        const interviewResponse = await HireflixService.createInterview(
          selectedPosition,
          email,
          name,
          candidateId
        );
        
        // Check if this is an "already invited" scenario
        if (interviewResponse.interview?.status === 'already_invited') {
          console.log('💡 Candidate already invited to this position');
          interview = interviewResponse.interview;
          interviewMessage = interviewResponse.user_message || 'You have already been invited to interview for this position.';
          showIframe = false; // Don't show iframe for already invited candidates
        } else {
          interview = interviewResponse.interview;
          console.log('✅ Interview created successfully:', interview);
        }
      } catch (interviewError) {
        console.warn('⚠️ Interview creation failed, using fallback:', interviewError);
        // Create a fallback interview object so the flow can continue
        interview = {
          id: `fallback_${candidateId}_${Date.now()}`,
          position_id: selectedPosition,
          candidate_email: email,
          interview_url: `https://app.hireflix.com/fallback-interview?candidate=${candidateId}`,
          status: 'fallback',
          created_at: new Date().toISOString()
        };
        interviewMessage = 'There was an issue creating your interview. Our team will contact you shortly with next steps.';
        showIframe = false;
      }

      // 5. Send confirmation email (COMMENTED OUT FOR TESTING)
      // try {
      //   const appUrl = window.location.origin;
      //   const emailHtml = createConfirmationEmailHtml(name, appUrl);
      //   const emailResponse = await fetch('/api/resend/send-email', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       to: [email],
      //       subject: 'Your Application to the Global Internship Initiative',
      //       html: emailHtml,
      //     })
      //   });
      //   
      //   if (emailResponse.ok) {
      //     console.log('✅ Confirmation email sent successfully');
      //   } else {
      //     console.warn('⚠️ Email sending failed, but application was processed');
      //   }
      // } catch (emailError) {
      //   console.warn('⚠️ Email sending failed, but application was processed:', emailError);
      // }
      
      console.log('📧 Email sending temporarily disabled for testing');

      // Save candidate info to localStorage for status tracking
      localStorage.setItem(`candidate_info_${candidateId}`, JSON.stringify({ 
        name, 
        email, 
        position: selectedPositionData?.title,
        candidateId 
      }));
      localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
        status: 'Application Submitted', 
        timestamp: new Date().toISOString() 
      }));

      // 6. Handle interview display based on status
      setCandidateId(candidateId);
      
      if (showIframe && interview.interview_url) {
        setInterviewUrl(interview.interview_url);
        setShowInterviewIframe(true);
        setFormState('success');
      } else {
        // For already invited or fallback scenarios, show success message and redirect
        setFormState('success');
        
        // Store the special message for the status page
        if (interviewMessage) {
          localStorage.setItem(`interview_message_${candidateId}`, interviewMessage);
        }
        
        // Update application status with appropriate message
        const statusMessage = interview.status === 'already_invited' 
          ? 'Already Invited - Check Email' 
          : interview.status === 'fallback'
          ? 'Application Received - Team Will Contact You'
          : 'Application Submitted';
          
        localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
          status: statusMessage, 
          timestamp: new Date().toISOString(),
          interview_status: interview.status,
          message: interviewMessage
        }));
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(`/status/${candidateId}`);
        }, 3000); // Increased to 3 seconds to give users time to read the message
      }

    } catch (error) {
      console.error('Application Submission Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.');
      setFormState('error');
    }
  };

  const handleCloseInterview = async () => {
    try {
      setShowInterviewIframe(false);
      
      // Get interview ID from the URL (extract from Hireflix URL)
      const urlParts = interviewUrl.split('/');
      const interviewId = urlParts[urlParts.length - 1];
      
      if (candidateId && interviewId) {
        console.log('🔄 Processing interview results...');
        
        // Call API to get interview results and update Manatal
        const response = await fetch('/api/hireflix/interview-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interview_id: interviewId,
            candidate_id: candidateId,
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Interview results processed successfully:', result);
          
          // Update localStorage with interview completion
          localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
            status: 'Interview Completed', 
            timestamp: new Date().toISOString(),
            interview_id: interviewId,
            video_url: result.interview_results?.video_url,
            transcript_url: result.interview_results?.transcript_url
          }));
        } else {
          console.warn('⚠️ Failed to process interview results, but continuing...');
        }
      }
      
      // Redirect to status page after processing
      if (candidateId) {
        router.push(`/status/${candidateId}`);
      }
    } catch (error) {
      console.error('❌ Error processing interview results:', error);
      // Still redirect even if processing fails
      if (candidateId) {
        router.push(`/status/${candidateId}`);
      }
    }
  };

  // If showing interview iframe, render the iframe view
  if (showInterviewIframe && interviewUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Video Interview</h2>
            <button
              onClick={handleCloseInterview}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Interview
            </button>
          </div>
          <div className="flex-1 p-4">
            <iframe
              src={interviewUrl}
              className="w-full h-full border-0 rounded-lg"
              title="Hireflix Video Interview"
              allow="camera; microphone; display-capture"
            />
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Complete your video interview and click "Close Interview" when finished.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If form is in success state (for already invited or fallback scenarios), show success message
  if (formState === 'success' && !showInterviewIframe) {
    const statusMessage = localStorage.getItem(`interview_message_${candidateId}`);
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-full text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted Successfully!</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium">
              {statusMessage || 'Your application has been received and is being processed.'}
            </p>
          </div>
          <p className="text-gray-600">
            You will be redirected to your application status page shortly...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Express Your Interest
            </h2>
            <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1 hover:bg-gray-100"
                aria-label="Close"
            >
                <X className="h-6 w-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left mb-2">Your Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                    disabled={formState === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                    disabled={formState === 'submitting'}
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                    disabled={formState === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left mb-2">Location *</label>
                  <input 
                    type="text" 
                    id="location" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    required
                    placeholder="e.g., New York, USA"
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                    disabled={formState === 'submitting'}
                  />
                </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 text-left mb-2">Position of Interest *</label>
              {loadingPositions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="ml-2 text-gray-600">Loading positions...</span>
                </div>
              ) : (
                <select
                  id="position"
                  value={selectedPosition}
                  onChange={e => setSelectedPosition(e.target.value)}
                  required
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                  disabled={formState === 'submitting'}
                >
                  <option value="">Select a position...</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title} - {position.location}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <FileDropzone
              onFileSelect={setResumeFile}
              disabled={formState === 'submitting'}
            />

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 text-left mb-2">Additional Message</label>
              <textarea 
                id="message" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                rows={4} 
                placeholder="Tell us about your interests, experience, or any questions you have..."
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"
                disabled={formState === 'submitting'}
              />
            </div>
            
            {formState === 'error' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
                    <div className="flex">
                        <div className="py-1"><AlertTriangle className="h-5 w-5 text-red-500 mr-3" /></div>
                        <div>
                            <p className="font-bold text-red-800">Submission Failed</p>
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div>
              <button 
                type="submit" 
                disabled={formState === 'submitting'}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {formState === 'submitting' && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {formState === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
        </form>
    </div>
  );
};

export default ApplicationForm;