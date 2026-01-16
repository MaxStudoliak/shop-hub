import { Router, Request, Response } from 'express';
import { prisma } from '../server.js';
import { Prisma } from '@prisma/client';

const router = Router();

// GET /api/products - List products with filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            discount,
            sort = 'createdAt',
            order = 'desc',
            page = '1',
            limit = '12',
        } = req.query;

        const where: Prisma.ProductWhereInput = {
            status: 'ACTIVE',
        };

        if (category) {
            where.category = { slug: category as string };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        if (discount === 'true') {
            where.comparePrice = { not: null };
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: { orderBy: { position: 'asc' }, take: 1 },
                },
                orderBy: { [sort as string]: order },
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/search - Search products
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, limit = '10' } = req.query;

        if (!q) {
            return res.json({ products: [] });
        }

        const products = await prisma.product.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { name: { contains: q as string, mode: 'insensitive' } },
                    { description: { contains: q as string, mode: 'insensitive' } },
                ],
            },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' }, take: 1 },
            },
            take: Number(limit),
        });

        res.json({ products });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
});

// GET /api/products/:slug - Get product by slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' } },
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export default router;
