import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10'
})

export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export function constructWebhookEvent(payload: Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
