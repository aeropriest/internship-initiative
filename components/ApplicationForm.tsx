'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';
import { MANATAL_API_TOKEN, HIREFLIX_API_KEY, HIREFLIX_POSITION_ID, RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config';
import { createConfirmationEmailHtml } from '../services/email';


type FormState = 'idle' | 'submitting' | 'success' | 'error';

const ApplicationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [clubName, setClubName] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || firstName;

    try {
      // 1. Create candidate in Manatal
      const manatalResponse = await fetch('https://api.manatal.com/v3/candidates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${MANATAL_API_TOKEN}`
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          notes: `Club: ${clubName}\n\nMessage:\n${message}`
        })
      });

      if (!manatalResponse.ok) {
        throw new Error('Failed to create your candidate profile. Please check your details.');
      }
      const manatalData = await manatalResponse.json();
      const candidateId = manatalData.id;

      // 2. Create interview in Hireflix
      const baseUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
      const hireflixRedirectUrl = `${baseUrl}#/status/${candidateId}`;

      const hireflixResponse = await fetch('https://api.hireflix.com/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HIREFLIX_API_KEY}`
        },
        body: JSON.stringify({
          position_id: HIREFLIX_POSITION_ID,
          name: name,
          email: email,
          redirect_url: hireflixRedirectUrl,
        })
      });

      if (!hireflixResponse.ok) {
        throw new Error('Failed to set up your video interview. Please try again.');
      }
      const hireflixData = await hireflixResponse.json();
      const interviewUrl = hireflixData.interview_url;

      // 3. Send confirmation email via Resend
      const emailHtml = createConfirmationEmailHtml(name, baseUrl);
      await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
              from: RESEND_FROM_EMAIL,
              to: [email],
              subject: 'Your Application to the Global Internship Initiative',
              html: emailHtml,
          })
      });

      // Save candidate info to localStorage for webhook simulation on the status page
      localStorage.setItem(`candidate_info_${candidateId}`, JSON.stringify({ name, email }));
      localStorage.setItem(`application_status_${candidateId}`, JSON.stringify({ status: 'Interview Pending', timestamp: new Date().toISOString() }));


      // 4. Redirect to interview
      window.location.href = interviewUrl;

    } catch (error) {
      console.error('Application Submission Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.');
      setFormState('error');
    }
  };


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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left mb-2">Your Full Name</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">Email Address</label>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"/>
                </div>
            </div>
            <div>
                <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 text-left mb-2">Club Name</label>
                <input type="text" id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} required className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"/>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 text-left mb-2">Staffing Needs / Message</label>
              <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} required className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none focus:border-pink-500 transition-all"></textarea>
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
                {formState === 'submitting' ? 'Processing...' : 'Proceed to Video Interview'}
              </button>
            </div>
        </form>
    </div>
  );
};

export default ApplicationForm;