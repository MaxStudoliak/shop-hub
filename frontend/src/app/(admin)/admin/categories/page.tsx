'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Upload,
  Spin,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { adminApi } from '@/lib/api'
import { Category } from '@/types'

const { TextArea } = Input

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm()

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.get('/categories')
      setCategories(data)
    } catch {
      message.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAdd = () => {
    setEditingCategory(null)
    setImageUrl('')
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setImageUrl(category.image || '')
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await adminApi.delete(`/categories/${id}`)
      message.success('Category deleted')
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete category')
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    setUploading(true)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await adminApi.post('/categories', formData, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
        url: '/api/upload',
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImageUrl(data.url)
      onSuccess(data)
    } catch {
      onError(new Error('Upload failed'))
      message.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        image: imageUrl || null,
      }

      if (editingCategory) {
        await adminApi.put(`/categories/${editingCategory.id}`, payload)
        message.success('Category updated')
      } else {
        await adminApi.post('/categories', payload)
        message.success('Category created')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Image',
      key: 'image',
      width: 80,
      render: (_: unknown, record: Category) => (
        <div style={{ width: 50, height: 50, position: 'relative' }}>
          {record.image ? (
            <Image
              src={record.image}
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
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Products',
      key: 'products',
      render: (_: unknown, record: Category) => record._count?.products || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this category?"
            description="Products in this category will need to be reassigned."
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
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          Categories
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item label="Image">
            <Space direction="vertical">
              {imageUrl && (
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <Image
                    src={imageUrl}
                    alt="Category"
                    fill
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setImageUrl('')}
                    style={{ position: 'absolute', top: 4, right: 4 }}
                  />
                </div>
              )}
              {!imageUrl && (
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
              )}
            </Space>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
