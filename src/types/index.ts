export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type SellerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type LocationType = 'PROVINCE' | 'DISTRICT' | 'CITY' | 'AREA';
export type ProductStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'ONLINE';
export type ReviewStatus = 'VISIBLE' | 'HIDDEN' | 'REPORTED';
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  avatarUrl?: string | null;
  sellerProfileId?: string | null;
  shopName?: string | null;
  shopSlug?: string | null;
  sellerApprovalStatus?: SellerApprovalStatus | null;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  query?: string;
  category?: string;
  province?: string;
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sellerId?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}
