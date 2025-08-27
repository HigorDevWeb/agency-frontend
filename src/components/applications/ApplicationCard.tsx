"use client";

import { motion } from "framer-motion";
import { Application, ApplicationStatus } from "@/types/application";
import { useState } from "react";

interface ApplicationCardProps {
  application: Application;
  language: string;
  index: number;
}

export default function ApplicationCard({ application, language, index }: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = (status: ApplicationStatus) => {
    const configs = {
      pending: {
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: '⏳',
        text: {
          en: 'Pending Analysis',
          pt: 'Aguardando Análise'
        }
      },
      analyzing: {
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: '🤖',
        text: {
          en: 'AI Analyzing',
          pt: 'IA Analisando'
        }
      },
      approved: {
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: '✅',
        text: {
          en: 'Approved',
          pt: 'Aprovado'
        }
      },
      rejected: {
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: '❌',
        text: {
          en: 'Not Selected',
          pt: 'Não Selecionado'
        }
      },
      interview: {
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: '🎯',
        text: {
          en: 'Interview',
          pt: 'Entrevista'
        }
      },
      hired: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: '🎉',
        text: {
          en: 'Hired',
          pt: 'Contratado'
        }
      },
      withdrawn: {
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '⏸️',
        text: {
          en: 'Withdrawn',
          pt: 'Retirada'
        }
      }
    };

    return configs[status];
  };

  const statusConfig = getStatusConfig(application.status);
  const statusText = language === 'en' ? statusConfig.text.en : statusConfig.text.pt;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusMessage = () => {
    if (application.statusMessage) return application.statusMessage;
    
    const defaultMessages = {
      pending: {
        en: 'Your application is in queue for analysis. We\'ll update you soon!',
        pt: 'Sua candidatura está na fila para análise. Atualizaremos você em breve!'
      },
      analyzing: {
        en: 'Our AI is currently analyzing your resume and matching it with job requirements.',
        pt: 'Nossa IA está analisando seu currículo e comparando com os requisitos da vaga.'
      },
      approved: {
        en: 'Congratulations! You passed the initial screening. Wait for next steps.',
        pt: 'Parabéns! Você passou na triagem inicial. Aguarde os próximos passos.'
      },
      rejected: {
        en: 'Unfortunately, your profile doesn\'t match the current requirements.',
        pt: 'Infelizmente, seu perfil não atende aos requisitos atuais.'
      },
      interview: {
        en: 'You\'ve been selected for an interview! Check your email for details.',
        pt: 'Você foi selecionado para entrevista! Verifique seu e-mail para detalhes.'
      },
      hired: {
        en: 'Congratulations! You\'ve been hired. Welcome to the team!',
        pt: 'Parabéns! Você foi contratado. Bem-vindo ao time!'
      },
      withdrawn: {
        en: 'This application has been withdrawn.',
        pt: 'Esta candidatura foi retirada.'
      }
    };

    return language === 'en' 
      ? defaultMessages[application.status].en 
      : defaultMessages[application.status].pt;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-300"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {application.jobTitle}
            </h3>
            {application.companyName && (
              <p className="text-gray-400 text-sm">
                {application.companyName}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {language === 'en' ? 'Applied on' : 'Candidatura enviada em'} {formatDate(application.appliedAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${statusConfig.color}`}>
              <span className="mr-2">{statusConfig.icon}</span>
              {statusText}
            </div>

            {/* Expand Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              <motion.svg
                animate={{ rotate: expanded ? 180 : 0 }}
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-300 text-sm leading-relaxed">
            {getStatusMessage()}
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">
              {language === 'en' ? 'Applicant:' : 'Candidato:'}
            </span>
            <p className="text-white font-medium">{application.userInfo.name}</p>
          </div>
          <div>
            <span className="text-gray-400">
              {language === 'en' ? 'Email:' : 'E-mail:'}
            </span>
            <p className="text-white font-medium">{application.userInfo.email}</p>
          </div>
          {application.userInfo.phone && (
            <div>
              <span className="text-gray-400">
                {language === 'en' ? 'Phone:' : 'Telefone:'}
              </span>
              <p className="text-white font-medium">{application.userInfo.phone}</p>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: expanded ? 'auto' : 0, 
            opacity: expanded ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-6">
            {/* CV Info */}
            {application.cvFileName && (
              <div>
                <h4 className="text-white font-medium mb-2">
                  {language === 'en' ? 'Resume' : 'Currículo'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{application.cvFileName}</span>
                  {application.cvUrl && (
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 ml-2"
                    >
                      ({language === 'en' ? 'View' : 'Ver'})
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {application.feedback && (
              <div>
                <h4 className="text-white font-medium mb-3">
                  {language === 'en' ? 'AI Analysis' : 'Análise da IA'}
                </h4>
                
                {application.feedback.aiAnalysis && (
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-300 text-sm">{application.feedback.aiAnalysis}</p>
                  </div>
                )}

                {application.feedback.passedRequirements && application.feedback.passedRequirements.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-green-400 font-medium text-sm mb-2">
                      {language === 'en' ? 'Matched Requirements:' : 'Requisitos Atendidos:'}
                    </h5>
                    <ul className="space-y-1">
                      {application.feedback.passedRequirements.map((req, reqIdx) => (
                        <li key={reqIdx} className="text-green-300 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.feedback.missingRequirements && application.feedback.missingRequirements.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-red-400 font-medium text-sm mb-2">
                      {language === 'en' ? 'Missing Requirements:' : 'Requisitos Não Atendidos:'}
                    </h5>
                    <ul className="space-y-1">
                      {application.feedback.missingRequirements.map((req, missingIdx) => (
                        <li key={missingIdx} className="text-red-300 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.feedback.improvementSuggestions && application.feedback.improvementSuggestions.length > 0 && (
                  <div>
                    <h5 className="text-yellow-400 font-medium text-sm mb-2">
                      {language === 'en' ? 'Improvement Suggestions:' : 'Sugestões de Melhoria:'}
                    </h5>
                    <ul className="space-y-1">
                      {application.feedback.improvementSuggestions.map((suggestion, suggestionIdx) => (
                        <li key={suggestionIdx} className="text-yellow-300 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            {application.timeline && application.timeline.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">
                  {language === 'en' ? 'Timeline' : 'Linha do Tempo'}
                </h4>
                <div className="space-y-3">
                  {application.timeline.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {getStatusConfig(event.status).text[language === 'en' ? 'en' : 'pt']}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDate(event.timestamp)}
                        </p>
                        {event.message && (
                          <p className="text-gray-300 text-sm mt-1">{event.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
