import { useState } from 'react'
import { motion } from 'framer-motion'

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
    if (email) setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb] text-gray-900 overflow-x-hidden">

      {/* Nav */}
      <nav className="relative z-10 px-8 py-5 lg:px-16 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center">
          <img src="/logo.png" alt="EcoVoltz" className="h-10 object-contain" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-[85vh] flex items-center px-8 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-block px-3 py-1 rounded-full border border-[#00d4ff] text-[#00d4ff] text-xs font-semibold tracking-wider uppercase mb-4">
                Residential Energy Storage
              </span>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight text-gray-900">
                Energy<br />
                <span style={{ color: '#00d4ff' }}>Freedom.</span><br />
                <span className="text-gray-400">On Your Terms.</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Stop relying on the grid. EcoVoltz stores solar energy so your home runs on clean power — day and night, rain or shine.
            </motion.p>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="flex gap-10 flex-wrap">
              {[
                { value: '13.5', unit: 'kWh', label: 'Storage Capacity' },
                { value: '30+', unit: 'yrs', label: 'System Lifespan' },
                { value: '24/7', unit: '', label: 'Energy Access' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#00d4ff]">{stat.value}</span>
                    {stat.unit && <span className="text-[#00d4ff]/70 text-lg font-semibold">{stat.unit}</span>}
                  </div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp}>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="px-5 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20 transition-all flex-1 min-w-[240px] shadow-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-gray-900 font-bold hover:opacity-90 transition-opacity shadow-md"
                  >
                    Get Early Access
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-[#00cc6a] px-5 py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You're on the list. We'll be in touch.
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
            {/* Glow blobs behind image */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/10 to-[#00ff88]/10 rounded-3xl blur-3xl scale-75" />
            <img
              src="/ecovoltz_concept3.png"
              alt="EcoVoltz Energy Hero"
              className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl"
            />
            {/* Floating badge */}
            <div className="absolute -right-4 top-16 z-20 px-4 py-2 rounded-xl bg-white/90 border border-[#00d4ff]/30 shadow-lg backdrop-blur-sm hidden md:block">
              <div className="text-[#00d4ff] text-sm font-bold">13.5 kWh</div>
              <div className="text-gray-500 text-xs">Battery Core</div>
            </div>
            <div className="absolute -left-4 top-32 z-20 px-4 py-2 rounded-xl bg-white/90 border border-[#00ff88]/30 shadow-lg backdrop-blur-sm hidden md:block">
              <div className="text-[#00ff88] text-sm font-bold">∞ Cycles</div>
              <div className="text-gray-500 text-xs">Lifespan</div>
            </div>
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
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Solar Integration',
                desc: 'Seamlessly captures and stores energy from any rooftop solar system. Maximize every ray.',
                accentColor: '#f59e0b',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Backup',
                desc: 'Grid goes down? Your lights stay on. EcoVoltz switches to stored power in milliseconds.',
                accentColor: '#00d4ff',
                bgColor: 'bg-cyan-50',
                borderColor: 'border-cyan-200',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Smart Management',
                desc: 'AI-driven energy optimization learns your usage patterns and maximizes efficiency automatically.',
                accentColor: '#00ff88',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className={`p-6 rounded-2xl ${feature.bgColor} border ${feature.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="mb-4" style={{ color: feature.accentColor }}>{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
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
            className="p-10 rounded-3xl bg-white border border-gray-200 shadow-sm text-center"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">
              Why EcoVoltz over <span className="text-gray-400 line-through">Tesla Powerwall</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We're not trying to beat Tesla on branding. We're building energy independence that's accessible, installable in hours — not days — and priced for the homeowner, not the tech investor.
            </p>
            <div className="mt-8 flex justify-center gap-12 flex-wrap text-sm">
              {[
                { label: 'Faster Install', voltz: '< 4 hrs', tesla: '1-3 days' },
                { label: 'Modular', voltz: 'Yes', tesla: 'Limited' },
                { label: 'Price', voltz: 'Transparent', tesla: '$15K+' },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-medium">{row.label}</div>
                  <div className="text-[#00cc6a] font-bold text-base">{row.voltz}</div>
                  <div className="text-gray-400 text-xs mt-1">{row.tesla}</div>
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
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
              The grid is <span className="text-gray-400">optional.</span><br />
              <span style={{ color: '#00d4ff' }}>Your energy isn't.</span>
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Join the waitlist and be first to know when EcoVoltz launches in your area.
            </p>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3 justify-center flex-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="px-5 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20 transition-all w-64 shadow-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-gray-900 font-bold hover:opacity-90 transition-opacity shadow-md"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <p className="text-[#00cc6a] font-semibold">✓ You're on the list. We'll notify you at <span className="text-gray-900">{email}</span></p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-gray-200 px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="EcoVoltz" className="h-6 object-contain opacity-60" />
          <p className="text-gray-400 text-xs">© 2026 EcoVoltz Energy. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <span className="hover:text-gray-600 cursor-default transition-colors">Privacy</span>
            <span className="hover:text-gray-600 cursor-default transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
