"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AnalyticsData {
  profileViews: number;
  applications: number;
  interviews: number;
  offers: number;
  chartData: { name: string; value: number; color: string }[];
  recentActivity: {
    type: string;
    message: string;
    time: string;
    icon: string;
  }[];
}

export default function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    profileViews: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
    chartData: [],
    recentActivity: [],
  });

  const [animatedValues, setAnimatedValues] = useState({
    profileViews: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
  });

  useEffect(() => {
    const mockData: AnalyticsData = {
      profileViews: 247,
      applications: 23,
      interviews: 8,
      offers: 3,
      chartData: [
        { name: "Frontend", value: 45, color: "#3b82f6" },
        { name: "Backend", value: 30, color: "#8b5cf6" },
        { name: "Fullstack", value: 20, color: "#10b981" },
        { name: "DevOps", value: 5, color: "#f59e0b" },
      ],
      recentActivity: [
        {
          type: "view",
          message: "Empresa TechCorp visualizou seu perfil",
          time: "2 min atrás",
          icon: "👁️",
        },
        {
          type: "application",
          message: "Você se candidatou para Senior React Developer",
          time: "1 hora atrás",
          icon: "📝",
        },
        {
          type: "interview",
          message: "Entrevista marcada com StartupXYZ",
          time: "3 horas atrás",
          icon: "🎯",
        },
        {
          type: "offer",
          message: "Nova proposta de CloudStart",
          time: "1 dia atrás",
          icon: "🎉",
        },
      ],
    };

    setData(mockData);

    const animateValues = (
      target: keyof typeof animatedValues,
      targetValue: number
    ) => {
      let current = 0;
      const increment = targetValue / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          current = targetValue;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({
          ...prev,
          [target]: Math.floor(current),
        }));
      }, 30);
    };

    setTimeout(() => animateValues("profileViews", mockData.profileViews), 200);
    setTimeout(() => animateValues("applications", mockData.applications), 400);
    setTimeout(() => animateValues("interviews", mockData.interviews), 600);
    setTimeout(() => animateValues("offers", mockData.offers), 800);
  }, []);

  const metrics = [
    {
      label: "Visualizações do Perfil",
      value: animatedValues.profileViews,
      icon: "👁️",
      color: "from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      label: "Candidaturas Enviadas",
      value: animatedValues.applications,
      icon: "📝",
      color: "from-purple-500 to-pink-500",
      change: "+8%",
    },
    {
      label: "Entrevistas Agendadas",
      value: animatedValues.interviews,
      icon: "🎯",
      color: "from-green-500 to-emerald-500",
      change: "+25%",
    },
    {
      label: "Propostas Recebidas",
      value: animatedValues.offers,
      icon: "🎉",
      color: "from-orange-500 to-red-500",
      change: "+50%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="relative overflow-hidden"
          >
            <div
              className={`bg-gradient-to-br ${metric.color} p-6 rounded-2xl text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{metric.icon}</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-sm bg-white/20 px-2 py-1 rounded-full"
                >
                  {metric.change}
                </motion.div>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                className="text-3xl font-bold mb-2"
              >
                {metric.value}
              </motion.div>

              <p className="text-sm opacity-90">{metric.label}</p>

              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico de distribuição */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 p-6 rounded-2xl border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-6">
            Distribuição por Área
          </h3>

          <div className="space-y-4">
            {data.chartData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white font-semibold">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="h-full rounded-full relative"
                      style={{ backgroundColor: item.color }}
                    >
                      <motion.div
                        animate={{ x: [0, 20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-white/20 w-full"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Atividade recente */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 p-6 rounded-2xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Atividade Recente</h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 bg-green-500 rounded-full"
            />
          </div>

          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <motion.div whileHover={{ scale: 1.2 }} className="text-2xl">
                  {activity.icon}
                </motion.div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            Ver todas as atividades →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
