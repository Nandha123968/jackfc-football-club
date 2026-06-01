import { useState, useCallback, useEffect } from 'react';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X, CreditCard, Loader2 } from 'lucide-react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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

interface StripeCheckoutProps {
  bookingDetails: BookingDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ bookingDetails, onSuccess, onCancel }: StripeCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientSecret = useCallback(async () => {
    try {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      setIsLoading(false);
      return data.clientSecret;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [bookingDetails]);

  const handleComplete = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

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
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Secure Payment</h3>
              <p className="text-orange-100 text-xs">Jack Football Club Booking</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white bg-black/10 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block">Facility</span>
              <span className="text-white font-bold">{bookingDetails.sportName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Date</span>
              <span className="text-white font-bold">{bookingDetails.date}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Time</span>
              <span className="text-orange-400 font-bold">{bookingDetails.time}</span>
            </div>
            <div className="ml-auto">
              <span className="text-zinc-500 block">Total</span>
              <span className="text-xl font-bold text-orange-500">₹{bookingDetails.total}</span>
            </div>
          </div>
        </div>

        {/* Stripe Checkout */}
        <div className="p-5 bg-white min-h-[400px]">
          {isLoading && (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-zinc-600 text-sm">Loading secure payment...</p>
              </div>
            </div>
          )}
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              fetchClientSecret,
              onComplete: handleComplete,
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 px-5 py-3 flex items-center justify-between border-t border-zinc-800">
          <span className="text-[10px] text-zinc-500">
            Powered by Stripe - 256-bit SSL Encryption
          </span>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  );
}
