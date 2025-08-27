"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Application, ApplicationStatus } from "@/types/application";
import ApplicationCard from "@/components/applications/ApplicationCard";
import ApplicationFilters from "@/components/applications/ApplicationFilters";
import ApplicationStats from "@/components/applications/ApplicationStats";
import LoadingScreen from "@/components/LoadingScreen";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');

  // Fetch applications
  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup real-time updates
  useEffect(() => {
    if (!user) return;

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchApplications(false); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApplications = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(language === 'en' ? 'Failed to load applications' : 'Falha ao carregar candidaturas');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter(app => filterStatus === 'all' || app.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        case 'oldest':
          return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-white mb-4">
            {language === 'en' ? 'Please log in to view your applications' : 'Faça login para ver suas candidaturas'}
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'en' ? 'My Applications' : 'Minhas Candidaturas'}
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Track all your job applications and their current status in real-time'
                : 'Acompanhe todas as suas candidaturas e seus status atuais em tempo real'
              }
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <ApplicationStats applications={applications} language={language} />

        {/* Filters and Sort */}
        <div className="mb-8">
          <ApplicationFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            language={language}
          />
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center"
          >
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => fetchApplications()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {language === 'en' ? 'Try Again' : 'Tentar Novamente'}
            </button>
          </motion.div>
        )}

        {/* Applications List */}
        <AnimatePresence mode="wait">
          {filteredAndSortedApplications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {language === 'en' ? 'No applications found' : 'Nenhuma candidatura encontrada'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {language === 'en' 
                  ? 'You haven\'t applied to any jobs yet. Start exploring opportunities and submit your first application!'
                  : 'Você ainda não se candidatou a nenhuma vaga. Comece a explorar oportunidades e envie sua primeira candidatura!'
                }
              </p>
              <motion.a
                href="/jobs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                {language === 'en' ? 'Browse Jobs' : 'Explorar Vagas'}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {filteredAndSortedApplications.map((application, index) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  language={language}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh Button */}
        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchApplications()}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            {language === 'en' ? 'Refresh' : 'Atualizar'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
