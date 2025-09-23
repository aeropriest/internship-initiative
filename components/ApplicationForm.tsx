'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import {FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp} from 'react-icons/fa';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config';
import { createConfirmationEmailHtml } from '../services/email';
import { HireflixService, HireflixPosition, HireflixInterviewResponse } from '../services/hireflix';
import { ManatalService } from '../services/manatal';
import FileDropzone from './FileDropzone';
import GradientButton from './GradientButton';
import '../styles/gradient-inputs.css';


type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'existing';

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
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [existingCandidate, setExistingCandidate] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
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

  // Check for existing candidate when email changes
  const checkExistingCandidate = async (emailToCheck: string) => {
    if (!emailToCheck || emailToCheck.length < 5) return;
    
    setCheckingExisting(true);
    try {
      const response = await fetch('/api/manatal/check-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          console.log('✅ Found existing candidate:', data.candidate);
          setExistingCandidate(data);
          setFormState('existing');
          setCandidateId(data.candidate.id);
        } else {
          setExistingCandidate(null);
          if (formState === 'existing') {
            setFormState('idle');
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing candidate:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && formState !== 'submitting') {
        checkExistingCandidate(email);
      }
    }, 1000); // Check after 1 second of no typing

    return () => clearTimeout(timer);
  }, [email]);

  // Listen for postMessage events to close iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Received postMessage:', event.data, 'from:', event.origin);
      
      // Accept messages from our own domain and Hireflix
      const allowedOrigins = [
        window.location.origin, // Our own domain
        'https://app.hireflix.com', // Hireflix domain
        'https://admin.hireflix.com' // Hireflix admin domain
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('⚠️ Ignoring message from unauthorized origin:', event.origin);
        return;
      }
      
      // Handle different message formats
      const messageData = event.data;
      
      // Check for Hireflix completion events
      if (
        messageData === 'close-iframe' || 
        messageData === 'interview-completed' ||
        (typeof messageData === 'object' && messageData?.type === 'interview.finished') ||
        (typeof messageData === 'object' && messageData?.type === 'interview.completed')
      ) {
        console.log('🎯 Interview completed via postMessage, closing iframe...');
        handleCloseInterview();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Poll for interview completion when iframe is shown
  useEffect(() => {
    if (!showInterviewIframe || !candidateId) return;
    
    console.log(`🔍 Starting completion polling for candidate: ${candidateId}`);
    
    const pollForCompletion = async () => {
      try {
        const response = await fetch(`/api/interview-complete-signal?candidate_id=${candidateId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            console.log('🎯 Interview completed via polling, closing iframe...');
            handleCloseInterview();
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
    
    // Cleanup on unmount or when iframe closes
    return () => {
      console.log('🔌 Stopping completion polling');
      clearInterval(interval);
    };
  }, [showInterviewIframe, candidateId]);

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

  // If existing candidate found, show status
  if (formState === 'existing' && existingCandidate) {
    const candidate = existingCandidate.candidate;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'interview_completed': return 'bg-green-50 border-green-200 text-green-800';
        case 'interview_scheduled': return 'bg-blue-50 border-blue-200 text-blue-800';
        default: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'interview_completed': return '✅';
        case 'interview_scheduled': return '📅';
        default: return '📋';
      }
    };

    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-full">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{getStatusIcon(existingCandidate.status)}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">{existingCandidate.ui_message}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Application Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {candidate.full_name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Position:</strong> {candidate.position_applied}</p>
              <p><strong>Applied:</strong> {new Date(candidate.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${getStatusColor(existingCandidate.status)}`}>
            <h3 className="font-semibold mb-2">Current Status</h3>
            <p className="font-medium">{existingCandidate.message}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <GradientButton
            onClick={() => router.push(`/status/${candidate.id}`)}
            variant="filled"
            size="md"
            className="flex-1"
          >
            View Application Status
          </GradientButton>
          <GradientButton
            onClick={() => {
              setFormState('idle');
              setExistingCandidate(null);
              setEmail('');
            }}
            variant="outline"
            size="md"
            className="flex-1"
          >
            Apply with Different Email
          </GradientButton>
        </div>
      </div>
    );
  }

  // If form is in success state (for already invited or fallback scenarios), show success message
  if (formState === 'success' && !showInterviewIframe) {
    const statusMessage = localStorage.getItem(`interview_message_${candidateId}`);
    
    // Get social sharing links
    const getSocialLinks = () => {
      const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const position = selectedPosition || 'an internship position';
      const message = `I've just applied for ${position} with the Global Internship Initiative! 🌍 Excited about this opportunity to work with leading clubs worldwide. #GlobalInternship #CareerOpportunity`;
      
      return {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(appUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=Applied for Global Internship Initiative&summary=${encodeURIComponent(message)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(message)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + appUrl)}`,
      };
    };
    
    const socialLinks = getSocialLinks();
    
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl w-full text-center">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h2>
          
          {/* Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              {statusMessage || 'Your application has been received and is being processed.'}
            </p>
          </div>
          
          {/* Application Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Status</h3>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 font-medium">Application Submitted</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              We'll review your application and contact you within 2-3 business days.
            </p>
          </div>
          
          {/* Social Media Sharing */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Share Your Application! 🚀</h3>
            <p className="text-gray-600 mb-6">Let your network know about this exciting opportunity!</p>
            <div className="flex justify-center items-center space-x-6">
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-500 hover:text-[#1DA1F2] transition-colors transform hover:scale-110">
                <FaTwitter className="h-8 w-8" />
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-500 hover:text-[#0A66C2] transition-colors transform hover:scale-110">
                <FaLinkedin className="h-8 w-8" />
              </a>
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-500 hover:text-[#1877F2] transition-colors transform hover:scale-110">
                <FaFacebook className="h-8 w-8" />
              </a>
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-500 hover:text-[#25D366] transition-colors transform hover:scale-110">
                <FaWhatsapp className="h-8 w-8" />
              </a>
            </div>
          </div>
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
                    className="w-full gradient-border-input text-gray-900"
                    disabled={formState === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">
                    Email Address *
                    {checkingExisting && (
                      <span className="ml-2 text-xs text-red-500">
                        <Loader className="inline h-3 w-3 animate-spin mr-1" />
                        Checking existing applications...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      id="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="w-full gradient-border-input text-gray-900 pr-10"
                      disabled={formState === 'submitting'}
                    />
                    {checkingExisting && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
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
                    className="w-full gradient-border-input text-gray-900"
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
                    className="w-full gradient-border-input text-gray-900"
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
                  className="w-full gradient-border-input text-gray-900"
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
                className="w-full gradient-border-input text-gray-900 resize-none"
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
            
            {/* Consent Checkbox */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  By submitting this form, you consent to Global Talent Solutions processing your data for recruitment. We may store your CV and video for up to 36 months for current and future roles. You can withdraw consent at any time by contacting{' '}
                  <a href="mailto:sean@globaltalentsolutions.net" className="text-pink-600 hover:text-pink-700 underline">
                    sean@globaltalentsolutions.net
                  </a>
                </span>
              </label>
            </div>
            
            <div>
              <GradientButton
                type="submit"
                disabled={formState === 'submitting' || !consentChecked}
                loading={formState === 'submitting'}
                variant="filled"
                size="lg"
                className="w-full"
              >
                {formState === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
              </GradientButton>
            </div>
        </form>
    </div>
  );
};

export default ApplicationForm;