import { lazy, Suspense, type ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { PageMeta } from './components/common/PageMeta';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const CustomizePage = lazy(() => import('./pages/CustomizePage'));
const CorporatePage = lazy(() => import('./pages/CorporatePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CraftsmanshipPage = lazy(() => import('./pages/CraftsmanshipPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
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
const AdminProtectedRoute = lazy(() => import('./pages/admin/AdminProtectedRoute'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-pearl">
    <div className="w-10 h-10 rounded-full border-4 border-charcoal/20 border-t-charcoal animate-spin" />
  </div>
);

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
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route
            path="/"
            element={withMeta(
              <HomePage />,
              'Personalized Silver Gifts in India',
              'Shop premium personalized silver pens and accessories for milestone gifting and everyday elegance.',
              '/'
            )}
          />
          <Route
            path="/products"
            element={withMeta(
              <ProductsPage />,
              'Shop Silver Products',
              'Explore Zuley silver pens and silver phone covers crafted for premium gifting and personal use.',
              '/products'
            )}
          />
          <Route
            path="/products/:id"
            element={withMeta(
              <ProductDetailPage />,
              'Product Details',
              'View product details, personalization options, and checkout for premium silver accessories.',
              '/products'
            )}
          />
          <Route
            path="/customize"
            element={withMeta(
              <CustomizePage />,
              'Customize Your Silver Gift',
              'Personalize silver gifts with names, initials, dates, and custom engraving styles.',
              '/customize'
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
            path="/craftsmanship"
            element={withMeta(
              <CraftsmanshipPage />,
              'Craftsmanship and Quality',
              'Discover our 925 silver standards, production process, engraving quality, and care guidance.',
              '/craftsmanship'
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
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="leads" element={<AdminLeadsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
