# Phase 7: Email Notifications

## Overview
Essential transactional emails only. No marketing, no newsletters, no fancy templates. Plain, reliable emails that customers need.

---

## Core Requirements

### 7.1 Email Types

| Email | Trigger | Priority |
|-------|---------|----------|
| Order Confirmation | Payment success | 🔴 Critical |
| Invoice Email | Invoice generated | 🔴 Critical |
| Shipping Confirmation | Admin marks shipped | 🟠 High |
| Delivery Confirmation | Admin marks delivered | 🟡 Medium |
| Refund Confirmation | Refund processed | 🟠 High |

---

### 7.2 Order Confirmation Email

**Trigger:** Immediately after order creation

**Subject:** `Order Confirmed - {Order ID} | Zuley`

**Contents:**
```
✓ Order Confirmed!

Hi {Customer Name},

Thank you for your order. Here's what you purchased:

Order ID: {Order ID}
Order Date: {Date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Items:
• {Product 1 Name} x {Qty} — ₹{Price}
• {Product 2 Name} x {Qty} — ₹{Price}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal: ₹{Subtotal}
GST (3%): ₹{Tax}
Total: ₹{Total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shipping to:
{Full Address}

We'll email you when your order ships.

Questions? Reply to this email.

— Team Zuley
```

---

### 7.3 Invoice Email

**Trigger:** After invoice PDF generated (same as order confirmation)

**Subject:** `Invoice {Invoice Number} - Zuley`

**Contents:**
```
Hi {Customer Name},

Please find attached the GST invoice for your recent purchase.

Invoice Number: {Invoice Number}
Order ID: {Order ID}
Amount: ₹{Total}

Download your invoice from the attachment.

For any queries, reply to this email.

— Team Zuley
```

**Attachment:** Invoice PDF

---

### 7.4 Shipping Confirmation Email

**Trigger:** Admin marks order as shipped

**Subject:** `Your Order is On Its Way! - {Order ID} | Zuley`

**Contents:**
```
📦 Shipped!

Hi {Customer Name},

Great news! Your order is on its way.

Order ID: {Order ID}
Courier: {Courier Name}
Tracking Number: {Tracking Number}

Track your package:
{Tracking URL}

Shipping to:
{Full Address}

Estimated delivery: 3-7 business days

Happy waiting!

— Team Zuley
```

---

### 7.5 Delivery Confirmation Email

**Trigger:** Admin marks order as delivered

**Subject:** `Order Delivered! - {Order ID} | Zuley`

**Contents:**
```
✓ Delivered!

Hi {Customer Name},

Your order has been delivered!

Order ID: {Order ID}
Delivered On: {Date}

We hope you love your purchase. 💎

If there's any issue, reply within 7 days.

Thank you for shopping with us!

— Team Zuley
```

---

### 7.6 Refund Confirmation Email

**Trigger:** Admin processes refund

**Subject:** `Refund Processed - {Order ID} | Zuley`

**Contents:**
```
Refund Processed

Hi {Customer Name},

Your refund has been processed.

Order ID: {Order ID}
Refund Amount: ₹{Amount}
Refund Reference: {Gateway Refund ID}

The amount will reflect in your account within 5-7 business days.

We're sorry to see you go. If there's anything we could have done better, please let us know.

— Team Zuley
```

---

### 7.7 Email Technical Requirements

**Sending:**
- Use transactional email service
- Send from `orders@zuley.in` or similar
- Reply-to: Support email

**Delivery:**
- Retry on failure (3 attempts)
- Log all send attempts
- Track delivery status if possible

**Format:**
- Plain text primary (no complex HTML)
- Mobile-friendly
- No images in body (or minimal)
- UTF-8 encoding

---

### 7.8 Email Queue & Processing

**Flow:**
```
Event Triggers → Add to Email Queue → Process Queue → Send → Log Result
```

**Queue Fields:**
| Field | Purpose |
|-------|---------|
| `id` | Queue item ID |
| `email_type` | order_confirmation / invoice / etc. |
| `recipient_email` | Where to send |
| `order_id` | Related order |
| `payload` | Email data (JSON) |
| `status` | pending / sent / failed |
| `attempts` | Number of send attempts |
| `last_attempt` | Timestamp of last attempt |
| `sent_at` | When successfully sent |
| `error` | Error message if failed |

---

### 7.9 Email Failure Handling

| Scenario | Action |
|----------|--------|
| Send fails | Retry after 5 mins |
| 3 failures | Mark as failed, alert admin |
| Invalid email | Log error, no retry |
| Attachment too large | Reduce PDF quality, retry |

**Admin Actions:**
- View failed emails
- Retry manually
- Mark as resolved

---

### 7.10 Email Content Storage

**Store for each sent email:**
- Email type
- Recipient
- Subject
- Body (or template + data)
- Attachments (links)
- Sent timestamp
- Status

**Retention:** Same as orders (permanent)

---

## Not Building (Explicitly Out of Scope)

- ❌ Marketing emails
- ❌ Newsletter signup
- ❌ Email templates editor
- ❌ Fancy HTML templates
- ❌ SMS notifications
- ❌ Push notifications
- ❌ WhatsApp notifications
- ❌ Email open tracking
- ❌ Click tracking
- ❌ Unsubscribe management
- ❌ Email personalization
- ❌ A/B testing
