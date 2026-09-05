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

  static async getSellerIncomeReport(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {
      orderStatus: { not: 'CANCELLED' },
    };

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const [sellers, items] = await Promise.all([
      prisma.sellerProfile.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderItem.findMany({
        where: {
          order: dateFilter,
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              orderStatus: true,
              paymentStatus: true,
              user: { select: { name: true, email: true } },
            },
          },
          product: { select: { id: true, name: true, price: true, slug: true } },
          sellerEarnings: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const sellerMap = new Map<
      string,
      {
        sellerId: string;
        shopName: string;
        ownerName: string;
        email: string;
        phone: string;
        location: string;
        approvalStatus: string;
        productsSold: number;
        ordersCount: Set<string>;
        totalSales: number;
        sellerEarnings: number;
        platformIncome: number;
        productSalesMap: Map<
          string,
          {
            productId: string;
            name: string;
            unitPrice: number;
            quantitySold: number;
            totalSales: number;
            sellerEarnings: number;
            platformIncome: number;
          }
        >;
        orderSalesMap: Map<
          string,
          {
            orderId: string;
            orderNumber: string;
            date: string;
            customerName: string;
            orderStatus: string;
            itemsCount: number;
            totalSales: number;
            sellerEarnings: number;
            platformIncome: number;
          }
        >;
        transactions: Array<{
          id: string;
          orderNumber: string;
          productName: string;
          quantity: number;
          unitPrice: number;
          subtotal: number;
          sellerNet: number;
          platformFee: number;
          date: string;
          status: string;
        }>;
      }
    >();

    sellers.forEach((s) => {
      const sId = s.id.toString();
      sellerMap.set(sId, {
        sellerId: sId,
        shopName: s.shopName,
        ownerName: s.user?.name || 'Unknown',
        email: s.user?.email || '',
        phone: s.user?.phone || '',
        location: s.location?.name || 'Sri Lanka',
        approvalStatus: s.approvalStatus,
        productsSold: 0,
        ordersCount: new Set(),
        totalSales: 0,
        sellerEarnings: 0,
        platformIncome: 0,
        productSalesMap: new Map(),
        orderSalesMap: new Map(),
        transactions: [],
      });
    });

    items.forEach((item) => {
      const sId = item.sellerId.toString();
      let record = sellerMap.get(sId);
      if (!record) {
        record = {
          sellerId: sId,
          shopName: 'Unknown Shop',
          ownerName: 'Unknown',
          email: '',
          phone: '',
          location: 'Sri Lanka',
          approvalStatus: 'APPROVED',
          productsSold: 0,
          ordersCount: new Set(),
          totalSales: 0,
          sellerEarnings: 0,
          platformIncome: 0,
          productSalesMap: new Map(),
          orderSalesMap: new Map(),
          transactions: [],
        };
        sellerMap.set(sId, record);
      }

      const gross = Number(item.subtotal);
      const commission = item.sellerEarnings
        ? Number(item.sellerEarnings.commissionAmount)
        : Number((gross * 0.1).toFixed(2));
      const net = item.sellerEarnings
        ? Number(item.sellerEarnings.netAmount)
        : Number((gross - commission).toFixed(2));

      record.productsSold += item.quantity;
      record.totalSales += gross;
      record.ordersCount.add(item.orderId.toString());
      record.platformIncome += commission;
      record.sellerEarnings += net;

      // Product-wise breakdown
      const pId = item.productId.toString();
      if (!record.productSalesMap.has(pId)) {
        record.productSalesMap.set(pId, {
          productId: pId,
          name: item.productName || item.product?.name || 'Product',
          unitPrice: Number(item.unitPrice),
          quantitySold: 0,
          totalSales: 0,
          sellerEarnings: 0,
          platformIncome: 0,
        });
      }
      const pRecord = record.productSalesMap.get(pId)!;
      pRecord.quantitySold += item.quantity;
      pRecord.totalSales += gross;
      pRecord.sellerEarnings += net;
      pRecord.platformIncome += commission;

      // Order-wise breakdown
      const oId = item.orderId.toString();
      if (!record.orderSalesMap.has(oId)) {
        record.orderSalesMap.set(oId, {
          orderId: oId,
          orderNumber: item.order.orderNumber,
          date: item.order.createdAt.toISOString(),
          customerName: item.order.user?.name || 'Customer',
          orderStatus: item.order.orderStatus,
          itemsCount: 0,
          totalSales: 0,
          sellerEarnings: 0,
          platformIncome: 0,
        });
      }
      const oRecord = record.orderSalesMap.get(oId)!;
      oRecord.itemsCount += item.quantity;
      oRecord.totalSales += gross;
      oRecord.sellerEarnings += net;
      oRecord.platformIncome += commission;

      // Recent transaction item
      record.transactions.push({
        id: item.id.toString(),
        orderNumber: item.order.orderNumber,
        productName: item.productName || item.product?.name || 'Product',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: gross,
        sellerNet: net,
        platformFee: commission,
        date: item.order.createdAt.toISOString(),
        status: item.order.orderStatus,
      });
    });

    const sellerList = Array.from(sellerMap.values())
      .map((r) => ({
        sellerId: r.sellerId,
        shopName: r.shopName,
        ownerName: r.ownerName,
        email: r.email,
        phone: r.phone,
        location: r.location,
        approvalStatus: r.approvalStatus,
        productsSold: r.productsSold,
        totalOrders: r.ordersCount.size,
        totalSales: r.totalSales,
        sellerEarnings: r.sellerEarnings,
        platformIncome: r.platformIncome,
        productSales: Array.from(r.productSalesMap.values()).sort((a, b) => b.totalSales - a.totalSales),
        orderSales: Array.from(r.orderSalesMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        recentTransactions: r.transactions.slice(0, 20),
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    const totalSellers = sellers.length;
    const totalProductsSold = sellerList.reduce((acc, s) => acc + s.productsSold, 0);
    const totalSales = sellerList.reduce((acc, s) => acc + s.totalSales, 0);
    const totalSellerEarnings = sellerList.reduce((acc, s) => acc + s.sellerEarnings, 0);
    const totalPlatformIncome = sellerList.reduce((acc, s) => acc + s.platformIncome, 0);
    const totalOrders = new Set(items.map((i) => i.orderId.toString())).size;

    return serializeBigInt({
      summary: {
        totalSellers,
        totalProductsSold,
        totalSales,
        totalSellerEarnings,
        totalPlatformIncome,
        totalOrders,
      },
      sellers: sellerList,
    });
  }
}
