import { Navbar } from '../components/common';
import {
    ProductSpotlight,
    CategorySection,
    PersonalizationSection,
    CraftsmanshipSection,
    CorporateSection,
    TestimonialsSection,
    Footer,
    HeroSection1,
} from '../components/home';

export function HomePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl overflow-x-hidden">
                <HeroSection1 />
                <ProductSpotlight />
                <CategorySection />
                <PersonalizationSection />
                <CraftsmanshipSection />
                <CorporateSection />
                <TestimonialsSection />
                <Footer />
            </main>
        </>
    );
}

export default HomePage;
