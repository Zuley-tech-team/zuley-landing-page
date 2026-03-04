# Frontend Integration Plan — Zuley Landing Page × Backend

> Full roadmap for integrating the backend (Phases 1–4) with the landing page.  
> Work is split into **small chunks** to be done sequentially.

---

## Chunk 1: Buy Now → Razorpay Checkout ✅ DONE

**Backend Phase:** Phase 1 (Payment System)

| What | Status |
|------|--------|
| Razorpay SDK in `index.html` | ✅ |
| API layer (`src/api/payment.ts`) | ✅ |
| `useRazorpay` hook | ✅ |
| `CheckoutModal` (form + validation + success view) | ✅ |
| Wire `ProductDetailPage` "Buy Now" button | ✅ |
| `.env.development` with `VITE_API_BASE_URL` | ✅ |

---

## Chunk 2: Order Confirmation Page ✅ DONE

**Backend Phase:** Phase 2 (Order System)  
**Backend Endpoints Used:** None directly (uses payment ID returned by Razorpay on client)  
**Why:** After payment, users see a success toast inside the modal but have no dedicated confirmation page. This gives them a proper receipt page they can bookmark/share.

| Task | Details |
|------|---------|
| Create `/order-success` page | Shows order confirmation with payment ID, product summary, estimated delivery |
| Redirect after payment | After Razorpay success callback, navigate to `/order-success?payment_id=xxx` |
| Add route in `App.tsx` | `<Route path="/order-success" element={<OrderSuccessPage />} />` |
| Design | Full-page with checkmark animation, order summary card, "Continue Shopping" CTA |

**Files:**
- `src/pages/OrderSuccessPage.tsx` (NEW)
- `src/pages/index.ts` (MODIFY — add export)
- `src/App.tsx` (MODIFY — add route)
- `src/components/checkout/CheckoutModal.tsx` (MODIFY — redirect instead of inline success)

---

## Chunk 3: Order Tracking Page (Customer-Facing) ✅ DONE

**Backend Phase:** Phase 2 (Order System) + Phase 3 (Customer Data)  
**Backend Endpoints Needed:** A new **public** endpoint for order lookup (currently all order APIs are admin-only).

> [!WARNING]
> The backend currently has order retrieval **only** behind admin auth (`GET /api/v1/admin/orders/:id`).  
> For customer-facing order tracking, we need **one new public endpoint**:  
> `GET /api/v1/orders/:orderId/track` — returns order status, shipping info, and history (no admin auth).

| Task | Details |
|------|---------|
| **Backend**: Add public order tracking endpoint | `GET /api/v1/orders/:orderId/track` returns status, shipping details, history |
| Create `/track-order` page | Input field for order ID (ZUL-YYMMDD-XXXX format) |
| Order status display component | Visual timeline showing: Paid → Shipped → In Transit → Delivered |
| Shipping info display | Courier name, tracking number, tracking URL link |
| API layer | `src/api/orders.ts` with `getOrderStatus(orderId)` |
| Add link in Navbar | "Track Order" link |
| Add route in `App.tsx` | `<Route path="/track-order" element={<TrackOrderPage />} />` |

**Files:**
- **Backend**: `src/routes/v1/index.ts` (MODIFY), new public order route
- `src/api/orders.ts` (NEW)
- `src/pages/TrackOrderPage.tsx` (NEW)
- `src/components/tracking/OrderTimeline.tsx` (NEW)
- `src/components/tracking/ShippingCard.tsx` (NEW)
- `src/components/common/Navbar.tsx` (MODIFY — add Track Order link)
- `src/App.tsx` (MODIFY)

---

## Chunk 4: Product Stock Availability (Inventory Display) ✅ DONE

**Backend Phase:** Phase 4 (Inventory Management)  
**Backend Endpoints Needed:** A new **public** endpoint for stock check.

> [!WARNING]
> Inventory endpoints are admin-only. We need:  
> `GET /api/v1/inventory/:sku/availability` — returns `{ inStock: boolean, quantity?: number }`

| Task | Details |
|------|---------|
| **Backend**: Add public stock check endpoint | Returns in-stock status for a given SKU |
| Show stock status on ProductDetailPage | "In Stock" badge or "Out of Stock" with disabled Buy Now |
| Show stock status on ProductCard | Small badge indicator |
| API layer | `src/api/inventory.ts` with `checkStock(sku)` |
| Hook | `useStockStatus(sku)` — fetches on mount, caches result |

**Files:**
- **Backend**: New public inventory route
- `src/api/inventory.ts` (NEW)
- `src/hooks/useStockStatus.ts` (NEW)
- `src/pages/ProductDetailPage.tsx` (MODIFY — stock badge + disable Buy Now if out of stock)
- `src/components/products/ProductCard.tsx` (MODIFY — stock indicator)

---

## Chunk 5: Toast/Notification System ✅ DONE

**Backend Phase:** Cross-cutting concern  
**Why:** Currently errors show inline in the modal. A global toast system improves UX across all features — payment errors, order tracking errors, success messages, etc.

| Task | Details |
|------|---------|
| Create Toast component | Slide-in from top-right, auto-dismiss, success/error/info variants |
| Create ToastContext provider | Global state for showing toasts from any component |
| Integrate across existing features | Replace inline error messages where appropriate |

**Files:**
- `src/components/common/Toast.tsx` (NEW)
- `src/components/common/Toast.css` (NEW)
- `src/contexts/ToastContext.tsx` (NEW)
- `src/main.tsx` (MODIFY — wrap with ToastProvider)
- `src/components/common/index.ts` (MODIFY — export Toast)

---

## Summary & Priority Order

| # | Chunk | Backend Phase | New Backend Work? | Estimated Effort |
|---|-------|--------------|-------------------|-----------------|
| 1 | ✅ Buy Now → Razorpay Checkout | Phase 1 | No | Done |
| 2 | ✅ Order Confirmation Page | Phase 2 | No | Done |
| 3 | ✅ Order Tracking Page | Phase 2+3 | Yes (1 endpoint) | Done |
| 4 | ✅ Product Stock Availability | Phase 4 | Yes (1 endpoint) | Done |
| 5 | ✅ Toast/Notification System | Cross-cutting | No | Done |

> [!NOTE]
> **Chunks 2 and 5** are frontend-only and can be done immediately.  
> **Chunks 3 and 4** need a small backend addition (one public endpoint each) before frontend work.  
> Recommended order: **2 → 5 → 3 → 4** (smallest to biggest, backend-dependent ones last).
