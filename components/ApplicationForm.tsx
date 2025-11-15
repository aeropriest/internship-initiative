'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import {FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp} from 'react-icons/fa';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config';
import { createConfirmationEmailHtml } from '../services/email';
import { HireflixService, HireflixPosition, HireflixInterviewResponse } from '../services/hireflix';
import { ManatalService } from '../services/manatal';
import { FirebaseService } from '../services/firebase';
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
  const [passportCountry, setPassportCountry] = useState('');
  const [golfHandicap, setGolfHandicap] = useState('');
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
    if (!name || !email || !location || !selectedPosition || !resumeFile || !passportCountry) {
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
        notes: `${message}\n\nPassport Country: ${passportCountry}\nGolf Handicap: ${golfHandicap || 'Not provided'}`,
        positionTitle: selectedPositionData?.title,
      });

      const candidateId = candidate.id;

      // 2. Upload resume to Manatal
      await ManatalService.uploadResume(candidateId, resumeFile);
      
      // 3. Save application data and resume to Firebase
      try {
        // Upload resume to Firebase Storage
        const resumeUrl = await FirebaseService.uploadResume(resumeFile, candidateId.toString());
        
        // Save application data to Firestore
        await FirebaseService.saveApplication({
          name,
          email,
          phone,
          location,
          position: selectedPositionData?.title,
          positionId: selectedPosition,
          resumeUrl,
          resumeFile, // This will be removed before saving to Firestore
          passportCountry,
          golfHandicap,
          message,
          candidateId: candidateId.toString(),
          status: 'Application Submitted',
          timestamp: new Date(),
          quizCompleted: false,
          interviewCompleted: false
        });
        
        console.log('✅ Application data and resume saved to Firebase');
      } catch (firebaseError) {
        console.error('❌ Error saving to Firebase:', firebaseError);
        // Continue even if Firebase save fails
      }

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

      // 6. Save details and redirect to survey
      setCandidateId(candidateId);
      
      // Store interview URL in localStorage for later use
      if (interview.interview_url) {
        localStorage.setItem(`interview_url_${candidateId}`, interview.interview_url);
      }
      
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
      
      // Set form state to success (this won't show the success page due to our condition change)
      setFormState('success');
      
      // Redirect to survey page
      console.log(`🔄 Redirecting to survey page: /survey/${candidateId}`);
      router.push(`/survey/${candidateId}`);

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
      
      // Redirect to survey page after interview completion
      if (candidateId) {
        console.log(`🔄 Redirecting to survey page after interview completion: /survey/${candidateId}`);
        router.push(`/survey/${candidateId}`);
      }
    } catch (error) {
      console.error('❌ Error processing interview results:', error);
      // Still redirect to survey page even if processing fails
      if (candidateId) {
        console.log(`🔄 Redirecting to survey page after error: /survey/${candidateId}`);
        router.push(`/survey/${candidateId}`);
      }
    }
  };

  // Show interview iframe after form submission
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

  // We always want to show the interview iframe, never the success page
  if (false && formState === 'success' && !showInterviewIframe) {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="passportCountry" className="block text-sm font-medium text-gray-700 text-left mb-2">What country is your passport? *</label>
                  <select
                    id="passportCountry"
                    value={passportCountry}
                    onChange={e => setPassportCountry(e.target.value)}
                    required
                    className="w-full gradient-border-input text-gray-900"
                    disabled={formState === 'submitting'}
                  >
                    <option value="">Select a country...</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cabo Verde">Cabo Verde</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Central African Republic">Central African Republic</option>
                    <option value="Chad">Chad</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Republic">Dominican Republic</option>
                    <option value="East Timor">East Timor</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Greece">Greece</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Korea, North">Korea, North</option>
                    <option value="Korea, South">Korea, South</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia">Micronesia</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="North Macedonia">North Macedonia</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City">Vatican City</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="golfHandicap" className="block text-sm font-medium text-gray-700 text-left mb-2">What is your golf handicap?</label>
                  <input 
                    type="text" 
                    id="golfHandicap" 
                    value={golfHandicap} 
                    onChange={e => setGolfHandicap(e.target.value)} 
                    placeholder="e.g., 12.5"
                    className="w-full gradient-border-input text-gray-900"
                    disabled={formState === 'submitting'}
                  />
                </div>
            </div>

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