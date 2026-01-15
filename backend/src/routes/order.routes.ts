import { Router, Response } from 'express';
import { prisma } from '../server.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { optionalUserAuth, UserRequest } from '../middleware/user-auth.middleware.js';

const router = Router();

const createOrderSchema = z.object({
    customerEmail: z.string().email(),
    customerName: z.string().min(1),
    customerPhone: z.string().min(1),
    shippingAddress: z.string().min(1),
    shippingCity: z.string().min(1),
    shippingZip: z.string().min(1),
    shippingCountry: z.string().min(1),
    items: z
        .array(
            z.object({
                productId: z.string().uuid(),
                quantity: z.number().int().positive(),
            }),
        )
        .min(1),
    stripePaymentId: z.string().optional(),
});

// POST /api/orders - Create order (guest or authenticated)
router.post('/', optionalUserAuth, async (req: UserRequest, res: Response) => {
    try {
        const data = createOrderSchema.parse(req.body);

        // Fetch products and validate
        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products not found' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            const price = Number(product.price);
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                price,
            };
        });

        const shippingCost = subtotal >= 100 ? 0 : 10;
        const total = subtotal + shippingCost;

        // Generate order number
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerEmail: data.customerEmail,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                shippingAddress: data.shippingAddress,
                shippingCity: data.shippingCity,
                shippingZip: data.shippingZip,
                shippingCountry: data.shippingCountry,
                subtotal,
                shippingCost,
                total,
                stripePaymentId: data.stripePaymentId,
                paymentStatus: data.stripePaymentId ? 'PAID' : 'PENDING',
                userId: req.user?.id || null,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        // Update stock
        for (const item of data.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        res.status(201).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error:', error.errors);
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Error creating order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
        res.status(500).json({ error: 'Failed to create order', message: errorMessage });
    }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: { take: 1 },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

export default router;
