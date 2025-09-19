import { HIREFLIX_API_KEY } from '../config';

export interface HireflixPosition {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  employment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HireflixInterview {
  id: string;
  position_id: string;
  candidate_email: string;
  interview_url: string | null;
  status: string;
  created_at: string;
  existing_candidate?: boolean;
  manatal_candidate_id?: string;
}

export interface HireflixInterviewResponse {
  success: boolean;
  interview: HireflixInterview;
  message?: string;
  user_message?: string;
}

const HIREFLIX_BASE_URL = 'https://api.hireflix.com/v1';

export class HireflixService {
  static async getOpenPositions(): Promise<HireflixPosition[]> {
    try {
      const response = await fetch('/api/hireflix/positions?status=open', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Hireflix API Error:', data);
        throw new Error(`Failed to fetch positions: ${data.error || response.statusText}`);
      }

      if (data.success && data.positions) {
        console.log(`Loaded ${data.positions.length} positions from ${data.source || 'API'}`);
        return data.positions;
      } else {
        throw new Error('No positions returned from API');
      }
    } catch (error) {
      console.error('Error fetching Hireflix positions:', error);
      throw error;
    }
  }

  static async createInterview(positionId: string, candidateEmail: string, candidateName: string, manatalCandidateId?: number): Promise<HireflixInterviewResponse> {
    try {
      const response = await fetch('/api/hireflix/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position_id: positionId,
          candidate_email: candidateEmail,
          candidate_name: candidateName,
          manatal_candidate_id: manatalCandidateId?.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create interview: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Return the full response object
    } catch (error) {
      console.error('Error creating Hireflix interview:', error);
      throw error;
    }
  }
}
