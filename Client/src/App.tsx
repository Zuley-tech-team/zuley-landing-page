import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { useEffect, lazy, Suspense, type ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { PageMeta } from './components/common/PageMeta';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const CorporatePage = lazy(() => import('./pages/CorporatePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/legal/ShippingPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/legal/TermsConditionsPage'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminLeadsPage = lazy(() => import('./pages/admin/AdminLeadsPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminProtectedRoute = lazy(() => import('./pages/admin/AdminProtectedRoute'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-pearl">
    <div className="w-10 h-10 rounded-full border-4 border-charcoal/20 border-t-charcoal animate-spin" />
  </div>
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

const withMeta = (
  element: ReactElement,
  title: string,
  description: string,
  path: string
) => (
  <PageMeta title={title} description={description} path={path}>
    {element}
  </PageMeta>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<RouteLoader />}>
          <ScrollToTop />
          <AuthModal />
          <Routes>
          <Route
            path="/"
            element={withMeta(
              <HomePage />,
              'Zuley',
              'Shop premium personalized silver pens and accessories for milestone gifting and everyday elegance.',
              '/'
            )}
          />
          <Route
            path="/products"
            element={withMeta(
              <ProductsPage />,
              'Shop Silver Products',
              'Explore Zuley premium silver pens crafted for gifting and personal use.',
              '/products'
            )}
          />
          <Route
            path="/products/:id"
            element={withMeta(
              <ProductDetailPage />,
              'Product Details',
              'View product details, personalization options, and checkout for premium silver plated accessories.',
              '/products'
            )}
          />
          <Route
            path="/corporate"
            element={withMeta(
              <CorporatePage />,
              'Corporate and Bulk Gifting',
              'Request branded silver gift solutions for teams, clients, and enterprise gifting programs.',
              '/corporate'
            )}
          />
          <Route
            path="/about"
            element={withMeta(
              <AboutPage />,
              'About Zuley',
              'Learn about Zuley, our silver craftsmanship philosophy, and our quality commitments.',
              '/about'
            )}
          />
          <Route
            path="/contact"
            element={withMeta(
              <ContactPage />,
              'Contact Support',
              'Reach Zuley support for order help, product queries, personalization guidance, and corporate enquiries.',
              '/contact'
            )}
          />
          <Route
            path="/reviews"
            element={withMeta(
              <ReviewsPage />,
              'Customer Reviews',
              'Read authentic customer experiences and testimonials for personalized silver gifting.',
              '/reviews'
            )}
          />
          <Route
            path="/order-success"
            element={withMeta(
              <OrderSuccessPage />,
              'Order Success',
              'Your Zuley order has been placed successfully. Review your next steps and support options.',
              '/order-success'
            )}
          />
          <Route
            path="/track-order"
            element={withMeta(
              <TrackOrderPage />,
              'Track Your Order',
              'Track your Zuley order status using your order ID and shipping details.',
              '/track-order'
            )}
          />

          <Route
            path="/privacy-policy"
            element={withMeta(
              <PrivacyPolicyPage />,
              'Privacy Policy',
              'Read how Zuley collects, uses, and protects your personal information.',
              '/privacy-policy'
            )}
          />
          <Route
            path="/refund-policy"
            element={withMeta(
              <RefundPolicyPage />,
              'Refund and Cancellation Policy',
              'Review cancellation, return, and refund rules for orders placed on zuley.in.',
              '/refund-policy'
            )}
          />
          <Route
            path="/shipping-policy"
            element={withMeta(
              <ShippingPolicyPage />,
              'Shipping and Delivery Policy',
              'See order processing, delivery timelines, and shipping terms for Zuley products.',
              '/shipping-policy'
            )}
          />
          <Route
            path="/terms"
            element={withMeta(
              <TermsConditionsPage />,
              'Terms and Conditions',
              'Read the terms governing your use of zuley.in and your purchases from Zuley.',
              '/terms'
            )}
          />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
               <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="leads" element={<AdminLeadsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
            </Route>
          </Route>

          <Route
            path="/profile"
            element={withMeta(
              <ProfilePage />,
              'My Profile',
              'Manage your Zuley account details.',
              '/profile'
            )}
          />

          <Route
            path="/orders"
            element={withMeta(
              <OrdersPage />,
              'My Orders',
              'View and track your Zuley orders.',
              '/orders'
            )}
          />
        </Routes>
      </Suspense>
    </AuthProvider>
    </Router>
  );
}

export default App;
