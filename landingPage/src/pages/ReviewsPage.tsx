import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { fetchTestimonials, type TestimonialItem } from '../api/engagement';

export function ReviewsPage() {
    const [stories, setStories] = useState<TestimonialItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadTestimonials = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await fetchTestimonials();
                if (mounted) {
                    setStories(data);
                }
            } catch (error) {
                if (mounted) {
                    setErrorMessage(error instanceof Error ? error.message : 'Unable to load testimonials right now.');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTestimonials();

        return () => {
            mounted = false;
        };
    }, []);

    const averageRating = useMemo(() => {
        if (stories.length === 0) {
            return 4.9;
        }

        const total = stories.reduce((sum, story) => sum + story.rating, 0);
        return Math.round((total / stories.length) * 10) / 10;
    }, [stories]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="bg-white border-b border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-16 md:py-22">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal">Stories from Our Community</h1>
                        <p className="font-body text-lg text-charcoal/70 mt-5 max-w-3xl">
                            Real gifting moments from customers who chose personalized silver for milestones, recognition, and everyday elegance.
                        </p>
                        <div className="flex items-center gap-2 mt-6">
                            {[1, 2, 3, 4, 5].map((index) => (
                                <Star key={index} className="w-5 h-5 text-amber-500" fill="currentColor" />
                            ))}
                            <span className="font-body text-charcoal/70">{averageRating} out of 5 average customer rating</span>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    {isLoading && (
                        <div className="text-center font-body text-charcoal/65">Loading customer stories...</div>
                    )}

                    {!isLoading && errorMessage && (
                        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-center font-body text-danger">
                            {errorMessage}
                        </div>
                    )}

                    {!isLoading && !errorMessage && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stories.map((story) => (
                                <article key={`${story.name}-${story.city || 'unknown'}`} className="bg-white rounded-2xl p-7 border border-charcoal/10 shadow-soft">
                                    <p className="font-body text-charcoal/75 leading-relaxed">"{story.quote}"</p>
                                    <p className="font-heading text-charcoal font-semibold mt-5">
                                        {story.name}{story.city ? `, ${story.city}` : ''}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}

export default ReviewsPage;
