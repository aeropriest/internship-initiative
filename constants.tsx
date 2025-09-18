
import React from 'react';
import { Briefcase, TrendingUp, Users, Globe, BarChart, BookOpen, Star, FileText, Video, UserCheck, MessageSquare, CheckSquare } from 'lucide-react';

export const valuePoints = [
  { icon: <Briefcase className="h-6 w-6" />, title: 'High Season Support', text: 'Motivated seasonal staff during peak periods.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Recruitment Efficiency', text: 'Guarantee seasonal headcount and save HR time and resources.' },
  { icon: <Users className="h-6 w-6" />, title: 'Pipeline of Future Employees', text: 'Turn seasonal interns into full-time talent.' },
  { icon: <BarChart className="h-6 w-6" />, title: 'Fresh ideas & Perspectives', text: 'Staff return with new skills and innovations.' },
  { icon: <Users className="h-6 w-6" />, title: 'Gen-Z Engagement', text: 'Your future customer base is also your future workforce.' },
  { icon: <Star className="h-6 w-6" />, title: 'Empowering Next-Gen Leaders', text: 'Attract and nurture passionate young professionals.' },
  { icon: <Globe className="h-6 w-6" />, title: 'International Experience', text: 'Graduates bring global exposure and cultural diversity.' },
];

export const partnershipData = [
  { name: 'Global Talent Solutions', points: ['Source graduates from top universities.', 'In-depth screening, interviews, and culture profiling.', 'Onboarding support & duty of care.', 'Visa application support.'] },
  { name: '59club', points: ['Trusted global club network.', 'Additional in-person training.', 'Industry certifications and benchmarking.', 'Regional support and candidate program management.'] },
  { name: 'Internal Club Leadership', points: ['Club onboarding & employee training.', 'Oversee progress & review assignments.', 'Foster an open-door culture.', 'Act as a mentor & challenge interns.'] },
  { name: 'Robincroft Leadership', points: ['Bespoke leadership development program.', 'One-to-one mentoring & online sessions.', 'Program management.'] },
  { name: 'PGA & CMAE', points: ['Supplementary education pathways.', 'Professional certifications & industry credentials.'] },
];

export const timeline = [
    { date: 'Sept. to Oct. 2025', description: 'On-boarding Clubs, begin graduate sourcing.' },
    { date: 'Nov. 2025', description: 'Graduate applications, screening interviews, video presentations, culture profiling.' },
    { date: 'Dec. 2025', description: 'Candidate shortlists presented to clubs; manager/HR interviews.' },
    { date: 'Jan. 2026', description: 'Home club onboarding and international club visa processes begin.' },
    { date: 'Apr. 2026', description: 'First interns start placements.' },
    { date: 'Oct. 2026', description: 'Second placements begin in opposite seasonal clubs.' }
];

export const screeningSteps = [
    { title: "CV Application", description: "Candidates formally apply with accompanying CV outlining their experience and education.", icon: <FileText /> },
    { title: "Video Presentation", description: "Candidates pitch themselves and their career goals via a short video.", icon: <Video /> },
    { title: "Culture Profiling", description: "Provides a foundational understanding of the candidates' organizational culture profile.", icon: <UserCheck /> },
    { title: "Screening Interview", description: "A face-to-face virtual meeting to understand the candidate's skills and emotional intelligence.", icon: <MessageSquare /> },
    { title: "Final Interview", description: "Candidate meets with club managers/HR to complete the final interview & selection process.", icon: <CheckSquare /> }
];

export const educationPoints = [
    { title: 'Industry Leading Education', description: '59club Training, 59club Service Excellence Certifications.', icon: <Star className="text-white"/> },
    { title: 'Internal Leadership', description: 'Club Managers at the host venue to be accessible, mentor with intent and challenge interns to lead.', icon: <Users className="text-white"/> },
    { title: 'External Leadership', description: 'Robincroft bespoke leadership coaching (group sessions + one-to-one mentoring).', icon: <Globe className="text-white"/> },
    { title: 'Supplementary', description: 'PGA & CMAE Professional Development Programs.', icon: <BookOpen className="text-white"/> }
];

export const faqData = [
  { question: "What if the candidate doesn't get a visa approved?", answer: "While visa application is supported at club level, and approval is ultimately outside of everyone's control, we don't leave you stranded. If a candidate is unsuccessful, Global Talent Solutions will work closely with you to identify a suitable replacement as quickly as possible, ensuring minimal disruption to your operation." },
  { question: 'What is expected from the clubs on-boarding?', answer: 'We simply ask that clubs engage with their new team members in the lead-up to the season and provide a welcoming environment when they arrive. This may include helping them source temporary accommodation and offering some local guidance, which goes a long way in setting your candidates up for success.' },
  { question: 'What are the financial costs to the club?', answer: 'Clubs are responsible for an annual program fee, a regionally competitive salary for candidates, and the visa cost. We work to keep the process transparent & track, ensuring you know exactly what to expect and that the investment delivers value through well-matched, motivated, & educated talent.' },
  { question: 'Which departments does the internship cover?', answer: 'The internship covers Golf Operations, Hospitality, F&B, and Agronomy, providing hands-on experience across every aspect of club and resort operations.' },
];
