"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FilterState {
  location: string[];
  experience: string[];
  salary: [number, number];
  technologies: string[];
  workMode: string[];
  companySize: string[];
}

export default function AdvancedFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    experience: [],
    salary: [0, 50000],
    technologies: [],
    workMode: [],
    companySize: [],
  });

  const filterOptions = {
    experience: ["Júnior", "Pleno", "Sênior", "Staff", "Principal"],
    technologies: [
      "React",
      "Node.js",
      "Python",
      "Java",
      "TypeScript",
      "Go",
      "Rust",
      "PHP",
    ],
    workMode: ["Remoto", "Presencial", "Híbrido"],
    companySize: ["Startup", "Pequena", "Média", "Grande", "Multinacional"],
    location: [
      "São Paulo",
      "Rio de Janeiro",
      "Belo Horizonte",
      "Brasília",
      "Porto Alegre",
    ],
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    if (category === "salary") return; // salary is not an array

    setFilters((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter((item) => item !== value)
        : [...(prev[category] as string[]), value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: [],
      experience: [],
      salary: [0, 50000],
      technologies: [],
      workMode: [],
      companySize: [],
    });
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
        Filtros Avançados
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-sm">
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-4 left-0 w-[800px] bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl z-50"
          >
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(filterOptions).map(([category, options]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-white font-semibold mb-3 capitalize">
                    {category === "workMode" ? "Modo de Trabalho" : category}
                  </h3>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <motion.label
                        key={option}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <motion.input
                          type="checkbox"
                          checked={(
                            filters[category as keyof FilterState] as string[]
                          ).includes(option)}
                          onChange={() =>
                            toggleFilter(category as keyof FilterState, option)
                          }
                          whileTap={{ scale: 0.9 }}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {option}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-2"
              >
                <h3 className="text-white font-semibold mb-3">
                  Faixa Salarial (R$)
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-gray-400 text-sm">Mínimo</label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        value={filters.salary[0]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            salary: [parseInt(e.target.value), prev.salary[1]],
                          }))
                        }
                        className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-400 text-sm">Máximo</label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        value={filters.salary[1]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            salary: [prev.salary[0], parseInt(e.target.value)],
                          }))
                        }
                        className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={filters.salary[1]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          salary: [prev.salary[0], parseInt(e.target.value)],
                        }))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>R$ 0</span>
                      <span>R$ 50.000+</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Limpar Filtros
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium"
                >
                  Aplicar Filtros
                </motion.button>
              </div>
            </motion.div>

            {/* Indicador de filtros ativos */}
            {Object.values(filters).some((filter) =>
              Array.isArray(filter)
                ? filter.length > 0
                : filter[0] > 0 || filter[1] < 50000
            ) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                {Object.values(filters).reduce(
                  (count, filter) =>
                    count +
                    (Array.isArray(filter)
                      ? filter.length
                      : filter[0] > 0 || filter[1] < 50000
                      ? 1
                      : 0),
                  0
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
