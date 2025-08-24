'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Move arrays outside component to prevent recreation on every render
const loadingTexts = [
  'Inicializando sistema...',
  'Carregando componentes...',
  'Preparando animações...',
  'Conectando APIs...',
  'Quase pronto...'
]

const codeLines = [
  'import { NextJob } from "@devjobs/core"',
  'const developer = new TalentSeeker()',
  'developer.findOpportunity()',
  'if (skills.match(requirements)) {',
  '  return "Perfect Match!"',
  '}',
  'console.log("Welcome to DevJobs")'
]

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [particles, setParticles] = useState<
    { id: number; top: number; left: number; duration: number; delay: number }[]
  >([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    const textTimer = setInterval(() => {
      setCurrentText(loadingTexts[Math.floor(Math.random() * loadingTexts.length)])
    }, 800)

    const generated = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    }))
    setParticles(generated)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
      clearInterval(textTimer)
    }
  }, []) // Remove loadingTexts from dependency array

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 bg-black z-[10000] flex items-center justify-center"
        >
          <div className="relative max-w-2xl mx-auto px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-white font-bold text-3xl">⚡</span>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
              >
                DevJobs
              </motion.h1>
            </motion.div>

            <div className="bg-gray-900 rounded-lg p-6 mb-8 font-mono text-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 ml-2">terminal</span>
              </div>

              {codeLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="text-green-400 mb-2"
                >
                  <span className="text-gray-500">$ </span>
                  {line}
                </motion.div>
              ))}

              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-green-400 mt-2"
              >
                <span className="text-gray-500">$ </span>|
              </motion.div>
            </div>

            <div className="space-y-4">
              <motion.p
                key={currentText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-300 text-center"
              >
                {currentText}
              </motion.p>

              <div className="relative">
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
                  >
                    <motion.div
                      animate={{ x: [0, 100, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-white opacity-20 w-full"
                    />
                  </motion.div>
                </div>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-blue-400 text-sm mt-2 block text-center"
                >
                  {Math.round(Math.min(progress, 100))}%
                </motion.span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg -z-10 blur-xl"
            />
          </div>

          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
