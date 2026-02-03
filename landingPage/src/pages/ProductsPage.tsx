import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { CategoryFilter, ProductsGrid } from '../components/products';
import { products, type ProductCategory } from '../data/products';

export function ProductsPage() {
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category') as ProductCategory | null;

    // Filter products based on URL query
    const filteredProducts = categoryFilter
        ? products.filter((product) => product.category === categoryFilter)
        : products;

    // Get page title based on filter
    const getTitle = () => {
        if (!categoryFilter) return 'Our Collection';
        switch (categoryFilter) {
            case 'silver-pens':
                return 'Silver Pens';
            case 'silver-phone-covers':
                return 'Silver Phone Covers';
            default:
                return 'Our Collection';
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                {/* Hero Section */}
                <section className="py-12 md:py-16 lg:py-10 bg-gradient-to-b from-primary-light/30 to-pearl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10">
                            <span className="inline-block px-3 py-1 mb-3 bg-charcoal/5 rounded-full font-body text-xs text-charcoal/60 uppercase tracking-wider">
                                Shop Now
                            </span>
                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                                {getTitle()}
                            </h1>
                            <p className="font-body text-base md:text-lg text-charcoal/60 max-w-2xl mx-auto">
                                Discover our exquisite collection of handcrafted silver accessories. Each piece is a testament to timeless elegance and superior craftsmanship.
                            </p>
                        </div>

                        {/* Category Filter */}
                        <div className="flex justify-center mb-10">
                            <CategoryFilter />
                        </div>
                    </div>
                </section>

                {/* Products Grid Section */}
                <section className="pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Results Count */}
                        <div className="mb-8">
                            <p className="font-body text-sm text-charcoal/60">
                                Showing <span className="font-medium text-charcoal">{filteredProducts.length}</span> products
                            </p>
                        </div>

                        {/* Products Grid */}
                        <ProductsGrid products={filteredProducts} />
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}

export default ProductsPage;
