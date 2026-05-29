import React from 'react';
import { Award, ShieldCheck, Users, Target } from 'lucide-react';
import { motion } from 'motion/react';
// @ts-ignore
import messiRonaldoImg from '../assets/images/messi_ronaldo_turf_bg_1779998962490.png';

interface HeroProps {
  onNavigateToBooking: () => void;
  onNavigateToFacilities: () => void;
}

export default function Hero({ onNavigateToBooking, onNavigateToFacilities }: HeroProps) {
  const statItems = [
    { value: '500+', label: 'ELITE ATHLETES', icon: <Users className="w-5 h-5 text-orange-500" /> },
    { value: '15+', label: 'PREMIUM COURTS', icon: <Target className="w-5 h-5 text-orange-500" /> },
    { value: '25+', label: 'EXPERT COACHES', icon: <Award className="w-5 h-5 text-orange-500" /> },
    { value: '4.9/5', label: 'GUEST SATISFACTION', icon: <ShieldCheck className="w-5 h-5 text-orange-500" /> },
  ];

  const heroImages = [
    {
      title: 'Academy Squad Huddle',
      subtitle: 'Official Jack Football Academy junior huddle',
      src: '/hero_team_huddle.jpg',
      fallback: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800', // high quality team soccer huddle
      description: 'Our junior champions huddling up before their match in the official Jack Football Academy jerseys!'
    },
    {
      title: 'CASAGRAND Championship Cup',
      subtitle: 'Junior League tournament squad',
      src: '/kids_academy.jpg',
      fallback: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800', // kids celebration
      description: 'The white & blue victory squad celebrating their weekend classic cup milestones.'
    }
  ];

  return (
    <section className="hero-section relative min-h-[95vh] lg:min-h-[100vh] flex flex-col justify-between pt-24 pb-16 bg-[#080a0e] overflow-hidden">
      {/* Immersive Stadium Blur Overlay Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080a0e]/95 via-[#080a0e]/60 to-[#080a0e] z-10" />
        <div className="premium-glow"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-bg"
          style={{ objectFit: 'cover' }}
        >
          <source src="/stadium.mp4" type="video/mp4" />
        </video>
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.25 }}
          transition={{ duration: 1.2 }}
          src={messiRonaldoImg}
          alt="Stadium background poster fallback"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter blur-[2px] -z-10"
        />
      </div>

      {/* Hero Body Content - Elegant Centered Layout */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center mt-12 mb-16">
        {/* Futury Accent Badge */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 font-mono text-xs tracking-[0.25em] font-extrabold uppercase px-5 py-2.5 rounded-full mb-8 leading-none"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Welcome to the future of sports
        </motion.div>

        {/* Cinematic Header Typography */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="hero-title font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-white uppercase leading-[0.9] max-w-5xl mb-6 fade-up"
        >
          PLAY AT <span className="text-orange-500 block sm:inline">JACK FC</span>
          <br />
          <span className="text-zinc-100 italic">MASTER</span> YOUR GAME
        </motion.h1>

        {/* Dynamic Subtext */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-xl sm:max-w-2xl text-zinc-300 font-sans text-base sm:text-lg lg:text-xl font-medium tracking-wide mb-10 leading-relaxed fade-up"
        >
          Experience world-class athletic facilities, FIFA-certified soccer turfs (Home of Jack FC), temperature-governed pools, badminton, and custom local tournaments designed for top competitors.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 animate-pulse-once"
        >
          <button
            onClick={onNavigateToBooking}
            className="premium-btn magnetic-btn text-white font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 shadow-xl shadow-orange-500/10"
          >
            Book Arena Slot
          </button>
          <button
            onClick={onNavigateToFacilities}
            className="magnetic-btn group inline-flex items-center gap-2 text-white hover:text-orange-500 font-extrabold text-sm uppercase tracking-wider transition-all duration-205"
          >
            See All Facilities
            <span className="transform group-hover:translate-x-1.5 transition-transform duration-205 font-semibold">
              &rarr;
            </span>
          </button>
        </motion.div>
      </div>

      {/* Floating Dynamic Athletic Stats segment overlays onto following section */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mb-20 sm:-mb-24">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 80 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-7 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-zinc-100"
        >
          {statItems.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
              key={i}
              className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 sm:p-5 ${
                i !== statItems.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 sm:pb-5 lg:pb-0' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-orange-55 flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <dt className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-950 tracking-tight leading-none">
                  {stat.value}
                </dt>
                <dd className="text-[10px] sm:text-xs font-bold font-mono text-zinc-500 tracking-wider uppercase mt-1">
                  {stat.label}
                </dd>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
