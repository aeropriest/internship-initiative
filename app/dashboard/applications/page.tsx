'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  X,
  ExternalLink
} from 'lucide-react';

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
  timestamp: Date | any;
  candidateId?: string | number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Application>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    country: '',
    position: ''
  });

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/dashboard/applications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.applications || []);
        setFilteredApplications(data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter and sort applications
  useEffect(() => {
    let result = [...applications];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.name?.toLowerCase().includes(term) || 
        app.email?.toLowerCase().includes(term) ||
        app.position?.toLowerCase().includes(term) ||
        app.location?.toLowerCase().includes(term) ||
        app.passportCountry?.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.status) {
      result = result.filter(app => app.status === filters.status);
    }
    
    if (filters.country) {
      result = result.filter(app => app.passportCountry === filters.country);
    }
    
    if (filters.position) {
      result = result.filter(app => app.position === filters.position);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) {
        return 0;
      }
      
      if (sortField === 'timestamp') {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredApplications(result);
  }, [applications, searchTerm, sortField, sortDirection, filters]);

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(applications.map(app => app.status).filter(Boolean) as string[]));
  const uniqueCountries = Array.from(new Set(applications.map(app => app.passportCountry).filter(Boolean) as string[]));
  const uniquePositions = Array.from(new Set(applications.map(app => app.position).filter(Boolean) as string[]));

  // Handle sort click
  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Position', 'Passport Country', 'Golf Handicap', 'Status', 'Date Applied'];
    const rows = filteredApplications.map(app => [
      app.name,
      app.email,
      app.phone || '',
      app.location || '',
      app.position || '',
      app.passportCountry || '',
      app.golfHandicap || '',
      app.status || '',
      app.timestamp instanceof Date 
        ? app.timestamp.toLocaleDateString() 
        : new Date(app.timestamp).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      country: '',
      position: ''
    });
    setSearchTerm('');
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">Applications</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative rounded-md shadow-sm max-w-lg flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search applications..."
            />
          </div>

          {/* Filter button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <Filter className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filter
              {filterOpen ? (
                <ChevronUp className="ml-2 h-5 w-5" />
              ) : (
                <ChevronDown className="ml-2 h-5 w-5" />
              )}
            </button>

            {(filters.status || filters.country || filters.position) && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <X className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700">Passport Country</label>
                <select
                  id="country-filter"
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700">Position</label>
                <select
                  id="position-filter"
                  value={filters.position}
                  onChange={(e) => setFilters({...filters, position: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                >
                  <option value="">All Positions</option>
                  {uniquePositions.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>

        {/* Applications table */}
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading applications...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-500">{error}</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filters.status || filters.country || filters.position
                        ? 'Try adjusting your search or filter criteria'
                        : 'No applications have been submitted yet'}
                    </p>
                  </div>
                ) : (
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
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('position')}
                        >
                          <div className="flex items-center">
                            Position
                            {sortField === 'position' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('passportCountry')}
                        >
                          <div className="flex items-center">
                            Passport
                            {sortField === 'passportCountry' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('golfHandicap')}
                        >
                          <div className="flex items-center">
                            Golf Handicap
                            {sortField === 'golfHandicap' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center">
                            Date Applied
                            {sortField === 'timestamp' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {application.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.position || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.passportCountry || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{application.golfHandicap || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              application.status === 'Application Submitted' 
                                ? 'bg-green-100 text-green-800' 
                                : application.status === 'Interview Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {application.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.timestamp instanceof Date 
                              ? application.timestamp.toLocaleDateString() 
                              : new Date(application.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-3 justify-end">
                              {application.resumeUrl && (
                                <a 
                                  href={application.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-900"
                                >
                                  <span className="sr-only">View Resume</span>
                                  <ExternalLink className="h-5 w-5" />
                                </a>
                              )}
                              <Link
                                href={`/dashboard/applications/${application.id}`}
                                className="text-pink-600 hover:text-pink-900"
                              >
                                View Details
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
