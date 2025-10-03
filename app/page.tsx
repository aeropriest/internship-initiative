'use client';

import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Section from '../components/Section';
import { CheckCircle, Search, Users, BarChart, Globe, Briefcase, TrendingUp, BookOpen, Star, ChevronsRight, FileText, Video, UserCheck, MessageSquare, CheckSquare } from 'lucide-react';
import { partnershipData, valuePoints, timeline, faqData, screeningSteps, educationPoints } from '../constants';

const ValuePoint: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex items-start space-x-4">
    <div className="text-pink-500 mt-1">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      {/* <Section id="goals" title="The Club & Hospitality Industry faces two pressing challenges...">
        <div className="space-y-12 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg relative border border-gray-200">
            <div className="absolute -top-5 -left-5 bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-full shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 pl-10">Finding passionate seasonal staff</h3>
            <p className="text-gray-700 text-lg">
              Each year, clubs struggle to source motivated and capable team members to support peak season operations. Poor recruitment leads to poor customer service.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg relative border border-gray-200">
            <div className="absolute -top-5 -left-5 bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-full shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 pl-10">Creating pathways for future leaders</h3>
            <p className="text-gray-700 text-lg">
              Aspiring managers and professionals often lack structured opportunities for international experience, leadership development, and mentorship.
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-800 p-8 rounded-2xl shadow-2xl text-center">
            <p className="text-lg text-white font-large">
              The Global Internship Initiative has been introduced to solve both problems at once – by connecting motivated graduates with leading clubs worldwide, and giving clubs a reliable talent pipeline.
            </p>
          </div>
        </div>
      </Section> */}
{/* 
      <Section id="value" title="Quality Talent, Better Service, Higher Revenue">
        <p className="max-w-4xl mx-auto text-center text-gray-600 text-xl mb-16">
          The Initiative supports clubs in recruiting proactive passionate seasonal staff and provides a structured, international pathway for aspiring managers and professionals.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {valuePoints.map((point, index) => (
            <ValuePoint key={index} {...point} />
          ))}
        </div>
      </Section> */}
{/* 
      <Section id="partners" title="Partnering for Success">
        <p className="max-w-4xl mx-auto text-center text-gray-600 text-xl mb-16">
          Collaboration is key, allowing us to tap into the finest expertise & experience in the industry.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partnershipData.map((partner) => (
            <div key={partner.name} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-pink-400 transition-all duration-300 transform hover:-translate-y-2 shadow-lg">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">{partner.name}</h3>
              <ul className="space-y-3">
                {partner.points.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      
      <Section id="model" title="A Smarter Way to Build Your Team">
         <p className="max-w-4xl mx-auto text-center text-gray-600 text-xl mb-16">
           Candidates are placed at clubs during high season. During low seasons, they rotate to respected international clubs with opposing seasonal cycles.
        </p>
        <div className="overflow-x-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-gray-100 rounded-tl-lg"></th>
                <th className="p-4 bg-gray-100 text-purple-700 font-semibold">Year 1</th>
                <th className="p-4 bg-gray-100 text-purple-700 font-semibold">Year 2</th>
                <th className="p-4 bg-gray-100 text-purple-700 font-semibold rounded-tr-lg">Year 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-4 font-semibold text-purple-800">Home Club (High Season)</td>
                <td className="p-4 text-gray-700">Home Club</td>
                <td className="p-4 text-gray-700">Home Club</td>
                <td className="p-4 text-gray-700">Home Club</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-purple-800">Away Club (Low Season)</td>
                <td className="p-4 text-gray-700">Away Club Region 1</td>
                <td className="p-4 text-gray-700">Away Club Region 2</td>
                <td className="p-4 text-gray-700">Away Club Region 3</td>
              </tr>
               <tr>
                <td className="p-4 font-semibold text-purple-800">Included Education</td>
                <td className="p-4 text-gray-700">59club Accreditations & Leadership Training</td>
                <td className="p-4 text-gray-700">59club Accreditations & Leadership Training</td>
                <td className="p-4 text-gray-700">59club Accreditations & Leadership Training</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-purple-800">Supplemental Education</td>
                <td className="p-4 text-gray-700">PGA / CMAE / Agronomy</td>
                <td className="p-4 text-gray-700">PGA / CMAE / Agronomy</td>
                <td className="p-4 text-gray-700">PGA / CMAE / Agronomy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      
       <Section id="timeline" title="Professional Onboarding Timeline">
          <div className="max-w-3xl mx-auto">
              <div className="relative">
                  <div className="absolute left-1/2 -ml-0.5 w-1 bg-gray-200 h-full"></div>
                  {timeline.map((item, index) => (
                      <div key={index} className="mb-12 flex justify-between items-center w-full">
                          <div className={`w-5/12 ${index % 2 === 0 ? 'order-1' : 'order-3 text-right'}`}>
                              <p className="text-xl font-bold text-pink-500">{item.date}</p>
                          </div>
                          <div className="z-10 order-2 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                             <ChevronsRight className="text-white" />
                          </div>
                          <div className={`w-5/12 px-4 py-3 bg-white rounded-lg shadow-md border border-gray-200 ${index % 2 === 0 ? 'order-3' : 'order-1'}`}>
                              <p className="text-md text-gray-600">{item.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </Section>

      <Section id="screening" title="Finding the Right Fit for You">
        <p className="max-w-4xl mx-auto text-center text-gray-600 text-xl mb-16">
          Our five-step selection process finds the best candidates for you, your club, and the industry.
        </p>
        <div className="max-w-3xl mx-auto space-y-8">
            {screeningSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-6">
                    <div className="text-7xl font-bold text-gray-200">{index + 1}</div>
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-pink-600 mb-2 flex items-center">
                            {step.icon}
                            <span className="ml-3">{step.title}</span>
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </Section>

       <Section id="education" title="Expert Education">
         <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {educationPoints.map((point, index) => (
               <div key={index} className="bg-white p-6 rounded-lg flex items-start space-x-4 shadow-md border border-gray-200">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-full mt-1">
                      {point.icon}
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-purple-700">{point.title}</h3>
                      <p className="text-gray-600 mt-2">{point.description}</p>
                  </div>
              </div>
            ))}
        </div>
       </Section>

      <Section id="faq" title="Frequently Asked Questions">
        <div className="max-w-4xl mx-auto space-y-6">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200">
              <details className="group">
                <summary className="p-6 cursor-pointer flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-purple-800">{faq.question}</h3>
                  <span className="transform transition-transform duration-300 group-open:rotate-90 text-purple-600">
                    <ChevronsRight />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-700">
                  <p>{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      </Section> */}
    </>
  );
}
