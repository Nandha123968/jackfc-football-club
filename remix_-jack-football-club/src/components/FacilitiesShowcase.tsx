import React, { useState } from 'react';
import { Facility } from '../types';
import { facilitiesData } from '../data';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import Tilt from 'react-parallax-tilt';
import {
  Waves,
  Filter,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Target,
  Maximize,
  Grid,
  Award,
  Layers,
  Sun,
  Activity,
  CheckCircle,
  MapPin,
  Flame,
  ChevronRight
} from 'lucide-react';

interface FacilitiesShowcaseProps {
  onSelectFacilityForBooking: (facilityId: string) => void;
}

export default function FacilitiesShowcase({ onSelectFacilityForBooking }: FacilitiesShowcaseProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('football-turf');
  const [activeTab, setActiveTab] = useState<number>(0);

  const filteredFacilities = facilitiesData;

  const selectedFacility = facilitiesData.find((f) => f.id === selectedFacilityId) || facilitiesData[0];

  // Helper to map string to lucide icons
  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'waves':
        return <Waves className="w-5 h-5 text-orange-500" />;
      case 'filter':
        return <Filter className="w-5 h-5 text-orange-500" />;
      case 'shieldcheck':
      case 'heartpulse':
        return <ShieldCheck className="w-5 h-5 text-orange-500" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'target':
        return <Target className="w-5 h-5 text-orange-500" />;
      case 'maximize':
        return <Maximize className="w-5 h-5 text-orange-500" />;
      case 'grid':
        return <Grid className="w-5 h-5 text-orange-500" />;
      case 'award':
        return <Award className="w-5 h-5 text-orange-500" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-orange-500" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-orange-500" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <section id="facilities" className="py-24 bg-white text-zinc-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 reveal-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 font-mono tracking-widest uppercase mb-3">
            <Flame className="w-4 h-4" />
            The Arena Facilities
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight uppercase mb-4 leading-none">
            HIGH-PERFORMANCE <span className="text-orange-600">ENVIRONMENTS</span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-medium leading-relaxed">
            Engineered exclusively for sports and leisure development. Explore our state-of-the-art climate-controlled water chambers, elite FIFA-certified football turfs (Jack FC Home), pristine badminton layouts, and multi-purpose cricket nets.
          </p>
        </div>

        {/* Facilities selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredFacilities.map((facility, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={facility.id}
            >
              <Tilt
                tiltMaxAngleX={12}
                tiltMaxAngleY={12}
                glareEnable={true}
                glareMaxOpacity={0.25}
                scale={1.03}
                className="w-full rounded-2xl overflow-hidden"
                style={{ display: 'block' }}
                tiltEnable={typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches}
              >
                <div
                  onClick={() => {
                    setSelectedFacilityId(facility.id);
                    setActiveTab(0);
                  }}
                  className={`relative h-64 rounded-2xl overflow-hidden cursor-pointer text-left group transition-colors duration-350 ${
                    selectedFacilityId === facility.id
                      ? 'ring-4 ring-orange-500 ring-offset-2 active-glow'
                      : ''
                  }`}
                >
                  {/* Overlay shadow gradient to ensure clear text readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                  <img
                    src={facility.image}
                    alt={facility.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Card info labels */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-md tracking-wider">
                      {facility.highlightText || 'Featured'}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="text-orange-400 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">
                      {facility.subtitle}
                    </div>
                    <h4 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                      {facility.name}
                    </h4>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/15">
                      <span className="text-xs text-zinc-300 font-mono">
                        Starts at <strong className="text-white">₹{facility.hourlyRate}/Hr</strong>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFacilityForBooking(facility.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-orange-400 hover:text-orange-300 uppercase cursor-pointer transition-colors"
                      >
                        Book Slot
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>

        {/* Selected Facility Blueprint and Technical Specs layout */}
        <AnimatePresence mode="wait">
          {selectedFacility && (
            <motion.div
              key={selectedFacility.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="bg-zinc-50 rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-inner"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Details column */}
                <div className="lg:col-span-5 flex flex-col justify-center h-full">
                  <span className="text-xs font-extrabold text-orange-600 font-mono tracking-widest uppercase mb-1">
                    {selectedFacility.subtitle}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-zinc-950 uppercase leading-none tracking-tight mb-5">
                    {selectedFacility.name.split(' ')[0]}{' '}
                    <span className="text-orange-600">{selectedFacility.name.split(' ').slice(1).join(' ')}</span>
                  </h3>

                  <p className="text-zinc-600 text-sm sm:text-base font-medium leading-relaxed mb-6">
                    {selectedFacility.description}
                  </p>

                  {/* Rating / Weekly Stat row */}
                  <div className="flex flex-wrap gap-8 py-5 border-y border-zinc-200 mb-8">
                    <div>
                      <div className="text-3xl font-display font-extrabold text-zinc-950">
                        ₹{selectedFacility.hourlyRate}
                      </div>
                      <div className="text-[10px] font-extrabold font-mono text-zinc-500 tracking-wider uppercase mt-1">
                        Hourly rate
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-display font-extrabold text-orange-600">
                        Active
                      </div>
                      <div className="text-[10px] font-extrabold font-mono text-zinc-500 tracking-wider uppercase mt-1">
                        Reservable slots
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-display font-extrabold text-zinc-900">
                        Elite
                      </div>
                      <div className="text-[10px] font-extrabold font-mono text-zinc-500 tracking-wider uppercase mt-1">
                        Member priority
                      </div>
                    </div>
                  </div>

                  {/* Quick booking CTA */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => onSelectFacilityForBooking(selectedFacility.id)}
                      className="bg-orange-500 hover:bg-orange-600 font-extrabold text-xs uppercase tracking-widest text-white px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                    >
                      Book a Slot
                    </button>
                    <a
                      href="#booking"
                      className="border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-xl block text-center transition-colors"
                    >
                      View Packages
                    </a>
                  </div>
                </div>

                {/* Right Media Graphic and Spec lists column */}
                <div className="lg:col-span-7 space-y-8">
                  {/* curved image card mimicking the exact specs design layout */}
                  <div className="relative rounded-2xl overflow-hidden h-[340px] shadow-lg border border-zinc-200 reveal-right">
                    <img
                      src={selectedFacility.image}
                      alt={selectedFacility.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover animate-fadeIn"
                    />
                    {/* Overlay shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Floating White Overlay Quote from reference */}
                    {selectedFacility.accentQuote && (
                      <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm shadow-xl p-4 sm:p-5 rounded-xl border border-zinc-100 text-left">
                        <div className="text-[10px] font-extrabold font-mono tracking-widest text-orange-600 uppercase mb-1">
                          LIVE USER REPUTATION
                        </div>
                        <p className="text-sm font-bold text-zinc-800 italic leading-relaxed">
                          {selectedFacility.accentQuote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Specifications Title */}
                  <div>
                    <h4 className="text-xs font-extrabold font-mono text-zinc-500 tracking-widest uppercase mb-4">
                      Arena Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedFacility.specs.map((spec, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={index}
                          className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex flex-col justify-between"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                            {renderIcon(spec.icon)}
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold font-mono text-zinc-400 tracking-wider uppercase block">
                              {spec.label}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-zinc-800 tracking-tight block mt-0.5 leading-snug">
                              {spec.value}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs toggle block */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold font-mono text-zinc-500 tracking-widest uppercase">
                      Technical Specifications & Guidelines
                    </h4>
                    <div className="flex gap-2.5 border-b border-zinc-200 pb-1">
                      {selectedFacility.details.map((tab, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(idx)}
                          className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors relative ${
                            activeTab === idx
                              ? 'text-orange-600 font-extrabold'
                              : 'text-zinc-400 hover:text-zinc-655'
                          }`}
                        >
                          {tab.title}
                          {activeTab === idx && (
                            <motion.div
                              layoutId="activeSpecsTabOutline"
                              className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-600 rounded-full"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-5 rounded-xl border border-zinc-150 text-sm font-medium text-zinc-600 leading-relaxed shadow-sm"
                    >
                      {selectedFacility.details[activeTab]?.content}
                    </motion.div>
                  </div>

                  {/* Dark Banner bottom callout mimicking Plunge panel */}
                  <div className="bg-zinc-950 p-6 sm:p-8 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden active-glow border border-zinc-800">
                    <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-orange-500/10 pointer-events-none blur-3xl" />
                    <div className="text-center md:text-left relative z-10">
                      <h5 className="text-lg sm:text-xl font-display font-extrabold uppercase leading-snug tracking-normal">
                        Ready to make your <br className="hidden sm:inline" />
                        <span className="text-orange-500">mark on the turf?</span>
                      </h5>
                      <p className="text-zinc-400 text-xs mt-1.5 font-medium">
                        Whether it's a casual kickabout or a high-stakes local final, Jack Football Club is your home.
                      </p>
                    </div>
                    <div className="flex gap-3 relative z-10 w-full md:w-auto">
                      <button
                        onClick={() => onSelectFacilityForBooking(selectedFacility.id)}
                        className="flex-1 md:flex-initial bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-5 py-3 rounded-lg text-center cursor-pointer shadow-lg shadow-orange-500/25 active:scale-95 transition-transform"
                      >
                        Book Pitch
                      </button>
                      <a
                        href="#contact"
                        className="flex-1 md:flex-initial bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-5 py-3 rounded-lg text-center"
                      >
                        Contact support
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
