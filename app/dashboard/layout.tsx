'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie, deleteCookie } from 'cookies-next';
import { 
  Users, 
  FileText, 
  BarChart2, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = getCookie('auth_token');
    setIsAuthenticated(!!token);
    
    // If not authenticated and not on login page, redirect to login
    if (!token && pathname !== '/dashboard/login') {
      router.push('/dashboard/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    deleteCookie('auth_token');
    router.push('/dashboard/login');
  };

  // Skip layout rendering for login page
  if (pathname === '/dashboard/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'Applications', href: '/dashboard/applications', icon: Users, current: pathname === '/dashboard/applications' },
    { name: 'Quiz Results', href: '/dashboard/quiz-results', icon: FileText, current: pathname === '/dashboard/quiz-results' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2, current: pathname === '/dashboard/analytics' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 group block w-full flex items-center"
            >
              <div className="flex items-center">
                <div>
                  <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
