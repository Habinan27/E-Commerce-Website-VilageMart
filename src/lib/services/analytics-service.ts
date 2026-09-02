import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';

export class AnalyticsService {
  static async getAdminSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      grossEarnings,
      todayOrders,
      monthOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.sellerProfile.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.sellerProfile.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.sellerEarnings.aggregate({
        _sum: {
          grossAmount: true,
          commissionAmount: true,
          netAmount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          orderStatus: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: firstDayOfMonth },
          orderStatus: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    const totalRevenue = Number(grossEarnings._sum.grossAmount || 0);
    const platformCommission = Number(grossEarnings._sum.commissionAmount || 0);
    const sellerPayouts = Number(grossEarnings._sum.netAmount || 0);

    return serializeBigInt({
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      platformCommission,
      sellerPayouts,
      todaySales: Number(todayOrders._sum.totalAmount || 0),
      todayOrdersCount: todayOrders._count,
      monthSales: Number(monthOrders._sum.totalAmount || 0),
      monthOrdersCount: monthOrders._count,
    });
  }

  static async getTopSellers(limit = 5) {
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { not: 'CANCELLED' },
        },
      },
      include: {
        seller: {
          include: {
            location: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    const sellerMap = new Map<string, { seller: any; totalSales: number; totalUnits: number; orderCount: Set<string> }>();

    items.forEach((item) => {
      const sId = item.sellerId.toString();
      if (!sellerMap.has(sId)) {
        sellerMap.set(sId, {
          seller: item.seller,
          totalSales: 0,
          totalUnits: 0,
          orderCount: new Set(),
        });
      }
      const record = sellerMap.get(sId)!;
      record.totalSales += Number(item.subtotal);
      record.totalUnits += item.quantity;
      record.orderCount.add(item.orderId.toString());
    });

    const results = Array.from(sellerMap.values())
      .map((r) => ({
        sellerId: r.seller.id,
        shopName: r.seller.shopName,
        slug: r.seller.slug,
        ownerName: r.seller.user.name,
        location: r.seller.location?.name || '',
        totalSales: r.totalSales,
        totalUnits: r.totalUnits,
        totalOrders: r.orderCount.size,
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);

    return serializeBigInt(results);
  }

  static async getTopProducts(limit = 5) {
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { not: 'CANCELLED' },
        },
      },
      include: {
        product: {
          include: {
            category: true,
            seller: true,
            productImages: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 1,
            },
          },
        },
      },
    });

    const productMap = new Map<string, { product: any; totalRevenue: number; totalSold: number }>();

    items.forEach((item) => {
      const pId = item.productId.toString();
      if (!productMap.has(pId)) {
        productMap.set(pId, {
          product: item.product,
          totalRevenue: 0,
          totalSold: 0,
        });
      }
      const record = productMap.get(pId)!;
      record.totalRevenue += Number(item.subtotal);
      record.totalSold += item.quantity;
    });

    const results = Array.from(productMap.values())
      .map((r) => ({
        productId: r.product.id,
        name: r.product.name,
        slug: r.product.slug,
        category: r.product.category.name,
        seller: r.product.seller.shopName,
        price: Number(r.product.price),
        image: r.product.productImages[0]?.imageUrl || '',
        totalRevenue: r.totalRevenue,
        totalSold: r.totalSold,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    return serializeBigInt(results);
  }

  static async getMonthlyRevenue(year = new Date().getFullYear()) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYear, lte: endOfYear },
        orderStatus: { not: 'CANCELLED' },
      },
      select: {
        totalAmount: true,
        subtotal: true,
        createdAt: true,
      },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, index) => ({
      month,
      monthIndex: index,
      revenue: 0,
      commission: 0,
      orders: 0,
    }));

    orders.forEach((order) => {
      const m = order.createdAt.getMonth();
      const gross = Number(order.subtotal);
      const commission = gross * 0.1; // 10%
      monthlyData[m].revenue += gross;
      monthlyData[m].commission += commission;
      monthlyData[m].orders += 1;
    });

    return serializeBigInt(monthlyData);
  }

  static async getCategorySales() {
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { not: 'CANCELLED' },
        },
      },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; totalRevenue: number; totalUnits: number }>();

    items.forEach((item) => {
      const catName = item.product.category.name;
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { name: catName, totalRevenue: 0, totalUnits: 0 });
      }
      const record = categoryMap.get(catName)!;
      record.totalRevenue += Number(item.subtotal);
      record.totalUnits += item.quantity;
    });

    const results = Array.from(categoryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    return serializeBigInt(results);
  }

  static async getLocationSales() {
    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { not: 'CANCELLED' },
        },
      },
      include: {
        seller: {
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
      },
    });

    const provinceMap = new Map<string, { name: string; totalRevenue: number; totalUnits: number }>();
    const districtMap = new Map<string, { name: string; totalRevenue: number; totalUnits: number }>();

    items.forEach((item) => {
      const loc = item.seller.location;
      if (!loc) return;

      // Determine district & province
      let districtName = 'Other';
      let provinceName = 'Other';

      if (loc.type === 'CITY' && loc.parent) {
        districtName = loc.parent.name;
        provinceName = loc.parent.parent?.name || 'Other';
      } else if (loc.type === 'DISTRICT') {
        districtName = loc.name;
        provinceName = loc.parent?.name || 'Other';
      } else if (loc.type === 'PROVINCE') {
        provinceName = loc.name;
      }

      // Aggregate province
      if (!provinceMap.has(provinceName)) {
        provinceMap.set(provinceName, { name: provinceName, totalRevenue: 0, totalUnits: 0 });
      }
      const prov = provinceMap.get(provinceName)!;
      prov.totalRevenue += Number(item.subtotal);
      prov.totalUnits += item.quantity;

      // Aggregate district
      if (!districtMap.has(districtName)) {
        districtMap.set(districtName, { name: districtName, totalRevenue: 0, totalUnits: 0 });
      }
      const dist = districtMap.get(districtName)!;
      dist.totalRevenue += Number(item.subtotal);
      dist.totalUnits += item.quantity;
    });

    return serializeBigInt({
      byProvince: Array.from(provinceMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
      byDistrict: Array.from(districtMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
    });
  }
}
