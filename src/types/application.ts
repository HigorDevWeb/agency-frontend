export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName?: string;
  appliedAt: string;
  status: ApplicationStatus;
  statusMessage?: string;
  cvFileName?: string;
  cvUrl?: string;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  jobInfo?: {
    title: string;
    description?: string;
    requirements?: string[];
    benefits?: string[];
  };
  feedback?: {
    aiAnalysis?: string;
    rejectionReason?: string;
    improvementSuggestions?: string[];
    passedRequirements?: string[];
    missingRequirements?: string[];
  };
  timeline?: ApplicationTimeline[];
}

export type ApplicationStatus = 
  | 'pending'      // Aguardando análise
  | 'analyzing'    // Sendo analisada pela IA
  | 'approved'     // Aprovada - aguarde próximos passos
  | 'rejected'     // Rejeitada
  | 'interview'    // Chamado para entrevista
  | 'hired'        // Contratado
  | 'withdrawn';   // Retirada

export interface ApplicationTimeline {
  id: string;
  status: ApplicationStatus;
  message: string;
  timestamp: string;
  isSystemGenerated: boolean;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
}

export interface ApplicationStatusUpdate {
  applicationId: string;
  status: ApplicationStatus;
  message?: string;
  feedback?: Application['feedback'];
}
