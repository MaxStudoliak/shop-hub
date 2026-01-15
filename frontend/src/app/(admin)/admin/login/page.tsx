'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { useAdminStore } from '@/stores/admin.store'
import { useSettingsStore } from '@/stores/settings.store'

const { Title } = Typography

interface LoginForm {
  email: string
  password: string
}

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setAuth } = useAdminStore()
  const { t } = useSettingsStore()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const { data } = await adminApi.post('/auth/login', values)
      setAuth(data.admin, data.token)
      message.success(t('loginSuccessful'))
      router.push('/admin/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.error || t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {t('adminPanel')}
          </Title>
          <p style={{ color: '#666' }}>{t('signInToAdmin')}</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ email: 'admin@shop-hub.com', password: 'admin123' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('invalidEmail') },
              { type: 'email', message: t('invalidEmail') },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('email')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('password')}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              {t('signIn')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          {t('demo')}: admin@shop-hub.com / admin123
        </div>
      </Card>
    </div>
  )
}
