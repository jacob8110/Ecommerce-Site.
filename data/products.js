const PRODUCTS = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Wireless Headphones",
    price: 349.99,
    originalPrice: 399.99,
    category: "Electronics",
    brand: "Sony",
    rating: 4.8,
    reviewCount: 2847,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&q=80"
    ],
    description: "Industry-leading noise canceling with two processors and eight microphones. Up to 30-hour battery life with quick charge. Lightweight foldable design.",
    features: ["30hr Battery", "ANC", "LDAC", "Multipoint"],
    inStock: true,
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Apple MacBook Air M3 13-inch",
    price: 1099.00,
    originalPrice: 1299.00,
    category: "Computers",
    brand: "Apple",
    rating: 4.9,
    reviewCount: 1523,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      "https://images.unsplash.com/photo-1611186871525-5cb2c0c18e45?w=600&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
    ],
    description: "Supercharged by M3 chip. Up to 18 hours of battery life. 13.6-inch Liquid Retina display. MagSafe charging. Fanless design.",
    features: ["M3 Chip", "18hr Battery", "8GB RAM", "256GB SSD"],
    inStock: true,
    badge: "New"
  },
  {
    id: 3,
    name: "Samsung 4K OLED Smart TV 55\"",
    price: 1299.99,
    originalPrice: 1599.99,
    category: "Electronics",
    brand: "Samsung",
    rating: 4.7,
    reviewCount: 983,
    
    images: [
      
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
      "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=600&q=80"
    ],
    description: "Quantum HDR OLED with neural quantum processor. Object tracking sound. Smart TV powered by Tizen OS with voice assistant support.",
    features: ["4K OLED", "120Hz", "Dolby Atmos", "SmartThings"],
    inStock: true,
    badge: "Sale"
  },
  {
    id: 4,
    name: "Nike Air Max 270 React",
    price: 149.99,
    originalPrice: 179.99,
    category: "Fashion",
    brand: "Nike",
    rating: 4.6,
    reviewCount: 4201,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
      "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=600&q=80"
    ],
    description: "The Nike Air Max 270 React combines two of Nike's most innovative cushioning technologies. React foam provides lightweight bounce.",
    features: ["Air Max Unit", "React Foam", "Mesh Upper", "All-Day Comfort"],
    inStock: true,
    badge: "Popular"
  },
  {
    id: 5,
    name: "Canon EOS R10 Mirrorless Camera",
    price: 879.99,
    originalPrice: 979.99,
    category: "Photography",
    brand: "Canon",
    rating: 4.7,
    reviewCount: 567,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80"
    ],
    description: "24.2MP APS-C sensor with DIGIC X image processor. Up to 23fps with electronic shutter. 4K video recording. Vari-angle touchscreen LCD.",
    features: ["24.2MP", "4K Video", "23fps", "Eye AF"],
    inStock: true,
    badge: null
  },
  {
    id: 6,
    name: "Dyson V15 Detect Absolute",
    price: 699.99,
    originalPrice: 749.99,
    category: "Home",
    brand: "Dyson",
    rating: 4.8,
    reviewCount: 1892,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80"
    ],
    description: "Laser reveals microscopic dust. Piezo sensor counts particles. LCD screen shows real-time scientific proof of a deep clean.",
    features: ["Laser Dust Detection", "LCD Screen", "HEPA Filter", "60min Battery"],
    inStock: true,
    badge: "Best Seller"
  },
  {
    id: 7,
    name: "iPad Pro 12.9\" M2 Wi-Fi 256GB",
    price: 1099.00,
    originalPrice: 1199.00,
    category: "Computers",
    brand: "Apple",
    rating: 4.9,
    reviewCount: 2134,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80"
    ],
    description: "The ultimate iPad experience. M2 chip. Stunning 12.9-inch Liquid Retina XDR display. ProMotion technology. Apple Pencil hover.",
    features: ["M2 Chip", "12.9\" XDR", "ProMotion", "Thunderbolt 4"],
    inStock: false,
    badge: "New"
  },
  {
    id: 8,
    name: "Logitech MX Master 3S Mouse",
    price: 99.99,
    originalPrice: 109.99,
    category: "Computers",
    brand: "Logitech",
    rating: 4.8,
    reviewCount: 3456,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"
    ],
    description: "8K DPI sensor on any surface. Ultra-fast MagSpeed scroll. Whisper-quiet clicks. Ergonomic design for all-day comfort.",
    features: ["8K DPI", "MagSpeed Scroll", "Quiet Clicks", "70-Day Battery"],
    inStock: true,
    badge: null
  },
  {
    id: 9,
    name: "Instant Pot Duo 7-in-1",
    price: 79.99,
    originalPrice: 99.99,
    category: "Home",
    brand: "Instant Pot",
    rating: 4.7,
    reviewCount: 8923,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80",
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80"
    ],
    description: "7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.",
    features: ["7-in-1", "6 Quart", "14 Programs", "Safety Certified"],
    inStock: true,
    badge: "Sale"
  },
  {
    id: 10,
    name: "Levi's 511 Slim Fit Jeans",
    price: 69.99,
    originalPrice: 89.99,
    category: "Fashion",
    brand: "Levi's",
    rating: 4.5,
    reviewCount: 5621,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80"
    ],
    description: "Slim fit with a slightly tapered leg. Sits at waist. Made with stretch denim for all-day comfort. Classic 5-pocket styling.",
    features: ["Slim Fit", "Stretch Denim", "Classic Style", "Versatile"],
    inStock: true,
    badge: null
  },
  {
    id: 11,
    name: "Nespresso Vertuo Plus Coffee Machine",
    price: 169.99,
    originalPrice: 199.99,
    category: "Home",
    brand: "Nespresso",
    rating: 4.6,
    reviewCount: 3102,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80"
    ],
    description: "Centrifusion technology for barista-quality coffee. 5 cup sizes. 40-second heat up time. Automatic capsule ejection.",
    features: ["Centrifusion Tech", "5 Cup Sizes", "40s Heat Up", "Auto Eject"],
    inStock: true,
    badge: null
  },
  {
    id: 12,
    name: "DJI Mini 4 Pro Drone",
    price: 759.00,
    originalPrice: 799.00,
    category: "Photography",
    brand: "DJI",
    rating: 4.9,
    reviewCount: 892,
    images: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&q=80",
      "https://images.unsplash.com/photo-1506947411487-a56738267384?w=600&q=80",
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80"
    ],
    description: "Under 249g foldable drone with 4K/60fps video. Omnidirectional obstacle sensing. 34-minute flight time. ActiveTrack 360°.",
    features: ["4K/60fps", "249g Weight", "34min Flight", "Obstacle Sensing"],
    inStock: true,
    badge: "New"
  }
];