import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bookingDetails,
      amount,
      customerEmail,
      customerName,
    } = req.body;

    if (!bookingDetails || !amount || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Checkout Session with embedded mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${bookingDetails.sportName} Booking`,
              description: `${bookingDetails.date} | ${bookingDetails.time} | ${bookingDetails.pitchType || 'Standard'}`,
            },
            unit_amount: amount * 100, // Convert to paise (smallest currency unit)
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingDetails.bookingId,
        slotId: bookingDetails.slotId,
        sportName: bookingDetails.sportName,
        date: bookingDetails.date,
        time: bookingDetails.time,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: bookingDetails.userPhone || '',
        teamName: bookingDetails.teamName || '',
      },
      redirect_on_completion: 'never',
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
