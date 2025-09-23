import React from 'react';
import Footer from '../components/Footer';
import './globals.css';

export const metadata = {
  title: 'Global Internship Initiative',
  description: 'Connecting motivated graduates with leading clubs worldwide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
