'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Twitter, Linkedin, Facebook, Loader } from 'lucide-react';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../../../config';
import { createInterviewCompleteEmailHtml } from '../../../services/email';
import {FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp} from 'react-icons/fa';
import GradientButton from '../../../components/GradientButton';

type ApplicationStatus = 'Unknown' | 'Application Submitted' | 'Resume Processing' | 'Resume Uploaded' | 'Interview Scheduled' | 'Interview Completed' | 'Survey Completed' | 'Under Review' | 'Quiz Completed' | 'Error';

interface StatusInfo {
    status: ApplicationStatus;
    timestamp?: string;
    interview_status?: string;
    interview_id?: string;
    video_url?: string;
    transcript_url?: string;
}

interface CandidateInfo {
    name: string;
    email: string;
    position?: string;
    candidateId: string;
}

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ status: 'Unknown' });
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTakenSurvey, setHasTakenSurvey] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const getSocialLinks = (candidateInfo: CandidateInfo | null) => {
    const position = candidateInfo?.position || 'an internship position';
    const message = `I've just applied for ${position} with the Global Internship Initiative! 🌍 Excited about this opportunity to work with leading clubs worldwide. #GlobalInternship #CareerOpportunity`;
    
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(appUrl)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=Applied for Global Internship Initiative&summary=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(message)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + appUrl)}`,
    };
  };
  
  useEffect(() => {
    const loadApplicationStatus = async () => {
      if (!candidateId) {
          setStatusInfo({ status: 'Error' });
          setIsLoading(false);
          return;
      }

      try {
        // Load candidate info
        const candidateInfoStr = localStorage.getItem(`candidate_info_${candidateId}`);
        if (candidateInfoStr) {
          const info = JSON.parse(candidateInfoStr);
          setCandidateInfo(info);
        }
        
        // Check if the candidate has taken the survey
        const surveyCompletedStr = localStorage.getItem(`survey_completed_${candidateId}`);
        if (surveyCompletedStr) {
          setHasTakenSurvey(true);
          
          // Update status to Quiz Completed if current status is Interview Completed
          const storedStatusStr = localStorage.getItem(`application_status_${candidateId}`);
          if (storedStatusStr) {
            const storedStatus = JSON.parse(storedStatusStr);
            if (storedStatus.status === 'Interview Completed') {
              const updatedStatus = {
                ...storedStatus,
                status: 'Quiz Completed',
                timestamp: new Date().toISOString()
              };
              localStorage.setItem(`application_status_${candidateId}`, JSON.stringify(updatedStatus));
            }
          }
        }

        // Load application status
        const storedStatusStr = localStorage.getItem(`application_status_${candidateId}`);
        if (storedStatusStr) {
          const storedStatus = JSON.parse(storedStatusStr);
          setStatusInfo(storedStatus);
        } else {
          setStatusInfo({ status: 'Application Submitted', timestamp: new Date().toISOString() });
        }

        // Simulate status progression (in real app, this would come from webhooks)
        setTimeout(() => {
          setStatusInfo({ status: 'Resume Processing', timestamp: new Date().toISOString() });
          localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
            status: 'Resume Processing', 
            timestamp: new Date().toISOString() 
          }));
        }, 2000);

        setTimeout(() => {
          setStatusInfo({ status: 'Resume Uploaded', timestamp: new Date().toISOString() });
          localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
            status: 'Resume Uploaded', 
            timestamp: new Date().toISOString() 
          }));
        }, 4000);

        setTimeout(() => {
          setStatusInfo({ status: 'Under Review', timestamp: new Date().toISOString() });
          localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
            status: 'Under Review', 
            timestamp: new Date().toISOString() 
          }));
        }, 6000);

      } catch (error) {
        console.error("Failed to load application status:", error);
        setStatusInfo({ status: 'Error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationStatus();
  }, [candidateId]);


  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
              <Loader className="h-12 w-12 animate-spin mb-4" />
              <p>Updating your application status...</p>
          </div>
      )
  }

  const socialLinks = getSocialLinks(candidateInfo);
  
  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'Application Submitted':
      case 'Resume Processing':
      case 'Resume Uploaded':
      case 'Under Review':
        return <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />;
      case 'Error':
        return <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-2xl">!</span>
        </div>;
      default:
        return <Loader className="h-20 w-20 text-blue-500 mx-auto mb-6 animate-spin" />;
    }
  };

  const getStatusMessage = (status: ApplicationStatus) => {
    switch (status) {
      case 'Application Submitted':
        return {
          title: 'Application Submitted Successfully! 🎉',
          message: 'Thank you for your application! We have received your information and resume. Please proceed with the personality survey (Step 1) below.'
        };
      case 'Resume Processing':
        return {
          title: 'Processing Your Resume...',
          message: 'Our team is reviewing your resume and qualifications. Please proceed with the personality survey (Step 1) below.'
        };
      case 'Resume Uploaded':
        return {
          title: 'Resume Successfully Processed! ✅',
          message: 'Your resume has been processed and added to your candidate profile. Please proceed with the personality survey (Step 1) below.'
        };
      case 'Survey Completed':
        return {
          title: 'Personality Survey Completed! 📝',
          message: 'Thank you for completing your personality survey. Please proceed to the video interview (Step 2) below to complete your application.'
        };
      case 'Interview Completed':
        return {
          title: 'Video Interview Completed! 📹',
          message: 'Thank you for completing your video interview. Your application is now complete and will be reviewed by our team.'
        };
      case 'Quiz Completed':
        return {
          title: 'Application Complete! 🎉',
          message: 'Thank you for completing all steps of the application process. Your personality assessment has been recorded and added to your profile. Our team will review your submission and be in touch soon!'
        };
      case 'Under Review':
        return {
          title: 'Application Under Review 📋',
          message: 'Our hiring team is reviewing your application. Please make sure you have completed both the personality survey (Step 1) and video interview (Step 2) below.'
        };
      case 'Error':
        return {
          title: 'Application Error',
          message: 'There was an issue with your application. Please contact support.'
        };
      default:
        return {
          title: 'Processing Application...',
          message: 'Please wait while we process your application. In the meantime, please proceed with the video interview (Step 1) below.'
        };
    }
  };

  const statusDisplay = getStatusMessage(statusInfo.status);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl text-center">
        {getStatusIcon(statusInfo.status)}
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {statusDisplay.title}
        </h1>
        
        <p className="text-gray-600 text-lg mb-8">
          {statusDisplay.message}
        </p>

        {candidateInfo && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Application Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {candidateInfo.name}</p>
              <p><span className="font-medium">Email:</span> {candidateInfo.email}</p>
              {candidateInfo.position && (
                <p><span className="font-medium">Position:</span> {candidateInfo.position}</p>
              )}
              <p><span className="font-medium">Application ID:</span> 
                <span className="font-mono bg-gray-200 text-gray-800 py-1 px-2 rounded ml-2">{candidateId}</span>
              </p>
              <p><span className="font-medium">Status:</span> 
                <span className="font-semibold text-purple-700 ml-2">{statusInfo.status}</span>
              </p>
              {statusInfo.timestamp && (
                <p><span className="font-medium">Last Updated:</span> {new Date(statusInfo.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Video Interview Section - Step 1 */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 bg-blue-600 text-white rounded-full">1</span>
            Video Interview
          </h3>
          
          {statusInfo.status === 'Interview Completed' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium mb-2">Video interview completed!</p>
              <p className="text-gray-600 text-sm">Thank you for completing your video interview.</p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                <strong>First step:</strong> Please complete a short video interview to tell us more about yourself and your qualifications.
                This will give our team a better understanding of your skills and experience.
              </p>
              <GradientButton
                onClick={() => {
                  // Get the stored interview URL from localStorage
                  const interviewUrl = localStorage.getItem(`interview_url_${candidateId}`) || 'https://app.hireflix.com/s/interview/start';
                  console.log(`🎬 Opening Hireflix interview URL: ${interviewUrl}`);
                  
                  // Open the interview in the current window
                  window.location.href = interviewUrl;
                  
                  // For demo purposes, we'll simulate interview completion
                  setTimeout(() => {
                    setStatusInfo({ 
                      status: 'Interview Completed', 
                      timestamp: new Date().toISOString() 
                    });
                    localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ 
                      status: 'Interview Completed', 
                      timestamp: new Date().toISOString() 
                    }));
                  }, 1000);
                }}
                variant="filled"
                size="md"
              >
                Start Video Interview
              </GradientButton>
            </div>
          )}
        </div>
        
        {/* Personality Survey Section - Step 2 */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 bg-blue-600 text-white rounded-full">2</span>
            Personality Survey
          </h3>
          
          {hasTakenSurvey ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium mb-2">Personality survey completed!</p>
              <p className="text-gray-600 text-sm">Thank you for completing your personality survey.</p>
            </div>
          ) : statusInfo.status === 'Interview Completed' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                <strong>Next step:</strong> Now that you've completed your video interview, please take our personality survey.
                This will help us better match you with suitable opportunities.
              </p>
              <GradientButton
                onClick={() => router.push(`/survey/${candidateId}`)}
                variant="filled"
                size="md"
              >
                Take Personality Survey
              </GradientButton>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-2">
                <strong>Coming up:</strong> After completing your video interview, you'll be able to take our personality survey.
              </p>
            </div>
          )}
        </div>

        {/* Social Sharing Section */}
        <div className="mt-10 pt-8 border-t border-gray-200">
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
