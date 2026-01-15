'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Layout,
  Menu,
  Button,
  theme,
  Dropdown,
  Avatar,
  Space,
} from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '@/stores/admin.store'

const { Header, Sider, Content } = Layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { admin, logout, isAuthenticated } = useAdminStore()
  const router = useRouter()
  const pathname = usePathname()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated() && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [mounted, isAuthenticated, pathname, router])

  if (!mounted) {
    return null
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuthenticated()) {
    return null
  }

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/categories">Categories</Link>,
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout()
        router.push('/admin/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link href="/admin/dashboard" style={{ color: 'white', fontSize: collapsed ? 16 : 20, fontWeight: 'bold' }}>
            {collapsed ? 'SH' : 'Shop-Hub'}
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{admin?.name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
