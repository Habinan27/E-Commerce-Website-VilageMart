# OoruMart (ஊர் சந்தை) – Multi-Vendor Village Products Marketplace

> **"Local Products. Local Sellers. One Marketplace."**

OoruMart is a production-quality, multi-vendor e-commerce platform engineered specifically for **Sri Lankan village products, rural agricultural harvests, traditional delicacies, and artisanal crafts**.

The platform connects customers directly with approved local village farmers, palmyra artisans, forest beekeepers, and heritage producers.

---

## 🌟 Key Features

* 🛍️ **Multi-Vendor Architecture**: Single customer orders can contain items from multiple distinct village sellers, automatically calculating snapshots, per-item seller earnings, and 10% platform commission.
* 🇱🇰 **Sri Lankan Hierarchical Location System**: `Province` $\to$ `District` $\to$ `City` $\to$ `Area` (supports Northern, Eastern, Central, Southern, and Western provinces).
* 🔤 **Native Unicode Multi-Lingual Support**: Sellers can list products in **Tamil (தமிழ்)** (e.g. *யாழ்ப்பாண பனங்கற்கண்டு*), **Sinhala (සිංහල)** (e.g. *ගම් මී පැණි*), or **English**.
* 🔍 **Faceted Search & Filters**: Multi-attribute filtering by Category, Province, District, City, Price range, Minimum rating, and In-Stock availability with shareable URL query parameters.
* 👥 **Three Role-Based Portals**:
  * **Customer**: Browse, search, filter, multi-vendor cart, wishlist, checkout, live order tracking, and verified reviews.
  * **Seller**: Shop storefront, product catalog management, order processing, stock controls, earnings breakdown, and customer review insights.
  * **Admin**: Executive analytics with **Recharts**, seller approvals/suspension, platform-wide orders inspection, and catalog moderation.
* 💳 **Payment Gateway Ready**: Cash on Delivery (COD) and PayHere payment gateway abstraction with MD5 hash security.
* ⭐ **Verified Reviews Only**: Customers can only review items they actually purchased in completed orders.
* 📱 **Mobile App Ready**: Clean REST API endpoints (`/api/...`) built alongside Next.js Server Actions for future React Native / Expo mobile applications.
* 🚀 **SEO & Performance**: Server components, dynamic `sitemap.xml`, `robots.txt`, OpenGraph metadata, and JSON-LD structured data (Product, Organization, BreadcrumbList).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) 14 (App Router, Server Components & Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Database** | **MySQL** (`utf8mb4` encoding, `utf8mb4_unicode_ci` collation) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) (17 Normalized Relational Tables) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with harmonious Earth & Brand color tokens |
| **Charts** | [Recharts](https://recharts.org/) (Executive Admin Visualizations) |
| **Validation** | [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Auth** | JWT Session Cookie with bcrypt password hashing |

---

## 🗄️ Database Relational Schema (17 Tables)

```
users
 ├── seller_profiles (1:1 with User)
 ├── addresses (1:N)
 ├── carts (1:1) ── cart_items (1:N) ── products
 ├── wishlists (1:1) ── wishlist_items (1:N) ── products
 ├── orders (1:N)
 │    ├── order_items (1:N) ── products & seller_profiles
 │    │    ├── reviews (1:1 with OrderItem for verified reviews)
 │    │    └── seller_earnings (1:1 with OrderItem, 10% commission)
 │    ├── payments (1:1 with Order)
 │    └── order_status_history (1:N audit timeline)
 └── reviews (1:N)

locations (Hierarchical Self-Referencing: Province → District → City → Area)
 ├── seller_profiles
 └── addresses

categories (1:N)
 └── products
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- MySQL Server (running locally or remote)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/oorumart_db?charset=utf8mb4"
AUTH_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to MySQL database
npm run prisma:push

# Seed rich Sri Lankan dataset (Locations, Sellers, Products, Orders, Reviews)
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| 👑 **Admin** | `admin@example.com` | `Admin@123` | Platform Executive Dashboard & Approvals |
| 🏪 **Seller 1** | `seller1@example.com` | `password123` | *Yarl Nature Organics* (Valvettithurai, Jaffna) |
| 🏪 **Seller 2** | `seller2@example.com` | `password123` | *Vanni Forest Harvests & Pure Honey* (Kilinochchi) |
| 🏪 **Seller 3** | `seller3@example.com` | `password123` | *Eastern Heritage Rice & Grains* (Eravur) |
| 🏪 **Seller 4** | `seller4@example.com` | `password123` | *Upcountry Ayurvedic Naturals* (Kandy) |
| 🏪 **Seller 5** | `seller5@example.com` | `password123` | *Ruhunu Clay & Handloom Crafts* (Galle Fort) |
| 👤 **Customer** | `customer1@example.com` | `password123` | *Kavitha Senthilvel* (Colombo 03) |

*(One-click demo login buttons are also available directly on the `/login` page)*

---

## 📊 Admin Analytics Capabilities

1. **Gross Revenue vs Platform Commission (10%) vs Seller Payouts (90%)**
2. **Monthly Sales Time-Series** (Area chart in LKR)
3. **Top Sellers Ranking** by sales volume and item counts
4. **Top Products Ranking** by quantity sold and revenue
5. **Category Sales Breakdown** (Pie chart distribution)
6. **Location-wise Sales Distribution** across Sri Lankan Provinces and Districts

---

## 📱 Future Mobile App REST API Integration

The API endpoints in `src/app/api/...` return normalized JSON responses with standard status codes and support `Authorization: Bearer <token>` for mobile authentication:

- `POST /api/auth/login` & `POST /api/auth/register`
- `GET /api/products` (supports query, category, location, price, rating, pagination)
- `GET /api/products/[id]`
- `GET /api/categories`
- `GET /api/locations` (Sri Lankan hierarchy)
- `GET /api/cart` & `POST /api/cart`
- `POST /api/orders/checkout`
- `GET /api/orders`
- `POST /api/reviews` (Verified customer review)

---

## 🛡️ License

Built for OoruMart Sri Lanka. All rights reserved.
