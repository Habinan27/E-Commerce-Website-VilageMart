import type { Metadata } from 'next';
import { Inter, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartToast } from '@/components/cart/cart-toast';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-tamil',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Village Mart | Your Village • Your Mart • Your Way',
    template: '%s | Village Mart',
  },
  description:
    'Buy fresh village products, pure honey, traditional rice, spices, and handmade crafts directly from local Sri Lankan farmers and artisans.',
  keywords: [
    'Village Mart',
    'VillageMart Sri Lanka',
    'Sri Lanka Village Products',
    'Jaffna Palm Candy',
    'Panang Karkandu',
    'Vanni Honey',
    'Mapillai Samba Rice',
    'Palmyra Crafts',
    'Local Village Online Shopping',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  let cartCount = 0;
  let initialAnnouncements: any[] = [];

  if (user) {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: BigInt(user.id) },
        include: { items: true },
      });
      cartCount = cart?.items.reduce((acc, it) => acc + it.quantity, 0) || 0;
    } catch (e) {
      // ignore
    }
  }

  try {
    if (prisma?.announcement) {
      const activeAnnouncements = await prisma.announcement.findMany({
        where: {
          targetAudience: { in: ['CUSTOMERS', 'ALL'] },
          isActive: true,
        },
        include: {
          seller: {
            select: { shopName: true, slug: true },
          },
          product: {
            select: { id: true, name: true, slug: true, price: true, status: true },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      if (activeAnnouncements && activeAnnouncements.length > 0) {
        initialAnnouncements = activeAnnouncements.map((a) => {
          const finalLinkUrl = a.product?.slug ? `/products/${a.product.slug}` : (a.linkUrl || null);

          return {
            id: a.id.toString(),
            sellerId: a.sellerId?.toString() || null,
            sellerShopName: a.seller?.shopName || null,
            sellerSlug: a.seller?.slug || null,
            productId: a.productId?.toString() || null,
            productName: a.product?.name || null,
            productSlug: a.product?.slug || null,
            productPrice: a.product?.price ? Number(a.product.price) : null,
            title: a.title,
            content: a.content,
            contentTamil: a.contentTamil,
            linkUrl: finalLinkUrl,
            linkLabel: a.linkLabel,
            theme: a.theme,
            bgType: a.bgType || 'COLOR',
            bgColor: a.bgColor || null,
            textColor: a.textColor || null,
            accentColor: a.accentColor || null,
            borderColor: a.borderColor || null,
            buttonColor: a.buttonColor || null,
            buttonTextColor: a.buttonTextColor || null,
            bgImage: a.bgImage || null,
            overlayOpacity: a.overlayOpacity !== undefined ? a.overlayOpacity : 60,
            isMarquee: a.isMarquee,
            speed: a.speed,
            isActive: a.isActive,
            displayOrder: a.displayOrder,
          };
        });
      }
    }
  } catch (e) {
    // ignore
  }

  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${notoSansTamil.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('village_mart_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        <div>
          <Header user={user} cartCount={cartCount} initialAnnouncements={initialAnnouncements} />
          <main>{children}</main>
        </div>
        <Footer />
        <CartToast />
      </body>
    </html>
  );
}