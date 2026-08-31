export interface Job {
    id: string;
    title: string;
    company: string;
    location: string | null;
    jobType: string | null;
    salary: string | null;
    experience: string | null;
    description: string | null;
    jobUrl: string | null;
    source: string | null;
    createdAt: string;
    updatedAt: string;
    saved: boolean;
    applicationStatus?: string | null;
    applicationId?: string | null;
  }
  
  export interface JobsResponse {
    success: boolean;
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }