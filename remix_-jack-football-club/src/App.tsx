import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { initAnimations } from './lib/gsapAnimations';
import { premiumMotion } from './lib/premiumMotion';
import Hero from './components/Hero';
import FacilitiesShowcase from './components/FacilitiesShowcase';
import BookingSystem from './components/BookingSystem';
import MatchMaker from './components/MatchMaker';
import FAQAndReviews from './components/FAQAndReviews';
import ContactMap from './components/ContactMap';
import Footer from './components/Footer';
import StadiumGallery from './components/StadiumGallery';

import { Flame, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedFacilityId, setSelectedFacilityId] = useState('football-turf');
  
  // Custom states
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTitle, setToastTitle] = useState<string | null>(null);

  // Preloader timeout mimics Varanasi staging loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloaderActive(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ctx = initAnimations();
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderActive) {
      let premiumCtx: any = null;
      // Small timeout to let elements settle in DOM layout
      const timer = setTimeout(() => {
        premiumCtx = premiumMotion();
      }, 50);
      return () => {
        clearTimeout(timer);
        if (premiumCtx) premiumCtx.revert();
      };
    }
  }, [preloaderActive]);

  // Update active section on window scroll positions
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'facilities', 'booking', 'matchmaker', 'gallery', 'testimonials', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safe navigation anchor scrolling
  const handleNavigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Callback when booking is compiled
  const handleBookingConfirmed = (ticket: any) => {
    setToastTitle('Slot Reserved Successfully!');
    setToastMessage(`Booking ID ${ticket.bookingId} created for ${ticket.sportName} on ${ticket.time}!`);
    setTimeout(() => {
      setToastMessage(null);
      setToastTitle(null);
    }, 5000);
  };

  // Facility focus handler (focuses details and scroll triggers booking)
  const handleSelectFacilityForBooking = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    handleNavigateToSection('booking');
  };

  return (
    <div className="bg-[#0c0f14] min-h-screen text-white font-sans relative antialiased selection:bg-orange-500 selection:text-white">
      
      {/* 1. DYNAMIC PRELOADER COVER */}
      {preloaderActive && (
        <div className="fixed inset-0 bg-[#06080b] z-50 flex items-center justify-center transition-all duration-500">
          <div className="text-center space-y-5 animate-pulse">
            <div className="w-16 h-16 border-4 border-orange-500/10 border-t-orange-500 border-r-orange-500 rounded-full animate-spin mx-auto shadow-2xl shadow-orange-500/10" />
            <div className="space-y-1">
              <span className="font-display font-extrabold text-2xl tracking-[0.25em] text-white uppercase block">
                Jack Football Club
              </span>
              <span className="text-[10px] text-orange-500 font-mono font-black tracking-widest uppercase block">
                Home of Jack FC Football Club
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOATING WHATSAPP CTA PANEL */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center group">
        
        {/* Floating tooltip appears on mouse over */}
        <div className="bg-zinc-900 border border-zinc-800 text-white font-bold text-xs uppercase tracking-wide py-2 px-4 rounded-xl shadow-2xl mr-3 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 pointer-events-none transition-all duration-300">
          Book on WhatsApp
        </div>

        <a
          href={`https://wa.me/919738582771?text=${encodeURIComponent(
            `🔥 *JACK FOOTBALL CLUB - PLAYER INQUIRY* 🔥\n` +
            `----------------------------------\n` +
            `Hey Kiran! I am planning to play at Jack FC Sports Arena. ⚽\n\n` +
            `Could you please help me find an available playing slot bro? Let me know the active timings.\n\n` +
            `Thank you! 🙌`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl text-white hover:scale-110 active:scale-95 transition-all duration-200 whatsapp-ring"
          aria-label="Direct helpdesk on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.182-3.896l.363.216c1.611.957 3.468 1.463 5.361 1.464 5.753 0 10.435-4.685 10.439-10.437.002-2.788-1.082-5.409-3.053-7.382C17.38 2.036 14.767.95 11.997.949c-5.758 0-10.44 4.685-10.443 10.439 0 1.954.512 3.86 1.482 5.578l.237.417-1.01 3.689 3.776-.989zM17.47 14.39c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        </a>
      </div>

      {/* 3. FLOATING ACTION TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-40 bg-zinc-900 border border-zinc-800 border-l-4 border-l-orange-500 rounded-xl p-5 shadow-2xl max-w-sm animate-slideIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h6 className="font-display font-extrabold text-white text-xs uppercase tracking-wider leading-none mb-1">
                {toastTitle}
              </h6>
              <p className="text-zinc-300 text-xs font-semibold leading-relaxed">
                {toastMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER NAVIGATION */}
      <Header onNavigate={handleNavigateToSection} activeSection={activeSection} />

      {/* CENTRAL SECTIONS */}
      <main>
        
        {/* HERO HEADER */}
        <div id="home">
          <Hero
            onNavigateToBooking={() => handleNavigateToSection('booking')}
            onNavigateToFacilities={() => handleNavigateToSection('facilities')}
          />
        </div>

        {/* DETAILED SPECIFICATIONS & FACILITIES */}
        <div id="facilities" className="relative z-30">
          <FacilitiesShowcase
            onSelectFacilityForBooking={handleSelectFacilityForBooking}
          />
        </div>

        {/* MATCHMAKER CO-PLAY PLATFORM */}
        <div id="matchmaker">
          <MatchMaker />
        </div>

        {/* INTERACTIVE STADIUM & TRAINING ACADEMY GALLERY */}
        <div id="gallery">
          <StadiumGallery />
        </div>

        {/* REAL TIME BOOKING matrix */}
        <div id="booking">
          <BookingSystem
            selectedFacilityId={selectedFacilityId}
            onBookingConfirmed={handleBookingConfirmed}
          />
        </div>

        {/* FEEDBACK & FREQUENT FAQS GRID */}
        <div id="testimonials">
          <FAQAndReviews />
        </div>

        {/* CONTACT MATRICES & GOOGLE MAPS BLOCK */}
        <div id="contact">
          <ContactMap />
        </div>

      </main>

      {/* SYSTEM STADIUM FOOTER */}
      <Footer onNavigate={handleNavigateToSection} />

    </div>
  );
}
