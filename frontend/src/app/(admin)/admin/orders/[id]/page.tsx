'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Select,
  Space,
  message,
  Spin,
  Divider,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { Order } from '@/types'
import { formatDate } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings.store'

interface OrderDetailProps {
  params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const { t, formatPrice } = useSettingsStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await adminApi.get(`/orders/${params.id}`)
      setOrder(data)
    } catch {
      message.error(t('failedToFetch'))
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }, [params.id, t, router])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    try {
      await adminApi.put(`/orders/${params.id}/status`, { status })
      setOrder((prev) => (prev ? { ...prev, status: status as Order['status'] } : null))
      message.success(t('statusUpdated'))
    } catch {
      message.error(t('failedToUpdate'))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusColors: Record<string, string> = {
    PENDING: 'gold',
    PROCESSING: 'blue',
    SHIPPED: 'cyan',
    DELIVERED: 'green',
    CANCELLED: 'red',
  }

  const paymentColors: Record<string, string> = {
    PENDING: 'gold',
    PAID: 'green',
    FAILED: 'red',
  }

  const itemColumns = [
    {
      title: t('product'),
      key: 'product',
      render: (_: unknown, record: any) => (
        <Space>
          <div style={{ width: 50, height: 50, position: 'relative' }}>
            {record.product?.images?.[0] ? (
              <Image
                src={record.product.images[0].url}
                alt={record.productName}
                fill
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: '#f0f0f0',
                  borderRadius: 4,
                }}
              />
            )}
          </div>
          <span>{record.productName}</span>
        </Space>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('total'),
      key: 'total',
      render: (_: unknown, record: any) =>
        formatPrice(Number(record.price) * record.quantity),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/orders')}
        >
          {t('backToOrders')}
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          {t('order')} {order.orderNumber}
        </h1>
        <Space>
          <Tag color={statusColors[order.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {t(`status${order.status.charAt(0) + order.status.slice(1).toLowerCase()}` as any) || order.status}
          </Tag>
          <Tag color={paymentColors[order.paymentStatus]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {t(`status${order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}` as any) || order.paymentStatus}
          </Tag>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <Card title={t('orderItems')}>
            <Table
              dataSource={order.items}
              columns={itemColumns}
              rowKey="id"
              pagination={false}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Space direction="vertical" align="end">
                <div>
                  <span style={{ marginRight: 24 }}>{t('subtotal')}:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div>
                  <span style={{ marginRight: 24 }}>{t('shipping')}:</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? t('free')
                      : formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                  <span style={{ marginRight: 24 }}>{t('total')}:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </Space>
            </div>
          </Card>
        </div>

        <div>
          <Card title={t('orderDetails')} style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('orderNumber')}>
                {order.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label={t('date')}>
                {formatDate(order.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={t('paymentId')}>
                {order.stripePaymentId || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={t('customerInformation')} style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('name')}>
                {order.customerName}
              </Descriptions.Item>
              <Descriptions.Item label={t('email')}>
                {order.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label={t('phone')}>
                {order.customerPhone}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={t('shippingAddress')} style={{ marginBottom: 24 }}>
            <div>
              {order.shippingAddress}
              <br />
              {order.shippingCity}, {order.shippingZip}
              <br />
              {order.shippingCountry}
            </div>
          </Card>

          <Card title={t('updateStatus')}>
            <Select
              value={order.status}
              onChange={handleStatusChange}
              loading={updating}
              style={{ width: '100%' }}
              options={[
                { label: t('statusPending'), value: 'PENDING' },
                { label: t('statusProcessing'), value: 'PROCESSING' },
                { label: t('statusShipped'), value: 'SHIPPED' },
                { label: t('statusDelivered'), value: 'DELIVERED' },
                { label: t('statusCancelled'), value: 'CANCELLED' },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
