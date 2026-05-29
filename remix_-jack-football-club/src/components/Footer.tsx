import React, { useState } from 'react';
import { Flame, MapPin, Phone, Mail, Instagram, Twitter, Facebook, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [logoError, setLogoError] = useState(false);
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-white relative">
      
      {/* Grass Cinematic divider replicating the user's reference exactly */}
      <div className="h-10 bg-gradient-to-b from-transparent to-zinc-950 border-b border-orange-500/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-zinc-900">
          
          {/* Logo brand & block description */}
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg text-white shadow-lg shadow-orange-500/20 overflow-hidden">
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
                <span className="font-display font-black text-xl tracking-tight text-white block">
                  JACK <span className="text-orange-500 font-sans font-bold">FOOTBALL CLUB</span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">
                  Sports Arena
                </span>
              </div>
            </button>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-semibold">
              State-of-the-art sports complex in the heart of the city. Providing FIFA-certified football turfs, high-end pools, and interactive squad matchmaking platforms for Bengaluru's elite athletes.
            </p>
            
            {/* Social channels */}
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-500 border border-zinc-800 flex items-center justify-center transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-500 border border-zinc-800 flex items-center justify-center transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-500 border border-zinc-800 flex items-center justify-center transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-left">
            <h5 className="font-display font-extrabold text-sm uppercase tracking-widest text-white">
              Quick Links
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
              <li>
                <button onClick={() => onNavigate('home')} className="text-zinc-400 hover:text-orange-500 transition-colors uppercase cursor-pointer">
                  Home Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="text-zinc-400 hover:text-orange-500 transition-colors uppercase cursor-pointer">
                  Arena Showcase
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('booking')} className="text-zinc-400 hover:text-orange-500 transition-colors uppercase cursor-pointer">
                  Reservations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('matchmaker')} className="text-zinc-400 hover:text-orange-500 transition-colors uppercase cursor-pointer">
                  Matchmaker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('testimonials')} className="text-zinc-400 hover:text-orange-500 transition-colors uppercase cursor-pointer">
                  REVIEWS & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Facilities catalog */}
          <div className="space-y-4 text-left">
            <h5 className="font-display font-extrabold text-sm uppercase tracking-widest text-white">
              Facilities
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
              <li>
                <button onClick={() => onNavigate('facilities')} className="text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer">
                  Swimming Pool Area
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer">
                  FIFA Jack FC Football Turfs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer">
                  Badminton Courts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer">
                  Box Cricket Nets
                </button>
              </li>
            </ul>
          </div>

          {/* Reach Us contact coordinates */}
          <div className="space-y-4 text-left font-semibold text-xs sm:text-sm">
            <h5 className="font-display font-extrabold text-sm uppercase tracking-widest text-white">
              Reach Us
            </h5>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-orange-500 mt-1 flex-shrink-0" />
                <span className="text-zinc-400">
                  97/3, Hoysala Nagar Rd, Horamavu, Bengaluru, Karnataka 560043
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-orange-500 flex-shrink-0" />
                <a href="tel:+919738582771" className="text-zinc-400 hover:text-orange-400">
                  +91 97385 82771
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-orange-500 flex-shrink-0" />
                <a href="mailto:hello@jackfootballclub.com" className="text-zinc-400 hover:text-orange-400">
                  hello@jackfootballclub.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-550 font-bold font-mono tracking-wider uppercase">
          <p>© 2026 Jack Football Club. Managed by Kiran (Club Manager). Licensed under local Sports Authority & FIFA Grassroots Affiliation. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#testimonials" className="hover:text-orange-500">Privacy Policy</a>
            <a href="#testimonials" className="hover:text-orange-500">Terms of Service</a>
            <button
              onClick={handleScrollTop}
              className="flex items-center gap-1.5 text-orange-500 hover:text-white"
            >
              Back To Top
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
}
