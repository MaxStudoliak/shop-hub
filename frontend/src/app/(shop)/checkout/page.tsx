'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart.store'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useSettingsStore } from '@/stores/settings.store'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(10, 'Phone is required'),
  shippingAddress: z.string().min(5, 'Address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingZip: z.string().min(4, 'ZIP code is required'),
  shippingCountry: z.string().min(2, 'Country is required'),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

function CheckoutFormContent({
  clientSecret,
  formData,
}: {
  clientSecret: string
  formData: CheckoutForm
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { items, clearCart, getTotalPrice } = useCartStore()
  const [processing, setProcessing] = useState(false)
  const { t } = useSettingsStore()

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 100 ? 0 : 10
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast({
          title: t('paymentFailed'),
          description: error.message,
          variant: 'destructive',
        })
        setProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create order
        const { data: order } = await api.post('/orders', {
          ...formData,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          stripePaymentId: paymentIntent.id,
        })

        clearCart()
        router.push(`/checkout/success?orderId=${order.id}`)
      }
    } catch (err) {
      toast({
        title: t('error'),
        description: t('somethingWrong'),
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('payment')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('qty')}: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('shipping')}</span>
              <span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || processing}
      >
        {processing ? t('processing') : `${t('pay')} ${formatPrice(total)}`}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice } = useCartStore()
  const [clientSecret, setClientSecret] = useState('')
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [formData, setFormData] = useState<CheckoutForm | null>(null)
  const { t } = useSettingsStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  })

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 100 ? 0 : 10
  const total = subtotal + shipping

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  const onSubmitInfo = async (data: CheckoutForm) => {
    setFormData(data)

    try {
      const response = await api.post('/checkout/create-intent', {
        amount: total,
      })
      setClientSecret(response.data.clientSecret)
      setStep('payment')
    } catch {
      toast({
        title: t('error'),
        description: t('failedToInitPayment'),
        variant: 'destructive',
      })
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

      {step === 'info' && (
        <form onSubmit={handleSubmit(onSubmitInfo)}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contactInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">{t('fullName')}</Label>
                    <Input
                      id="customerName"
                      {...register('customerName')}
                      placeholder="John Doe"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">{t('email')}</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register('customerEmail')}
                      placeholder="john@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.customerEmail.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">{t('phone')}</Label>
                    <Input
                      id="customerPhone"
                      {...register('customerPhone')}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.customerPhone.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('shippingInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddress">{t('address')}</Label>
                    <Input
                      id="shippingAddress"
                      {...register('shippingAddress')}
                      placeholder="123 Main St"
                    />
                    {errors.shippingAddress && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shippingAddress.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">{t('city')}</Label>
                      <Input
                        id="shippingCity"
                        {...register('shippingCity')}
                        placeholder="New York"
                      />
                      {errors.shippingCity && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingCity.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shippingZip">{t('zipCode')}</Label>
                      <Input
                        id="shippingZip"
                        {...register('shippingZip')}
                        placeholder="10001"
                      />
                      {errors.shippingZip && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingZip.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shippingCountry">{t('country')}</Label>
                    <Input
                      id="shippingCountry"
                      {...register('shippingCountry')}
                      placeholder="United States"
                    />
                    {errors.shippingCountry && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.shippingCountry.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('qty')}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('subtotal')}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('shipping')}</span>
                      <span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t('total')}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    {t('continueToPayment')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}

      {step === 'payment' && clientSecret && formData && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: 'stripe' },
          }}
        >
          <div className="max-w-xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setStep('info')}
            >
              {t('backToInformation')}
            </Button>
            <CheckoutFormContent clientSecret={clientSecret} formData={formData} />
          </div>
        </Elements>
      )}
    </div>
  )
}
