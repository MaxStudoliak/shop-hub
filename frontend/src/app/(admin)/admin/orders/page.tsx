'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Table, Button, Space, Tag, Input, Select, Card, message } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { Order, Pagination } from '@/types'
import { formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings.store'

export default function OrdersPage() {
  const { t, formatPrice } = useSettingsStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (paymentFilter) params.set('paymentStatus', paymentFilter)

      const { data } = await adminApi.get(`/orders?${params.toString()}`)
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      message.error(t('failedToFetch'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSearch = () => {
    fetchOrders(1)
  }

  const columns = [
    {
      title: t('orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (orderNumber: string, record: Order) => (
        <Link href={`/admin/orders/${record.id}`} style={{ fontWeight: 500 }}>
          {orderNumber}
        </Link>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: t('customer'),
      key: 'customer',
      render: (_: unknown, record: Order) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: t('items'),
      key: 'items',
      render: (_: unknown, record: Order) => record.items?.length || 0,
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
        const statusLabels: Record<string, string> = {
          PENDING: t('statusPending'),
          PROCESSING: t('statusProcessing'),
          SHIPPED: t('statusShipped'),
          DELIVERED: t('statusDelivered'),
          CANCELLED: t('statusCancelled'),
        }
        return <Tag color={colors[status]}>{statusLabels[status] || status}</Tag>
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
        const paymentLabels: Record<string, string> = {
          PENDING: t('statusPending'),
          PAID: t('statusPaid'),
          FAILED: t('statusFailed'),
        }
        return <Tag color={colors[status]}>{paymentLabels[status] || status}</Tag>
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Order) => (
        <Link href={`/admin/orders/${record.id}`}>
          <Button icon={<EyeOutlined />} size="small" />
        </Link>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        {t('orders')}
      </h1>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder={t('searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder={t('status')}
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            style={{ width: 150 }}
            options={[
              { label: t('statusPending'), value: 'PENDING' },
              { label: t('statusProcessing'), value: 'PROCESSING' },
              { label: t('statusShipped'), value: 'SHIPPED' },
              { label: t('statusDelivered'), value: 'DELIVERED' },
              { label: t('statusCancelled'), value: 'CANCELLED' },
            ]}
          />
          <Select
            placeholder={t('paymentStatus')}
            allowClear
            value={paymentFilter || undefined}
            onChange={(value) => setPaymentFilter(value || '')}
            style={{ width: 150 }}
            options={[
              { label: t('statusPending'), value: 'PENDING' },
              { label: t('statusPaid'), value: 'PAID' },
              { label: t('statusFailed'), value: 'FAILED' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            {t('search')}
          </Button>
        </Space>
      </Card>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: (page) => fetchOrders(page),
          showSizeChanger: false,
        }}
      />
    </div>
  )
}
