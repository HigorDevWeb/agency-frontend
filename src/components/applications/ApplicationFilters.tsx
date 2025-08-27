"use client";

import { motion } from "framer-motion";
import { ApplicationStatus } from "@/types/application";

interface ApplicationFiltersProps {
  filterStatus: ApplicationStatus | 'all';
  setFilterStatus: (status: ApplicationStatus | 'all') => void;
  sortBy: 'newest' | 'oldest' | 'status';
  setSortBy: (sort: 'newest' | 'oldest' | 'status') => void;
  language: string;
}

export default function ApplicationFilters({
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  language
}: ApplicationFiltersProps) {
  
  const statusOptions = [
    { value: 'all', label: { en: 'All Status', pt: 'Todos os Status' }, icon: '📋' },
    { value: 'pending', label: { en: 'Pending', pt: 'Pendente' }, icon: '⏳' },
    { value: 'analyzing', label: { en: 'Analyzing', pt: 'Analisando' }, icon: '🤖' },
    { value: 'approved', label: { en: 'Approved', pt: 'Aprovado' }, icon: '✅' },
    { value: 'rejected', label: { en: 'Rejected', pt: 'Rejeitado' }, icon: '❌' },
    { value: 'interview', label: { en: 'Interview', pt: 'Entrevista' }, icon: '🎯' },
    { value: 'hired', label: { en: 'Hired', pt: 'Contratado' }, icon: '🎉' },
  ];

  const sortOptions = [
    { value: 'newest', label: { en: 'Newest First', pt: 'Mais Recentes' }, icon: '⬇️' },
    { value: 'oldest', label: { en: 'Oldest First', pt: 'Mais Antigas' }, icon: '⬆️' },
    { value: 'status', label: { en: 'By Status', pt: 'Por Status' }, icon: '📊' },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Status Filter */}
        <div>
          <h3 className="text-white font-medium mb-3">
            {language === 'en' ? 'Filter by Status' : 'Filtrar por Status'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterStatus(option.value as ApplicationStatus | 'all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === option.value
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {language === 'en' ? option.label.en : option.label.pt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="text-white font-medium mb-3">
            {language === 'en' ? 'Sort by' : 'Ordenar por'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSortBy(option.value as 'newest' | 'oldest' | 'status')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === option.value
                    ? 'bg-purple-600 text-white border border-purple-500'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {language === 'en' ? option.label.en : option.label.pt}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
