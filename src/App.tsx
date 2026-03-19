import { useState } from 'react'
import { motion } from 'framer-motion'
import Batteryman from './components/Batteryman'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-voltz-dark text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-voltz-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-voltz-green/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0f_70%)]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-8 py-5 lg:px-16" style={{background: '#e5e7eb'}}>
        <div className="max-w-7xl mx-auto flex items-center">
          <img src="/logo.png" alt="EcoVoltz" className="h-10 object-contain" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-[85vh] flex items-center px-8 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-block px-3 py-1 rounded-full border border-voltz-accent/30 text-voltz-accent text-xs font-medium tracking-wider uppercase mb-4">
                Residential Energy Storage
              </span>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="energy-gradient">Energy</span>
                <br />
                <span className="text-white">Freedom.</span>
                <br />
                <span className="text-gray-500">On Your Terms.</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg text-gray-400 max-w-lg leading-relaxed">
              Stop relying on the grid. EcoVoltz stores solar energy so your home runs on clean power — day and night, rain or shine.
            </motion.p>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="flex gap-8 flex-wrap">
              {[
                { value: '13.5', unit: 'kWh', label: 'Storage Capacity' },
                { value: '30+', unit: 'yrs', label: 'System Lifespan' },
                { value: '24/7', unit: '', label: 'Energy Access' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-voltz-accent text-glow-cyan">{stat.value}</span>
                    {stat.unit && <span className="text-voltz-accent/70 text-lg">{stat.unit}</span>}
                  </div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-voltz-accent/50 focus:ring-1 focus:ring-voltz-accent/20 transition-all flex-1 min-w-[240px]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-voltz-accent to-voltz-green text-black font-bold hover:opacity-90 transition-opacity glow-cyan"
                  >
                    Get Early Access
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-voltz-green px-5 py-3 rounded-xl bg-voltz-green/10 border border-voltz-green/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">You're on the list. We'll be in touch.</span>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right: Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <Batteryman />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Solar Integration',
                desc: 'Seamlessly captures and stores energy from any rooftop solar system. Maximize every ray.',
                color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
                iconColor: 'text-yellow-400',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Backup',
                desc: 'Grid goes down? Your lights stay on. EcoVoltz switches to stored power in milliseconds.',
                color: 'from-voltz-accent/20 to-blue-500/20 border-voltz-accent/30',
                iconColor: 'text-voltz-accent',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Smart Management',
                desc: 'AI-driven energy optimization learns your usage patterns and maximizes efficiency automatically.',
                color: 'from-voltz-green/20 to-emerald-500/20 border-voltz-green/30',
                iconColor: 'text-voltz-green',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className={`p-6 rounded-2xl bg-gradient-to-br ${feature.color} border backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
              >
                <div className={`mb-4 ${feature.iconColor}`}>{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison bar */}
      <section className="relative z-10 px-8 lg:px-16 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-gradient-to-r from-voltz-card to-voltz-dark border border-white/10 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Why EcoVoltz over <span className="text-gray-500 line-through">Tesla Powerwall</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We're not trying to beat Tesla on branding. We're building energy independence that's accessible, 
              installable in hours — not days — and priced for the homeowner, not the tech investor.
            </p>
            <div className="mt-8 flex justify-center gap-8 flex-wrap text-sm">
              {[
                { label: 'Faster Install', voltz: '< 4 hrs', tesla: '1-3 days' },
                { label: 'Modular', voltz: 'Yes', tesla: 'Limited' },
                { label: 'Price', voltz: 'Transparent', tesla: '$15K+' },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">{row.label}</div>
                  <div className="text-voltz-green font-bold">{row.voltz}</div>
                  <div className="text-gray-600 text-xs">{row.tesla}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-8 lg:px-16 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              The grid is <span className="text-gray-600">optional.</span>
              <br />
              <span className="energy-gradient">Your energy isn't.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join the waitlist and be first to know when EcoVoltz launches in your area.
            </p>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-voltz-accent/50 focus:ring-1 focus:ring-voltz-accent/20 transition-all w-64"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-voltz-accent to-voltz-green text-black font-bold hover:opacity-90 transition-opacity glow-cyan"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <p className="text-voltz-green font-medium">✓ You're on the list. We'll notify you at <span className="text-white">{email}</span></p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="EcoVoltz" className="h-6 object-contain opacity-80" />
          <p className="text-gray-600 text-xs">© 2026 EcoVoltz Energy. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <span className="hover:text-gray-300 cursor-default transition-colors">Privacy</span>
            <span className="hover:text-gray-300 cursor-default transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
