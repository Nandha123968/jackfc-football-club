import { useState, useEffect } from 'react';
import { X, Loader2, Smartphone, CreditCard, Building2 } from 'lucide-react';

interface BookingDetails {
  bookingId: string;
  slotId: string;
  sportName: string;
  date: string;
  time: string;
  pitchType?: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  teamName: string;
  total: number;
}

interface RazorpayCheckoutProps {
  bookingDetails: BookingDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({ bookingDetails, onSuccess, onCancel }: RazorpayCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      initializePayment();
    };
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const initializePayment = async () => {
    try {
      // Create order on server
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingDetails,
          amount: bookingDetails.total,
          customerEmail: bookingDetails.userEmail,
          customerName: bookingDetails.userName,
          customerPhone: bookingDetails.userPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      setIsLoading(false);

      // Initialize Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Jack Football Club',
        description: `${bookingDetails.sportName} - ${bookingDetails.date}`,
        order_id: data.orderId,
        prefill: {
          name: bookingDetails.userName,
          email: bookingDetails.userEmail,
          contact: bookingDetails.userPhone,
        },
        notes: {
          bookingId: bookingDetails.bookingId,
          slotId: bookingDetails.slotId,
        },
        theme: {
          color: '#f97316', // Orange theme to match Jack FC
          backdrop_color: 'rgba(0, 0, 0, 0.8)',
        },
        modal: {
          ondismiss: () => {
            onCancel();
          },
          escape: true,
          animation: true,
        },
        handler: function (response: any) {
          // Payment successful
          console.log('[v0] Razorpay payment successful:', response);
          onSuccess();
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('[v0] Razorpay payment failed:', response.error);
        setError(response.error.description || 'Payment failed. Please try again.');
      });

      razorpay.open();

    } catch (err: any) {
      console.error('[v0] Razorpay initialization error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Payment Error</h3>
          <p className="text-sm text-zinc-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                initializePayment();
              }}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Jack Football Club</h3>
              <p className="text-orange-100 text-xs">Secure Payment</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white bg-black/10 rounded-full p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-5 border-b border-zinc-800">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Facility</span>
              <span className="text-white font-bold text-sm">{bookingDetails.sportName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Date & Time</span>
              <span className="text-white font-bold text-sm">{bookingDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Slot</span>
              <span className="text-orange-400 font-bold text-sm">{bookingDetails.time}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
              <span className="text-white font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-orange-500">₹{bookingDetails.total}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="p-8 text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Opening Payment Gateway...</p>
          <p className="text-zinc-500 text-sm mb-6">Please wait while we connect you to Razorpay</p>
          
          {/* Payment methods hint */}
          <div className="flex justify-center gap-4 text-zinc-600">
            <div className="flex flex-col items-center gap-1">
              <Smartphone className="w-5 h-5" />
              <span className="text-[10px]">UPI</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px]">Cards</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Building2 className="w-5 h-5" />
              <span className="text-[10px]">Net Banking</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 px-5 py-3 flex items-center justify-between border-t border-zinc-800">
          <span className="text-[10px] text-zinc-500">
            Powered by Razorpay - Secure Payment
          </span>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
