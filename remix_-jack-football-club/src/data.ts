import { Facility, Addon, MatchListing, Testimonial, FAQ } from './types';
// @ts-ignore
import messiRonaldoImg from './assets/images/messi_ronaldo_turf_bg_1779998962490.png';

export const facilitiesData: Facility[] = [
  {
    id: 'football-turf',
    name: 'Jack FC Football Turfs',
    subtitle: 'DOMINATE THE PITCH',
    category: 'football',
    description: 'Book professional-grade FIFA-certified artificial football turfs. Engineered for local competitive leagues, training modules, and action-packed matches. Underneath our blades lies a custom shock padding to prevent joint strain.',
    image: messiRonaldoImg,
    hourlyRate: 800,
    highlightText: 'FIFA-Certified Turf',
    accentQuote: '"The best turf I\'ve played on in years. The grip is unreal and ball-roll is natural."',
    specs: [
      { label: 'TURF TYPE', value: 'High-performance SBR infill turf', icon: 'Sparkles' },
      { label: 'LIGHTING', value: 'Pro-Floodlights Low-glare LED system', icon: 'Zap' },
      { label: 'LOCKER ROOMS', value: 'Fully equipped with modern showers', icon: 'ShieldCheck' },
      { label: 'DIMENSIONS', value: 'Optimized for 5-a-side / 7-a-side', icon: 'Maximize' },
      { label: 'FENCING', value: 'Netted perimeter with overhead box', icon: 'Grid' }
    ],
    details: [
      {
        title: 'EQUIPMENT INCLUDED',
        content: 'Every turf booking comes with premium match footballs and custom-colored neon squads bibs (lime and hot orange).'
      },
      {
        title: 'RENTAL RULES',
        content: 'Both moulded cleats and training studs are allowed. Multi-stud soccer cleats work best. Maximum 14 players on pitch.'
      }
    ]
  },
  {
    id: 'swimming-pool',
    name: 'Semi-Olympic Pool',
    subtitle: 'TAKE THE PERFORMANCE PLUNGE',
    category: 'pool',
    description: 'Experience elite-level training in our 25-meter pristine waters. Fully climate-controlled, crystal clear, and designed for both casual laps and competitive drills under certified lifeguards supervision.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1200&auto=format&fit=crop',
    hourlyRate: 150,
    highlightText: 'Professional Pool',
    accentQuote: '"A constant 28°C pristine environment. Excellent water quality checked triple times daily."',
    specs: [
      { label: 'DIMENSIONS', value: '25m x 12.5m (6 lanes)', icon: 'Minimize' },
      { label: 'FILTRATION', value: 'High Performance M-Sand system with Flocculent', icon: 'Settings' },
      { label: 'SAFETY', value: 'Certified On-duty Lifeguards', icon: 'HeartPulse' },
      { label: 'POOL HOURS', value: '6:00 AM - 11:00 PM Daily', icon: 'Clock' }
    ],
    details: [
      {
        title: 'WATER QUALITY',
        content: 'PH balanced & chlorine level stabilized. Monitored and filtered continuously every single day.'
      },
      {
        title: 'SAFETY & HYGIENE',
        content: 'Swimmers must wear a swimming cap. Showering is mandatory before taking the plunge.'
      }
    ]
  },
  {
    id: 'badminton',
    name: 'Elite Badminton Courts',
    subtitle: 'SPEED AND STRIKE',
    category: 'badminton',
    description: '5 high-density indoor badminton courts with specialized shock-absorb wooden sub-floors designed to maximize knee health and increase baseline speed.',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
    hourlyRate: 300,
    highlightText: 'Indoor High Elastic Arena',
    specs: [
      { label: 'FLOORING', value: 'Grade-A synthetic non-slip rubber mats', icon: 'Layers' },
      { label: 'NETS', value: 'BWF-standard professional nets', icon: 'Activity' },
      { label: 'SHADOW LIGHTS', value: 'Indirect low-glare ceiling spotlights', icon: 'Sun' }
    ],
    details: [
      {
        title: 'GUM SOLLED SHOES ONLY',
        content: 'Non-marking gum sole shoes are strictly mandatory. Barefoot or black-soled tennis sneakers are not allowed on the mats.'
      },
      {
        title: 'COURT RESERVATION',
        content: 'Water bottles, racket rentals, and feather birds are available for purchase at the front desk.'
      }
    ]
  },
  {
    id: 'box-cricket',
    name: 'Box Cricket Pavilion',
    subtitle: 'KNOTLESS INDOOR CRICKET',
    category: 'cricket',
    description: 'Fast, intense, short-format box cricket. Completely surrounded by pro-grade tension nets, ensuring zero lost balls and a continuous high-pace target game.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
    hourlyRate: 800,
    highlightText: 'Overhead Mesh Enclosed',
    specs: [
      { label: 'TURF STRUCTURE', value: 'HD Multi-layer heavy grass fibers', icon: 'Sparkles' },
      { label: 'NET SYSTEM', value: 'Knotless tensioned perimeter grids', icon: 'Shuffle' },
      { label: 'EQUIPMENT', value: 'Heavy wooden bats and windsors included', icon: 'Grid' }
    ],
    details: [
      {
        title: 'SQUAD SIZE',
        content: 'Best for 6v6 or 8v8 fast matches. Fully responsive score panels are embedded inside the enclosure.'
      },
      {
        title: 'SAFETY NETS',
        content: 'High overhead enclosure allows hard vertical hitting without risk of damage.'
      }
    ]
  }
];

export const addonsData: Addon[] = [
  { id: 'bibs', name: 'Premium Neon Bibs (Set of 10)', price: 100, description: 'Lime and orange squad separators' },
  { id: 'gloves', name: 'Goalkeeper Gloves (Pro)', price: 150, description: 'Non-slip latex professional grip' },
  { id: 'referee', name: 'Hire Official Match Referee', price: 500, description: 'Brawl-free, certified league referee' },
  { id: 'energy', name: 'Sports Energy Drinks (Pack of 5)', price: 200, description: 'Isotonic hydration for the squad' }
];

export const mockMatches: MatchListing[] = [
  {
    id: 'match-1',
    sport: 'Football (Jack FC Turf)',
    hostName: 'Kiran (Manager)',
    joinedCount: 9,
    maxPlayers: 12,
    date: '2026-05-28',
    time: '7:00 PM - 8:00 PM',
    skillLevel: 'Intermediate',
    whatsappLink: `https://wa.me/919738582771?text=${encodeURIComponent(
      `🏆 *JACK FC - SQUAD MATCH* 🏆\n` +
      `----------------------------------\n` +
      `Hey Kiran! I want to join the "Football (Jack FC Turf)" match organized by Kiran (Manager) on 2026-05-28 at 7:00 PM. Please add me to the squad, bro! ⚽`
    )}`
  },
  {
    id: 'match-2',
    sport: 'Badminton Doubles',
    hostName: 'Anjali Sharma',
    joinedCount: 3,
    maxPlayers: 4,
    date: '2026-05-28',
    time: '6:00 PM - 7:00 PM',
    skillLevel: 'Competitive',
    whatsappLink: `https://wa.me/919738582771?text=${encodeURIComponent(
      `🏆 *JACK FC - SQUAD MATCH* 🏆\n` +
      `----------------------------------\n` +
      `Hey Kiran! I want to join the "Badminton Doubles" match organized by Anjali Sharma on 2026-05-28 at 6:00 PM. Please add me in, bro! 🏸`
    )}`
  },
  {
    id: 'match-3',
    sport: 'Box Cricket Tournament Style',
    hostName: 'Karthik Rao',
    joinedCount: 11,
    maxPlayers: 16,
    date: '2026-05-29',
    time: '8:30 PM - 10:00 PM',
    skillLevel: 'Friendly',
    whatsappLink: `https://wa.me/919738582771?text=${encodeURIComponent(
      `🏆 *JACK FC - SQUAD MATCH* 🏆\n` +
      `----------------------------------\n` +
      `Hey Kiran! I want to join the "Box Cricket Tournament Style" match organized by Karthik Rao on 2026-05-29 at 8:30 PM. Please add me to the squad list, bro! 🏏`
    )}`
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: 'test-1',
    name: 'nandha kumar s',
    role: '',
    rating: 5,
    text: 'Jack Football Club has raised local sports standards to a whole new tier. The FIFA-certified football turfs have amazing grip, and the underlying shock pads dramatically reduce joint stress.',
    avatar: 'NK'
  },
  {
    id: 'test-2',
    name: 'kiran',
    role: '',
    rating: 5,
    text: 'The semi-olympic temperature-controlled swimming pool is flawless. Constant 28°C pristine water with an extremely clean high-performance M-sand filter system in place.',
    avatar: 'K'
  },
  {
    id: 'test-3',
    name: 'naveen kumar s',
    role: '',
    rating: 5,
    text: 'The scheduling portal makes booking slots seamless. Adding matchmaker features is such an asset on weekends to easily assemble squads for games!',
    avatar: 'NK'
  }
];

export const faqsData: FAQ[] = [
  {
    question: 'What are the hourly booking rates?',
    answer: 'Rates vary by sport and timing: Swimming Pool is ₹150/hr, Badminton is ₹300/hr, Jack FC Football Turfs starts at ₹800/hr, and Box Cricket starts at ₹800/hr.'
  },
  {
    question: 'Can I rent gear and sports accessories?',
    answer: 'Yes! Rackets, cricket gear, team squad bibs, goalkeeper gloves, and standard balls/shuttlecocks can be rented directly at our central reception counter.'
  },
  {
    question: 'What is the booking cancellation policy?',
    answer: 'You can reschedule or cancel your session with a full credit refund up to 12 hours before your scheduled booking time directly through our support channel.'
  }
];
