"use client";

import { motion } from "framer-motion";
import { Application } from "@/types/application";

interface ApplicationStatsProps {
  applications: Application[];
  language: string;
}

export default function ApplicationStats({ applications, language }: ApplicationStatsProps) {
  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const analyzing = applications.filter(app => app.status === 'analyzing').length;
    const approved = applications.filter(app => ['approved', 'interview', 'hired'].includes(app.status)).length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, pending, analyzing, approved, rejected, successRate };
  };

  const stats = getStats();

  const statCards = [
    {
      title: { en: 'Total Applications', pt: 'Total de Candidaturas' },
      value: stats.total,
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-300'
    },
    {
      title: { en: 'Pending Review', pt: 'Aguardando Análise' },
      value: stats.pending + stats.analyzing,
      icon: '⏳',
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-300'
    },
    {
      title: { en: 'Approved', pt: 'Aprovadas' },
      value: stats.approved,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-300'
    },
    {
      title: { en: 'Success Rate', pt: 'Taxa de Sucesso' },
      value: `${stats.successRate}%`,
      icon: '📈',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-300'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title.en}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${card.color}`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{card.icon}</div>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.color}`}></div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium">
                  {language === 'en' ? card.title.en : card.title.pt}
                </h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>

              {/* Progress bar for success rate */}
              {card.title.en === 'Success Rate' && stats.total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.successRate}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${card.color}`}
                    ></motion.div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick insights */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <h4 className="text-white font-medium mb-2">
            {language === 'en' ? 'Quick Insights' : 'Insights Rápidos'}
          </h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            {stats.analyzing > 0 && (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                {language === 'en' 
                  ? `${stats.analyzing} application${stats.analyzing > 1 ? 's' : ''} being analyzed`
                  : `${stats.analyzing} candidatura${stats.analyzing > 1 ? 's' : ''} sendo analisada${stats.analyzing > 1 ? 's' : ''}`
                }
              </span>
            )}
            {stats.approved > 0 && (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {language === 'en' 
                  ? `${stats.approved} positive response${stats.approved > 1 ? 's' : ''}`
                  : `${stats.approved} resposta${stats.approved > 1 ? 's' : ''} positiva${stats.approved > 1 ? 's' : ''}`
                }
              </span>
            )}
            {stats.total >= 5 && stats.successRate > 50 && (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {language === 'en' 
                  ? 'Great success rate! Keep it up!'
                  : 'Ótima taxa de sucesso! Continue assim!'
                }
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
