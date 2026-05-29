import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Maximize2, X, Sparkles, Award, Users, Trophy } from 'lucide-react';
// @ts-ignore
import messiRonaldoImg from '../assets/images/messi_ronaldo_turf_bg_1779998962490.png';

interface GalleryItem {
  id: string;
  title: string;
  category: 'academy' | 'tournaments' | 'facility';
  src: string;
  fallbackSrc: string;
  desc: string;
}

interface GalleryCardProps {
  key?: string;
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
}

interface SmartImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

function SmartImage({ src, fallbackSrc, alt, className }: SmartImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [triedAltFormat, setTriedAltFormat] = useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setTriedAltFormat(false);
  }, [src]);

  return (
    <img
      src={imgSrc}
      onError={() => {
        if (!triedAltFormat && src.includes(' (')) {
          const altSrc = src.replace(' (', '(');
          setTriedAltFormat(true);
          setImgSrc(altSrc);
        } else if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}

function GalleryCard({ item, onSelect }: GalleryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[#10141a] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl hover:border-orange-500/40 transition-all flex flex-col justify-between"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {/* Visual Badge overlay */}
        <div className="absolute top-4 left-4 z-20 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-black text-orange-400 tracking-wider uppercase border border-orange-500/25">
          {item.category === 'academy' ? '🎓 Academy' : item.category === 'tournaments' ? '🏆 Tournament' : '⚽ Stadium'}
        </div>

        <SmartImage 
          src={item.src}
          fallbackSrc={item.fallbackSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Dark gradient gloss */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />

        {/* View details full-screener */}
        <button
          onClick={() => onSelect(item)}
          className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-black/85 backdrop-blur-md text-white border border-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 cursor-pointer"
          title="View Details"
        >
          <Maximize2 className="w-4 h-4 text-orange-400" />
        </button>
      </div>

      {/* Descriptions block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-extrabold text-white text-base tracking-tight mb-2 group-hover:text-orange-400 transition-colors">
            {item.title}
          </h4>
          <p className="text-zinc-400 text-xs font-medium leading-relaxed">
            {item.desc}
          </p>
        </div>

        {/* Dynamic Action Trigger to book associated facilities or send WhatsApp inquiry */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono font-extrabold">
          <span className="text-zinc-500">JACK FIELD SNAPS</span>
          <a 
            href={`https://wa.me/919738582771?text=${encodeURIComponent(
              `Hey Kiran! I saw the amazing "${item.title}" snap in your stadium gallery, and I wanted to know more details about it, bro! ⚽`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="text-orange-400 hover:text-orange-300 uppercase cursor-pointer"
          >
            Inquire Bro &rarr;
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function StadiumGallery() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'academy' | 'tournaments' | 'facility'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'gallery-1',
      title: 'Jack FC Kids Pro Academy',
      category: 'academy',
      src: '/kids_academy.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800&auto=format&fit=crop', // Soccer match kids fallback
      desc: 'Our future champions in action! Direct snap from our junior weekend cup matching the blue & white jersey squads.'
    },
    {
      id: 'gallery-2',
      title: 'Under-16 Championship Kick-off',
      category: 'tournaments',
      src: '/kids_academy_2.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      desc: 'High-intensity local community tournament hosted on our premium FIFA-certified artificial turf.'
    },
    {
      id: 'gallery-3',
      title: 'Floodlit Premium Turf Nights',
      category: 'facility',
      src: '/kids_academy_3.jpg',
      fallbackSrc: messiRonaldoImg,
      desc: 'Zero-shadow floodlights illuminated box setup for night-time 7-a-side and 7vs7 play.'
    },
    {
      id: 'gallery-4',
      title: 'Coaching Clinic & Drills',
      category: 'academy',
      src: '/kids_academy_4.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
      desc: 'Personalized development coaching modules led by former national team coaches at Jack FC.'
    },
    {
      id: 'gallery-5',
      title: 'Semi-Olympic Pool Swimming Clinic',
      category: 'facility',
      src: '/kids_academy_5.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
      desc: 'Our crystal clear climate-controlled swimming tracks used for custom performance strokes coaching.'
    },
    {
      id: 'gallery-6',
      title: 'Corporate Box Cricket Fixtures',
      category: 'tournaments',
      src: '/kids_academy_6.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop',
      desc: 'Corporate level intense fast box tournament finals played on high-performance grass fibers.'
    },
    {
      id: 'gallery-7',
      title: 'Jack FC Weekend Cycling Club',
      category: 'facility',
      src: '/cycling_action.jpg',
      fallbackSrc: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop', // Cycling race
      desc: 'Our endurance and speed cycling group matches. Perfect for weekend cardio loops and professional road racing training.'
    }
  ];

  const filteredItems = galleryItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <section className="py-20 bg-gradient-to-b from-[#0c0f14] via-[#090b0e] to-[#0c0f14] relative overflow-hidden border-t border-zinc-800/30">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-mono font-bold tracking-widest uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            STADIUM VIBES & GALLERY
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white uppercase"
          >
            JACK FC <span className="text-orange-500">LIVE ACTION</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm sm:text-base font-semibold mt-4 leading-relaxed"
          >
            Explore real photos of our kids training academy, competitive league tournaments, and elite stadium facilities. 
            <span className="text-orange-500 font-extrabold ml-1 block sm:inline">Add your own images into the public project folder anytime!</span>
          </motion.p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'KIDS ENROLLED', value: '180+', icon: <Users className="w-4 h-4 text-orange-500" /> },
            { label: 'COACHES IN UNIT', value: '12 Pro', icon: <Award className="w-4 h-4 text-orange-500" /> },
            { label: 'YEARS LEAGUE', value: '4 Active', icon: <Trophy className="w-4 h-4 text-orange-500" /> },
            { label: 'TOTAL TOURNAMENTS', value: '45+', icon: <Sparkles className="w-4 h-4 text-orange-500" /> }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#10141a]/60 border border-zinc-800 px-5 py-4 rounded-xl flex items-center justify-between shadow-xl"
            >
              <div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider block uppercase">{stat.label}</span>
                <span className="text-xl font-display font-extrabold text-white mt-1 block">{stat.value}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {(['all', 'academy', 'tournaments', 'facility'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-zinc-800/55 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat === 'all' ? 'All Snaps' : cat === 'academy' ? 'Kids Academy' : cat === 'tournaments' ? 'Tournaments' : 'Facilities'}
            </button>
          ))}
        </div>

        {/* Dynamic Image Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedImage(selected)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Detailed Image Lightbox overlay */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10"
            >
              <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedImage(null)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col z-10 shadow-2xl"
              >
                {/* Close Button top corner */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-25 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5 text-orange-400" />
                </button>

                {/* Main Body */}
                <div className="grid grid-cols-1 md:grid-cols-5 flex-1 min-h-0 overflow-y-auto">
                  
                  {/* Huge image view */}
                  <div className="md:col-span-3 bg-zinc-950 flex items-center justify-center min-h-[280px] md:min-h-[420px] p-2 relative">
                    <SmartImage 
                      src={selectedImage.src}
                      fallbackSrc={selectedImage.fallbackSrc}
                      alt={selectedImage.title}
                      className="max-w-full max-h-[45vh] md:max-h-[70vh] object-contain block mx-auto rounded-xl shadow-2xl"
                    />
                  </div>

                  {/* Informative credentials segment on right side */}
                  <div className="md:col-span-2 p-6 md:p-8 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col justify-between">
                    <div>
                      {/* Badge category mapping */}
                      <span className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-[10px] font-mono font-black tracking-widest uppercase mb-4">
                        {selectedImage.category === 'academy' ? 'Grad Academy' : selectedImage.category === 'tournaments' ? 'Active Leagues' : 'Stadium Spec'}
                      </span>

                      <h3 className="font-display font-black text-white text-xl uppercase tracking-tight mb-3">
                        {selectedImage.title}
                      </h3>

                      <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                        {selectedImage.desc}
                      </p>

                      <div className="mt-6 space-y-4">
                        <div className="flex gap-3 items-start text-xs text-zinc-400">
                          <Image className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">Image Reference File</span>
                            Place your photo inside the <code className="text-orange-400 font-mono px-1 bg-black/40 rounded">/public</code> folder as <code className="text-orange-400 font-mono px-1 bg-black/40 rounded">{selectedImage.src.slice(1)}</code> (e.g. <code className="text-orange-400 font-mono px-1 bg-black/40 rounded">/public{selectedImage.src}</code>) to replace this with your actual uploaded snap!
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                      <a
                        href={`https://wa.me/919738582771?text=${encodeURIComponent(
                          `Hey Kiran! I want to register my kids in the Jack FC Pro Sports Academy under your coaching slots, bro! 🎓 Please guide me on direct admissions.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-orange-500 hover:bg-orange-600 font-extrabold py-3 text-xs uppercase tracking-wider text-white rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        Enroll Kids / Contact Kiran on WhatsApp
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
