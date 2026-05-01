import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { CategoryFilter, ProductsGrid } from '../components/products';
import { fetchProducts, type Product, type ProductCategory } from '../api/products';
import { Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';

type SortOption = 'bestsellers' | 'newest' | 'priceLowToHigh' | 'priceHighToLow' | 'nameAZ';
type PriceRange = 'all' | 'under5000' | '5000to10000' | '10000to15000' | 'above15000';

const PAGE_SIZE = 8;

const inPriceRange = (price: number, range: PriceRange) => {
    if (range === 'all') return true;
    if (range === 'under5000') return price < 5000;
    if (range === '5000to10000') return price >= 5000 && price <= 10000;
    if (range === '10000to15000') return price > 10000 && price <= 15000;
    return price > 15000;
};

export function ProductsPage() {
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category') as ProductCategory | null;

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('bestsellers');
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const data = await fetchProducts();
                if (!cancelled) {
                    setAllProducts(data);
                }
            } catch (error) {
                console.error('Failed to load products:', error);
                if (!cancelled) {
                    setErrorMessage('Unable to load products right now. Please try again in a moment.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [categoryFilter, sortBy, priceRange]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allProducts.length };
        allProducts.forEach((product) => {
            counts[product.category] = (counts[product.category] || 0) + 1;
        });
        return counts;
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        const filtered = allProducts.filter((product) => {
            if (categoryFilter && product.category !== categoryFilter) {
                return false;
            }

            if (!inPriceRange(product.price, priceRange)) {
                return false;
            }

            return true;
        });

        const sorted = [...filtered];
        if (sortBy === 'priceLowToHigh') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'priceHighToLow') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'nameAZ') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'newest') {
            sorted.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
        } else {
            sorted.sort((a, b) => (b.badge === 'Bestseller' ? 1 : 0) - (a.badge === 'Bestseller' ? 1 : 0));
        }

        return sorted;
    }, [allProducts, categoryFilter, priceRange, sortBy]);

    const visibleProducts = useMemo(
        () => filteredProducts.slice(0, visibleCount),
        [filteredProducts, visibleCount]
    );

    const hasMoreProducts = visibleCount < filteredProducts.length;

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
                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                                {getTitle()}
                            </h1>
                            <p className="font-body text-base md:text-lg text-charcoal/60 max-w-2xl mx-auto">
                                Discover our exquisite collection of handcrafted silver accessories. Each piece is a testament to timeless elegance and superior craftsmanship.
                            </p>
                        </div>

                        {/* Category Filter */}
                        <div className="flex justify-center mb-10">
                            <CategoryFilter counts={categoryCounts} />
                        </div>

                        {/* Filter and Sort Toolbar */}
                        <div className="rounded-2xl border border-charcoal/10 bg-white p-4 md:p-5 shadow-soft">
                            <div className="flex items-center gap-2 mb-4 text-charcoal/70">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="font-body text-sm uppercase tracking-wider">Filter and Sort</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                                    className="rounded-xl border border-charcoal/20 px-3 py-2.5 font-body text-sm text-charcoal bg-white"
                                >
                                    <option value="bestsellers">Sort: Best Sellers</option>
                                    <option value="newest">Sort: New Arrivals</option>
                                    <option value="priceLowToHigh">Sort: Price Low to High</option>
                                    <option value="priceHighToLow">Sort: Price High to Low</option>
                                    <option value="nameAZ">Sort: Name A to Z</option>
                                </select>

                                <select
                                    value={priceRange}
                                    onChange={(event) => setPriceRange(event.target.value as PriceRange)}
                                    className="rounded-xl border border-charcoal/20 px-3 py-2.5 font-body text-sm text-charcoal bg-white"
                                >
                                    <option value="all">Price: All</option>
                                    <option value="under5000">Under Rs. 5,000</option>
                                    <option value="5000to10000">Rs. 5,000 - Rs. 10,000</option>
                                    <option value="10000to15000">Rs. 10,000 - Rs. 15,000</option>
                                    <option value="above15000">Above Rs. 15,000</option>
                                </select>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Grid Section */}
                <section className="pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Results Count */}
                        <div className="mb-8">
                            <p className="font-body text-sm text-charcoal/60">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading products...
                                    </span>
                                ) : errorMessage ? (
                                    <span className="text-error">{errorMessage}</span>
                                ) : (
                                    <>
                                        Showing <span className="font-medium text-charcoal">{Math.min(visibleCount, filteredProducts.length)}</span> of{' '}
                                        <span className="font-medium text-charcoal">{filteredProducts.length}</span> products
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-charcoal/40" />
                            </div>
                        ) : (
                            <>
                                <ProductsGrid
                                    products={visibleProducts}
                                    emptyTitle={errorMessage ? 'Unable to Load Collection' : 'No Products Found'}
                                    emptyDescription={
                                        errorMessage
                                            ? 'Please refresh the page or try again shortly.'
                                            : 'Try adjusting your filters or clear all selections to explore more products.'
                                    }
                                />

                                {hasMoreProducts && (
                                    <div className="flex justify-center mt-10">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal px-6 py-3 font-body text-sm text-charcoal hover:bg-charcoal hover:text-pearl transition-colors"
                                            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Load More Products
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <Footer />

            </main>
        </>
    );
}

export default ProductsPage;
