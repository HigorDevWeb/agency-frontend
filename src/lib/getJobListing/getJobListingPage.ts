// lib/getJobListing/getJobListingPage.ts

export interface Filter {
    id: number;
    label: string;
}

export interface FrontCardJob {
    id: number;
    jobTitle: string;
    labelType: string;
    companyLabel: string;
    jobType: string;
    jobSalary: string;
    jobHours: string;
    jobDescription: string | null;
    seeMoreButton: string;
    labelStack: string;
}

export interface InsideCardJob {
    id: number;
    JobTitle: string;
    companyTitle: string;
    jobInfo: string;
    jobStack: string;
    LevelLabel: string;
    applyButton: string;
    JobDescription: string;
    jobRequirements: string;
    jobbenefits: string;
    labelDescription: string;
    labelRequirements: string;
    labelBenefits: string;
}

export interface JobListingPage {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    featured_title: string;
    featured_subtitle: string;
    seeAllJobsButton: string;
    labelVoltar: string;
    filters: Filter[];
    frontCardJob: FrontCardJob[];
    insideCardJob: InsideCardJob[];
    localizations: string; // ajuste se precisar
}

// lib/getJobListing/getJobListingPage.ts

export async function getJobListingPage(locale?: string): Promise<JobListingPage | null> {
    try {
        // Adicionar locale como parâmetro de consulta se fornecido
        const localeParam = locale ? `locale=${locale}&` : '';
        
        const res = await fetch(`https://api.recruitings.info/api/job-listing-page?${localeParam}populate[filters][populate]=*&populate[frontCardJob]=true&populate[insideCardJob]=true`, {
            headers: { "Content-Type": "application/json" },
            // Se usar Next.js, ajuste cache/revalidate como preferir
            next: { revalidate: 60 },
        });
        
        if (!res.ok) {
            throw new Error(`Erro na API: ${res.status}`);
        }
        
        const { data } = await res.json();
        return data as JobListingPage;
    } catch (err) {
        console.error('Erro ao buscar dados do JobListingPage:', err);
        return null;
    }
}

