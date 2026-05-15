export type ProductCategory = 'silver-pens';

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
        description: 'Handcrafted silver coating pen with personalized engraving option',
        longDescription: 'Experience the pinnacle of writing luxury with our Executive Signature Pen. Meticulously handcrafted from silver coating, this pen is a statement of sophistication and success. Each pen undergoes rigorous quality checks and comes with a certificate of authenticity. Perfect for executives, professionals, and collectors who appreciate the finer things in life.',
        badge: 'Bestseller',
        features: [
            'Handcrafted from silver coating',
            'Personalized engraving available',
            'Smooth roller ball mechanism',
            'Comes with premium gift box',
            'Certificate of authenticity included',
        ],
        specifications: {
            material: 'silver coating',
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
        longDescription: 'The Classic Fountain Pen combines timeless elegance with modern precision. Its 18K gold nib ensures smooth, consistent ink flow while the silver coating body provides the perfect weight balance for extended writing sessions.',
        features: [
            '18K gold nib for smooth writing',
            'silver coating barrel and cap',
            'Converter and cartridge compatible',
            'Luxury presentation box',
        ],
        specifications: {
            material: 'silver coating with 18K Gold Nib',
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
            material: 'silver coating',
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
            material: 'silver coating with Oxidized Finish',
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
            material: 'silver coating (Brushed)',
            weight: '32 grams',
            dimensions: '13cm x 0.9cm',
            warranty: '1 Year',
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
