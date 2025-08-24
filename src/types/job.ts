export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  tech: string[];
  type: string;
  level: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  companyInfo?: {
    name: string;
    size: string;
    industry: string;
    founded: string;
  };
}

export interface JobsData {
  jobs: Job[];
} 