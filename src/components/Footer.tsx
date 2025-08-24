"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getGlobal } from "@/lib/global/global";

interface FooterStats {
  id: number;
  value: string;
  label: string;
}

interface FooterLinksGroup {
  id: number;
  groupTitle: string;
}

interface GlobalData {
  companyName: string;
  companyDescription: string;
  copyrightText: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  cookiesUrl: string;
  madeWithText: string;
  developerName: string | null;
  developerUrl: string | null;
  footerStats: FooterStats[];
  footerLinksGroups: FooterLinksGroup[];
  footerSocialLinks: Array<{
    name?: string;
    icon?: string;
    href?: string;
    color?: string;
  }>;
}

export default function Footer() {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await getGlobal();
        setGlobalData(data);
      } catch (error) {
        console.error("Erro ao buscar dados globais:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  // Dados de fallback para redes sociais caso não haja dados da API
  const fallbackSocialLinks = [
    {
      name: "LinkedIn",
      icon: "💼",
      href: "#",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "GitHub",
      icon: "🐙",
      href: "#",
      color: "from-gray-700 to-gray-800",
    },
    {
      name: "Twitter",
      icon: "🐦",
      href: "#",
      color: "from-blue-400 to-blue-500",
    },
    {
      name: "Discord",
      icon: "🎮",
      href: "#",
      color: "from-indigo-600 to-purple-600",
    },
  ];

  // Dados de fallback para links do footer caso não haja dados da API
  const fallbackFooterLinks = {
    "Para Desenvolvedores": [
      "Buscar Vagas",
      "Criar Perfil",
      "Salários Tech",
      "Guia de Carreira",
    ],
    "Para Empresas": [
      "Postar Vagas",
      "Buscar Talentos",
      "Planos Premium",
      "Recrutamento Tech",
    ],
    Recursos: ["Blog Tech", "Webinars", "Comunidade", "Newsletter"],
    Suporte: ["Central de Ajuda", "Contato", "Termos de Uso", "Privacidade"],
  };

  // Função para obter ícone baseado no label
  const getIconForLabel = (label: string) => {
    const iconMap: { [key: string]: string } = {
      "Vagas Ativas": "💼",
      "Desenvolvedores": "👨‍💻",
      "Empresas Parceiras": "🏢",
      "Contratações": "🤝",
    };
    return iconMap[label] || "📊";
  };

  if (loading) {
    return (
      <footer className="relative bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-gray-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-12 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (!globalData) {
    return (
      <footer className="relative bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-gray-700">
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-red-400">Erro ao carregar dados do footer</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-gray-700">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {globalData.footerStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-4xl mb-2"
              >
                {getIconForLabel(stat.label)}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                viewport={{ once: true }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1"
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">⚡</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {globalData.companyName}
              </span>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed">
              {globalData.companyDescription}
            </p>

            <div className="flex space-x-4">
              {(globalData.footerSocialLinks.length > 0 
                ? globalData.footerSocialLinks 
                : fallbackSocialLinks
              ).map((social, index) => (
                <motion.a
                  key={social.name || index}
                  href={social.href || "#"}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.9 }}
                  viewport={{ once: true }}
                  className={`w-12 h-12 bg-gradient-to-br ${social.color || "from-blue-600 to-purple-600"} rounded-lg flex items-center justify-center text-white hover:shadow-lg transition-all duration-300`}
                >
                  <span className="text-xl">{social.icon || "🔗"}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {globalData.footerLinksGroups.map((group, categoryIndex) => {
            // Usar dados de fallback para os links se não houver dados específicos
            const groupLinks = fallbackFooterLinks[group.groupTitle as keyof typeof fallbackFooterLinks] || [];
            
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-white font-semibold mb-4">{group.groupTitle}</h3>
                <ul className="space-y-2">
                  {groupLinks.map((link, linkIndex) => (
                    <motion.li
                      key={link}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: categoryIndex * 0.1 + linkIndex * 0.05,
                      }}
                      viewport={{ once: true }}
                    >
                      <motion.a
                        href="#"
                        whileHover={{ x: 5, color: "#60a5fa" }}
                        className="text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm"
                      >
                        {link}
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-gray-400 text-sm"
            >
              {globalData.copyrightText}
            </motion.div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <motion.span
                whileHover={{ scale: 1.1, color: "#60a5fa" }}
                className="cursor-pointer transition-all duration-200"
              >
                {globalData.privacyPolicyUrl}
              </motion.span>
              <span>•</span>
              <motion.span
                whileHover={{ scale: 1.1, color: "#60a5fa" }}
                className="cursor-pointer transition-all duration-200"
              >
                {globalData.termsUrl}
              </motion.span>
              <span>•</span>
              <motion.span
                whileHover={{ scale: 1.1, color: "#60a5fa" }}
                className="cursor-pointer transition-all duration-200"
              >
                {globalData.cookiesUrl}
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 text-sm text-gray-400"
            >
              <span dangerouslySetInnerHTML={{ __html: globalData.madeWithText }} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      />
    </footer>
  );
}
