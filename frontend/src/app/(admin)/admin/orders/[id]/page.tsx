'use client'

import { useEffect, useState } from 'react'
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
import { formatPrice, formatDate } from '@/lib/utils'

interface OrderDetailProps {
  params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const { data } = await adminApi.get(`/orders/${params.id}`)
      setOrder(data)
    } catch {
      message.error('Failed to fetch order')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    try {
      await adminApi.put(`/orders/${params.id}/status`, { status })
      setOrder((prev) => (prev ? { ...prev, status: status as Order['status'] } : null))
      message.success('Order status updated')
    } catch {
      message.error('Failed to update status')
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
      title: 'Product',
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total',
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
          Back to Orders
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
          Order {order.orderNumber}
        </h1>
        <Space>
          <Tag color={statusColors[order.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {order.status}
          </Tag>
          <Tag color={paymentColors[order.paymentStatus]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {order.paymentStatus}
          </Tag>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <Card title="Order Items">
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
                  <span style={{ marginRight: 24 }}>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div>
                  <span style={{ marginRight: 24 }}>Shipping:</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? 'Free'
                      : formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                  <span style={{ marginRight: 24 }}>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </Space>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Order Details" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order Number">
                {order.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(order.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment ID">
                {order.stripePaymentId || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Customer Information" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">
                {order.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {order.customerPhone}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Shipping Address" style={{ marginBottom: 24 }}>
            <div>
              {order.shippingAddress}
              <br />
              {order.shippingCity}, {order.shippingZip}
              <br />
              {order.shippingCountry}
            </div>
          </Card>

          <Card title="Update Status">
            <Select
              value={order.status}
              onChange={handleStatusChange}
              loading={updating}
              style={{ width: '100%' }}
              options={[
                { label: 'Pending', value: 'PENDING' },
                { label: 'Processing', value: 'PROCESSING' },
                { label: 'Shipped', value: 'SHIPPED' },
                { label: 'Delivered', value: 'DELIVERED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
