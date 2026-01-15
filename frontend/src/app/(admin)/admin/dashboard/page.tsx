'use client'

import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd'
import {
  ShoppingOutlined,
  OrderedListOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { Stats, Order } from '@/types'
import { formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings.store'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t, formatPrice } = useSettingsStore()

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await adminApi.get('/stats')
        setStats(data)
      } catch {
        console.error('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!stats) {
    return <div>{t('failedToFetch')}</div>
  }

  const orderColumns = [
    {
      title: t('orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: t('date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: t('total'),
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatPrice(total),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: 'gold',
          PROCESSING: 'blue',
          SHIPPED: 'cyan',
          DELIVERED: 'green',
          CANCELLED: 'red',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: t('paymentStatus'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: 'gold',
          PAID: 'green',
          FAILED: 'red',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 'bold' }}>
        {t('dashboard')}
      </h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalProducts')}
              value={stats.products.total}
              prefix={<ShoppingOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  {stats.products.active} {t('active')}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalOrders')}
              value={stats.orders.total}
              prefix={<OrderedListOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#faad14' }}>
                  {stats.orders.pending} {t('pending')}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('totalRevenue')}
              value={stats.revenue.total}
              formatter={(value) => formatPrice(Number(value))}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('categories')}
              value={stats.categories.total}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={t('thisMonth')}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={t('orders')}
                  value={stats.orders.thisMonth}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('revenue')}
                  value={stats.revenue.thisMonth}
                  formatter={(value) => formatPrice(Number(value))}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('today')}>
            <Statistic
              title={t('orders')}
              value={stats.orders.today}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('recentOrders')} style={{ marginTop: 24 }}>
        <Table
          dataSource={stats.recentOrders}
          columns={orderColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}
