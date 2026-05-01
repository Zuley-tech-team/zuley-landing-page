import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { fetchTestimonials, type TestimonialItem } from '../api/engagement';
import { fetchReviews, type ReviewItem } from '../api/reviews';

export function ReviewsPage() {
    const [stories, setStories] = useState<TestimonialItem[]>([]);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadTestimonials = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const reviewResponse = await fetchReviews({ limit: 30 });
                const reviewData = reviewResponse.data || [];

                if (reviewData.length > 0) {
                    if (mounted) {
                        setReviews(reviewData);
                        setStories([]);
                    }
                    return;
                }

                const data = await fetchTestimonials();
                if (mounted) {
                    setStories(data);
                    setReviews([]);
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
        if (reviews.length === 0 && stories.length === 0) {
            return 4.9;
        }

        if (reviews.length > 0) {
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            return Math.round((total / reviews.length) * 10) / 10;
        }

        const total = stories.reduce((sum, story) => sum + story.rating, 0);
        const calculated = Math.round((total / stories.length) * 10) / 10;
        return Math.max(4.9, calculated);
    }, [stories, reviews]);

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

                    {!isLoading && !errorMessage && reviews.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <article key={review._id} className="bg-white rounded-2xl p-7 border border-charcoal/10 shadow-soft">
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <Star key={index} className={`w-4 h-4 ${index <= review.rating ? 'text-amber-500' : 'text-charcoal/20'}`} fill={index <= review.rating ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <p className="font-body text-charcoal/75 leading-relaxed">"{review.comment}"</p>
                                    {review.images?.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {review.images.slice(0, 3).map((image) => (
                                                <img key={image.public_id} src={image.url} alt={review.product_name} className="h-20 w-full rounded-lg object-cover" />
                                            ))}
                                        </div>
                                    )}
                                    <p className="font-heading text-charcoal font-semibold mt-5">
                                        {review.customer_name}{review.customer_city ? `, ${review.customer_city}` : ''}
                                    </p>
                                    <p className="font-body text-xs text-charcoal/50 mt-1">{review.product_name}</p>
                                </article>
                            ))}
                        </div>
                    )}

                    {!isLoading && !errorMessage && reviews.length === 0 && (
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
