import { type Product } from '../../api/products';
import { ProductCard } from './ProductCard';
import { PackageX } from 'lucide-react';

interface ProductsGridProps {
    products: Product[];
    emptyTitle?: string;
    emptyDescription?: string;
}

export function ProductsGrid({
    products,
    emptyTitle = 'No Products Found',
    emptyDescription = "We couldn't find any products matching your filter. Try adjusting your filters.",
}: ProductsGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 mb-6 rounded-full bg-primary-light/50 flex items-center justify-center">
                    <PackageX className="w-10 h-10 text-charcoal/40" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">
                    {emptyTitle}
                </h3>
                <p className="font-body text-charcoal/60 text-center max-w-md">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
            ))}
        </div>
    );
}

export default ProductsGrid;
