"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getContactPage } from "@/lib/contact-page/contact-page";

interface ContactPageData {
  section_title: string;
  section_subtitle: string;
  socialTitle: string;
  contactTitle: string;
  contactForm: {
    namePlaceholder: string;
    emailPlaceholder: string;
    empresaPlaceholder: string;
    mensagePlaceholder: string;
    buttonSend: string;
  };
  contactInfo: Array<{
    id: number;
    Label: string;
    input: string;
  }>;
  socialLinks: Array<{
    name?: string;
    icon?: string;
    href?: string;
  }>;
}

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [contactData, setContactData] = useState<ContactPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const data = await getContactPage();
        setContactData(data);
      } catch (error) {
        console.error("Erro ao buscar dados de contato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <section ref={ref} className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!contactData) {
    return (
      <section ref={ref} className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-400">Erro ao carregar dados de contato</p>
        </div>
      </section>
    );
  }

  // Mapeamento de ícones para os tipos de contato
  const getIconForLabel = (label: string) => {
    const iconMap: { [key: string]: string } = {
      "Email": "📧",
      "Telefone": "📱",
      "Endereço": "📍",
      "Website": "🌐",
    };
    return iconMap[label.trim()] || "📞";
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
            {contactData.section_title}
          </h2>
          <p className="text-xl text-gray-300">
            {contactData.section_subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-white">
              {contactData.contactTitle}
            </h3>

            <div className="space-y-6">
              {contactData.contactInfo.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                  }
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                >
                  <span className="text-2xl">{getIconForLabel(item.Label)}</span>
                  <div>
                    <p className="text-gray-400 text-sm">{item.Label}</p>
                    <p className="text-white font-medium">{item.input}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <h4 className="text-lg font-semibold mb-4 text-white">
                {contactData.socialTitle}
              </h4>
              <div className="flex gap-4">
                {contactData.socialLinks.length > 0 ? (
                  contactData.socialLinks.map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-white font-bold text-sm">
                        {social.name ? social.name.slice(0, 2) : "S"}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  // Fallback para redes sociais padrão se não houver dados
                  ["LinkedIn", "GitHub", "Twitter", "Instagram"].map(
                    (social) => (
                      <motion.div
                        key={social}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
                      >
                        <span className="text-white font-bold text-sm">
                          {social.slice(0, 2)}
                        </span>
                      </motion.div>
                    )
                  )
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="name"
                  placeholder={contactData.contactForm.namePlaceholder}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                  required
                />
              </div>

              <div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  name="email"
                  placeholder={contactData.contactForm.emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                  required
                />
              </div>

              <div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="company"
                  placeholder={contactData.contactForm.empresaPlaceholder}
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                />
              </div>

              <div>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  name="message"
                  placeholder={contactData.contactForm.mensagePlaceholder}
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                {contactData.contactForm.buttonSend}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
