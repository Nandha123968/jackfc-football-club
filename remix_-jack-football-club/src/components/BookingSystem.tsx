import React, { useState, useEffect } from 'react';
import { Facility, Addon, BookingSlot } from '../types';
import { facilitiesData, addonsData } from '../data';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, runTransaction, deleteDoc, getDocs } from 'firebase/firestore';
import { generateBookingPDF } from '../utils/pdfGenerator';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ShieldAlert,
  Users,
  CheckCircle,
  HelpCircle,
  PhoneCall,
  Flame,
  Check,
  ChevronRight,
  Download,
  Share2,
  X,
  CreditCard,
  Lock,
  Unlock,
  Search,
  LogOut,
  Key,
  Banknote,
  Wallet
} from 'lucide-react';
import RazorpayCheckout from './RazorpayCheckout';

interface BookingSystemProps {
  selectedFacilityId: string;
  onBookingConfirmed: (details: any) => void;
}

const getEndTimeString = (startTimeStr: string, durationHours: number): string => {
  try {
    const match = startTimeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return startTimeStr;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    
    if (ampm) {
      const ampmUpper = ampm.toUpperCase();
      if (ampmUpper === 'PM' && hours < 12) hours += 12;
      if (ampmUpper === 'AM' && hours === 12) hours = 0;
    }
    
    let endHours = hours + durationHours;
    const endAmpm = endHours >= 12 && endHours < 24 ? 'PM' : 'AM';
    let displayHours = endHours % 12;
    if (displayHours === 0) displayHours = 12;
    
    if (endHours >= 24) {
      const displayHours24 = endHours - 24;
      displayHours = displayHours24 % 12;
      if (displayHours === 0) displayHours = 12;
    }
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${String(displayHours).padStart(2, '0')}:${formattedMinutes} ${endAmpm}`;
  } catch (err) {
    return startTimeStr;
  }
};

export default function BookingSystem({ selectedFacilityId, onBookingConfirmed }: BookingSystemProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // 1 = 1 Hour, 2 = 2 Hours
  const [activeTab, setActiveTab] = useState<'reservations' | 'touch' | 'manage'>('reservations');
  const [chosenSportId, setChosenSportId] = useState<string>(selectedFacilityId);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [timeFilterCategory, setTimeFilterCategory] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');
  const [pitchType, setPitchType] = useState<'half' | 'full'>('half');

  // Contact form state
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [teamName, setTeamName] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'venue'>('online');
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState<any | null>(null);

  // Ticket Modal state
  const [showNotification, setShowNotification] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any | null>(null);

  // Real-time Firestore mapped bookings (time -> details)
  const [dbBookings, setDbBookings] = useState<Record<string, { userName: string; teamName: string }>>({});

  // All bookings dynamic listener for the admin manager
  const [allDbBookings, setAllDbBookings] = useState<any[]>([]);

  // Security locks and lookup states
  const [managerUnlockCode, setManagerUnlockCode] = useState('');
  const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');
  const [athleteLookupResults, setAthleteLookupResults] = useState<any[]>([]);
  const [hasLookedUpAthlete, setHasLookedUpAthlete] = useState(false);
  const [isSearchingAthlete, setIsSearchingAthlete] = useState(false);

  // Update chosen sport if prop changes
  useEffect(() => {
    if (selectedFacilityId) {
      setChosenSportId(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  const selectedSport = facilitiesData.find((f) => f.id === chosenSportId) || facilitiesData[0];

  // Generate 7 upcoming calendar dates starting dynamically from today
  const generateDates = () => {
    const dates = [];
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Use the user's specific current time: 2026-05-27
    const startDate = new Date('2026-05-27T14:26:37Z');
    
    for (let i = 0; i < 7; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      dates.push({
        dayName: daysOfWeek[current.getDay()],
        dayNum: current.getDate(),
        month: months[current.getMonth()],
        fullString: current.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const datesList = generateDates();

  // Load real-time booked slots from Firestore for selected sport and date
  useEffect(() => {
    const formattedDate = `${datesList[selectedDateIndex].dayName}, ${datesList[selectedDateIndex].dayNum} ${datesList[selectedDateIndex].month} 2026`;
    const q = query(
      collection(db, 'bookings'),
      where('sportName', '==', selectedSport.name),
      where('date', '==', formattedDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsMap: Record<string, { userName: string; teamName: string }> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.time) {
          // If stored as range like "08:30 PM - 09:30 PM", extract "08:30 PM" for core matching
          const startTime = data.time.split(' - ')[0].trim();
          bookingsMap[startTime] = {
            userName: data.userName || 'Registered Athlete',
            teamName: data.teamName || 'Jack FC'
          };
          bookingsMap[data.time.trim()] = {
            userName: data.userName || 'Registered Athlete',
            teamName: data.teamName || 'Jack FC'
          };
        }
      });
      setDbBookings(bookingsMap);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [selectedSport.name, selectedDateIndex]);

  // Load all bookings regardless of sport/date in real-time for managers/testing cleanup
  useEffect(() => {
    if (!isManagerUnlocked) return;
    const qAll = query(collection(db, 'bookings'));
    const unsubscribeAll = onSnapshot(qAll, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          list.push({
            id: doc.id,
            ...data
          });
        }
      });
      // Sort by creation or time
      list.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
      setAllDbBookings(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribeAll();
  }, [isManagerUnlocked]);

  const handleDeleteBooking = async (
    bookingId: string,
    slotId: string,
    originalAthletePhone?: string,
    originalAthleteEmail?: string
  ) => {
    if (isManagerUnlocked) {
      const confirmCancel = window.confirm(`Manager Bypass: Are you sure you want to cancel booking ${bookingId}? This slot will be opened again immediately.`);
      if (!confirmCancel) return;
    } else {
      const verifyInput = window.prompt(
        `To cancel booking ${bookingId}, please verify your registered Phone Number or Contact Email:`
      );
      if (verifyInput === null) return; // user clicked cancel

      const cleanInput = verifyInput.trim().toLowerCase().replace(/\s+/g, '');
      const cleanPhone = (originalAthletePhone || '').trim().replace(/\D/g, '');
      const cleanEmail = (originalAthleteEmail || '').trim().toLowerCase();

      const inputIsPhone = /^\+?\d+$/.test(cleanInput);
      const cleanInputPhone = verifyInput.replace(/\D/g, '');

      const matchesPhone = cleanPhone && inputIsPhone && cleanInputPhone === cleanPhone;
      const matchesEmail = cleanEmail && cleanInput === cleanEmail;

      if (!matchesPhone && !matchesEmail) {
        alert("Verification failed! The contact info entered does not match this booking record. Only the original athlete or the Manager (Kiran) can cancel slots.");
        return;
      }
    }

    try {
      await deleteDoc(doc(db, 'bookings', slotId));
      alert(`Booking ${bookingId} canceled successfully!`);
      // Update local client states immediately
      if (isManagerUnlocked) {
        setAllDbBookings((prev) => prev.filter((b) => b.id !== slotId && b.slotId !== slotId));
      } else {
        setAthleteLookupResults((prev) => prev.filter((b) => b.id !== slotId && b.slotId !== slotId));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel slot, rules might be mismatched or offline.');
    }
  };

  const handleAthleteLookupSearch = async () => {
    const trimmed = athleteSearchQuery.trim();
    if (!trimmed) {
      alert('Please enter your registered contact phone number or email, machan.');
      return;
    }
    setIsSearchingAthlete(true);
    setHasLookedUpAthlete(true);
    try {
      // Look up where phone or email matches the search query string
      const qPhone = query(collection(db, 'bookings'), where('userPhone', '==', trimmed));
      const qEmail = query(collection(db, 'bookings'), where('userEmail', '==', trimmed));

      const phoneSnap = await getDocs(qPhone);
      const emailSnap = await getDocs(qEmail);

      const found: any[] = [];
      const seenIds = new Set();

      phoneSnap.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          found.push({ id: doc.id, ...doc.data() });
        }
      });

      emailSnap.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          found.push({ id: doc.id, ...doc.data() });
        }
      });

      // Sort by creation or time
      found.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      setAthleteLookupResults(found);
    } catch (err) {
      console.error(err);
      alert('Failed to extract bookings. Please trace connection logs.');
    } finally {
      setIsSearchingAthlete(false);
    }
  };

  const handleUnlockManager = () => {
    const trimmed = managerUnlockCode.trim();
    if (trimmed === '9360' || trimmed.toLowerCase() === 'kiran' || trimmed.toLowerCase() === 'jackfc10') {
      setIsManagerUnlocked(true);
      alert('Manager Console verified! Real-time stream unlocked.');
    } else {
      alert('Access Denied: Administrative passcode is incorrect.');
    }
  };

  const handleSecurityReset = () => {
    setIsManagerUnlocked(false);
    setManagerUnlockCode('');
    setAthleteLookupResults([]);
    setAthleteSearchQuery('');
    setHasLookedUpAthlete(false);
    setAllDbBookings([]);
  };

  // Standard interactive slot availability mapping
  const sampleSlots: BookingSlot[] = [
    { time: '06:00 AM', category: 'morning', booked: false },
    { time: '07:30 AM', category: 'morning', booked: false },
    { time: '09:00 AM', category: 'morning', booked: false },
    { time: '10:30 AM', category: 'morning', booked: false },
    { time: '12:00 PM', category: 'afternoon', booked: false },
    { time: '01:30 PM', category: 'afternoon', booked: false },
    { time: '03:00 PM', category: 'afternoon', booked: false },
    { time: '04:30 PM', category: 'evening', booked: false },
    { time: '06:00 PM', category: 'evening', booked: false },
    { time: '07:15 PM', category: 'evening', booked: false },
    { time: '08:30 PM', category: 'night', booked: false },
    { time: '10:00 PM', category: 'night', booked: false }
  ];

  const parseTimeToMinutes = (timeStr: string): number | null => {
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      const ampmUpper = ampm.toUpperCase();
      if (ampmUpper === 'PM' && hours < 12) hours += 12;
      if (ampmUpper === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

  const isTimeClubBlocked = (dayName: string, timeStr: string) => {
    const isWeekday = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(dayName);
    const isWeekend = ['SAT', 'SUN'].includes(dayName);
    const normalized = timeStr.trim().toUpperCase();

    if (isWeekday) {
      if (normalized.includes('04:30 PM') || normalized.includes('4:30 PM')) {
        return true;
      }
      try {
        const minutes = parseTimeToMinutes(normalized);
        if (minutes !== null && minutes >= 990 && minutes < 1080) { // 16:30 is 990. 18:00 is 1080
          return true;
        }
      } catch (err) {}
    }

    if (isWeekend) {
      if (normalized.includes('07:30 AM') || normalized.includes('7:30 AM')) {
        return true;
      }
      try {
        const minutes = parseTimeToMinutes(normalized);
        if (minutes !== null && minutes >= 450 && minutes < 540) { // 07:30 is 450. 09:00 is 540
          return true;
        }
      } catch (err) {}
    }

    return false;
  };

  // Overlay Firestore booked bookings and club schedules over standard sample slots
  const updatedSlots = sampleSlots.map((slot) => {
    const dayName = datesList[selectedDateIndex].dayName;
    const isClubBlocked = isTimeClubBlocked(dayName, slot.time);

    if (isClubBlocked) {
      return {
        ...slot,
        booked: true,
        bookedBy: 'Club Practice',
        bookedTeam: 'Jack FC (Academy)',
        isClubBlocked: true
      } as any;
    }

    const matched = dbBookings[slot.time];
    if (matched) {
      return { 
        ...slot, 
        booked: true, 
        bookedBy: matched.userName,
        bookedTeam: matched.teamName 
      };
    }
    return slot;
  });

  const filteredSlots = updatedSlots.filter(
    (slot) => timeFilterCategory === 'all' || slot.category === timeFilterCategory
  );

  // Toggle addons items state
  const handleToggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Finance calculations
  const getBaseRate = () => {
    const isWeekend = ['SAT', 'SUN'].includes(datesList[selectedDateIndex].dayName);
    if (chosenSportId === 'football-turf' || chosenSportId === 'box-cricket') {
      if (isWeekend) {
        return pitchType === 'full' ? 1200 : 900;
      } else {
        return pitchType === 'full' ? 1000 : 800;
      }
    }
    return selectedSport.hourlyRate;
  };
  const baseRate = getBaseRate();
  const chosenAddonDetails = addonsData.filter((a) => selectedAddons.includes(a.id));
  const addonsTotal = chosenAddonDetails.reduce((sum, item) => sum + item.price, 0);
  const subTotal = (baseRate * selectedDuration) + addonsTotal;
  const cgstAndSgst = 0; // GST sports tax is removed per manager request
  const finalTotalAmount = subTotal;

  // Helper function to create booking ticket object
  const createBookingTicket = () => {
    const formattedDate = `${datesList[selectedDateIndex].dayName}, ${datesList[selectedDateIndex].dayNum} ${datesList[selectedDateIndex].month} 2026`;
    const normalizedTime = selectedTime.replace(/[:\s]/g, '');
    const slotDocId = `SLOT-${chosenSportId}-${datesList[selectedDateIndex].fullString}-${normalizedTime}`.toLowerCase();
    const displayBookingId = `JK-${datesList[selectedDateIndex].dayNum}${normalizedTime}-${Math.floor(Math.random() * 90 + 10)}`;
    const ticketTimeRange = selectedTime && getEndTimeString(selectedTime, selectedDuration)
      ? `${selectedTime} - ${getEndTimeString(selectedTime, selectedDuration)}`
      : selectedTime;

    return {
      bookingId: displayBookingId,
      slotId: slotDocId,
      userName,
      userPhone,
      userEmail,
      teamName: teamName || 'Jack FC Free Agent',
      sportName: selectedSport.name,
      sportId: chosenSportId,
      date: formattedDate,
      dateString: datesList[selectedDateIndex].fullString,
      time: ticketTimeRange,
      duration: selectedDuration,
      addons: chosenAddonDetails.map((a) => a.name),
      hourlyRate: baseRate,
      addonsTotal,
      gst: cgstAndSgst,
      total: finalTotalAmount,
      createdAt: new Date().toISOString(),
      pitchType: (chosenSportId === 'football-turf' || chosenSportId === 'box-cricket') ? (pitchType === 'full' ? 'Full Pitch' : 'Half Pitch') : undefined,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'venue' ? 'pending' : 'paid'
    };
  };

  // Function to save booking to Firestore
  const saveBookingToFirestore = async (ticket: any) => {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'bookings', ticket.slotId);
      const docSnapshot = await transaction.get(docRef);
      
      if (docSnapshot.exists()) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }
      
      transaction.set(docRef, ticket);
    });
  };

  // Handle successful Stripe payment
  const handleStripePaymentSuccess = async () => {
    if (!pendingBookingDetails) return;
    
    try {
      const ticket = { ...pendingBookingDetails, paymentStatus: 'paid' };
      await saveBookingToFirestore(ticket);
      
      setShowStripeCheckout(false);
      setPendingBookingDetails(null);
      setGeneratedTicket(ticket);
      setIsReserving(false);
      onBookingConfirmed(ticket);
      
      try {
        generateBookingPDF(ticket);
      } catch (pdfErr) {
        console.error('PDF Generation Error: ', pdfErr);
      }
    } catch (error: any) {
      setShowStripeCheckout(false);
      setIsReserving(false);
      if (error && error.message === 'SLOT_ALREADY_BOOKED') {
        alert('Sorry! This slot was just booked by someone else. Please select another timing.');
      } else {
        handleFirestoreError(error, OperationType.WRITE, `bookings/${pendingBookingDetails.slotId}`);
      }
    }
  };

  // Handle Stripe payment cancellation
  const handleStripePaymentCancel = () => {
    setShowStripeCheckout(false);
    setPendingBookingDetails(null);
    setIsReserving(false);
  };

  // Form Booking Submission Action
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert('Please select an available timing slot to continue.');
      return;
    }
    const dayName = datesList[selectedDateIndex].dayName;
    if (isTimeClubBlocked(dayName, selectedTime)) {
      alert(`Machan! This slot (${selectedTime}) is reserved exclusively for Jack FC Club Practice/Academy on Mon-Fri 4:30 PM - 6:00 PM and Sat-Sun 7:30 AM - 9:00 AM. Please choose another available timing!`);
      return;
    }
    if (!userName || !userPhone || !userEmail) {
      alert('Please fill out Name, Phone, and Email to file reservation.');
      return;
    }

    setIsReserving(true);
    const ticket = createBookingTicket();

    // If paying online, show Stripe checkout
    if (paymentMethod === 'online') {
      setPendingBookingDetails(ticket);
      setShowStripeCheckout(true);
      return;
    }

    // If paying at venue, save booking directly
    try {
      await saveBookingToFirestore(ticket);

      setGeneratedTicket(ticket);
      setIsReserving(false);
      onBookingConfirmed(ticket);
      
      // Auto-trigger the PDF receipt download immediately!
      try {
        generateBookingPDF(ticket);
      } catch (pdfErr) {
        console.error('PDF Generation Error: ', pdfErr);
      }

    } catch (error: any) {
      setIsReserving(false);
      if (error && error.message === 'SLOT_ALREADY_BOOKED') {
        alert('Sorry/Maafi! This play slot has already been reserved by another athlete. Please select another available timing!');
      } else {
        handleFirestoreError(error, OperationType.WRITE, `bookings/${ticket.slotId}`);
      }
    }
  };

  return (
    <section id="booking" className="py-24 bg-zinc-950 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] tracking-widest font-extrabold uppercase px-4 py-2 rounded-full mb-3">
            <Flame className="w-4 h-4 animate-pulse text-orange-500" />
            Arena Booking Matrix
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight uppercase">
            RESERVE YOUR <span className="text-orange-500">DYNAMIC SLOT</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium mt-3 leading-relaxed">
            Direct real-time slot registration and squad allocations. Choose your prefered sport facility, select live calendar schedules, and get immediate matches checkout.
          </p>
        </div>

        {/* Global Workplace layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Navigation panels */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5 flex flex-col gap-1 shadow-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('reservations')}
                className={`w-full py-3.5 px-4 rounded-xl text-left font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'reservations'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                1. Arena Slots
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('touch');
                  const contactBlock = document.getElementById('contact');
                  if (contactBlock) contactBlock.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full py-3.5 px-4 rounded-xl text-left font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'touch'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                2. Rent Entire Facility
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`w-full py-3.5 px-4 rounded-xl text-left font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'manage'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                3. Manage / Cancel Bookings
              </button>
            </div>

            {/* Need help widget box modeled exactly on Horamavu referenced mockup screenshots */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-orange-500/5 blur-xl group-hover:bg-orange-500/15 transition-all duration-300" />
              <HelpCircle className="w-8 h-8 text-orange-500 mb-4" />
              <h5 className="font-display font-bold text-base text-zinc-100 uppercase mb-2">
                Need Fast Help?
              </h5>
              <p className="text-zinc-400 text-xs font-semibold leading-relaxed mb-4">
                Our front desk coordinators are live 24 Hours daily for custom fixtures setup or tournament bookings.
              </p>
              <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block">Direct Helpline</span>
                  <a href="tel:+919738582771" className="text-sm font-bold text-zinc-200 hover:text-orange-400 transition-colors">
                    +91 97385 82771
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main parameters entry parameters */}
          <div className="lg:col-span-3">
            {activeTab === 'manage' ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                {!isManagerUnlocked && !hasLookedUpAthlete ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                      <Lock className="w-6 h-6 text-orange-500 animate-pulse" />
                      <div>
                        <h3 className="font-display font-extrabold text-lg uppercase tracking-wider text-zinc-100">
                          Secure Security Lock
                        </h3>
                        <p className="text-zinc-500 text-[11px] mt-0.5">
                          Verification is required to safeguard athletes' details and slot assignments from bot abuses.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Athlete lookup */}
                      <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono font-bold px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">Option A</span>
                            <h4 className="font-display font-black text-sm text-zinc-200 uppercase">Athlete Self-Service</h4>
                          </div>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">
                            Search and cancel your own scheduled play passes by verifying the contact phone/email registered during slot purchase.
                          </p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Phone or Email..."
                              value={athleteSearchQuery}
                              onChange={(e) => setAthleteSearchQuery(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500/50 rounded-xl py-2.5 pl-3 pr-8 text-xs text-white placeholder-zinc-550 outline-none transition-all font-mono"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAthleteLookupSearch();
                              }}
                            />
                            <Search className="w-3.5 h-3.5 text-zinc-650 absolute right-3 top-3.5" />
                          </div>
                          <button
                            type="button"
                            onClick={handleAthleteLookupSearch}
                            disabled={isSearchingAthlete}
                            className="w-full bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-300 font-bold text-xs uppercase p-3 rounded-xl tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isSearchingAthlete ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                            Retrieve My Passes
                          </button>
                        </div>
                      </div>

                      {/* Manager passcode unlock */}
                      <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">Option B</span>
                            <h4 className="font-display font-black text-sm text-zinc-200 uppercase">Jack FC Club Manager</h4>
                          </div>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">
                            For coordinators and executive staff. Unlocks full stream of all booked sessions for diagnostics and sweep-up.
                          </p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Administrative Code..."
                              value={managerUnlockCode}
                              onChange={(e) => setManagerUnlockCode(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500/50 rounded-xl py-2.5 pl-3 pr-8 text-xs text-white placeholder-zinc-550 outline-none transition-all font-mono"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUnlockManager();
                              }}
                            />
                            <Key className="w-3.5 h-3.5 text-zinc-650 absolute right-3 top-3.5" />
                          </div>
                          <button
                            type="button"
                            onClick={handleUnlockManager}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase p-3 rounded-xl tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Verify Credentials
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          {isManagerUnlocked ? (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                              ADMIN ACCESS ENABLED
                            </span>
                          ) : (
                            <span className="text-[9px] bg-orange-500/15 text-orange-400 font-mono font-bold px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest">
                              SECURE USER ACCESS
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-wider text-zinc-100 mt-1.5 flex items-center gap-2">
                          {isManagerUnlocked ? 'Active Arena Master Logs' : 'Verified Purchase Passes'}
                        </h3>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {isManagerUnlocked 
                            ? 'Displaying all interactive database logs. Execute direct master cancellations.'   
                            : `Displaying your play records matching "${athleteSearchQuery}".`
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-zinc-950 text-orange-400 border border-zinc-850 text-[10px] font-mono font-bold py-1.5 px-3 rounded-full uppercase tracking-widest w-fit">
                          {isManagerUnlocked ? allDbBookings.length : athleteLookupResults.length} Slots
                        </span>
                        
                        <button
                          type="button"
                          onClick={handleSecurityReset}
                          className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-white text-[10px] font-mono font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3 text-red-400" />
                          Lock Board
                        </button>
                      </div>
                    </div>

                    {(isManagerUnlocked ? allDbBookings : athleteLookupResults).length === 0 ? (
                      <div className="text-center py-16 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                          <Calendar className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                            No Records Discovered!
                          </p>
                          <p className="text-zinc-500 text-[11px]">
                            {isManagerUnlocked 
                              ? 'Reservations board is currently completely vacant.'
                              : 'We could not trace any active booking matching your supplied credential.'
                            }
                          </p>
                        </div>
                        {!isManagerUnlocked && (
                          <button
                            type="button"
                            onClick={handleSecurityReset}
                            className="bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-100 text-xs font-bold px-4 py-2 rounded-xl mt-2 transition-all cursor-pointer"
                          >
                            Try Another Number/Email
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(isManagerUnlocked ? allDbBookings : athleteLookupResults).map((b) => (
                          <div
                            key={b.id}
                            className="bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-5 space-y-4 transition-all duration-300 relative overflow-hidden group"
                          >
                            {/* Decorative lock overlay */}
                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-orange-500/2 blur-lg pointer-events-none" />

                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1 max-w-[65%]">
                                <span className="text-[10px] text-orange-400 font-mono font-bold px-2 py-0.5 bg-orange-500/5 rounded border border-orange-500/10">
                                  {b.bookingId}
                                </span>
                                <h4 className="font-display font-black text-sm text-zinc-100 uppercase tracking-wide truncate">
                                  {b.sportName}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b.bookingId, b.slotId || b.id, b.userPhone, b.userEmail)}
                                className="bg-red-500/10 hover:bg-red-500 active:scale-95 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 text-[10px] font-extrabold uppercase px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                Cancel Slot
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 text-xs border-t border-zinc-900/80 pt-3 text-zinc-400">
                              <div>
                                <span className="text-[8px] text-zinc-500 block font-bold uppercase">Athlete</span>
                                <span className="font-bold text-zinc-200 block truncate">{b.userName}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-zinc-500 block font-bold uppercase">Date & Hours</span>
                                <span className="font-semibold text-zinc-200 font-mono text-[10px] block leading-snug">
                                  {b.date} <br />
                                  <strong className="text-orange-400 font-bold">{b.time}</strong>
                                </span>
                              </div>
                              
                              <div className="col-span-2 bg-zinc-900/40 p-2.5 border border-zinc-900/60 rounded-xl relative">
                                <span className="text-[8px] text-zinc-500 block font-bold uppercase">Squad Name</span>
                                <span className="text-zinc-300 font-semibold text-[10.5px] block truncate mt-0.5">
                                  {b.teamName || 'Jack FC Agent'}
                                </span>
                                {isManagerUnlocked && (
                                  <div className="mt-1.5 pt-1.5 border-t border-zinc-950 flex flex-col gap-0.5 text-[9px] font-mono text-zinc-500 select-all">
                                    <span>Phone: {b.userPhone}</span>
                                    <span>Email: {b.userEmail}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* Mid column parameters Steps 1, 2, 3, 4 */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Step 1: Sport Selection */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                      1
                    </div>
                    <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                      Select Facility & Sport
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {facilitiesData.map((fac) => (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => {
                          setChosenSportId(fac.id);
                          setSelectedTime(''); // Reset timing back for sports
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          chosenSportId === fac.id
                            ? 'border-orange-500 bg-orange-500/5 shadow-inner'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold block text-white">
                          {fac.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          ₹{fac.hourlyRate}/Hr rate
                        </span>
                      </button>
                    ))}
                  </div>

                  {(chosenSportId === 'football-turf' || chosenSportId === 'box-cricket') && (
                    <div className="pt-4 border-t border-zinc-800/60 mt-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                          Pitch Size Option
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          Pick the pitch layout fit for your team size
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          key="pitch-half"
                          type="button"
                          onClick={() => setPitchType('half')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            pitchType === 'half'
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold block text-white">Half Pitch</span>
                            <span className="text-[10px] text-orange-400 font-mono font-bold">
                              ₹{['SAT', 'SUN'].includes(datesList[selectedDateIndex].dayName) ? 900 : 800}/Hr
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 block mt-1">Ideal for 5v5 / 6v6 squad matches</span>
                        </button>
                        <button
                          key="pitch-full"
                          type="button"
                          onClick={() => setPitchType('full')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            pitchType === 'full'
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold block text-white">Full Pitch</span>
                            <span className="text-[10px] text-orange-400 font-mono font-bold">
                              ₹{['SAT', 'SUN'].includes(datesList[selectedDateIndex].dayName) ? 1200 : 1000}/Hr
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 block mt-1">Required for 7-a-side / 7vs7 fixtures</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Choose Date Row */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                      2
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                        Choose Play Date
                      </h3>
                      <span className="text-[10px] text-orange-400 font-mono font-bold uppercase">
                        {datesList[selectedDateIndex].month} 2026
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Dates row */}
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {datesList.map((dt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`flex-1 min-w-[70px] py-3 text-center rounded-xl border flex flex-col justify-center items-center cursor-pointer transition-all ${
                          selectedDateIndex === idx
                            ? 'border-orange-500 bg-orange-500/10 text-white active-glow'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono tracking-wider block font-bold">
                          {dt.dayName}
                        </span>
                        <span className="text-xl font-display font-extrabold block mt-0.5">
                          {dt.dayNum}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Slots Grid and categories from screenshots */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                        3
                    </div>
                    <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                      Choose Timing Slot
                    </h3>
                    </div>
                    
                    {/* Tiny info bullet */}
                    <span className="text-[10px] text-zinc-500 font-bold uppercase hidden sm:block">
                      GMT+5:30 IST Selection
                    </span>
                  </div>

                  {/* Categories tabs exact to Aura screenshots */}
                  <div className="flex flex-wrap gap-2.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    {(['all', 'morning', 'afternoon', 'evening', 'night'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTimeFilterCategory(cat)}
                        className={`flex-1 py-1.5 px-2.5 text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          timeFilterCategory === cat
                            ? 'bg-orange-500 text-white shadow-inner'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Slots trigger bubbles */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {filteredSlots.map((slot, sIdx) => {
                      const bookedUser = (slot as any).bookedBy;
                      const isClubBlocked = (slot as any).isClubBlocked;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={slot.booked}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-3 px-1 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer border ${
                            slot.booked
                              ? isClubBlocked
                                ? 'bg-orange-500/5 border-orange-500/20 text-orange-400 opacity-90 cursor-not-allowed'
                                : 'bg-zinc-950/70 border-zinc-900 text-zinc-500 opacity-80 cursor-not-allowed'
                              : selectedTime === slot.time
                              ? 'border-orange-500 bg-orange-500 text-white active-glow font-extrabold'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-orange-500/50'
                          }`}
                          title={isClubBlocked ? 'Blocked for Jack FC Club Practice/Academy' : slot.booked ? `Booked by ${bookedUser || 'another athlete'}` : 'Time slot is available'}
                        >
                          <span className={slot.booked && !isClubBlocked ? 'line-through text-zinc-650' : ''}>{slot.time}</span>
                          {slot.booked && (
                            <span className={`block text-[8px] font-extrabold uppercase mt-0.5 max-w-full truncate px-0.5 ${isClubBlocked ? 'text-orange-400' : 'text-red-500'}`}>
                              {isClubBlocked ? 'Club Use' : `By ${bookedUser ? bookedUser.split(' ')[0] : 'Club'}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Time Selection Section */}
                  <div className="mt-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-805/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-500/20 transition-all duration-300">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-200 block">Set Custom Playing Slot Time</span>
                      <span className="text-[10px] text-zinc-500 block">Enter or select any custom time of your choice</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        onChange={(e) => {
                          const timeVal = e.target.value;
                          if (timeVal) {
                            const [hoursStr, minutesStr] = timeVal.split(':');
                            const hours = parseInt(hoursStr, 10);
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            const formattedTime = `${String(displayHours).padStart(2, '0')}:${minutesStr} ${ampm}`;
                            setSelectedTime(formattedTime);
                          }
                        }}
                        className="bg-zinc-900 border border-zinc-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-orange-500 font-mono"
                      />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">or</span>
                      <input
                        type="text"
                        placeholder="e.g. 05:45 PM"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-28 bg-zinc-900 border border-zinc-800 text-xs px-3.5 py-2 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Playing Duration Selection Container */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Playing Duration</span>
                      <span className="text-[10px] text-zinc-500 block">Select the block duration for your squad session (Base rate matches the hours selected)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDuration(1)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedDuration === 1
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold block text-white">1 Hour</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Standard</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 block mt-1">Normal hourly reservation slot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDuration(2)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedDuration === 2
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold block text-white">2 Hours</span>
                          <span className="text-[10px] text-orange-400 font-mono font-bold">Double Time</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 block mt-1">Extend play block (Total Hourly rate × 2)</span>
                      </button>
                    </div>
                  </div>

                  {/* Icon Legend */}
                  <div className="flex gap-4 pt-2 border-t border-zinc-850 text-[10px] text-zinc-500 font-bold uppercase">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-zinc-950 border border-zinc-800 block" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-orange-500 block" /> Your Choice
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-red-900 opacity-40 line-through block" /> Locked
                    </span>
                  </div>
                </div>

                {/* Step 4: Premium Optional Extras */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                      4
                    </div>
                    <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                      Include Jack FC Premium Addons
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addonsData.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => handleToggleAddon(addon.id)}
                          className={`p-4 rounded-xl text-left transition-all border flex justify-between items-center cursor-pointer ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/5'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <span className="text-xs sm:text-sm font-bold block text-white">
                              {addon.name}
                            </span>
                            <span className="text-[10px] text-zinc-550 block mt-0.5">
                              {addon.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-400 font-mono">
                              +₹{addon.price}
                            </span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-700'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 5: User profile information */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                      5
                    </div>
                    <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                      Squad Contact Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Your Full Name <strong className="text-orange-500">*</strong>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-zinc-950 text-white text-xs py-3 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Phone (10-Digit Contact) <strong className="text-orange-500">*</strong>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Enter Your Phone Number"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="w-full bg-zinc-950 text-white text-xs py-3 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Email Address <strong className="text-orange-500">*</strong>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="Enter Your Email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full bg-zinc-950 text-white text-xs py-3 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                          Club / Team Name
                        </label>
                        <input
                          type="text"
                          placeholder="Jack FC Strikers Unit"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="w-full bg-zinc-950 text-white text-xs py-3 px-4 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 6: Payment Method Selection */}
                <div className="bg-zinc-900 border border-zinc-805/90 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                      6
                    </div>
                    <h3 className="font-display font-extrabold text-base uppercase tracking-wider text-zinc-100">
                      Choose Payment Method
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Pay Online Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 rounded-xl text-left transition-all border flex justify-between items-start cursor-pointer ${
                        paymentMethod === 'online'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className={`w-4 h-4 ${paymentMethod === 'online' ? 'text-orange-500' : 'text-zinc-400'}`} />
                          <span className="text-sm font-bold text-white">Pay Online</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Secure payment via Stripe. Card, UPI, and more accepted.
                        </span>
                        <span className="text-[9px] text-green-500 font-bold mt-1 block">
                          Instant Confirmation
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        paymentMethod === 'online' ? 'border-orange-500 bg-orange-500' : 'border-zinc-600'
                      }`}>
                        {paymentMethod === 'online' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>

                    {/* Pay at Venue Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('venue')}
                      className={`p-4 rounded-xl text-left transition-all border flex justify-between items-start cursor-pointer ${
                        paymentMethod === 'venue'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className={`w-4 h-4 ${paymentMethod === 'venue' ? 'text-orange-500' : 'text-zinc-400'}`} />
                          <span className="text-sm font-bold text-white">Pay at Venue</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Pay in cash or card when you arrive at Jack FC.
                        </span>
                        <span className="text-[9px] text-yellow-500 font-bold mt-1 block">
                          Payment Due on Arrival
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        paymentMethod === 'venue' ? 'border-orange-500 bg-orange-500' : 'border-zinc-600'
                      }`}>
                        {paymentMethod === 'venue' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  </div>

                  {/* Payment method info */}
                  <div className={`p-3 rounded-lg border ${
                    paymentMethod === 'online' 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-yellow-500/5 border-yellow-500/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      {paymentMethod === 'online' ? (
                        <>
                          <Lock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] text-green-400 font-bold block">Secure Online Payment</span>
                            <span className="text-[10px] text-zinc-500 block">
                              Your slot will be instantly confirmed after successful payment. 256-bit SSL encryption.
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] text-yellow-400 font-bold block">Pay When You Arrive</span>
                            <span className="text-[10px] text-zinc-500 block">
                              Your slot will be reserved. Please arrive 10 minutes early to complete payment at the reception.
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Invoice Summary right column block styled on screenshots receipt grids */}
              <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative self-start md:sticky md:top-24">
                <div className="border-b border-zinc-800 pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-zinc-100">
                      Booking Invoice
                    </h4>
                    <span className="bg-orange-500/15 text-orange-400 text-[9px] font-bold py-1 px-2.5 rounded uppercase font-mono">
                      Live Draft
                    </span>
                  </div>
                </div>

                {/* Selected options review details */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                    <span className="text-zinc-500 font-medium">Athlete Name:</span>
                    <span className="text-orange-400 font-bold">
                      {userName ? userName : 'Not entered yet (See Step 5)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Selected Sport:</span>
                    <span className="text-white font-bold">{selectedSport.name}</span>
                  </div>
                  {(chosenSportId === 'football-turf' || chosenSportId === 'box-cricket') && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Pitch Size:</span>
                      <span className="text-white font-bold uppercase">{pitchType} Pitch</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Date:</span>
                    <span className="text-white font-bold">
                      {datesList[selectedDateIndex].dayName}, {datesList[selectedDateIndex].dayNum}{' '}
                      {datesList[selectedDateIndex].month}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Timing Slot:</span>
                    <span className="text-orange-400 font-bold">
                      {selectedTime ? selectedTime : 'Not selected yet'}
                    </span>
                  </div>
                  
                  {/* List chosen addons */}
                  {chosenAddonDetails.length > 0 && (
                    <div className="pt-2.5 border-t border-zinc-850 space-y-1.5">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                        Included Extras:
                      </div>
                      {chosenAddonDetails.map((a) => (
                        <div key={a.id} className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">{a.name}</span>
                          <span className="text-zinc-300">₹{a.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Final computed item sums */}
                  <div className="pt-4 border-t border-dashed border-zinc-800 space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>Base rate (/hr)</span>
                      <span>₹{baseRate}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Extras subtotal</span>
                        <span>₹{addonsTotal}</span>
                      </div>
                    )}

                    {/* Payment Method Display */}
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800/40">
                      <span className="text-zinc-500 font-medium">Payment:</span>
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${
                        paymentMethod === 'online' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {paymentMethod === 'online' ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Online
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5" />
                            Pay at Venue
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 border-t border-zinc-800">
                      <span className="text-white font-bold text-sm tracking-wide uppercase">Total Payable</span>
                      <span className="text-2xl font-display font-extrabold text-orange-500 tracking-tight text-right active-glow">
                        ₹{finalTotalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Booking submission trigger button */}
                <button
                  type="submit"
                  disabled={isReserving}
                  className={`w-full py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg active-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-wait cursor-pointer active:scale-95 ${
                    paymentMethod === 'online'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/20'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  }`}
                >
                  {isReserving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      {paymentMethod === 'online' ? 'Preparing Payment...' : 'Filing Reservation...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {paymentMethod === 'online' ? (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Proceed to Payment
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Confirm & Reserve Slot
                        </>
                      )}
                    </div>
                  )}
                </button>

                {/* Disclaimer lock icon */}
                <div className="flex items-start gap-1.5 text-[9px] text-zinc-500 font-semibold leading-normal pt-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span>
                    Fully secured SSL reservation. You will receive an instant digital receipt ticket upon submission. Rescheduling allowed.
                  </span>
                </div>

              </div>

            </form>
            )}
          </div>

        </div>

      </div>

      {/* SUCCESS TICKET POPUP STUB CONTAINER OVERLAY */}
      {generatedTicket && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/5 animate-fadeIn">
            
            {/* Top orange status head */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-center text-white relative">
              <button
                onClick={() => setGeneratedTicket(null)}
                className="absolute top-4 right-4 text-white hover:text-black/80 bg-black/10 rounded-full p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>

              <h4 className="font-display font-extrabold text-xl tracking-tight uppercase leading-none">
                Ticket Reserved
              </h4>
              <p className="text-[10px] text-orange-100 uppercase tracking-widest font-mono font-bold mt-1">
                Jack Football Club Entry Permit
              </p>
            </div>

            {/* Ticket body - looks like a real stadium slip with side-punched circles */}
            <div className="bg-[#0c0f14] p-6 sm:p-8 relative border-b border-dashed border-zinc-800">
              
              {/* punched ticket circles on the left and right border */}
              <div className="absolute top-[-12px] left-[-12px] w-6 h-6 bg-zinc-900 rounded-full" />
              <div className="absolute top-[-12px] right-[-12px] w-6 h-6 bg-zinc-900 rounded-full" />

              <div className="text-center space-y-4">
                {/* generated scan qr mimic placeholder */}
                <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg mx-auto">
                  <div className="w-32 h-32 flex flex-col justify-between items-center border-4 border-zinc-950 p-1">
                    {/* Simulated vector sports QR block */}
                    <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            (i + 3 * Math.floor(i / 2)) % 3 === 0 ? 'bg-zinc-950' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mt-2">
                    SCAN AT GATE ENTRY
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block tracking-wider">
                    BOOKING IDENTIFICATION
                  </span>
                  <strong className="text-xl text-orange-500 font-mono tracking-widest">
                    {generatedTicket.bookingId}
                  </strong>
                </div>
              </div>

              {/* parameters details itemization list */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-850 mt-6 text-xs leading-normal">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">ATHLETE</span>
                  <span className="text-white font-bold">{generatedTicket.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">SQUAD / TEAM</span>
                  <span className="text-white font-bold">{generatedTicket.teamName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">FACILITY</span>
                  <span className="text-white font-bold text-orange-400">
                    {generatedTicket.sportName} {generatedTicket.pitchType ? ` (${generatedTicket.pitchType})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">PERMIT TIMING</span>
                  <span className="text-white font-mono font-bold">
                    {generatedTicket.date} <br />
                    <span className="text-orange-500">{generatedTicket.time}</span>
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase">INCLUDED EXTRAS</span>
                  <span className="text-zinc-300 font-medium">
                    {generatedTicket.addons.length > 0 ? generatedTicket.addons.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Paid block footer stub */}
            <div className="bg-[#0c0f14] px-8 py-6 flex items-center justify-between border-t border-zinc-850">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">TOTAL AMOUNT PAID</span>
                <span className="text-2xl font-display font-extrabold text-white tracking-tight">
                  ₹{generatedTicket.total}
                </span>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">DIRECT COMPILATION COMPLETE</span>
              </div>
              <span className="text-xs font-bold text-green-400 bg-green-500/10 py-1.5 px-3 rounded uppercase border border-green-500/25">
                ● Confirmed
              </span>
            </div>

            {/* Bottom action bar */}
            <div className="bg-[#10141a] p-4 flex gap-3 text-center">
              <a
                href={`https://wa.me/919738582771?text=${encodeURIComponent(
                  `🔥 *JACK FC - BOOKING CONFIRMED* 🔥\n` +
                  `----------------------------------\n` +
                  `🎫 *Booking ID:* ${generatedTicket.bookingId}\n` +
                  `👤 *Athlete:* ${generatedTicket.userName}\n` +
                  `⚽ *Facility:* ${generatedTicket.sportName}${generatedTicket.pitchType ? ` (${generatedTicket.pitchType})` : ''}\n` +
                  `📅 *Date:* ${generatedTicket.date}\n` +
                  `⏰ *Time Slot:* ${generatedTicket.time}\n` +
                  `📦 *Addons:* ${generatedTicket.addons.length > 0 ? generatedTicket.addons.join(', ') : 'None'}\n` +
                  `💰 *Total Paid:* ₹${generatedTicket.total}\n` +
                  `----------------------------------\n` +
                  `Hey Kiran! Please confirm my playing slot reservation, bro! Thank you! 🙌`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 font-bold py-3 text-xs uppercase tracking-wide text-white rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp Share
              </a>
              <button
                onClick={() => {
                  try {
                    generateBookingPDF(generatedTicket);
                  } catch (err) {
                    console.error('PDF Trigger failure, falling back to window print:', err);
                    window.print();
                  }
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 font-bold py-3 text-xs uppercase tracking-wide text-white rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {showStripeCheckout && pendingBookingDetails && (
        <RazorpayCheckout
          bookingDetails={pendingBookingDetails}
          onSuccess={handleStripePaymentSuccess}
          onCancel={handleStripePaymentCancel}
        />
      )}

    </section>
  );
}
