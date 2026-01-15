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
import { formatPrice, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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
    return <div>Failed to load dashboard</div>
  }

  const orderColumns = [
    {
      title: 'Order',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatPrice(total),
    },
    {
      title: 'Status',
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
      title: 'Payment',
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
        Dashboard
      </h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.products.total}
              prefix={<ShoppingOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  {stats.products.active} active
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.orders.total}
              prefix={<OrderedListOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#faad14' }}>
                  {stats.orders.pending} pending
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.revenue.total}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.categories.total}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="This Month">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Orders"
                  value={stats.orders.thisMonth}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Revenue"
                  value={stats.revenue.thisMonth}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Today">
            <Statistic
              title="Orders"
              value={stats.orders.today}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders" style={{ marginTop: 24 }}>
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
