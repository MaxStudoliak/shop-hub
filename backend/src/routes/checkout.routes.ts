import { Router, Request, Response } from 'express'
import { createPaymentIntent, constructWebhookEvent } from '../services/payment.service.js'
import { prisma } from '../server.js'

const router = Router()

// POST /api/checkout/create-intent - Create payment intent
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { amount, orderId } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const paymentIntent = await createPaymentIntent(amount, {
      orderId: orderId || ''
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

// POST /api/checkout/webhook - Stripe webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string

  try {
    const event = constructWebhookEvent(req.body, signature)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              stripePaymentId: paymentIntent.id
            }
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'FAILED' }
          })
        }
        break
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: 'Webhook error' })
  }
})

export default router
