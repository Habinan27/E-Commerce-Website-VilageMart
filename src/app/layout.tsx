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
  let initialAnnouncement = null;

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
      const a = await prisma.announcement.findFirst({
        where: {
          sellerId: null,
          targetAudience: { in: ['CUSTOMERS', 'ALL'] },
          isActive: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      });
      if (a) {
        initialAnnouncement = {
          id: a.id.toString(),
          sellerId: a.sellerId?.toString() || null,
          title: a.title,
          content: a.content,
          contentTamil: a.contentTamil,
          linkUrl: a.linkUrl,
          linkLabel: a.linkLabel,
          theme: a.theme,
          isMarquee: a.isMarquee,
          speed: a.speed,
          isActive: a.isActive,
          displayOrder: a.displayOrder,
        };
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
          <Header user={user} cartCount={cartCount} initialAnnouncement={initialAnnouncement} />
          <main>{children}</main>
        </div>
        <Footer />
        <CartToast />
      </body>
    </html>
  );
}