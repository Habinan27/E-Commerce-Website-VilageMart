import { prisma } from '@/lib/db/prisma';
import { serializeBigInt, slugify } from '@/lib/utils';
import type { ProductFilters, PaginatedResult } from '@/types';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<any>> {
    const {
      query,
      category,
      province,
      district,
      city,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sellerId,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = filters;

    const skip = (page - 1) * limit;

    // Base WHERE conditions
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      seller: {
        is: {
          approvalStatus: 'APPROVED',
        },
      },
    };

    // Text search (supports Tamil, Sinhala, English)
    if (query && query.trim() !== '') {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { metaTitle: { contains: q } },
        { category: { is: { name: { contains: q } } } },
        { seller: { is: { shopName: { contains: q } } } },
      ];
    }

    // Category filter (by slug or id)
    if (category) {
      where.category = {
        is: {
          OR: [
            { slug: category },
            { name: category },
            ...(isNaN(Number(category)) ? [] : [{ id: BigInt(category) }]),
          ],
        },
      };
    }

    // Seller ID filter
    if (sellerId) {
      where.sellerId = BigInt(sellerId);
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // In stock filter
    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Location hierarchy filters (seller's location)
    if (city || district || province) {
      const locationConditions: Prisma.LocationWhereInput[] = [];

      if (city) {
        locationConditions.push({
          OR: [
            { slug: city },
            { name: { contains: city } },
            ...(isNaN(Number(city)) ? [] : [{ id: BigInt(city) }]),
          ],
        });
      }

      if (district) {
        locationConditions.push({
          OR: [
            { slug: district },
            { name: { contains: district } },
            { parent: { is: { slug: district } } },
            { parent: { is: { name: { contains: district } } } },
          ],
        });
      }

      if (province) {
        locationConditions.push({
          OR: [
            { slug: province },
            { name: { contains: province } },
            { parent: { is: { parent: { is: { slug: province } } } } },
            { parent: { is: { parent: { is: { name: { contains: province } } } } } },
          ],
        });
      }

      if (locationConditions.length > 0) {
        where.seller = {
          is: {
            approvalStatus: 'APPROVED',
            location: {
              is: {
                OR: locationConditions,
              },
            },
          },
        };
      }
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
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
          productImages: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          reviews: {
            where: { status: 'VISIBLE' },
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Calculate ratings for each product
    const formattedProducts = products.map((p) => {
      const reviewCount = p.reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
          : 0;

      return {
        ...p,
        averageRating,
        reviewCount,
      };
    });

    // Filter by rating if minRating is provided
    let finalProducts = formattedProducts;
    if (minRating && minRating > 0) {
      finalProducts = finalProducts.filter((p) => p.averageRating >= minRating);
    }

    // Sort by rating if requested
    if (sort === 'rating') {
      finalProducts.sort((a, b) => b.averageRating - a.averageRating);
    }

    return {
      data: serializeBigInt(finalProducts),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    let product = await prisma.product.findUnique({
      where: { slug: decodedSlug },
      include: {
        category: true,
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
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        reviews: {
          where: { status: 'VISIBLE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product && decodedSlug !== slug) {
      product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
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
          productImages: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          reviews: {
            where: { status: 'VISIBLE' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!product) return null;

    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    // Rating breakdown (1-5 stars)
    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    product.reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingBreakdown[r.rating]++;
      }
    });

    // Get related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      include: {
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          take: 1,
        },
        seller: {
          include: { location: true },
        },
        reviews: {
          where: { status: 'VISIBLE' },
          select: { rating: true },
        },
      },
      take: 4,
    });

    const formattedRelated = relatedProducts.map((p) => {
      const count = p.reviews.length;
      const avg = count > 0 ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)) : 0;
      return {
        ...p,
        averageRating: avg,
        reviewCount: count,
      };
    });

    return serializeBigInt({
      ...product,
      averageRating,
      reviewCount,
      ratingBreakdown,
      relatedProducts: formattedRelated,
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
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
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    });

    if (!product) return null;
    return serializeBigInt(product);
  }

  static async getFeaturedProducts(limit = 8) {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        seller: { is: { approvalStatus: 'APPROVED' } },
      },
      include: {
        category: true,
        seller: {
          include: {
            location: true,
          },
        },
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        reviews: {
          where: { status: 'VISIBLE' },
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formatted = products.map((p) => {
      const count = p.reviews.length;
      const avg = count > 0 ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)) : 0;
      return {
        ...p,
        averageRating: avg,
        reviewCount: count,
      };
    });

    return serializeBigInt(formatted);
  }

  static async getTopRatedProducts(limit = 6) {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        seller: { is: { approvalStatus: 'APPROVED' } },
        reviews: { some: { status: 'VISIBLE' } },
      },
      include: {
        category: true,
        seller: {
          include: {
            location: true,
          },
        },
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        reviews: {
          where: { status: 'VISIBLE' },
          select: { rating: true },
        },
      },
      take: limit * 2,
    });

    const formatted = products
      .map((p) => {
        const count = p.reviews.length;
        const avg = count > 0 ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)) : 0;
        return {
          ...p,
          averageRating: avg,
          reviewCount: count,
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return serializeBigInt(formatted);
  }

  static async createProduct(sellerProfileId: string, data: any) {
    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        sellerId: BigInt(sellerProfileId),
        categoryId: BigInt(data.categoryId),
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        minStock: data.minStock || 0,
        status: data.status || 'PENDING',
        metaTitle: data.metaTitle || data.name,
        metaDescription: data.metaDescription || (data.description ? data.description.substring(0, 155) : null),
        productImages: {
          create: (data.images || []).map((url: string, index: number) => ({
            imageUrl: url,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        productImages: true,
      },
    });

    return serializeBigInt(product);
  }

  static async updateProduct(productId: string, sellerProfileId: string, data: any, isAdmin = false) {
    if (!isAdmin) {
      const existing = await prisma.product.findFirst({
        where: { id: BigInt(productId), sellerId: BigInt(sellerProfileId) },
      });
      if (!existing) throw new Error('Product not found or unauthorized');
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId) updateData.category = { connect: { id: BigInt(data.categoryId) } };
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.status) updateData.status = data.status;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    if (data.images && Array.isArray(data.images)) {
      await prisma.productImage.deleteMany({ where: { productId: BigInt(productId) } });
      await prisma.productImage.createMany({
        data: data.images.map((url: string, index: number) => ({
          productId: BigInt(productId),
          imageUrl: url,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id: BigInt(productId) },
      data: updateData,
      include: {
        productImages: true,
      },
    });

    return serializeBigInt(updated);
  }

  static async deleteProduct(productId: string, sellerProfileId: string, isAdmin = false) {
    if (!isAdmin) {
      const existing = await prisma.product.findFirst({
        where: { id: BigInt(productId), sellerId: BigInt(sellerProfileId) },
      });
      if (!existing) throw new Error('Product not found or unauthorized');
    }

    const hasOrders = await prisma.orderItem.count({
      where: { productId: BigInt(productId) },
    });

    if (hasOrders > 0) {
      return prisma.product.update({
        where: { id: BigInt(productId) },
        data: { status: 'INACTIVE' },
      });
    } else {
      return prisma.product.delete({
        where: { id: BigInt(productId) },
      });
    }
  }
}
