import { NextRequest, NextResponse } from "next/server";

// Mock data for development - In production, this would come from your database
const mockApplications = [
  {
    id: "app-1",
    userId: "user-1",
    jobId: "job-501",
    jobTitle: "Fullstack Java Sênior",
    companyName: "TechCorp",
    appliedAt: "2024-12-27T10:30:00Z",
    status: "analyzing" as const,
    statusMessage: "Nossa IA está analisando seu currículo e comparando com os requisitos da vaga.",
    cvFileName: "curriculo-higor.pdf",
    userInfo: {
      name: "Higor Felipe Ribeiro",
      email: "pf388892@gmail.com",
      phone: "+55 11 99999-9999"
    },
    jobInfo: {
      title: "Fullstack Java Sênior",
      description: "Desenvolvimento de aplicações Java com Spring Boot e Angular",
      requirements: ["Java 8+", "Spring Boot", "Angular", "PostgreSQL", "Docker"],
      benefits: ["Vale Refeição", "Plano de Saúde", "Home Office"]
    },
    feedback: {
      aiAnalysis: "Perfil muito alinhado com a vaga. Experiência sólida em Java e Spring Boot.",
      passedRequirements: ["Java 8+", "Spring Boot", "PostgreSQL"],
      missingRequirements: ["Angular", "Docker"],
      improvementSuggestions: ["Adicionar experiência com Angular", "Estudar Docker para containerização"]
    },
    timeline: [
      {
        id: "t1",
        status: "pending" as const,
        message: "Candidatura recebida e adicionada à fila de análise",
        timestamp: "2024-12-27T10:30:00Z",
        isSystemGenerated: true
      },
      {
        id: "t2",
        status: "analyzing" as const,
        message: "IA iniciou análise do currículo",
        timestamp: "2024-12-27T10:35:00Z",
        isSystemGenerated: true
      }
    ]
  },
  {
    id: "app-2",
    userId: "user-1",
    jobId: "job-502",
    jobTitle: "Frontend React Developer",
    companyName: "StartupTech",
    appliedAt: "2024-12-26T14:20:00Z",
    status: "approved" as const,
    statusMessage: "Parabéns! Você passou na triagem inicial. Aguarde os próximos passos.",
    cvFileName: "curriculo-higor.pdf",
    userInfo: {
      name: "Higor Felipe Ribeiro",
      email: "pf388892@gmail.com",
      phone: "+55 11 99999-9999"
    },
    jobInfo: {
      title: "Frontend React Developer",
      description: "Desenvolvimento de interfaces modernas com React e TypeScript",
      requirements: ["React", "TypeScript", "CSS3", "Git"],
      benefits: ["Vale Refeição", "Flexibilidade de horário"]
    },
    feedback: {
      aiAnalysis: "Excelente match! Candidato possui todas as competências necessárias.",
      passedRequirements: ["React", "TypeScript", "CSS3", "Git"],
      missingRequirements: [],
      improvementSuggestions: []
    },
    timeline: [
      {
        id: "t1",
        status: "pending" as const,
        message: "Candidatura recebida",
        timestamp: "2024-12-26T14:20:00Z",
        isSystemGenerated: true
      },
      {
        id: "t2",
        status: "analyzing" as const,
        message: "Análise iniciada",
        timestamp: "2024-12-26T14:22:00Z",
        isSystemGenerated: true
      },
      {
        id: "t3",
        status: "approved" as const,
        message: "Aprovado na triagem inicial",
        timestamp: "2024-12-26T14:27:00Z",
        isSystemGenerated: true
      }
    ]
  },
  {
    id: "app-3",
    userId: "user-1",
    jobId: "job-503",
    jobTitle: "Backend Node.js Developer",
    companyName: "DevCorp",
    appliedAt: "2024-12-25T09:15:00Z",
    status: "rejected" as const,
    statusMessage: "Infelizmente, seu perfil não atende aos requisitos atuais desta vaga.",
    cvFileName: "curriculo-higor.pdf",
    userInfo: {
      name: "Higor Felipe Ribeiro",
      email: "pf388892@gmail.com",
      phone: "+55 11 99999-9999"
    },
    jobInfo: {
      title: "Backend Node.js Developer",
      description: "Desenvolvimento de APIs com Node.js e MongoDB",
      requirements: ["Node.js", "Express", "MongoDB", "AWS"],
      benefits: ["Vale Refeição", "Plano de Saúde"]
    },
    feedback: {
      aiAnalysis: "Candidato tem boa base técnica, mas não possui experiência específica com Node.js e MongoDB.",
      passedRequirements: [],
      missingRequirements: ["Node.js", "Express", "MongoDB", "AWS"],
      improvementSuggestions: [
        "Estudar Node.js e Express.js",
        "Aprender MongoDB",
        "Fazer cursos de AWS",
        "Desenvolver projetos práticos com essas tecnologias"
      ]
    },
    timeline: [
      {
        id: "t1",
        status: "pending" as const,
        message: "Candidatura recebida",
        timestamp: "2024-12-25T09:15:00Z",
        isSystemGenerated: true
      },
      {
        id: "t2",
        status: "analyzing" as const,
        message: "Análise em andamento",
        timestamp: "2024-12-25T09:17:00Z",
        isSystemGenerated: true
      },
      {
        id: "t3",
        status: "rejected" as const,
        message: "Não aprovado nesta etapa",
        timestamp: "2024-12-25T09:22:00Z",
        isSystemGenerated: true
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    // For demo purposes, we'll return all mock applications
    // In production, you would filter by authenticated user
    let applications = mockApplications;
    
    // Filter by status if provided
    if (status && status !== 'all') {
      applications = applications.filter(app => app.status === status);
    }

    // Sort by most recent first
    applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApplications = applications.slice(startIndex, endIndex);

    return NextResponse.json({
      applications: paginatedApplications,
      total: applications.length,
      page,
      limit,
      totalPages: Math.ceil(applications.length / limit)
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to update application status (called by N8N webhook)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, message, feedback, webhookKey } = body;

    // Verify webhook key for security
    if (webhookKey !== process.env.N8N_WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
    }

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, update the application in your database
    // For now, we'll just log it
    console.log('Updating application status:', {
      applicationId,
      status,
      message,
      feedback
    });

    // Here you would:
    // 1. Find the application by ID
    // 2. Update the status and message
    // 3. Add timeline entry
    // 4. Update feedback if provided
    // 5. Save to database

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
