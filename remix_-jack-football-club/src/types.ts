export interface Facility {
  id: string;
  name: string;
  subtitle: string;
  category: 'pool' | 'football' | 'badminton' | 'pickleball' | 'basketball' | 'cricket';
  description: string;
  image: string;
  hourlyRate: number;
  highlightText?: string;
  accentQuote?: string;
  specs: {
    label: string;
    value: string;
    icon: string;
  }[];
  details: {
    title: string;
    content: string;
  }[];
}

export interface BookingSlot {
  time: string;
  category: 'morning' | 'afternoon' | 'evening' | 'night';
  booked: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface MatchListing {
  id: string;
  sport: string;
  hostName: string;
  joinedCount: number;
  maxPlayers: number;
  date: string;
  time: string;
  skillLevel: 'Friendly' | 'Intermediate' | 'Competitive' | 'Pro Only';
  whatsappLink: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
