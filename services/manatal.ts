import { MANATAL_API_TOKEN } from '../config';

export interface ManatalCandidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  position_applied?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ManatalResumeUpload {
  id: number;
  candidate_id: number;
  file_name: string;
  file_url: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

const MANATAL_BASE_URL = 'https://api.manatal.com/v3';

export interface ManatalCandidateExtended extends ManatalCandidate {
  full_name?: string;
  location?: string;
  source?: string;
  status?: string;
  interview_status?: string;
  hireflix_interview_status?: string;
  application_stage?: string;
  custom_fields?: Record<string, any>;
}

export class ManatalService {
  static async getAllCandidates(): Promise<ManatalCandidateExtended[]> {
    try {
      const response = await fetch('/api/manatal/all-candidates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch candidates: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.candidates || [];
    } catch (error) {
      console.error('Error fetching Manatal candidates:', error);
      return [];
    }
  }
  
  static async createCandidate(candidateData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    notes?: string;
    positionTitle?: string;
  }): Promise<ManatalCandidate> {
    try {
      const response = await fetch('/api/manatal/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create candidate: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.candidate;
    } catch (error) {
      console.error('Error creating Manatal candidate:', error);
      throw error;
    }
  }

  static async uploadResume(candidateId: number, resumeFile: File): Promise<ManatalResumeUpload> {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('candidateId', candidateId.toString());

      const response = await fetch('/api/manatal/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload resume: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.upload;
    } catch (error) {
      console.error('Error uploading resume to Manatal:', error);
      throw error;
    }
  }

  static async getCandidateStatus(candidateId: number): Promise<ManatalCandidate> {
    // This would typically be called from a server-side API route
    // For now, we'll simulate the response
    try {
      const mockCandidate: ManatalCandidate = {
        id: candidateId,
        first_name: 'Mock',
        last_name: 'Candidate',
        email: 'mock@example.com',
        notes: 'Mock candidate for development',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mockCandidate;
    } catch (error) {
      console.error('Error getting candidate status from Manatal:', error);
      throw error;
    }
  }

  static async addCandidateToPosition(candidateId: number, positionId: string): Promise<void> {
    try {
      // This would typically make an API call to associate candidate with position
      // For now, we'll just log it as this is not critical for the demo
      console.log(`Adding candidate ${candidateId} to position ${positionId}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding candidate to position:', error);
      // Don't throw error as this might not be critical
    }
  }
}
