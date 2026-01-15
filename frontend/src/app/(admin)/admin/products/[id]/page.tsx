'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  message,
  Upload,
  Image,
  Spin,
} from 'antd'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { adminApi } from '@/lib/api'
import { Category, Product } from '@/types'

const { TextArea } = Input

interface ProductFormProps {
  params: { id: string }
}

export default function ProductFormPage({ params }: ProductFormProps) {
  const isNew = params.id === 'new'
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (!isNew) {
      fetchProduct()
    }
  }, [isNew, params.id])

  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.get('/categories')
      setCategories(data)
    } catch {
      message.error('Failed to fetch categories')
    }
  }

  const fetchProduct = async () => {
    try {
      const { data } = await adminApi.get(`/products/${params.id}`)
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
        sku: data.sku,
        stock: data.stock,
        status: data.status,
        categoryId: data.categoryId,
      })
      setImageUrls(data.images.map((img: { url: string }) => img.url))
    } catch {
      message.error('Failed to fetch product')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    setUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await adminApi.post('/products', formData, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
        url: '/api/upload',
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImageUrls((prev) => [...prev, data.url])
      onSuccess(data)
      message.success('Image uploaded')
    } catch {
      onError(new Error('Upload failed'))
      message.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        images: imageUrls.map((url, idx) => ({ url, position: idx })),
      }

      if (isNew) {
        await adminApi.post('/products', payload)
        message.success('Product created')
      } else {
        await adminApi.put(`/products/${params.id}`, payload)
        message.success('Product updated')
      }
      router.push('/admin/products')
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/products')}
        >
          Back to Products
        </Button>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        {isNew ? 'Add Product' : 'Edit Product'}
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'ACTIVE',
          stock: 0,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <Card title="Basic Information">
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={4} placeholder="Enter product description" />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  placeholder="Select category"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>
            </Card>

            <Card title="Images" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {imageUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <Image
                      src={url}
                      alt={`Product ${idx + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveImage(url)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                      }}
                    />
                  </div>
                ))}
                <Upload
                  customRequest={handleUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      border: '1px dashed #d9d9d9',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {uploading ? <Spin /> : <PlusOutlined />}
                  </div>
                </Upload>
              </div>
            </Card>
          </div>

          <div>
            <Card title="Pricing">
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>

              <Form.Item name="comparePrice" label="Compare at Price">
                <InputNumber
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Card>

            <Card title="Inventory" style={{ marginTop: 24 }}>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="Enter SKU" />
              </Form.Item>

              <Form.Item name="stock" label="Stock Quantity">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item name="status" label="Status">
                <Select
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card style={{ marginTop: 24 }}>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  block
                  size="large"
                >
                  {isNew ? 'Create Product' : 'Update Product'}
                </Button>
                <Button
                  block
                  onClick={() => router.push('/admin/products')}
                >
                  Cancel
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  )
}
