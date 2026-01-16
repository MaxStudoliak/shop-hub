'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { useUserStore } from '@/stores/user.store'
import { toast } from '@/hooks/use-toast'
import { useSettingsStore } from '@/stores/settings.store'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setAuth } = useUserStore()
  const { t } = useSettingsStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setAuth(response.data.user, response.data.token)
      toast({ title: t('accountCreated') })
      router.push('/account')
    } catch (error: any) {
      toast({
        title: t('registrationFailed'),
        description: error.response?.data?.error || t('somethingWrong'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-12 md:py-16 px-4">
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl md:text-2xl">{t('createAccountTitle')}</CardTitle>
          <CardDescription className="text-sm">{t('signUpToStart')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">{t('fullName')}</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className="h-11"
              />
              {errors.name && (
                <p className="text-xs md:text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className="h-11"
              />
              {errors.email && (
                <p className="text-xs md:text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('atLeast6Chars')}
                {...register('password')}
                className="h-11"
              />
              {errors.password && (
                <p className="text-xs md:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('confirmYourPassword')}
                {...register('confirmPassword')}
                className="h-11"
              />
              {errors.confirmPassword && (
                <p className="text-xs md:text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? t('creatingAccount') : t('createAccount')}
            </Button>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('signIn')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
