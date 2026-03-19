import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Batteryman() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full max-w-lg float-animation">
      {/* Glow behind character */}
      <div className="absolute inset-0 bg-gradient-to-b from-voltz-accent/20 via-transparent to-voltz-green/20 rounded-full blur-3xl scale-75" />

      {/* Pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full aspect-square rounded-full border border-voltz-accent/20 pulse-ring" />
        <div className="absolute w-full aspect-square rounded-full border border-voltz-accent/10 pulse-ring" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* Main image */}
      <div className="relative z-10">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-voltz-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src="/ecovoltz_concept3.png"
          alt="EcoVoltz Energy Hero"
          className={`w-full h-auto drop-shadow-2xl transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Floating energy particles (CSS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-voltz-accent"
            initial={{
              x: `${20 + i * 12}%`,
              y: '80%',
              opacity: 0,
            }}
            animate={{
              y: ['80%', '-20%'],
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Label badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -right-4 top-1/4 z-20 hidden md:block"
      >
        <div className="px-3 py-1.5 rounded-lg bg-voltz-card/90 border border-voltz-accent/30 backdrop-blur-sm">
          <div className="text-voltz-accent text-xs font-bold">13.5 kWh</div>
          <div className="text-gray-400 text-[10px]">Battery Core</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -left-4 top-1/3 z-20 hidden md:block"
      >
        <div className="px-3 py-1.5 rounded-lg bg-voltz-card/90 border border-voltz-green/30 backdrop-blur-sm">
          <div className="text-voltz-green text-xs font-bold">∞</div>
          <div className="text-gray-400 text-[10px]">Cycles</div>
        </div>
      </motion.div>
    </div>
  )
}
