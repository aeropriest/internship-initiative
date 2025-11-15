'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart2, Briefcase, Calendar, MapPin, Mail, Phone, ExternalLink, Loader, AlertTriangle, Database, Cloud } from 'lucide-react';
import Link from 'next/link';
import { ManatalService, ManatalCandidateExtended } from '../../services/manatal';

interface Application {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  resumeUrl?: string;
  passportCountry?: string;
  golfHandicap?: string;
  status?: string;
  timestamp: string | Date;
  candidateId?: string | number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'firestore' | 'manatal'>('firestore');
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalQuizResults: 0,
    recentApplications: [] as Application[],
    loading: true,
    error: null as string | null
  });
  const [manatalCandidates, setManatalCandidates] = useState<ManatalCandidateExtended[]>([]);
  const [loadingManatal, setLoadingManatal] = useState(false);
  const [manatalError, setManatalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setStats({
          totalApplications: data.totalApplications || 0,
          totalQuizResults: data.totalQuizResults || 0,
          recentApplications: data.recentApplications || [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchManatalCandidates = async () => {
      if (activeTab === 'manatal') {
        setLoadingManatal(true);
        setManatalError(null);
        try {
          const candidates = await ManatalService.getAllCandidates();
          setManatalCandidates(candidates);
        } catch (error) {
          console.error('Error fetching Manatal candidates:', error);
          setManatalError(error instanceof Error ? error.message : 'Failed to fetch Manatal candidates');
        } finally {
          setLoadingManatal(false);
        }
      }
    };

    fetchManatalCandidates();
  }, [activeTab]);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status) {
      case 'Application Submitted':
        return 'bg-green-100 text-green-800';
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Interview Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer Extended':
        return 'bg-indigo-100 text-indigo-800';
      case 'Offer Accepted':
        return 'bg-teal-100 text-teal-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cards = [
    {
      name: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'bg-pink-500',
      href: '/dashboard/applications'
    },
    {
      name: 'Quiz Completions',
      value: stats.totalQuizResults,
      icon: FileText,
      color: 'bg-purple-500',
      href: '/dashboard/quiz-results'
    },
    {
      name: 'Open Positions',
      value: '5',
      icon: Briefcase,
      color: 'bg-blue-500',
      href: '#'
    },
    {
      name: 'Analytics',
      value: 'View',
      icon: BarChart2,
      color: 'bg-green-500',
      href: '/dashboard/analytics'
    }
  ];

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of applications and quiz results
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('firestore')}
            className={`${activeTab === 'firestore' 
              ? 'border-pink-500 text-pink-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Database className="mr-2 h-5 w-5" />
            Firestore Candidates
          </button>
          <button
            onClick={() => setActiveTab('manatal')}
            className={`${activeTab === 'manatal' 
              ? 'border-pink-500 text-pink-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Cloud className="mr-2 h-5 w-5" />
            Manatal Candidates
          </button>
        </nav>
      </div>

      {activeTab === 'firestore' ? (
        stats.loading ? (
          <div className="mt-6 flex justify-center">
            <Loader className="h-12 w-12 text-pink-500 animate-spin" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : stats.error ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {stats.error}
                </p>
              </div>
            </div>
          </div>
        ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {card.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
              <Link 
                href="/dashboard/applications" 
                className="text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                View all
              </Link>
            </div>
            
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              {stats.recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {application.email}
                                </div>
                                {application.phone && (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {application.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.position || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {application.location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                              {application.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(application.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/applications/${application.id}`}
                              className="text-pink-600 hover:text-pink-900 flex items-center justify-end"
                            >
                              View <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No applications yet
                </div>
              )}
            </div>
          </div>
        </>
      )
      ) : (
        // Manatal tab content
        loadingManatal ? (
          <div className="mt-6 flex justify-center">
            <Loader className="h-12 w-12 text-pink-500 animate-spin" />
            <span className="sr-only">Loading Manatal candidates...</span>
          </div>
        ) : manatalError ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {manatalError}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Manatal Candidates</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Candidates imported from Manatal ATS
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {manatalCandidates.length} candidates
                </span>
              </div>
              
              {manatalCandidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {manatalCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.full_name || `${candidate.first_name} ${candidate.last_name}`}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {candidate.email}
                                </div>
                                {candidate.phone && (
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {candidate.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{candidate.position_applied || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {candidate.location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                              {candidate.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(candidate.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No candidates found in Manatal
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
