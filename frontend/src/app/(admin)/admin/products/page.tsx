'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { Product, Category, Pagination } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('categoryId', categoryFilter)

      const { data } = await adminApi.get(`/products?${params.toString()}`)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch {
      message.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.get('/categories')
      setCategories(data)
    } catch {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await adminApi.delete(`/products/${id}`)
      message.success('Product deleted')
      fetchProducts(pagination.page)
    } catch {
      message.error('Failed to delete product')
    }
  }

  const handleSearch = () => {
    fetchProducts(1)
  }

  const columns = [
    {
      title: 'Image',
      key: 'image',
      width: 80,
      render: (_: unknown, record: Product) => (
        <div style={{ width: 50, height: 50, position: 'relative' }}>
          {record.images[0] ? (
            <Image
              src={record.images[0].url}
              alt={record.name}
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
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Category',
      key: 'category',
      render: (_: unknown, record: Product) => record.category?.name,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'gold' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          ACTIVE: 'green',
          DRAFT: 'gold',
          OUT_OF_STOCK: 'red',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Product) => (
        <Space>
          <Link href={`/admin/products/${record.id}`}>
            <Button icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Products</h1>
        <Link href="/admin/products/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        </Link>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            style={{ width: 150 }}
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
            ]}
          />
          <Select
            placeholder="Category"
            allowClear
            value={categoryFilter || undefined}
            onChange={(value) => setCategoryFilter(value || '')}
            style={{ width: 150 }}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </Space>
      </Card>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: (page) => fetchProducts(page),
          showSizeChanger: false,
        }}
      />
    </div>
  )
}
