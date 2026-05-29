import React, { useState, useEffect } from 'react';
import { MatchListing } from '../types';
import { motion } from 'motion/react';
import { mockMatches } from '../data';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { Users, Award, Calendar, Clock, Landmark, MessageSquare, Plus, Check, CheckCircle, Flame } from 'lucide-react';

export default function MatchMaker() {
  const [dbMatches, setDbMatches] = useState<MatchListing[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form parameters
  const [sport, setSport] = useState('Football (Jack FC Turf)');
  const [hostName, setHostName] = useState('Enter your name');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [matchDate, setMatchDate] = useState('2026-05-28');
  const [matchTime, setMatchTime] = useState('8:00 PM - 9:00 PM');
  const [skillLevel, setSkillLevel] = useState<'Friendly' | 'Competitive' | 'Pro Only'>('Friendly');

  // Load matches from Firestore
  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsList: MatchListing[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        docsList.push({
          id: d.id,
          sport: d.sport,
          hostName: d.hostName,
          joinedCount: d.joinedCount,
          maxPlayers: d.maxPlayers,
          date: d.date,
          time: d.time,
          skillLevel: d.skillLevel,
          whatsappLink: d.whatsappLink
        });
      });
      setDbMatches(docsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });

    return () => unsubscribe();
  }, []);

  // Merge Firestore matches with mock matches for rich seeding
  const matches = [
    ...dbMatches,
    ...mockMatches.filter((m) => !dbMatches.some((dbM) => dbM.id === m.id))
  ];

  // Submit Match handler
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName) {
      alert('Please fill out Host Name to file listings.');
      return;
    }

    const mId = `match-${Date.now()}`;
    const newMatch = {
      id: mId,
      sport,
      hostName,
      joinedCount: 1, // Host starts joined
      maxPlayers: Number(maxPlayers),
      date: matchDate,
      time: matchTime,
      skillLevel,
      whatsappLink: `https://wa.me/919738582771?text=${encodeURIComponent(
        `🏆 *JACK FC - MATCHMAKING JOINEE* 🏆\n` +
        `----------------------------------\n` +
        `Hey Kiran! I want to join the "${sport}" match hosted by ${hostName}.\n` +
        `Could you please list me in the squad or reserve my slot for this game bro?\n\n` +
        `Thank you! ⚽`
      )}`,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'matches', mId), newMatch);
      setHostName('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `matches/${mId}`);
    }
  };

  return (
    <section id="matchmaker" className="py-24 bg-zinc-900 border-t border-b border-zinc-850 text-white relative overflow-hidden scroll-mt-20">
      
      {/* Decorative full bleed parallax look backdrop */}
      <div className="absolute inset-0 z-0 opacity-15">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        <img
          src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=1200"
          alt="Sports matchmaker asset background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-extrabold text-orange-500 font-mono tracking-widest uppercase mb-3 block">
            Co-play Facilitator
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white uppercase tracking-tight">
            JOIN SQUAD <span className="text-orange-500">MATCHES TODAY</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium mt-3 leading-relaxed">
            Want to play but short of players? Explore upcoming friendly games or host a new fixture so local players can sign up to join your squad on the turf.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left panel matches showcase listing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-150 uppercase tracking-wider">
                Open Matches & Fixtures
              </h3>
              <span className="text-xs text-orange-400 font-bold font-mono uppercase bg-orange-500/10 py-1 px-3 rounded-full border border-orange-500/15">
                {matches.length} active sessions
              </span>
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 scrollbar-thin">
              {matches.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.08, 0.4) }}
                  key={item.id}
                  className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between hover:border-orange-500/30 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 relative group"
                >
                  <div className="absolute top-5 right-5">
                    <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded">
                      {item.skillLevel}
                    </span>
                  </div>

                  {/* Sport & Host Details */}
                  <div className="space-y-1 pr-16 text-left">
                    <h4 className="text-base font-display font-black text-white tracking-wide uppercase leading-snug">
                      {item.sport}
                    </h4>
                    <p className="text-xs text-zinc-400 font-medium tracking-wide">
                      Organized by <strong className="text-zinc-200">{item.hostName}</strong>
                    </p>
                  </div>

                  {/* Time lists */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-zinc-900/60 text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">SCHEDULED DATE</span>
                      <span className="text-zinc-300 font-bold font-mono">{item.date}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">GAMEPLAY HOUR</span>
                      <span className="text-zinc-300 font-bold font-mono text-orange-400">{item.time}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">SLOT VACANCIES</span>
                      <span className="text-zinc-200 font-extrabold text-sm tracking-tight font-sans">
                        {item.joinedCount} / {item.maxPlayers}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-end">
                      <a
                        href={item.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-center py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-lg active:scale-95"
                      >
                        Join Squad
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right panel Host Match Form */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-850 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 pointer-events-none rounded-full blur-2xl" />
              
              <h3 className="font-display font-extrabold text-lg text-white uppercase pb-4 border-b border-zinc-850 mb-6">
                Host New Fixture
              </h3>

              <form onSubmit={handleCreateMatch} className="space-y-4">
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Select Sport Format
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option>Football (Jack FC Turf)</option>
                    <option>Badminton Doubles</option>
                    <option>Box Cricket Classic</option>
                    <option>Lane Swim Relay</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Your Full Name (Host) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-zinc-905 bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Max Players Cap
                    </label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={40}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Gameplay Hour
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="8:00 PM - 9:00 PM"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Match Vibe
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs py-3 px-3.5 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    >
                      <option>Friendly</option>
                      <option>Competitive</option>
                      <option>Pro Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-orange-500/20 mt-4 active:scale-95"
                >
                  Create Match Session
                </button>

                {successMsg && (
                  <div className="text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/25 p-3 rounded-lg text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Fixture created successfully is now live!
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
