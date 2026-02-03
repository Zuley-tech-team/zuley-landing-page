import { Navbar } from '../components/common';
import {
    // HeroSection,
    ProductSpotlight,
    CategorySection,
    PersonalizationSection,
    GiftingSection,
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
                <CategorySection />
                <ProductSpotlight />
                <PersonalizationSection />
                <GiftingSection />
                <CraftsmanshipSection />
                <CorporateSection />
                <TestimonialsSection />
                <Footer />
            </main>
        </>
    );
}

export default HomePage;
