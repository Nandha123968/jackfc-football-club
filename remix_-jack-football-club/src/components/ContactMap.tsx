import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, HelpCircle, CheckCircle2, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactMap() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('Horamavu, Bengaluru');
  const [msg, setMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert('Please fill out Name, Phone, and Email to summon concierge.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setEmail('');
      setMsg('');
      setIsSubmitted(false);
      alert('Thank you! Your inquiry has been registered. Kiran, our Jack FC coordinator, will reach out to your team shortly.');
    }, 1000);
  };

  const contactWidgets = [
    {
      title: 'Our Location',
      content: '97/3, Hoysala Nagar Rd, Horamavu, Bengaluru, KA 560043',
      sub: 'opp. ANJENAYA TEMPLE, Vinayaka Layout (Plus Code: 2MC7+V4)',
      icon: <MapPin className="w-5 h-5 text-orange-500" />
    },
    {
      title: 'Helpline Contact',
      content: '+91 97385 82771 (Kiran)',
      sub: 'Direct Support Coordinator (Open 24 hours)',
      icon: <Phone className="w-5 h-5 text-orange-500" />
    },
    {
      title: 'Email Queries',
      content: 'hello@jackfootballclub.com',
      sub: 'Team pack registrations',
      icon: <Mail className="w-5 h-5 text-orange-500" />
    },
    {
      title: 'Daily Hours',
      content: 'Open 24 Hours',
      sub: 'Eid al-Adha might affect these hours',
      icon: <Clock className="w-5 h-5 text-orange-500" />
    }
  ];

  return (
    <section id="contact" className="py-24 bg-zinc-950 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-extrabold text-orange-500 font-mono tracking-widest uppercase mb-3 block">
            Liaison Office
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white uppercase tracking-tight">
            READY TO <span className="text-orange-500">CONNECT?</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium mt-3 leading-relaxed">
            Have questions about league tournaments, coaching slots, or want to lease courts for corporate matches? Drop a word to Kiran, our Vinayaka Layout coordinator.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left column coordinates grids */}
          <div className="lg:col-span-5 space-y-4">
            {contactWidgets.map((wid, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                key={idx}
                className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex gap-4 hover:border-orange-500/25 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-center flex-shrink-0">
                  {wid.icon}
                </div>
                <div>
                  <h5 className="font-display font-extrabold text-sm uppercase text-zinc-100 tracking-wide mb-1">
                    {wid.title}
                  </h5>
                  <p className="text-sm font-bold text-zinc-200">
                    {wid.content}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                    {wid.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right column Interactive Form Entry */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-850 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 pointer-events-none rounded-full blur-3xl" />
            
            <h4 className="font-display font-black text-lg text-white uppercase mb-6 pb-4 border-b border-zinc-850">
              Direct Inquiries
            </h4>

            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kiran (Manager)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs py-3.5 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="97385 82771"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs py-3.5 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kiran@jackfcclub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs py-3.5 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Select Area Complex
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-zinc-100/5 text-zinc-450 text-xs py-3.5 px-4 rounded-lg border border-zinc-800 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Message / Match Format request
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your team size, sports format choice or long-term packages..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-zinc-950 text-white text-xs py-3.5 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-white" />
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* Dynamic Dark Grayscale Styled Map Box matching Horamavu exactly */}
        <div className="mt-16 rounded-3xl overflow-hidden h-96 border border-zinc-850 shadow-2xl relative group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-300 z-10 pointer-events-none" />
          
          <iframe
            title="Jack Football Club Google Map Address"
            className="w-full h-full border-none grayscale invert contrast-125 filter opacity-90"
            src="https://maps.google.com/maps?q=97/3,%20Hoysala%20Nagar%2520Rd,%2520opp.%2520ANJENAYA%2520TEMPLE,%2520Vinayaka%2520Layout,%2520Horamavu,%2520Bengaluru,%2520Karnataka%2520560043&t=&z=14&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
            loading="lazy"
          />

          {/* Embedded Floating White badge */}
          <div className="absolute bottom-6 left-6 right-6 bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-2xl z-20 max-w-md text-left flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h6 className="font-display font-extrabold text-white text-sm uppercase tracking-wide">
                Jack Football Club Arena Complex (Horamavu)
              </h6>
              <p className="text-zinc-400 text-xs mt-1 leading-normal font-semibold">
                97/3, Hoysala Nagar Rd, opp. ANJENAYA TEMPLE, Vinayaka Layout, Horamavu, Bengaluru, Karnataka 560043. Follow signage opposite the temple crossroads. Open 24 Hours.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
