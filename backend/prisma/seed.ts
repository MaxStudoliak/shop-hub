import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@shop-hub.com' },
        update: {},
        create: {
            email: 'admin@shop-hub.com',
            password: hashedPassword,
            name: 'Admin',
        },
    });
    console.log('Created admin:', admin.email);

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'electronics' },
            update: {},
            create: {
                name: 'Electronics',
                slug: 'electronics',
                description: 'Gadgets and electronic devices',
                image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'clothing' },
            update: {},
            create: {
                name: 'Clothing',
                slug: 'clothing',
                description: 'Fashion and apparel',
                image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'home-garden' },
            update: {},
            create: {
                name: 'Home & Garden',
                slug: 'home-garden',
                description: 'Home decor and garden supplies',
                image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'sports' },
            update: {
                name: 'Sports & Outdoors',
                description: 'Sports equipment and outdoor gear',
                image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
            },
            create: {
                name: 'Sports & Outdoors',
                slug: 'sports',
                description: 'Sports equipment and outdoor gear',
                image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'books' },
            update: {},
            create: {
                name: 'Books',
                slug: 'books',
                description: 'Books and educational materials',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'beauty' },
            update: {},
            create: {
                name: 'Beauty & Health',
                slug: 'beauty',
                description: 'Beauty and health products',
                image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'toys' },
            update: {},
            create: {
                name: 'Toys & Games',
                slug: 'toys',
                description: 'Toys and games for all ages',
                image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
            },
        }),
        prisma.category.upsert({
            where: { slug: 'automotive' },
            update: {},
            create: {
                name: 'Automotive',
                slug: 'automotive',
                description: 'Auto parts and accessories',
                image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
            },
        }),
    ]);
    console.log('Created categories:', categories.length);

    // Create products
    const products = [
        // Electronics
        {
            name: 'Wireless Bluetooth Headphones',
            slug: 'wireless-bluetooth-headphones',
            description:
                'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.',
            price: 149.99,
            comparePrice: 199.99,
            sku: 'WBH-001',
            stock: 50,
            categorySlug: 'electronics',
            images: [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
            ],
        },
        {
            name: 'Smart Watch Pro',
            slug: 'smart-watch-pro',
            description: 'Advanced smartwatch with health monitoring, GPS, and seamless smartphone integration.',
            price: 299.99,
            comparePrice: null,
            sku: 'SWP-001',
            stock: 30,
            categorySlug: 'electronics',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
        },
        {
            name: 'Portable Bluetooth Speaker',
            slug: 'portable-bluetooth-speaker',
            description: 'Waterproof portable speaker with 360-degree sound and 12-hour playtime.',
            price: 79.99,
            comparePrice: 99.99,
            sku: 'PBS-001',
            stock: 100,
            categorySlug: 'electronics',
            images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
        },
        {
            name: 'Wireless Charging Pad',
            slug: 'wireless-charging-pad',
            description: 'Fast wireless charger compatible with all Qi-enabled devices.',
            price: 34.99,
            comparePrice: null,
            sku: 'WCP-001',
            stock: 120,
            categorySlug: 'electronics',
            images: ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=800'],
        },
        {
            name: 'USB-C Hub Adapter',
            slug: 'usb-c-hub-adapter',
            description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.',
            price: 49.99,
            comparePrice: 69.99,
            sku: 'UCH-001',
            stock: 80,
            categorySlug: 'electronics',
            images: ['https://images.unsplash.com/photo-1625281584165-a6c2c7169f78?w=800'],
        },

        // Clothing
        {
            name: 'Classic Cotton T-Shirt',
            slug: 'classic-cotton-tshirt',
            description: '100% organic cotton t-shirt. Comfortable, breathable, and perfect for everyday wear.',
            price: 29.99,
            comparePrice: null,
            sku: 'CCT-001',
            stock: 200,
            categorySlug: 'clothing',
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
        },
        {
            name: 'Denim Jacket',
            slug: 'denim-jacket',
            description: 'Classic denim jacket with modern fit. Perfect for layering in any season.',
            price: 89.99,
            comparePrice: 119.99,
            sku: 'DJ-001',
            stock: 45,
            categorySlug: 'clothing',
            images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
        },
        {
            name: 'Wool Sweater',
            slug: 'wool-sweater',
            description: 'Soft merino wool sweater, perfect for cold weather.',
            price: 79.99,
            comparePrice: 99.99,
            sku: 'WS-001',
            stock: 60,
            categorySlug: 'clothing',
            images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
        },
        {
            name: 'Casual Hoodie',
            slug: 'casual-hoodie',
            description: 'Comfortable cotton blend hoodie with kangaroo pocket.',
            price: 59.99,
            comparePrice: null,
            sku: 'CH-001',
            stock: 150,
            categorySlug: 'clothing',
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
        },

        // Sports
        {
            name: 'Running Sneakers',
            slug: 'running-sneakers',
            description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
            price: 129.99,
            comparePrice: null,
            sku: 'RS-001',
            stock: 75,
            categorySlug: 'sports',
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        },
        {
            name: 'Yoga Mat Premium',
            slug: 'yoga-mat-premium',
            description: 'Extra thick yoga mat with non-slip surface. Perfect for yoga, pilates, and meditation.',
            price: 49.99,
            comparePrice: 69.99,
            sku: 'YMP-001',
            stock: 150,
            categorySlug: 'sports',
            images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
        },
        {
            name: 'Fitness Dumbbells Set',
            slug: 'fitness-dumbbells-set',
            description: 'Adjustable dumbbell set from 5 to 25 lbs. Perfect for home workouts.',
            price: 199.99,
            comparePrice: 249.99,
            sku: 'FDS-001',
            stock: 40,
            categorySlug: 'sports',
            images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
        },
        {
            name: 'Resistance Bands Set',
            slug: 'resistance-bands-set',
            description: 'Set of 5 resistance bands with different strengths for full-body workout.',
            price: 24.99,
            comparePrice: null,
            sku: 'RBS-001',
            stock: 200,
            categorySlug: 'sports',
            images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800'],
        },

        // Home & Garden
        {
            name: 'Modern Table Lamp',
            slug: 'modern-table-lamp',
            description: 'Minimalist table lamp with adjustable brightness and warm LED light.',
            price: 59.99,
            comparePrice: null,
            sku: 'MTL-001',
            stock: 60,
            categorySlug: 'home-garden',
            images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'],
        },
        {
            name: 'Indoor Plant Set',
            slug: 'indoor-plant-set',
            description: 'Set of 3 easy-care indoor plants in decorative ceramic pots.',
            price: 44.99,
            comparePrice: 59.99,
            sku: 'IPS-001',
            stock: 40,
            categorySlug: 'home-garden',
            images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
        },
        {
            name: 'Throw Blanket',
            slug: 'throw-blanket',
            description: 'Soft and cozy throw blanket, perfect for living room or bedroom.',
            price: 39.99,
            comparePrice: null,
            sku: 'TB-001',
            stock: 100,
            categorySlug: 'home-garden',
            images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
        },
        {
            name: 'Decorative Pillows Set',
            slug: 'decorative-pillows-set',
            description: 'Set of 2 decorative pillows with modern geometric patterns.',
            price: 34.99,
            comparePrice: 49.99,
            sku: 'DPS-001',
            stock: 80,
            categorySlug: 'home-garden',
            images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800'],
        },

        // Books
        {
            name: 'JavaScript Guide',
            slug: 'javascript-guide',
            description: 'Complete guide to modern JavaScript development.',
            price: 39.99,
            comparePrice: null,
            sku: 'JSG-001',
            stock: 100,
            categorySlug: 'books',
            images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'],
        },
        {
            name: 'Design Patterns Book',
            slug: 'design-patterns-book',
            description: 'Learn essential design patterns for software development.',
            price: 44.99,
            comparePrice: 54.99,
            sku: 'DPB-001',
            stock: 75,
            categorySlug: 'books',
            images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800'],
        },

        // Beauty
        {
            name: 'Skincare Set',
            slug: 'skincare-set',
            description: 'Complete skincare routine set with cleanser, toner, and moisturizer.',
            price: 89.99,
            comparePrice: 119.99,
            sku: 'SS-001',
            stock: 60,
            categorySlug: 'beauty',
            images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'],
        },
        {
            name: 'Hair Care Bundle',
            slug: 'hair-care-bundle',
            description: 'Professional hair care bundle with shampoo, conditioner, and hair mask.',
            price: 54.99,
            comparePrice: null,
            sku: 'HCB-001',
            stock: 90,
            categorySlug: 'beauty',
            images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
        },

        // Toys
        {
            name: 'Building Blocks Set',
            slug: 'building-blocks-set',
            description: '500-piece building blocks set for creative play.',
            price: 34.99,
            comparePrice: 44.99,
            sku: 'BBS-001',
            stock: 120,
            categorySlug: 'toys',
            images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800'],
        },
        {
            name: 'RC Racing Car',
            slug: 'rc-racing-car',
            description: 'High-speed remote control racing car with rechargeable battery.',
            price: 49.99,
            comparePrice: null,
            sku: 'RCC-001',
            stock: 50,
            categorySlug: 'toys',
            images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800'],
        },

        // Automotive
        {
            name: 'Car Phone Mount',
            slug: 'car-phone-mount',
            description: 'Universal car phone mount with 360-degree rotation.',
            price: 19.99,
            comparePrice: 29.99,
            sku: 'CPM-001',
            stock: 200,
            categorySlug: 'automotive',
            images: ['https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800'],
        },
        {
            name: 'Car Vacuum Cleaner',
            slug: 'car-vacuum-cleaner',
            description: 'Portable car vacuum cleaner with strong suction power.',
            price: 39.99,
            comparePrice: null,
            sku: 'CVC-001',
            stock: 80,
            categorySlug: 'automotive',
            images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        },
    ];

    for (const productData of products) {
        const category = categories.find(c => c.slug === productData.categorySlug);
        if (!category) continue;

        const existing = await prisma.product.findUnique({
            where: { slug: productData.slug },
        });

        if (!existing) {
            await prisma.product.create({
                data: {
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    price: productData.price,
                    comparePrice: productData.comparePrice,
                    sku: productData.sku,
                    stock: productData.stock,
                    status: 'ACTIVE',
                    categoryId: category.id,
                    images: {
                        create: productData.images.map((url, idx) => ({
                            url,
                            position: idx,
                        })),
                    },
                },
            });
        }
    }
    console.log('Created products:', products.length);

    console.log('Seed completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
