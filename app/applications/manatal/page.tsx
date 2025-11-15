'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Edit, Trash2, FileText, Download, 
  Loader, AlertCircle, ChevronLeft, ChevronRight,
  Database
} from 'lucide-react';
import GradientButton from '../../../components/GradientButton';

// Types
interface Applicant {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  status?: string;
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
}

export default function ManatalApplicationsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Function to fetch applicants from Manatal
  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Add cache-busting timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/applications?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch applicants from Manatal');
      }
      
      const data = await response.json();
      
      // Filter applicants with custom fields set (quiz completed)
      const applicantsWithSurvey = data.filter(
        (applicant: Applicant) => 
          applicant.custom_fields && 
          applicant.custom_fields.quiz_completed === true
      );
      
      setApplicants(applicantsWithSurvey);
      setFilteredApplicants(applicantsWithSurvey);
      setTotalPages(Math.ceil(applicantsWithSurvey.length / itemsPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching applicants from Manatal:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch applicants on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredApplicants(applicants);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = applicants.filter(applicant => 
        applicant.full_name.toLowerCase().includes(term) || 
        applicant.email.toLowerCase().includes(term) ||
        (applicant.position && applicant.position.toLowerCase().includes(term))
      );
      setFilteredApplicants(filtered);
    }
    
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredApplicants.length / itemsPerPage));
  }, [searchTerm, applicants]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplicants.slice(startIndex, endIndex);
  };

  // Handle edit applicant
  const handleEdit = (applicant: Applicant) => {
    router.push(`/applications/edit/${applicant.id}`);
  };

  // Handle delete applicant
  const handleDelete = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowDeleteConfirm(true);
  };

  // Confirm delete applicant
  const confirmDelete = async () => {
    if (!selectedApplicant) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/applications/${selectedApplicant.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete applicant');
      }
      
      // Remove from state
      const updatedApplicants = applicants.filter(a => a.id !== selectedApplicant.id);
      setApplicants(updatedApplicants);
      setFilteredApplicants(updatedApplicants);
      
      setShowDeleteConfirm(false);
      setSelectedApplicant(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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

  // Render personality score with color coding
  const renderPersonalityScore = (score?: string) => {
    if (!score) return <span className="text-gray-400">N/A</span>;
    
    const numScore = parseFloat(score);
    let colorClass = 'text-gray-600';
    
    if (numScore >= 4.5) {
      colorClass = 'text-green-600 font-semibold';
    } else if (numScore >= 3.5) {
      colorClass = 'text-blue-600';
    } else if (numScore >= 2.5) {
      colorClass = 'text-yellow-600';
    } else {
      colorClass = 'text-red-600';
    }
    
    return <span className={colorClass}>{numScore.toFixed(1)}</span>;
  };

  if (isLoading && applicants.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading applicants from Manatal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="flex items-center">
                <Database className="h-8 w-8 mr-2 text-blue-600" />
                Manatal Applicants
              </span>
            </h1>
            <button 
              onClick={fetchApplicants}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              title="Refresh Manatal data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Refresh</span>
            </button>
            <GradientButton 
              onClick={() => router.push('/applications/firestore')}
              className="ml-4"
            >
              Switch to Firestore
            </GradientButton>
          </div>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applicants..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {filteredApplicants.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">No applicants found with completed surveys in Manatal.</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personality Scores
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Additional Info
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentPageItems().map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{applicant.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{applicant.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{applicant.position || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {applicant.status || applicant.custom_fields.application_flow || 'Applied'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div>O: {renderPersonalityScore(applicant.custom_fields.personality_openness)}</div>
                            <div>E: {renderPersonalityScore(applicant.custom_fields.personality_extraversion)}</div>
                            <div>A: {renderPersonalityScore(applicant.custom_fields.personality_agreeableness)}</div>
                            <div>C: {renderPersonalityScore(applicant.custom_fields.personality_conscientiousness)}</div>
                            <div>ES: {renderPersonalityScore(applicant.custom_fields.personality_emotionalstability)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {applicant.custom_fields.passport_country && (
                              <div><span className="font-medium">Passport:</span> {applicant.custom_fields.passport_country}</div>
                            )}
                            {applicant.custom_fields.golf_handicap && (
                              <div><span className="font-medium">Golf Handicap:</span> {applicant.custom_fields.golf_handicap}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {applicant.resume_url ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewResume(applicant.resume_url!)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Resume"
                              >
                                <FileText className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDownloadResume(applicant.resume_url!)}
                                className="text-green-600 hover:text-green-800"
                                title="Download Resume"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">No resume</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Resume Dialog */}
      {showResumeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Resume Preview</h3>
              <button
                onClick={() => setShowResumeDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                src={selectedResume}
                className="w-full h-full min-h-[500px] border"
                title="Resume Preview"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => handleDownloadResume(selectedResume)}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete {selectedApplicant.full_name}? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
