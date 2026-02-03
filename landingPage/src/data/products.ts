export type ProductCategory = 'silver-pens' | 'silver-phone-covers';

export interface ProductSpecifications {
    material: string;
    weight?: string;
    dimensions?: string;
    warranty?: string;
    [key: string]: string | undefined;
}

export interface Product {
    id: string;
    name: string;
    category: ProductCategory;
    categoryLabel: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    description: string;
    longDescription?: string;
    badge?: 'Bestseller' | 'New' | 'Limited Edition';
    features?: string[];
    specifications?: ProductSpecifications;
}

export const categories: { slug: ProductCategory; label: string }[] = [
    { slug: 'silver-pens', label: 'Silver Pens' },
    { slug: 'silver-phone-covers', label: 'Silver Phone Covers' },
];

export const products: Product[] = [
    // Silver Pens
    {
        id: 'pen-001',
        name: 'Executive Signature Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 12999,
        originalPrice: 15999,
        image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
            'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=800&q=80',
        ],
        description: 'Handcrafted 925 sterling silver pen with personalized engraving option',
        longDescription: 'Experience the pinnacle of writing luxury with our Executive Signature Pen. Meticulously handcrafted from 925 sterling silver, this pen is a statement of sophistication and success. Each pen undergoes rigorous quality checks and comes with a certificate of authenticity. Perfect for executives, professionals, and collectors who appreciate the finer things in life.',
        badge: 'Bestseller',
        features: [
            'Handcrafted from 925 sterling silver',
            'Personalized engraving available',
            'Smooth roller ball mechanism',
            'Comes with premium gift box',
            'Certificate of authenticity included',
        ],
        specifications: {
            material: '925 Sterling Silver',
            weight: '42 grams',
            dimensions: '14cm x 1.2cm',
            warranty: '2 Years',
        },
    },
    {
        id: 'pen-002',
        name: 'Classic Fountain Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 9999,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
        ],
        description: 'Elegant fountain pen with smooth ink flow and premium silver finish',
        longDescription: 'The Classic Fountain Pen combines timeless elegance with modern precision. Its 18K gold nib ensures smooth, consistent ink flow while the sterling silver body provides the perfect weight balance for extended writing sessions.',
        features: [
            '18K gold nib for smooth writing',
            'Sterling silver barrel and cap',
            'Converter and cartridge compatible',
            'Luxury presentation box',
        ],
        specifications: {
            material: '925 Sterling Silver with 18K Gold Nib',
            weight: '38 grams',
            dimensions: '13.5cm x 1.1cm',
            warranty: '2 Years',
        },
    },
    {
        id: 'pen-003',
        name: 'Premium Ballpoint',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 7499,
        image: 'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=800&q=80',
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
        ],
        description: 'Refined ballpoint pen perfect for everyday professional use',
        longDescription: 'A perfect balance of luxury and practicality, the Premium Ballpoint is designed for professionals who want to make a statement. Its reliable ballpoint mechanism ensures effortless writing every time.',
        badge: 'New',
        features: [
            'Twist-action ballpoint mechanism',
            'Ergonomic grip design',
            'Refillable with standard cartridges',
            'Polished silver finish',
        ],
        specifications: {
            material: '925 Sterling Silver',
            weight: '35 grams',
            dimensions: '13cm x 1cm',
            warranty: '1 Year',
        },
    },
    {
        id: 'pen-004',
        name: 'Heritage Collection Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 18999,
        originalPrice: 22999,
        image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80',
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
        ],
        description: 'Limited edition pen with intricate silver engravings and vintage design',
        longDescription: 'The Heritage Collection Pen is a masterpiece of artisanal craftsmanship. Featuring hand-engraved patterns inspired by traditional Indian motifs, this limited edition piece is numbered and comes with a heritage certificate.',
        badge: 'Limited Edition',
        features: [
            'Hand-engraved traditional patterns',
            'Limited edition numbered piece',
            'Heritage certificate included',
            'Collector\'s wooden case',
            'Lifetime warranty on mechanism',
        ],
        specifications: {
            material: '925 Sterling Silver with Oxidized Finish',
            weight: '48 grams',
            dimensions: '14.5cm x 1.3cm',
            warranty: 'Lifetime',
        },
    },
    {
        id: 'pen-005',
        name: 'Modern Minimalist Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 8499,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
        ],
        description: 'Sleek contemporary design with brushed silver finish',
        longDescription: 'Clean lines and understated elegance define the Modern Minimalist Pen. Its brushed silver finish and contemporary design make it perfect for the modern professional who values simplicity.',
        features: [
            'Brushed silver finish',
            'Minimalist contemporary design',
            'Lightweight for comfort',
            'Click mechanism',
        ],
        specifications: {
            material: '925 Sterling Silver (Brushed)',
            weight: '32 grams',
            dimensions: '13cm x 0.9cm',
            warranty: '1 Year',
        },
    },
    // Silver Phone Covers
    {
        id: 'cover-001',
        name: 'Classic Silver Case',
        category: 'silver-phone-covers',
        categoryLabel: 'Silver Phone Covers',
        price: 4999,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
        ],
        description: 'Premium silver-accented phone case with shock protection',
        longDescription: 'Protect your device in style with the Classic Silver Case. Featuring genuine sterling silver accents and military-grade shock absorption, this case offers the perfect blend of luxury and protection.',
        badge: 'Bestseller',
        features: [
            'Genuine silver accent frame',
            'Military-grade drop protection',
            'Wireless charging compatible',
            'Raised edges for screen protection',
        ],
        specifications: {
            material: 'Aircraft-grade Aluminum with Silver Accents',
            weight: '45 grams',
            warranty: '1 Year',
        },
    },
    {
        id: 'cover-002',
        name: 'Engraved Monogram Case',
        category: 'silver-phone-covers',
        categoryLabel: 'Silver Phone Covers',
        price: 6999,
        originalPrice: 8499,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        ],
        description: 'Personalized phone case with your initials in sterling silver',
        longDescription: 'Make your phone uniquely yours with the Engraved Monogram Case. Your initials are hand-engraved in sterling silver, creating a one-of-a-kind accessory that reflects your personal style.',
        badge: 'New',
        features: [
            'Hand-engraved sterling silver monogram',
            'Choose up to 3 initials',
            'Multiple font styles available',
            'Slim profile design',
        ],
        specifications: {
            material: 'Premium Polycarbonate with Sterling Silver Plate',
            weight: '38 grams',
            warranty: '1 Year',
        },
    },
    {
        id: 'cover-003',
        name: 'Platinum Shield Case',
        category: 'silver-phone-covers',
        categoryLabel: 'Silver Phone Covers',
        price: 5499,
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        ],
        description: 'Military-grade protection with elegant silver trim',
        longDescription: 'The Platinum Shield Case offers uncompromising protection without sacrificing style. Its reinforced corners and platinum-finished silver trim make it the choice for those who demand the best.',
        features: [
            'Platinum-finished silver trim',
            '6-foot drop protection tested',
            'Scratch-resistant coating',
            'Precise button cutouts',
        ],
        specifications: {
            material: 'Reinforced TPU with Platinum Silver Trim',
            weight: '42 grams',
            warranty: '2 Years',
        },
    },
    {
        id: 'cover-004',
        name: 'Luxury Leather & Silver',
        category: 'silver-phone-covers',
        categoryLabel: 'Silver Phone Covers',
        price: 8999,
        originalPrice: 10999,
        image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=80',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
        ],
        description: 'Premium Italian leather combined with silver hardware',
        longDescription: 'The epitome of luxury phone protection. Handcrafted from genuine Italian leather with sterling silver hardware, this case ages beautifully and develops a unique patina over time.',
        badge: 'Limited Edition',
        features: [
            'Genuine Italian leather',
            'Sterling silver corner protectors',
            'Card slot on back',
            'Develops unique patina',
            'Handstitched details',
        ],
        specifications: {
            material: 'Italian Leather with 925 Sterling Silver',
            weight: '55 grams',
            warranty: '2 Years',
        },
    },
];

export function getCategorySlug(title: string): ProductCategory {
    return title.toLowerCase().replace(/\s+/g, '-') as ProductCategory;
}

export function getCategoryLabel(slug: ProductCategory): string {
    const category = categories.find(c => c.slug === slug);
    return category?.label || slug;
}

export function getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
}

export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
    return products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, limit);
}
