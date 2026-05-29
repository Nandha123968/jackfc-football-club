import React, { useState, useEffect } from 'react';
import { Menu, X, Flame } from 'lucide-react';

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

export default function Header({ onNavigate, activeSection }: HeaderProps) {
  const [logoError, setLogoError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Facilities', id: 'facilities' },
    { label: 'Book Arena', id: 'booking' },
    { label: 'Matchmaker', id: 'matchmaker' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-r from-[#0c0f14] to-[#06080b] py-3 shadow-xl border-b border-zinc-800'
          : 'bg-transparent py-5 border-b border-zinc-800/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105 overflow-hidden">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Club Logo" 
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Flame className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white block">
                JACK <span className="text-orange-500 font-sans font-bold">FOOTBALL CLUB</span>
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono block">
                Sports Arena
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  activeSection === item.id
                    ? 'text-orange-500 bg-orange-500/5'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Book Now Button Desktop */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => handleNavClick('booking')}
              className="relative overflow-hidden bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-orange-500/15 hover:shadow-orange-500/35 transition-all duration-300 cursor-pointer"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-orange-500 p-2 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0c0f14] border-b border-zinc-800 shadow-2xl py-6 px-4 animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full py-3 px-4 rounded-xl text-left text-base font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeSection === item.id
                    ? 'text-white bg-orange-500/10 border-l-4 border-orange-500 pl-3'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('booking')}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-xl text-center text-white font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20"
            >
              Join / Book Arena
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
