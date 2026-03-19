export default function Batteryman() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/10 via-transparent to-[#00ff88]/10 rounded-3xl blur-3xl scale-90" />

      {/* Main image */}
      <img
        src="/ecovoltz_concept3.png"
        alt="EcoVoltz Energy Hero"
        className="relative z-10 w-full h-auto rounded-2xl"
      />
    </div>
  )
}
