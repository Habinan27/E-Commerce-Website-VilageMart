import { z } from 'zod';

// Auth Validations
export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits').max(20).optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Seller Onboarding Validation
export const registerSellerSchema = z.object({
  name: z.string().min(2, 'Personal name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name is required').max(200),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5, 'Physical address is required'),
  locationId: z.string().min(1, 'Location is required'),
});

export const updateSellerProfileSchema = z.object({
  shopName: z.string().min(2, 'Shop name is required').max(200),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5, 'Physical address is required'),
  locationId: z.string().min(1, 'Location is required'),
});

// Product Validation (Supports Tamil, English, Sinhala)
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  minStock: z.coerce.number().int().nonnegative('Minimum stock threshold cannot be negative').default(0),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE']).default('PENDING'),
});

// Address Validation
export const addressSchema = z.object({
  name: z.string().min(2, 'Contact person name is required'),
  phone: z.string().min(9, 'Valid phone number is required'),
  addressLine: z.string().min(5, 'Street address is required'),
  locationId: z.string().min(1, 'City/Area selection is required'),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  isDefault: z.boolean().default(false),
});

// Cart Validation
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// Checkout & Order Validation
export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
  notes: z.string().optional(),
});

// Review Validation
export const reviewSchema = z.object({
  orderItemId: z.string().min(1, 'Order item is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// Order Status Update (Seller / Admin)
export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  note: z.string().optional(),
});

// Seller Approval Status Update (Admin)
export const updateSellerApprovalSchema = z.object({
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
});
