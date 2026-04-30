# Zuley

Zuley is a premium silver gifting website built for selling handcrafted silver pens and silver phone covers. The site is designed for both customers and administrators, with a polished storefront, guided checkout flow, order tracking, and an admin dashboard for managing the business.

## What The Website Offers

- Premium silver pens and silver phone covers
- Product browsing with category-based shopping
- Product detail pages with buy-now and add-to-cart flows
- Checkout with COD support and address validation
- Pincode autofill for city and state lookup during checkout
- Customer sign-up and login through OTP
- Automatic resume of checkout after sign-up
- Order success and order tracking pages
- Customer profile and order history pages
- Admin login and dashboard for managing products, orders, inventory, and leads
- Legal pages for privacy, refund, shipping, and terms

## Main Customer Flow

1. Browse products on the homepage or products page.
2. Open a product and choose Buy Now or Add to Cart.
3. If the customer is not logged in, the sign-in modal opens first.
4. After sign-up or login, the checkout flow resumes automatically.
5. During checkout, the pincode can be entered first so city and state can be auto-filled.
6. Place the order and view the success page.
7. Use the order tracking page later to monitor the shipment.

## Admin Flow

- Sign in from the admin login page.
- View the dashboard, products, orders, inventory, and leads.
- The admin tab uses a separate admin favicon so it is easy to recognize.

## Project Structure

- `Client/` - React + Vite frontend
- `Server/` - Node.js backend API

## Frontend Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind-style utility classes and custom CSS
- GSAP animations in selected sections

## Backend Stack

- Node.js
- Express
- MongoDB
- Authentication and order APIs
- Invoice, shipping, and admin services

## Local Setup

### Client

```bash
cd Client
npm install
npm run dev
```

### Server

```bash
cd Server
npm install
npm run dev
```