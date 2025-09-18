'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Twitter, Linkedin, Facebook, Loader } from 'lucide-react';
import WhatsAppIcon from '../../../components/WhatsappIcon';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../../../config';
import { createInterviewCompleteEmailHtml } from '../../../services/email';

type ApplicationStatus = 'Unknown' | 'Interview Pending' | 'Interview Received' | 'Error';

interface StatusInfo {
    status: ApplicationStatus;
    timestamp?: string;
}

export default function StatusPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ status: 'Unknown' });
  const [isLoading, setIsLoading] = useState(true);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=I've%20just%20completed%20my%20video%20interview%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!%20Wish%20me%20luck!&url=${encodeURIComponent(appUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=I've%20Completed%20My%20Video%20Interview!&summary=I've%20just%20completed%20my%20video%20interview%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=I've%20just%20completed%20my%20video%20interview%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!%20Check%20it%20out:%20${encodeURIComponent(appUrl)}`,
  };
  
  useEffect(() => {
    const simulateWebhookReception = async () => {
      if (!candidateId) {
          setStatusInfo({ status: 'Error' });
          setIsLoading(false);
          return;
      }

      // Check if status update has already been processed to prevent multiple emails
      const alreadyProcessed = localStorage.getItem(`status_update_sent_${candidateId}`);
      if (alreadyProcessed) {
          const storedStatus = JSON.parse(localStorage.getItem(`application_status_${candidateId}`) || '{}');
          setStatusInfo(storedStatus.status ? storedStatus : { status: 'Interview Received' });
          setIsLoading(false);
          return;
      }
      
      try {
        const userInfoStr = localStorage.getItem(`candidate_info_${candidateId}`);
        if (!userInfoStr) {
          throw new Error("Candidate details not found. Could not send confirmation.");
        }
        const userInfo = JSON.parse(userInfoStr);

        // 1. Update Status in our "system" (localStorage)
        const newStatus: StatusInfo = { status: 'Interview Received', timestamp: new Date().toISOString() };
        localStorage.setItem(`application_status_${candidateId}`, JSON.stringify(newStatus));
        setStatusInfo(newStatus);
        
        // 2. Trigger branded email receipt
        const emailHtml = createInterviewCompleteEmailHtml(userInfo.name);
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [userInfo.email],
                subject: 'We Have Received Your Interview!',
                html: emailHtml,
            })
        });

        // 3. Mark as processed
        localStorage.setItem(`status_update_sent_${candidateId}`, 'true');

      } catch (error) {
        console.error("Webhook simulation failed:", error);
        setStatusInfo({ status: 'Error' });
      } finally {
        setIsLoading(false);
      }
    };

    simulateWebhookReception();
  }, [candidateId]);


  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
              <Loader className="h-12 w-12 animate-spin mb-4" />
              <p>Updating your application status...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 bg-gray-50">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Interview Complete!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Thank you for your submission. We've received your video interview and will be in touch with the next steps shortly.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-700">Application ID: <span className="font-mono bg-gray-200 text-gray-800 py-1 px-2 rounded">{candidateId}</span></p>
           <p className="text-sm text-gray-700 mt-2">Current Status: <span className="font-semibold text-purple-700">{statusInfo.status}</span></p>
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Share Your Journey</h3>
            <div className="flex justify-center items-center space-x-6">
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2] transition-colors"><Twitter className="h-8 w-8" /></a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0A66C2] transition-colors"><Linkedin className="h-8 w-8" /></a>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1877F2] transition-colors"><Facebook className="h-8 w-8" /></a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#25D366] transition-colors"><WhatsAppIcon className="h-8 w-8" /></a>
            </div>
        </div>
      </div>
    </div>
  );
}
