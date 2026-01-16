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

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setAuth } = useUserStore()
  const { t } = useSettingsStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      setAuth(response.data.user, response.data.token)
      toast({ title: t('welcomeBack') })
      router.push('/account')
    } catch (error: any) {
      toast({
        title: t('loginFailed'),
        description: error.response?.data?.error || t('invalidCredentials'),
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
          <CardTitle className="text-xl md:text-2xl">{t('welcomeBack')}</CardTitle>
          <CardDescription className="text-sm">{t('signInToAccount')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                placeholder={t('password')}
                {...register('password')}
                className="h-11"
              />
              {errors.password && (
                <p className="text-xs md:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </Button>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                {t('register')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
