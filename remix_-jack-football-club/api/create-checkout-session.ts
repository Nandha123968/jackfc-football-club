import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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
      customerPhone,
    } = req.body;

    if (!bookingDetails || !amount || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise (smallest currency unit)
      currency: 'INR',
      receipt: bookingDetails.bookingId,
      notes: {
        bookingId: bookingDetails.bookingId,
        slotId: bookingDetails.slotId,
        sportName: bookingDetails.sportName,
        date: bookingDetails.date,
        time: bookingDetails.time,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone || '',
        teamName: bookingDetails.teamName || '',
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}
