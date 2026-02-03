import { useSearchParams } from 'react-router-dom';
import { categories, type ProductCategory } from '../../data/products';

export function CategoryFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('category') as ProductCategory | null;

    const handleCategoryChange = (slug: ProductCategory | null) => {
        if (slug) {
            setSearchParams({ category: slug });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* All Button */}
            <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 cursor-pointer ${!currentCategory
                        ? 'bg-charcoal text-pearl shadow-soft'
                        : 'bg-white text-charcoal border border-charcoal/20 hover:border-charcoal/40 hover:bg-primary-light/30'
                    }`}
            >
                All Products
            </button>

            {/* Category Buttons */}
            {categories.map((category) => (
                <button
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 cursor-pointer ${currentCategory === category.slug
                            ? 'bg-charcoal text-pearl shadow-soft'
                            : 'bg-white text-charcoal border border-charcoal/20 hover:border-charcoal/40 hover:bg-primary-light/30'
                        }`}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
}

export default CategoryFilter;
