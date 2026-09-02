import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import type { OrderStatus, PaymentMethod } from '@/types';
import { Prisma } from '@prisma/client';

const PLATFORM_COMMISSION_PERCENT = 10; // 10% marketplace commission

export class OrderService {
  // ---------------------------------------------------------
  // CART OPERATIONS
  // ---------------------------------------------------------
  static async getOrCreateCart(userId: string) {
    const uId = BigInt(userId);
    let cart = await prisma.cart.findUnique({
      where: { userId: uId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  include: {
                    location: true,
                  },
                },
                productImages: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: uId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    include: { location: true },
                  },
                  productImages: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    // Group items by seller for multi-vendor presentation
    const items = cart.items || [];
    let subtotal = 0;
    const sellersMap = new Map<string, any>();

    items.forEach((item) => {
      const pPrice = Number(item.product.price);
      const lineSubtotal = pPrice * item.quantity;
      subtotal += lineSubtotal;

      const sellerKey = item.product.seller.id.toString();
      if (!sellersMap.has(sellerKey)) {
        sellersMap.set(sellerKey, {
          sellerId: sellerKey,
          shopName: item.product.seller.shopName,
          slug: item.product.seller.slug,
          location: item.product.seller.location?.name || '',
          items: [],
          subtotal: 0,
        });
      }
      const sellerGroup = sellersMap.get(sellerKey);
      sellerGroup.items.push({
        ...item,
        lineSubtotal,
      });
      sellerGroup.subtotal += lineSubtotal;
    });

    const deliveryFee = items.length > 0 ? 350 : 0;
    const totalAmount = subtotal + deliveryFee;

    return serializeBigInt({
      id: cart.id,
      userId: cart.userId,
      items,
      sellerGroups: Array.from(sellersMap.values()),
      subtotal,
      deliveryFee,
      totalAmount,
      itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
    });
  }

  static async addToCart(userId: string, productId: string, quantity = 1) {
    const uId = BigInt(userId);
    const pId = BigInt(productId);

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: pId },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new Error('Product is not available for purchase');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items currently in stock`);
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: uId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: uId } });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: pId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error(`Cannot add more than available stock (${product.stock})`);
      }
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      return prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: pId,
          quantity,
        },
      });
    }
  }

  static async updateCartItemQuantity(userId: string, cartItemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: BigInt(cartItemId) },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item || item.cart.userId !== BigInt(userId)) {
      throw new Error('Cart item not found or unauthorized');
    }

    if (quantity <= 0) {
      return prisma.cartItem.delete({ where: { id: item.id } });
    }

    if (item.product.stock < quantity) {
      throw new Error(`Only ${item.product.stock} units available in stock`);
    }

    return prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  static async removeCartItem(userId: string, cartItemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: BigInt(cartItemId) },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== BigInt(userId)) {
      throw new Error('Cart item not found or unauthorized');
    }

    return prisma.cartItem.delete({ where: { id: item.id } });
  }

  // ---------------------------------------------------------
  // ORDER CHECKOUT & CREATION (MULTI-VENDOR)
  // ---------------------------------------------------------
  static async checkout(userId: string, data: { addressId: string; paymentMethod: PaymentMethod; notes?: string }) {
    const uId = BigInt(userId);
    const addrId = BigInt(data.addressId);

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addrId, userId: uId },
    });
    if (!address) throw new Error('Valid delivery address is required');

    // Get cart items
    const cart = await prisma.cart.findUnique({
      where: { userId: uId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Verify stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Product "${item.product.name}" has insufficient stock (${item.product.stock} available)`);
      }
      if (item.product.status !== 'ACTIVE' || item.product.seller.approvalStatus !== 'APPROVED') {
        throw new Error(`Product "${item.product.name}" is no longer available`);
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      const unitPrice = Number(item.product.price);
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;

      const commission = Number((lineSubtotal * (PLATFORM_COMMISSION_PERCENT / 100)).toFixed(2));
      const netAmount = Number((lineSubtotal - commission).toFixed(2));

      return {
        sellerId: item.product.sellerId,
        productId: item.productId,
        productName: item.product.name, // Snapshot
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(unitPrice), // Snapshot
        subtotal: new Prisma.Decimal(lineSubtotal),
        commissionAmount: new Prisma.Decimal(commission),
        netAmount: new Prisma.Decimal(netAmount),
      };
    });

    const deliveryFee = 350.0;
    const totalAmount = subtotal + deliveryFee;

    // Generate unique human-readable order number
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `OM-${datePrefix}-${randomSuffix}`;

    // Execute atomic transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: uId,
          addressId: addrId,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          discount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(totalAmount),
          paymentStatus: data.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
          orderStatus: 'PENDING',
        },
      });

      // 2. Create OrderItems & SellerEarnings & decrement stock
      for (const itemData of orderItemsData) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            sellerId: itemData.sellerId,
            productId: itemData.productId,
            productName: itemData.productName,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            subtotal: itemData.subtotal,
          },
        });

        // Create seller earnings record
        await tx.sellerEarnings.create({
          data: {
            sellerId: itemData.sellerId,
            orderItemId: orderItem.id,
            grossAmount: itemData.subtotal,
            commissionAmount: itemData.commissionAmount,
            netAmount: itemData.netAmount,
            payoutStatus: 'PENDING',
          },
        });

        // Decrement product stock
        await tx.product.update({
          where: { id: itemData.productId },
          data: {
            stock: { decrement: itemData.quantity },
          },
        });
      }

      // 3. Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: data.paymentMethod,
          gateway: data.paymentMethod === 'ONLINE' ? 'PayHere Sandbox' : null,
          transactionId: data.paymentMethod === 'ONLINE' ? `TXN-PAYHERE-${order.orderNumber}` : null,
          amount: new Prisma.Decimal(totalAmount),
          status: data.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
          paidAt: data.paymentMethod === 'ONLINE' ? new Date() : null,
        },
      });

      // 4. Create initial order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          note: data.notes ? `Order placed. Note: ${data.notes}` : 'Order placed successfully by customer.',
          changedBy: uId,
        },
      });

      // 5. Empty the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return serializeBigInt(createdOrder);
  }

  // ---------------------------------------------------------
  // ORDER LOOKUPS & QUERIES
  // ---------------------------------------------------------
  static async getCustomerOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId: BigInt(userId) },
      include: {
        address: {
          include: { location: true },
        },
        payment: true,
        orderItems: {
          include: {
            product: {
              include: {
                productImages: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
            seller: {
              include: { location: true },
            },
            review: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return serializeBigInt(orders);
  }

  static async getOrderById(orderId: string, userId?: string, sellerProfileId?: string, isAdmin = false) {
    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: {
          include: {
            location: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
        orderItems: {
          include: {
            product: {
              include: {
                productImages: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
            seller: {
              include: {
                location: true,
              },
            },
            review: true,
            sellerEarnings: true,
          },
        },
        statusHistory: {
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) return null;

    // Authorization check
    if (!isAdmin) {
      const isCustomer = userId && order.userId.toString() === userId;
      const isSeller = sellerProfileId && order.orderItems.some((item) => item.sellerId.toString() === sellerProfileId);
      if (!isCustomer && !isSeller) {
        throw new Error('Unauthorized to view this order');
      }
    }

    return serializeBigInt(order);
  }

  static async getSellerOrders(sellerProfileId: string) {
    const sId = BigInt(sellerProfileId);
    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId: sId },
      include: {
        order: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
            address: {
              include: { location: true },
            },
            payment: true,
          },
        },
        product: {
          include: {
            productImages: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 1,
            },
          },
        },
        sellerEarnings: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return serializeBigInt(orderItems);
  }

  static async getAllOrders(filters?: { status?: OrderStatus; search?: string }) {
    const where: Prisma.OrderWhereInput = {};
    if (filters?.status) where.orderStatus = filters.status;
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } },
        { user: { name: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: { include: { location: true } },
        payment: true,
        orderItems: {
          include: {
            seller: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return serializeBigInt(orders);
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus, changedByUserId: string, note?: string) {
    const oId = BigInt(orderId);
    const uId = BigInt(changedByUserId);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: oId },
        data: {
          orderStatus: status,
          // If marked delivered and payment is COD, update payment status to PAID
          ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}),
        },
      });

      if (status === 'DELIVERED') {
        await tx.payment.updateMany({
          where: { orderId: oId },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: oId,
          status,
          note: note || `Order status updated to ${status}`,
          changedBy: uId,
        },
      });

      return order;
    });

    return serializeBigInt(updatedOrder);
  }
}
