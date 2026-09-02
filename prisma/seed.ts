import { PrismaClient, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OoruMart Sri Lankan Marketplace Seeding...');

  // ---------------------------------------------------------
  // 1. CLEAN EXISTING DATA (Safe Order)
  // ---------------------------------------------------------
  await prisma.orderStatusHistory.deleteMany();
  await prisma.sellerEarnings.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  console.log('✓ Cleaned previous database entries');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // ---------------------------------------------------------
  // 2. SRI LANKAN HIERARCHICAL LOCATIONS
  // ---------------------------------------------------------
  // Northern Province
  const northernProvince = await prisma.location.create({
    data: { name: 'Northern Province', slug: 'northern-province', type: 'PROVINCE' },
  });

  const jaffnaDistrict = await prisma.location.create({
    data: { name: 'Jaffna', slug: 'jaffna', type: 'DISTRICT', parentId: northernProvince.id },
  });
  const valvettithurai = await prisma.location.create({
    data: { name: 'Valvettithurai', slug: 'valvettithurai', type: 'CITY', parentId: jaffnaDistrict.id },
  });
  const pointPedro = await prisma.location.create({
    data: { name: 'Point Pedro', slug: 'point-pedro', type: 'CITY', parentId: jaffnaDistrict.id },
  });
  const nallur = await prisma.location.create({
    data: { name: 'Nallur', slug: 'nallur', type: 'CITY', parentId: jaffnaDistrict.id },
  });
  const chavadhcheri = await prisma.location.create({
    data: { name: 'Chavakachcheri', slug: 'chavakachcheri', type: 'CITY', parentId: jaffnaDistrict.id },
  });

  const kilinochchiDistrict = await prisma.location.create({
    data: { name: 'Kilinochchi', slug: 'kilinochchi', type: 'DISTRICT', parentId: northernProvince.id },
  });
  const kilinochchiTown = await prisma.location.create({
    data: { name: 'Kilinochchi Town', slug: 'kilinochchi-town', type: 'CITY', parentId: kilinochchiDistrict.id },
  });

  // Eastern Province
  const easternProvince = await prisma.location.create({
    data: { name: 'Eastern Province', slug: 'eastern-province', type: 'PROVINCE' },
  });
  const batticaloaDistrict = await prisma.location.create({
    data: { name: 'Batticaloa', slug: 'batticaloa', type: 'DISTRICT', parentId: easternProvince.id },
  });
  const kattankudy = await prisma.location.create({
    data: { name: 'Kattankudy', slug: 'kattankudy', type: 'CITY', parentId: batticaloaDistrict.id },
  });
  const eravur = await prisma.location.create({
    data: { name: 'Eravur', slug: 'eravur', type: 'CITY', parentId: batticaloaDistrict.id },
  });

  // Central Province
  const centralProvince = await prisma.location.create({
    data: { name: 'Central Province', slug: 'central-province', type: 'PROVINCE' },
  });
  const kandyDistrict = await prisma.location.create({
    data: { name: 'Kandy', slug: 'kandy', type: 'DISTRICT', parentId: centralProvince.id },
  });
  const peradeniya = await prisma.location.create({
    data: { name: 'Peradeniya', slug: 'peradeniya', type: 'CITY', parentId: kandyDistrict.id },
  });
  const gampola = await prisma.location.create({
    data: { name: 'Gampola', slug: 'gampola', type: 'CITY', parentId: kandyDistrict.id },
  });

  // Western Province
  const westernProvince = await prisma.location.create({
    data: { name: 'Western Province', slug: 'western-province', type: 'PROVINCE' },
  });
  const colomboDistrict = await prisma.location.create({
    data: { name: 'Colombo', slug: 'colombo', type: 'DISTRICT', parentId: westernProvince.id },
  });
  const colombo03 = await prisma.location.create({
    data: { name: 'Colombo 03 (Kollupitiya)', slug: 'colombo-03', type: 'CITY', parentId: colomboDistrict.id },
  });
  const dehiwala = await prisma.location.create({
    data: { name: 'Dehiwala', slug: 'dehiwala', type: 'CITY', parentId: colomboDistrict.id },
  });

  // Southern Province
  const southernProvince = await prisma.location.create({
    data: { name: 'Southern Province', slug: 'southern-province', type: 'PROVINCE' },
  });
  const galleDistrict = await prisma.location.create({
    data: { name: 'Galle', slug: 'galle', type: 'DISTRICT', parentId: southernProvince.id },
  });
  const galleFort = await prisma.location.create({
    data: { name: 'Galle Fort', slug: 'galle-fort', type: 'CITY', parentId: galleDistrict.id },
  });
  const hikkaduwa = await prisma.location.create({
    data: { name: 'Hikkaduwa', slug: 'hikkaduwa', type: 'CITY', parentId: galleDistrict.id },
  });

  console.log('✓ Sri Lankan hierarchical locations created');

  // ---------------------------------------------------------
  // 3. CATEGORIES (10 Authentic Rural Categories)
  // ---------------------------------------------------------
  const categoriesData = [
    {
      name: 'Traditional Foods',
      slug: 'traditional-foods',
      description: 'Authentic Sri Lankan heritage foods, sweets, and traditional culinary items.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Authentic Traditional Foods & Sweets | OoruMart Sri Lanka',
      metaDescription: 'Order pure Jaffna palm sweets, traditional sesame rolls, and village treats online.',
    },
    {
      name: 'Organic Products',
      slug: 'organic-products',
      description: 'Locally grown, chemical-free organic produce and natural groceries.',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Certified Organic Village Groceries | OoruMart',
      metaDescription: 'Fresh farm-to-table organic products harvested by local Sri Lankan farmers.',
    },
    {
      name: 'Rice & Grains',
      slug: 'rice-grains',
      description: 'Indigenous ancient rice varieties (Mapillai Samba, Suwandel, Karunkuruvai) and natural millet.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Traditional Indigenous Rice & Ancient Grains | OoruMart',
      metaDescription: 'Nutrient-rich traditional heirloom rice directly from village paddies.',
    },
    {
      name: 'Honey',
      slug: 'honey',
      description: 'Raw unpasteurized bee honey harvested from wild forest blossoms and village apiaries.',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Pure Wild Forest Bee Honey | OoruMart Sri Lanka',
      metaDescription: '100% pure raw bee honey sustainably sourced from Vanni forests.',
    },
    {
      name: 'Coconut Products',
      slug: 'coconut-products',
      description: 'Wood-pressed virgin coconut oil, coconut jaggery, coconut butter, and husk crafts.',
      imageUrl: 'https://images.unsplash.com/photo-1520256862855-398228c41684?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Pure Wood-Pressed Virgin Coconut Oil | OoruMart',
      metaDescription: 'Traditional cold-pressed coconut oil and natural coconut goods.',
    },
    {
      name: 'Spices',
      slug: 'spices',
      description: 'Pure Ceylon cinnamon, Jaffna roasted curry powder, cardamom, and highland black pepper.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Authentic Pure Ceylon Spices & Curry Powders | OoruMart',
      metaDescription: 'High-aroma Ceylon spices directly milled by village spice artisans.',
    },
    {
      name: 'Handmade Products',
      slug: 'handmade-products',
      description: 'Handwoven palmyra baskets, clay pots, brass crafts, and eco-friendly home decor.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Traditional Handcrafted Village Goods & Palmyra Baskets | OoruMart',
      metaDescription: 'Support Sri Lankan rural artisans and weavers.',
    },
    {
      name: 'Agricultural Products',
      slug: 'agricultural-products',
      description: 'Village seeds, dried legumes, raw palmyra root flour (Odiyal), and natural farm produce.',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Natural Farm Produce & Agricultural Goods | OoruMart',
      metaDescription: 'Direct agricultural harvest from smallholder Sri Lankan farmers.',
    },
    {
      name: 'Herbal Products',
      slug: 'herbal-products',
      description: 'Ayurvedic herbal teas, moringa powders, sukku coffee, and herbal hair oils.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Ayurvedic Herbal Remedies & Wellness Teas | OoruMart',
      metaDescription: 'Traditional herbal health powders and immune boosters.',
    },
    {
      name: 'Local Gifts',
      slug: 'local-gifts',
      description: 'Authentic regional gift packs, traditional sweets boxes, and artisanal craft sets.',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      metaTitle: 'Authentic Sri Lankan Local Gift Hampers | OoruMart',
      metaDescription: 'Curated gift sets featuring village treasures and handmade delicacies.',
    },
  ];

  const categories: any = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.create({ data: c });
  }

  console.log('✓ 10 Categories created');

  // ---------------------------------------------------------
  // 4. USERS (1 Admin, 5 Approved Sellers, 10 Customers)
  // ---------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      name: 'OoruMart Platform Admin',
      email: 'admin@example.com',
      phone: '0771234567',
      password: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  });

  // 5 Verified Local Sellers
  const sellerUser1 = await prisma.user.create({
    data: {
      name: 'Sivakumaran Nadarajah',
      email: 'seller1@example.com',
      phone: '0778899111',
      password: defaultPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  const sellerProfile1 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser1.id,
      shopName: 'Yarl Nature Organics',
      slug: 'yarl-nature-organics',
      description: 'Authentic Jaffna palmyra goods, pure palm candy, homemade roasted curry powders, and organic northern spices.',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
      address: 'No. 45, Coast Road, Valvettithurai, Jaffna',
      locationId: valvettithurai.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      name: 'Kandasamy Thevendran',
      email: 'seller2@example.com',
      phone: '0778899222',
      password: defaultPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
  });

  const sellerProfile2 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser2.id,
      shopName: 'Vanni Forest Harvests & Pure Honey',
      slug: 'vanni-forest-harvests',
      description: 'Sustainably collected 100% raw wild bee honey and herbal powders from the lush forest belts of Kilinochchi and Mullaitivu.',
      logoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&auto=format&fit=crop&q=80',
      address: 'Main Street, Kilinochchi Town',
      locationId: kilinochchiTown.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const sellerUser3 = await prisma.user.create({
    data: {
      name: 'Mohamed Fazil',
      email: 'seller3@example.com',
      phone: '0778899333',
      password: defaultPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  const sellerProfile3 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser3.id,
      shopName: 'Eastern Heritage Rice & Grains',
      slug: 'eastern-heritage-grains',
      description: 'Traditional organic paddy varieties cultivated by Eastern smallholder farmer cooperatives without harmful pesticides.',
      logoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
      address: 'Rice Mill Road, Eravur, Batticaloa',
      locationId: eravur.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const sellerUser4 = await prisma.user.create({
    data: {
      name: 'Sunil Jayasundara',
      email: 'seller4@example.com',
      phone: '0778899444',
      password: defaultPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    },
  });

  const sellerProfile4 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser4.id,
      shopName: 'Upcountry Ayurvedic & Herbal Naturals',
      slug: 'upcountry-ayurvedic-naturals',
      description: 'Pure Kithul treacle, dried ginger herbal coffee (Sukku Kaapi), and organic botanical wellness teas from Kandy hills.',
      logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80',
      address: 'University Junction, Peradeniya, Kandy',
      locationId: peradeniya.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const sellerUser5 = await prisma.user.create({
    data: {
      name: 'Nalinda Perera',
      email: 'seller5@example.com',
      phone: '0778899555',
      password: defaultPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
  });

  const sellerProfile5 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser5.id,
      shopName: 'Ruhunu Clay & Handloom Crafts',
      slug: 'ruhunu-clay-handloom',
      description: 'Traditional wood-pressed coconut oils, handcrafted unglazed terracotta cookware, and woven home goods.',
      logoUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&auto=format&fit=crop&q=80',
      address: 'Church Street, Galle Fort, Galle',
      locationId: galleFort.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  console.log('✓ 5 Approved Sellers & Profiles created');

  // 10 Realistic Customers
  const customerNames = [
    { name: 'Kavitha Senthilvel', email: 'customer1@example.com', phone: '0771112233', locationId: colombo03.id, address: 'No. 12/A, Galle Road, Colombo 03' },
    { name: 'Tharindu Fernando', email: 'customer2@example.com', phone: '0772223344', locationId: dehiwala.id, address: '45 Hill Street, Dehiwala' },
    { name: 'Priya Rajendran', email: 'customer3@example.com', phone: '0773334455', locationId: nallur.id, address: '88 Temple Road, Nallur, Jaffna' },
    { name: 'Dinesh Wickramasinghe', email: 'customer4@example.com', phone: '0774445566', locationId: peradeniya.id, address: '22 River View, Peradeniya' },
    { name: 'Fathima Rameez', email: 'customer5@example.com', phone: '0775556677', locationId: kattankudy.id, address: '104 Beach Road, Kattankudy' },
    { name: 'Anuradha Bandara', email: 'customer6@example.com', phone: '0776667788', locationId: gampola.id, address: '15 Station Road, Gampola' },
    { name: 'Vithuran Kanagasabai', email: 'customer7@example.com', phone: '0777778899', locationId: pointPedro.id, address: '6 Harbor Road, Point Pedro' },
    { name: 'Dilani Samarawickrama', email: 'customer8@example.com', phone: '0778889900', locationId: galleFort.id, address: '3 Lighthouse Street, Galle' },
    { name: 'Bavithra Mohan', email: 'customer9@example.com', phone: '0779990011', locationId: chavadhcheri.id, address: '50 Main Road, Chavakachcheri' },
    { name: 'Kasun Rathnayake', email: 'customer10@example.com', phone: '0770001122', locationId: hikkaduwa.id, address: '99 Surf Point, Hikkaduwa' },
  ];

  const customers: any[] = [];
  for (const c of customerNames) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        password: defaultPasswordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name: c.name,
        phone: c.phone,
        addressLine: c.address,
        locationId: c.locationId,
        postalCode: '40000',
        isDefault: true,
      },
    });

    customers.push({ user, address });
  }

  console.log('✓ 10 Customers and default Addresses created');

  // ---------------------------------------------------------
  // 5. PRODUCTS (Tamil, English, Sinhala Unicode Support)
  // ---------------------------------------------------------
  const productsData = [
    {
      sellerId: sellerProfile1.id,
      categoryId: categories['traditional-foods'].id,
      name: 'யாழ்ப்பாண பனங்கற்கண்டு (Jaffna Palm Candy)',
      slug: 'jaffna-palm-candy-panang-karkandu',
      description: '100% தூய இயற்கை பனம்பாலில் இருந்து பாரம்பரிய முறையில் காய்ச்சப்பட்ட அசல் யாழ்ப்பாண பனங்கற்கண்டு. எந்தவித செயற்கை இனிப்புகளோ இரசாயனங்களோ கலக்கப்படாதது.',
      price: 850.0,
      stock: 45,
      minStock: 5,
      status: ProductStatus.ACTIVE,
      metaTitle: 'யாழ்ப்பாண பனங்கற்கண்டு | Pure Jaffna Palm Candy - OoruMart',
      metaDescription: 'Buy authentic Jaffna village panang karkandu online. 100% natural pure palmyra palm candy.',
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      sellerId: sellerProfile2.id,
      categoryId: categories['honey'].id,
      name: 'கிராமத்து தூய காட்டுத் தேன் (Pure Vanni Bee Honey)',
      slug: 'vanni-pure-wild-forest-bee-honey',
      description: 'வன்னி பெருங்காடுகளில் இயற்கை மரப்பொந்துகளில் இருந்து பழங்குடி மக்களால் சேகரிக்கப்பட்ட 100% அடர்ந்த சுத்தமான காட்டுத் தேன் (ගම් මී පැණි).',
      price: 1850.0,
      stock: 30,
      minStock: 4,
      status: ProductStatus.ACTIVE,
      metaTitle: 'கிராமத்து தூய தேன் | 100% Raw Wild Forest Honey - OoruMart',
      metaDescription: 'Direct harvest wild bee honey from Vanni forests. Pure, unheated, unpasteurized.',
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      sellerId: sellerProfile5.id,
      categoryId: categories['coconut-products'].id,
      name: 'இயற்கை மரச்செக்கு தேங்காய் எண்ணெய் (Cold-Pressed Virgin Coconut Oil)',
      slug: 'wood-pressed-virgin-coconut-oil',
      description: 'பாரம்பரிய மரச்செக்கில் ஆட்டப்பட்ட தூய முதல் தர தேங்காய் எண்ணெய். சமையலுக்கும் தலைமுடி பராமரிப்பிற்கும் சிறந்தது.',
      price: 1200.0,
      stock: 60,
      minStock: 10,
      status: ProductStatus.ACTIVE,
      metaTitle: 'மரச்செக்கு தேங்காய் எண்ணெய் | Pure Virgin Coconut Oil - OoruMart',
      metaDescription: 'Traditional cold-pressed coconut oil without additives or preservatives.',
      images: [
        'https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      sellerId: sellerProfile3.id,
      categoryId: categories['rice-grains'].id,
      name: 'பாரம்பரிய மாப்பிள்ளை சம்பா அரிசி (Mapillai Samba Rice)',
      slug: 'traditional-mapillai-samba-rice-1kg',
      description: 'இரத்த சோகையை நீக்கி, நரம்புகளுக்கு வலுவூட்டும் பழமையான பாரம்பரிய மாப்பிள்ளை சம்பா சிவப்பு அரிசி (පාරම්පරික සහල්). 1kg பாக்கெட்.',
      price: 480.0,
      stock: 120,
      minStock: 15,
      status: ProductStatus.ACTIVE,
      metaTitle: 'மாப்பிள்ளை சம்பா அரிசி | Traditional Mapillai Samba Heirloom Rice',
      metaDescription: 'Authentic pesticide-free traditional red rice rich in fiber and iron.',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      sellerId: sellerProfile1.id,
      categoryId: categories['handmade-products'].id,
      name: 'கைவினை பனை ஓலைக் கூடை (Handmade Palmyra Leaf Basket)',
      slug: 'handmade-palmyra-leaf-storage-basket',
      description: 'யாழ்ப்பாண கிராமிய கைவினைஞர்களால் நேர்த்தியாக பின்னப்பட்ட உறுதியான பனை ஓலைக் கூடை.',
      price: 650.0,
      stock: 25,
      minStock: 3,
      status: ProductStatus.ACTIVE,
      metaTitle: 'பனை ஓலைக் கூடை | Handwoven Palmyra Leaf Basket - OoruMart',
      metaDescription: 'Eco-friendly handwoven palmyra basket crafted by rural women artisans.',
      images: [
        'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80',
      ],
    },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const { images, ...productFields } = p;
    const product = await prisma.product.create({
      data: {
        ...productFields,
        productImages: {
          create: images.map((url, idx) => ({
            imageUrl: url,
            sortOrder: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    createdProducts.push(product);
  }

  console.log(`✓ Products created`);

  // Orders
  const cust1 = customers[0];
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'OM-20260816-1001',
      userId: cust1.user.id,
      addressId: cust1.address.id,
      subtotal: 850 * 2 + 1850 * 1,
      deliveryFee: 350.0,
      discount: 0,
      totalAmount: 850 * 2 + 1850 * 1 + 350.0,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
    },
  });

  const item1_1 = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      sellerId: sellerProfile1.id,
      productId: createdProducts[0].id,
      productName: createdProducts[0].name,
      quantity: 2,
      unitPrice: 850.0,
      subtotal: 1700.0,
    },
  });
  await prisma.sellerEarnings.create({
    data: {
      sellerId: sellerProfile1.id,
      orderItemId: item1_1.id,
      grossAmount: 1700.0,
      commissionAmount: 170.0,
      netAmount: 1530.0,
      payoutStatus: 'PAID',
    },
  });

  const item1_2 = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      sellerId: sellerProfile2.id,
      productId: createdProducts[1].id,
      productName: createdProducts[1].name,
      quantity: 1,
      unitPrice: 1850.0,
      subtotal: 1850.0,
    },
  });
  await prisma.sellerEarnings.create({
    data: {
      sellerId: sellerProfile2.id,
      orderItemId: item1_2.id,
      grossAmount: 1850.0,
      commissionAmount: 185.0,
      netAmount: 1665.0,
      payoutStatus: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      paymentMethod: 'ONLINE',
      gateway: 'PayHere Sandbox',
      transactionId: 'TXN-PAYHERE-OM-1001',
      amount: 850 * 2 + 1850 * 1 + 350.0,
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: order1.id, status: 'DELIVERED', note: 'Order delivered to recipient', changedBy: admin.id },
  });

  await prisma.review.create({
    data: {
      productId: createdProducts[0].id,
      userId: cust1.user.id,
      orderItemId: item1_1.id,
      rating: 5,
      comment: 'மிகவும் அசல் சுவை! யாழ்ப்பாணத்தில் வாங்குவது போலவே சுத்தமான பனங்கற்கண்டு.',
      status: 'VISIBLE',
    },
  });

  console.log('✓ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
