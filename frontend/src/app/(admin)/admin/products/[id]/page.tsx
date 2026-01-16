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
import { useSettingsStore } from '@/stores/settings.store'

const { TextArea } = Input

interface ProductFormProps {
  params: { id: string }
}

export default function ProductFormPage({ params }: ProductFormProps) {
  const isNew = params.id === 'new'
  const { t } = useSettingsStore()
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
      message.error(t('failedToFetch'))
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
      message.error(t('failedToFetch'))
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
      message.success(t('imageUploaded'))
    } catch {
      onError(new Error('Upload failed'))
      message.error(t('failedToUpload'))
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
        message.success(t('productCreated'))
      } else {
        await adminApi.put(`/products/${params.id}`, payload)
        message.success(t('productUpdated'))
      }
      router.push('/admin/products')
    } catch (error: any) {
      message.error(error.response?.data?.error || t('failedToSave'))
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
          {t('backToProducts')}
        </Button>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        {isNew ? t('addProduct') : t('editProduct')}
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
            <Card title={t('basicInformation')}>
              <Form.Item
                name="name"
                label={t('productName')}
                rules={[{ required: true, message: t('pleaseEnterProductName') }]}
              >
                <Input placeholder={t('enterProductName')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={t('description')}
                rules={[{ required: true, message: t('pleaseEnterDescription') }]}
              >
                <TextArea rows={4} placeholder={t('enterDescription')} />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label={t('category')}
                rules={[{ required: true, message: t('pleaseSelectCategory') }]}
              >
                <Select
                  placeholder={t('selectCategory')}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>
            </Card>

            <Card title={t('images')} style={{ marginTop: 24 }}>
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
            <Card title={t('pricing')}>
              <div style={{ marginBottom: 16, padding: 8, background: '#f0f2f5', borderRadius: 4 }}>
                <small style={{ color: '#666' }}>
                  💡 {t('priceInUAH') || 'Ціна вказується в гривнях (UAH). Конвертація в інші валюти відбувається автоматично на сайті.'}
                </small>
              </div>
              <Form.Item
                name="price"
                label={`${t('price')} (UAH)`}
                rules={[{ required: true, message: t('pleaseEnterPrice') }]}
              >
                <InputNumber
                  prefix="₴"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="499.99"
                />
              </Form.Item>

              <Form.Item name="comparePrice" label={`${t('compareAtPrice')} (UAH)`}>
                <InputNumber
                  prefix="₴"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="699.99"
                />
              </Form.Item>
            </Card>

            <Card title={t('inventory')} style={{ marginTop: 24 }}>
              <Form.Item name="sku" label={t('adminSku')}>
                <Input placeholder={t('enterSku')} />
              </Form.Item>

              <Form.Item name="stock" label={t('stockQuantity')}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item name="status" label={t('status')}>
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
                  {isNew ? t('createProduct') : t('updateProduct')}
                </Button>
                <Button
                  block
                  onClick={() => router.push('/admin/products')}
                >
                  {t('cancel')}
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  )
}
