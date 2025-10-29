'use client';

import React, { useState, useEffect } from 'react';
import { Loader, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { FirebaseService, QuizResult } from '../../services/firebase';

export default function AnswersPage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof QuizResult>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Trait display names for better readability
  const traitDisplayNames: Record<string, string> = {
    extraversion: 'Extraversion',
    conscientiousness: 'Conscientiousness',
    agreeableness: 'Agreeableness',
    openness: 'Openness',
    emotionalStability: 'Emotional Stability'
  };

  // Question text mapping
  const questionText: Record<number, string> = {
    1: "I enjoy meeting new people and networking at events.",
    2: "I always plan my tasks and meet deadlines ahead of time.",
    3: "I prefer collaborating with a team rather than working alone.",
    4: "I like exploring new ideas and learning emerging technologies.",
    5: "I stay calm and focused during stressful situations.",
    6: "I take initiative to solve problems without being asked.",
    7: "I value feedback from others to improve my performance.",
    8: "I adapt quickly to changes in plans or environments.",
    9: "I feel energized after social interactions at work.",
    10: "I manage my emotions well when facing criticism."
  };

  // Answer text mapping
  const answerText: Record<number, string> = {
    1: "Strongly Disagree",
    2: "Disagree",
    3: "Neutral",
    4: "Agree",
    5: "Strongly Agree"
  };

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setIsLoading(true);
        const results = await FirebaseService.getQuizResults();
        setQuizResults(results);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  // Filter results based on search term
  const filteredResults = quizResults.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    return (
      result.name.toLowerCase().includes(searchLower) ||
      result.email.toLowerCase().includes(searchLower) ||
      (result.candidateId && result.candidateId.toLowerCase().includes(searchLower))
    );
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortField === 'timestamp') {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp as any);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp as any);
      
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    }
    
    const valueA = a[sortField] as string;
    const valueB = b[sortField] as string;
    
    if (sortDirection === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  const handleSort = (field: keyof QuizResult) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleExpand = (email: string) => {
    if (expandedResult === email) {
      setExpandedResult(null);
    } else {
      setExpandedResult(email);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <p className="text-gray-600 text-lg">Loading quiz results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full text-center">
          <p className="text-red-700 font-medium text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Applicant Quiz Results</h1>
        
        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email or candidate ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="text-gray-600 text-sm">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
          </div>
        </div>
        
        {/* Results table */}
        {sortedResults.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center">
                        Submitted
                        {sortField === 'timestamp' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trait Scores
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedResults.map((result) => {
                    const isExpanded = expandedResult === result.email;
                    const timestamp = result.timestamp instanceof Date 
                      ? result.timestamp 
                      : new Date(result.timestamp as any);
                    
                    return (
                      <React.Fragment key={result.email}>
                        <tr className={`${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{result.name}</div>
                            {result.candidateId && (
                              <div className="text-xs text-gray-500">ID: {result.candidateId}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {timestamp.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timestamp.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(result.traitScores).map(([trait, score]) => (
                                <div 
                                  key={trait} 
                                  className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center"
                                  title={`${traitDisplayNames[trait] || trait}: ${score.toFixed(2)}`}
                                >
                                  <span className="font-medium">{traitDisplayNames[trait]?.substring(0, 3) || trait.substring(0, 3)}</span>
                                  <span className="ml-1">{typeof score === 'number' ? score.toFixed(1) : score}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleExpand(result.email)}
                              className="text-pink-600 hover:text-pink-900 mr-4"
                            >
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </button>
                            {result.manatalUrl && (
                              <a
                                href={result.manatalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              >
                                <span className="mr-1">Manatal</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </td>
                        </tr>
                        
                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-blue-50">
                              <div className="border-t border-blue-200 pt-4 mt-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Answers</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Trait scores */}
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="text-md font-medium text-gray-800 mb-3">Personality Trait Scores</h4>
                                    <div className="space-y-3">
                                      {Object.entries(result.traitScores).map(([trait, score]) => (
                                        <div key={trait} className="flex items-center">
                                          <span className="text-sm font-medium text-gray-700 w-40">{traitDisplayNames[trait] || trait}</span>
                                          <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                                            <div 
                                              className="bg-pink-600 h-2.5 rounded-full" 
                                              style={{ width: `${(score / 5) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="ml-3 text-sm text-gray-600">{typeof score === 'number' ? score.toFixed(2) : score}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Individual question answers */}
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="text-md font-medium text-gray-800 mb-3">Question Responses</h4>
                                    <div className="space-y-3">
                                      {Object.entries(result.answers).map(([questionId, answer]) => (
                                        <div key={questionId} className="text-sm">
                                          <p className="font-medium text-gray-700">Q{questionId}: {questionText[parseInt(questionId)]}</p>
                                          <p className="text-gray-600 mt-1">
                                            Answer: <span className="font-medium">{answerText[answer] || answer}</span>
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Links */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                  {result.manatalUrl && (
                                    <a
                                      href={result.manatalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                                    >
                                      <span>View in Manatal</span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                  )}
                                  
                                  {result.hireflixUrl && (
                                    <a
                                      href={result.hireflixUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                                    >
                                      <span>View Video Interview</span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                  )}
                                  
                                  {result.candidateId && (
                                    <Link
                                      href={`/status/${result.candidateId}`}
                                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                                    >
                                      <span>View Status Page</span>
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-600">No quiz results found{searchTerm ? ' matching your search' : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
