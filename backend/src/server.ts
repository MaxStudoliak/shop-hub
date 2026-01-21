import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminAuthRoutes from './routes/admin/auth.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';
import adminCategoryRoutes from './routes/admin/category.routes.js';
import adminOrderRoutes from './routes/admin/order.routes.js';
import adminStatsRoutes from './routes/admin/stats.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userAuthRoutes from './routes/user/auth.routes.js';
import userFavoritesRoutes from './routes/user/favorites.routes.js';
import userOrdersRoutes from './routes/user/orders.routes.js';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 4000;

// Stripe webhook needs raw body
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

// CORS configuration for both development and production
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }),
);

app.use(express.json());

// Public routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// User routes
app.use('/api/auth', userAuthRoutes);
app.use('/api/favorites', userFavoritesRoutes);
app.use('/api/user/orders', userOrdersRoutes);

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// Health check
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
