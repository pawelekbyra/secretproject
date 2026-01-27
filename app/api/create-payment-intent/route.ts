import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, email, createAccount, language } = body;

    // Basic validation
    if (!amount || amount < 1) { // Assuming minimum 1.00 unit
      return NextResponse.json({ error: 'Amount is too low' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/smallest unit
      currency: currency || 'pln',
      automatic_payment_methods: { enabled: true },
      receipt_email: email, // Crucial for Patron logic via Webhook
      metadata: {
        user_email: email,
        source: 'ting-tong-app',
        create_account: createAccount ? 'true' : 'false',
        language: language || 'pl'
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: error.message || 'Error creating payment intent' }, { status: 500 });
  }
}
