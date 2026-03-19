import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function App() {
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

            {/* CTA — no email */}
            <motion.div variants={fadeUp}>
              <a
                href="#how-it-works"
                className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-gray-900 font-bold hover:opacity-90 transition-opacity shadow-md text-lg"
              >
                See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/10 to-[#00ff88]/10 rounded-3xl blur-3xl scale-75" />
            <img
              src="/ecovoltz_concept3.png"
              alt="EcoVoltz Energy Hero"
              className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl"
            />
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

      {/* How It Works — Diagram */}
      <section id="how-it-works" className="relative z-10 px-8 lg:px-16 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full border border-[#00d4ff] text-[#00d4ff] text-xs font-semibold tracking-wider uppercase mb-4">
                System Overview
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Your Home. <span style={{ color: '#00d4ff' }}>Your Energy.</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                EcoVoltz sits between your home and every power source — solar, battery, and grid — intelligently routing energy where it's needed, when it's needed.
              </p>
            </motion.div>

            {/* Energy flow diagram */}
            <motion.div variants={fadeUp} className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 md:p-12 overflow-hidden">

              {/* Animated grid background */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              />

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                {/* Solar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-28 h-28 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-14 h-14 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.05-6.95l-1.41 1.41m-9.19 9.19l-1.41 1.41m0-12.02l1.41 1.41m9.19 9.19l1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z"/>
                    </svg>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full shadow">
                      +0W
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Solar Panels</h3>
                  <p className="text-gray-500 text-sm">Harvest free energy from the sun</p>
                </motion.div>

                {/* Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-28 h-28 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18m-9 5h9M6 17H3" />
                    </svg>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-400 text-white text-xs font-bold rounded-full shadow">
                      +900W
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Utility Grid</h3>
                  <p className="text-gray-500 text-sm">Reliable backup power from your utility</p>
                </motion.div>

                {/* Battery */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-28 h-28 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col items-center justify-center mb-4 shadow-lg overflow-hidden">
                    {/* Battery fill */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-400 to-emerald-300 transition-all duration-1000" style={{ height: '95%' }} />
                    <div className="relative z-10 mb-1">
                      <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4zM6 7V4h4v3M14 7V4h4v3" />
                      </svg>
                    </div>
                    <div className="relative z-10 text-xs font-black text-emerald-800">95%</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow">
                      Ready
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">EcoVoltz Battery</h3>
                  <p className="text-gray-500 text-sm">13.5 kWh of stored energy on standby</p>
                </motion.div>
              </div>

              {/* Central EcoVoltz unit */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="relative mt-8 flex justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="flex gap-6 items-end mb-6">
                    {/* Solar to EcoVoltz */}
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-1 bg-gradient-to-b from-amber-400 to-[#00d4ff] rounded-full" />
                      <svg className="w-4 h-4 text-[#00d4ff] -mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
                    </div>
                    {/* Grid to EcoVoltz */}
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-1 bg-gradient-to-b from-blue-400 to-[#00d4ff] rounded-full" />
                      <svg className="w-4 h-4 text-[#00d4ff] -mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
                    </div>
                    {/* Battery to EcoVoltz */}
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-1 bg-gradient-to-b from-emerald-400 to-[#00d4ff] rounded-full" />
                      <svg className="w-4 h-4 text-[#00d4ff] -mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
                    </div>
                  </div>

                  {/* Main unit */}
                  <div className="relative w-full max-w-md">
                    <div className="bg-gradient-to-br from-[#00d4ff] to-[#00ff88] rounded-2xl p-6 shadow-2xl">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-white font-black text-2xl mb-1">EcoVoltz</div>
                        <div className="text-white/70 text-sm font-medium">Smart Energy Hub</div>
                        <div className="mt-3 flex justify-center gap-4 text-xs text-white/80">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Running
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Max Green
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            Tier 2
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Home output */}
                    <div className="flex flex-col items-center mt-6">
                      <svg className="w-4 h-4 text-[#00d4ff] mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-8h5v-8h6v8h5z"/></svg>
                      <div className="h-8 w-1 bg-gradient-to-b from-[#00d4ff] to-gray-400 rounded-full" />
                    </div>
                  </div>

                  {/* Home */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="w-24 h-16 bg-gray-200 border-2 border-gray-300 rounded-xl flex items-center justify-center shadow-inner">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                      </svg>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-gray-900 font-bold text-sm">Your Home</div>
                      <div className="text-gray-500 text-xs">6 Rooms Connected</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Readout badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex justify-center gap-4 flex-wrap"
              >
                {[
                  { label: 'Solar In', value: '0W', color: 'amber' },
                  { label: 'Grid Draw', value: '900W', color: 'blue' },
                  { label: 'Battery', value: '95% Full', color: 'emerald' },
                  { label: 'Home Load', value: '900W', color: 'gray' },
                ].map((badge) => (
                  <div key={badge.label} className={`px-4 py-2 rounded-xl bg-${badge.color}-50 border border-${badge.color}-200 text-sm`}>
                    <span className="text-gray-500 font-medium">{badge.label}: </span>
                    <span className={`font-bold text-${badge.color}-600`}>{badge.value}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
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

      {/* Bottom CTA — no email */}
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
              EcoVoltz installs in under 4 hours. Get started with your free home energy assessment.
            </p>
            <a
              href="#how-it-works"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-gray-900 font-bold hover:opacity-90 transition-opacity shadow-md text-lg"
            >
              Learn More
            </a>
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
