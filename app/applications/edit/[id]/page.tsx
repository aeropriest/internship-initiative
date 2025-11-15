'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader, AlertCircle, ArrowLeft, Save, FileText, Download, X 
} from 'lucide-react';
import GradientButton from '../../../../components/GradientButton';

// Types
interface Applicant {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  position_id?: number;
  status?: string;
  status_id?: number;
  created_at: string;
  updated_at: string;
  custom_fields: {
    personality_openness?: string;
    personality_extraversion?: string;
    personality_agreeableness?: string;
    personality_conscientiousness?: string;
    personality_emotionalstability?: string;
    quiz_completed?: boolean;
    application_flow?: string;
    application_source?: string;
    [key: string]: any;
  };
  resume_url?: string;
  attachments?: Array<{
    id: number;
    name: string;
    file: string;
    type: string;
  }>;
}

export default function EditApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [formData, setFormData] = useState<any>({
    full_name: '',
    email: '',
    phone: '',
    custom_fields: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');

  // Fetch applicant data
  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch(`/api/applications/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applicant');
        }
        
        const data = await response.json();
        setApplicant(data);
        
        // Initialize form data
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          custom_fields: {
            ...data.custom_fields,
            personality_openness: data.custom_fields.personality_openness || '',
            personality_extraversion: data.custom_fields.personality_extraversion || '',
            personality_agreeableness: data.custom_fields.personality_agreeableness || '',
            personality_conscientiousness: data.custom_fields.personality_conscientiousness || '',
            personality_emotionalstability: data.custom_fields.personality_emotionalstability || '',
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching applicant:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchApplicant();
    }
  }, [id]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle custom field change
  const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [name]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Prepare data for API
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        custom_fields: formData.custom_fields
      };
      
      // Update applicant via API
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update applicant');
      }
      
      setSuccessMessage('Applicant updated successfully');
      
      // Refresh applicant data
      const updatedApplicant = await response.json();
      setApplicant(updatedApplicant);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating');
      console.error('Error updating applicant:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle view resume
  const handleViewResume = (resumeUrl: string) => {
    setSelectedResume(resumeUrl);
    setShowResumeDialog(true);
  };

  // Handle download resume
  const handleDownloadResume = (resumeUrl: string) => {
    window.open(resumeUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading applicant data...</p>
      </div>
    );
  }

  if (!applicant && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Applicant not found</p>
        <button
          onClick={() => router.push('/applications')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/applications')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Applicant</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={applicant?.position || 'N/A'}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personality Assessment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="personality_openness" className="block text-sm font-medium text-gray-700 mb-1">
                    Openness
                  </label>
                  <input
                    type="number"
                    id="personality_openness"
                    name="personality_openness"
                    min="1"
                    max="5"
                    step="0.01"
                    value={formData.custom_fields.personality_openness || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="personality_extraversion" className="block text-sm font-medium text-gray-700 mb-1">
                    Extraversion
                  </label>
                  <input
                    type="number"
                    id="personality_extraversion"
                    name="personality_extraversion"
                    min="1"
                    max="5"
                    step="0.01"
                    value={formData.custom_fields.personality_extraversion || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="personality_agreeableness" className="block text-sm font-medium text-gray-700 mb-1">
                    Agreeableness
                  </label>
                  <input
                    type="number"
                    id="personality_agreeableness"
                    name="personality_agreeableness"
                    min="1"
                    max="5"
                    step="0.01"
                    value={formData.custom_fields.personality_agreeableness || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="personality_conscientiousness" className="block text-sm font-medium text-gray-700 mb-1">
                    Conscientiousness
                  </label>
                  <input
                    type="number"
                    id="personality_conscientiousness"
                    name="personality_conscientiousness"
                    min="1"
                    max="5"
                    step="0.01"
                    value={formData.custom_fields.personality_conscientiousness || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="personality_emotionalstability" className="block text-sm font-medium text-gray-700 mb-1">
                    Emotional Stability
                  </label>
                  <input
                    type="number"
                    id="personality_emotionalstability"
                    name="personality_emotionalstability"
                    min="1"
                    max="5"
                    step="0.01"
                    value={formData.custom_fields.personality_emotionalstability || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="application_flow" className="block text-sm font-medium text-gray-700 mb-1">
                    Application Flow
                  </label>
                  <select
                    id="application_flow"
                    name="application_flow"
                    value={formData.custom_fields.application_flow || ''}
                    onChange={handleCustomFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Application Submitted">Application Submitted</option>
                    <option value="Resume Uploaded">Resume Uploaded</option>
                    <option value="Questionnaire Completed">Questionnaire Completed</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {applicant?.resume_url && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume</h2>
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-gray-600">Resume is available for this applicant</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewResume(applicant.resume_url!)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadResume(applicant.resume_url!)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 flex justify-end">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/applications')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Resume Dialog */}
      {showResumeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadResume(selectedResume)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Download Resume"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowResumeDialog(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                src={selectedResume}
                className="w-full h-full border-0"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
