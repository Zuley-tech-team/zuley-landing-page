import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { HomePage, ProductsPage, ProductDetailPage, OrderSuccessPage, TrackOrderPage, PrivacyPolicyPage, RefundPolicyPage, ShippingPolicyPage, TermsConditionsPage } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />

        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
