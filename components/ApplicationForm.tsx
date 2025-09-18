'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '../config';
import { createConfirmationEmailHtml } from '../services/email';
import { HireflixService, HireflixPosition } from '../services/hireflix';
import { ManatalService } from '../services/manatal';
import FileDropzone from './FileDropzone';


type FormState = 'idle' | 'submitting' | 'success' | 'error';

const ApplicationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [positions, setPositions] = useState<HireflixPosition[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
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
    if (!name || !email || !selectedPosition || !resumeFile) {
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
        notes: message,
        positionTitle: selectedPositionData?.title,
      });

      const candidateId = candidate.id;

      // 2. Upload resume to Manatal
      await ManatalService.uploadResume(candidateId, resumeFile);

      // 3. Add candidate to position in Manatal
      await ManatalService.addCandidateToPosition(candidateId, selectedPosition);

      // 4. Create interview in Hireflix
      const interview = await HireflixService.createInterview(
        selectedPosition,
        email,
        name
      );

      // 5. Send confirmation email
      const emailHtml = createConfirmationEmailHtml(name);
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

      // 6. Redirect to status page
      router.push(`/status/${candidateId}`);

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