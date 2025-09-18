'use client';

import React from 'react';
import ApplicationForm from '../../components/ApplicationForm';

export default function ApplicationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden bg-gray-50">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-pink-500/5 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-600/5 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>

        <div className="relative z-10 w-full max-w-2xl">
            <ApplicationForm />
        </div>
    </div>
  );
}
