'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart2, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalQuizResults: 0,
    recentApplications: [] as any[],
    loading: true,
    error: null as string | null
  });

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

      {stats.loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : stats.error ? (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
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

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              {stats.recentApplications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {stats.recentApplications.map((application: any) => (
                    <li key={application.id}>
                      <Link
                        href={`/dashboard/applications/${application.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-pink-600 truncate">
                              {application.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                application.status === 'Application Submitted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {application.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {application.position || 'No position specified'}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Applied on {new Date(application.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No applications yet
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
