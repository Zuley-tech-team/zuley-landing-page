# Zuley — End-to-End Testing Flows (UI Perspective)

> Every flow below starts from the user's browser. Prerequisites are listed where needed.

---

## Prerequisites

| Requirement | Details |
|------------|---------|
| **Backend running** | `npm run dev` in `/backend` — should be on `localhost:8000` |
| **Frontend running** | `npm run dev` in `/landingPage` — should be on `localhost:5173` |
| **MongoDB connected** | Backend connects to your Mongo instance |
| **Razorpay credentials** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` set in backend `.env` |
| **Inventory seeded** | At least one SKU (e.g. `pen-001`) has an Inventory document in the DB |

---

## Flow 1 — Homepage Browsing

1. Open `http://localhost:5173/`
2. **Navbar** loads at top — verify logo, links: *Silver Pens*, *Silver Phone Covers*, *Track Order*, *Corporate*
3. Scroll down — verify sections load in order:
   - Hero section
   - Category section (Silver Pens, Silver Phone Covers cards)
   - Corporate section
   - Testimonials section
   - Footer (with links, social icons)
4. **Mobile responsive**: Resize to mobile width → hamburger menu appears → tap to open → all 4 nav links visible
5. **Scroll behaviour**: Scroll down → navbar gets background blur/shadow. Scroll back to top → transparent again

---

## Flow 2 — Product Catalogue & Filtering

1. Click **"Silver Pens"** in navbar → navigates to `/products?category=silver-pens`
2. Verify page title says **"Silver Pens"** and product count shows **5 products**
3. Verify **CategoryFilter** tabs appear — "All", "Silver Pens", "Silver Phone Covers"
4. Click **"Silver Phone Covers"** tab → URL updates, grid shows **4 phone cover products**
5. Click **"All"** tab → shows all **9 products**
6. Each **ProductCard** should display:
   - Product image
   - Name, price (₹ formatted)
   - Badge if applicable (Bestseller, New, Limited Edition)
   - Original price with strikethrough (for discounted items like `pen-001`, `pen-004`, `cover-002`, `cover-004`)

---

## Flow 3 — Product Detail Page

1. From the products grid, click any product (e.g. **"Executive Signature Pen"**)
2. Navigates to `/products/pen-001`
3. Verify the page shows:
   - Breadcrumb: Home > Silver Pens > Executive Signature Pen
   - Product image gallery (multiple images, clickable thumbnails)
   - Product name, price (₹12,999), original price struck through (₹15,999)
   - "Bestseller" badge
   - Long description text
   - Features list (5 bullet points)
   - Specifications table (Material, Weight, Dimensions, Warranty)
4. **Stock status badge** shows one of:
   - 🟢 "In Stock"
   - 🟡 "Low Stock" (when inventory quantity ≤ 5)
   - 🔴 "Out of Stock" (when inventory quantity = 0)
5. **"Buy Now" button** — enabled if in stock, **disabled** if out of stock
6. **Related products** section at bottom — shows other products from same category
7. **Back button** (← arrow) — navigates back to products listing

---

## Flow 4 — Checkout (Buy Now → Payment)

> **This is the core purchasing flow. Requires Razorpay credentials.**

1. On a product detail page (with stock available), click **"Buy Now"**
2. **CheckoutModal** slides in from the right with backdrop blur
3. The modal has three sections visible:

### 4a — Customer Information
4. Fill in fields:
   - **Full Name** (required)
   - **Email** (required, validated as email format)
   - **Phone** (required, 10-digit, shown with +91 prefix)

### 4b — Shipping Address
5. Fill in fields:
   - **Address Line 1** (required)
   - **Address Line 2** (optional)
   - **City** (required)
   - **State** (required — dropdown with all Indian states + UTs)
   - **Pincode** (required, 6-digit Indian format)

### 4c — Order Summary
6. Verify modal shows:
   - Product name and image
   - **Quantity selector** (+ / − buttons)
   - Unit price × quantity = total
7. Click **"Proceed to Pay ₹X,XXX"**

### 4d — Form Validation (Negative Tests)
8. Try submitting with empty required fields → inline error messages appear
9. Try invalid email format → validation error
10. Try phone number that isn't 10 digits → validation error
11. Try pincode that isn't 6 digits → validation error

### 4e — Razorpay Widget
12. After valid form submission:
    - Loading spinner appears on button
    - Backend `POST /api/v1/payments/create-order` is called
    - **Razorpay checkout widget** opens (overlay with card/UPI/netbanking options)
    - Prefilled with customer name, email, phone from form
13. **Close the Razorpay widget** (X or Escape) → modal returns to form state, not loading

### 4f — Payment Success
14. Complete a test payment in the Razorpay widget
15. On success → user is **redirected to `/order-success`** page (see Flow 5)

### 4g — Payment Failure
16. If payment fails in Razorpay widget:
    - Error message appears in the checkout modal
    - User can retry

### 4h — Modal Close
17. Press **Escape key** → modal closes
18. Click the **X button** → modal closes
19. Click the **backdrop** (outside modal) → verify behaviour (may or may not close)

---

## Flow 5 — Order Confirmation Page

1. After successful payment, user lands on `/order-success?payment_id=pay_XXXXX&amount=XXXXX&order_id=order_XXXXX`
2. Verify the page shows:
   - ✅ **Animated green checkmark** icon
   - **"Payment Successful!"** heading
   - **Payment ID** displayed (e.g. `pay_XXXXX`)
   - **Amount paid** (formatted as ₹X,XXX)
   - **Razorpay Order ID**
3. **Copy to clipboard** — click the copy icon next to Payment ID → copies to clipboard, icon briefly changes to checkmark
4. **CTA buttons**:
   - "Track Your Order" → navigates to `/track-order`
   - "Continue Shopping" → navigates to `/products`
5. **Direct URL access** — visit `/order-success` without query params → page should handle gracefully (show message or redirect)

---

## Flow 6 — Order Tracking

> **Requires at least one completed order in the database.**

1. Click **"Track Order"** in the navbar → navigates to `/track-order`
2. Verify the page shows:
   - Search input field with placeholder for order ID format (ZUL-YYMMDD-XXXX)
   - Search button with 🔍 icon
3. **Enter a valid order ID** (e.g. `ZUL-250227-0001`) and click Search or press Enter
4. Loading spinner appears while fetching from `GET /api/v1/orders/:orderId/track`
5. On success, verify display:

### 6a — Order Details Card
   - Order ID (bold, prominent)
   - Status badge (e.g. "Created", "Paid", "Shipped", "Delivered")
   - Items list — name, quantity, price per item
   - Total amount
   - Shipping address — city, state, pincode

### 6b — Order Timeline
   - Visual timeline component (`OrderTimeline`) showing status progression:
     - **Paid** ✓ (always first, since orders are only created after payment)
     - **Shipped** (active/inactive depending on status)
     - **In Transit** 
     - **Delivered**
   - Each step shows timestamp if available

### 6c — Shipping Card
   - If shipping info exists:
     - Courier name
     - Tracking number
     - **Tracking URL** — clickable link opening courier's tracking page
     - Shipped date, delivered date
   - If no shipping info yet: shipping section is absent or shows "Not shipped yet"

### 6d — Order Tracking — Error Cases
6. **Invalid order ID** — enter "ABC-123" or random text → API returns 404 → error message: *"Order not found. Please check the order ID and try again."*
7. **Empty search** — click search with empty input → validation prevents the call
8. **Network error** — disconnect backend → search → error toast or inline error

---

## Flow 7 — Stock Availability Display

1. Navigate to `/products/pen-001`
2. On page load, frontend calls `GET /api/v1/inventory/pen-001/availability`
3. Verify badge shows based on backend response:
   - **quantity > 5** → 🟢 "In Stock" badge, Buy Now button enabled
   - **0 < quantity ≤ 5** → 🟡 "Low Stock" badge, Buy Now button enabled
   - **quantity = 0** → 🔴 "Out of Stock" badge, Buy Now button **disabled**
4. **Unseeded SKU** (no Inventory document in DB for that SKU) → API returns `inStock: true` → shows as "In Stock"
5. **API failure** (backend down) → hook defaults to `inStock: true` (graceful fallback, no crash)

---

## Flow 8 — Toast Notifications

Toasts are a cross-cutting concern. Verify they appear in these scenarios:

| Trigger | Expected Toast |
|---------|---------------|
| Payment backend call fails (e.g. 500 error) | ❌ Error toast with message |
| Order tracking search finds no order | ❌ Error toast or inline error |
| Network request fails (backend offline) | ❌ Error toast |
| Successful copy-to-clipboard on order success page | ✅ Success feedback (icon change) |

For each toast, verify:
- Appears in **top-right** corner
- Has correct variant (success = green, error = red, info = blue)
- **Auto-dismisses** after a few seconds
- Can be manually dismissed

---

## Flow 9 — Navigation & Routing

| Action | Expected Result |
|--------|----------------|
| Visit `/` | Homepage loads |
| Visit `/products` | All products (9 items) |
| Visit `/products?category=silver-pens` | 5 silver pens |
| Visit `/products?category=silver-phone-covers` | 4 phone covers |
| Visit `/products/pen-001` | Product detail for Executive Signature Pen |
| Visit `/products/INVALID_ID` | Should handle gracefully (show error or redirect) |
| Visit `/order-success` (no params) | Should handle gracefully |
| Visit `/track-order` | Order tracking page with empty search |
| Visit `/track-order?id=ZUL-250227-0001` | May auto-trigger search (check if `useSearchParams` is used) |
| Visit `/nonexistent-path` | No 404 page defined — renders blank or default React Router handling |

---

## Flow 10 — Responsive Design & Mobile UX

Test all above flows at these breakpoints:

| Breakpoint | Width |
|-----------|-------|
| Mobile | 375px |
| Tablet | 768px |
| Desktop | 1280px |

Key things to check on mobile:
1. Navbar collapses to hamburger menu
2. Product grid changes from multi-column to single column
3. Checkout modal is usable (scrollable, all fields accessible)
4. Order tracking page search and results fit screen
5. Touch targets are large enough (buttons, links)

---

## Quick Smoke Test Checklist

> Minimum set to verify the system works end-to-end:

- [ ] Homepage loads with all sections
- [ ] Navigate to products → see 9 products
- [ ] Filter by category → correct products shown
- [ ] Open a product → see details + stock status
- [ ] Click Buy Now → checkout modal opens
- [ ] Fill form → Razorpay widget opens
- [ ] Complete payment → redirected to order success page
- [ ] Copy payment ID → clipboard works
- [ ] Navigate to Track Order → search with the generated order ID
- [ ] Order details, timeline, and shipping info displayed correctly
- [ ] Test with backend offline → graceful error handling, no crashes
