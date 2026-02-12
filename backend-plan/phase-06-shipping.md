# Phase 6: Shipping

## Overview
Shipping is manual for now. We capture the address, admin enters tracking info manually, and customer gets notified. No automated courier integrations.

---

## Core Requirements

### 6.1 Address Capture

**At Checkout:**
- Full shipping address captured (see Phase 3)
- Address validated for completeness
- Stored with order

**Address Format:**
```
{full_name}
{address_line1}
{address_line2}
{city}, {state} - {pincode}
Phone: {phone}
```

---

### 6.2 Shipping Data Model

**Shipment Record:**
| Field | Purpose |
|-------|---------|
| `id` | Internal reference |
| `order_id` | Link to order |
| `courier_name` | Name of courier service |
| `tracking_number` | AWB / Tracking ID |
| `tracking_url` | Full tracking link |
| `shipped_at` | When package was shipped |
| `delivered_at` | When delivered (if manually updated) |
| `status` | pending / shipped / in_transit / delivered |
| `notes` | Admin notes |
| `created_at` | Record creation |
| `updated_at` | Last update |

---

### 6.3 Shipping States

| State | Meaning | Who Updates |
|-------|---------|-------------|
| `pending` | Order paid, not yet shipped | System (default) |
| `shipped` | Package handed to courier | Admin |
| `in_transit` | Package with courier | Admin (optional) |
| `delivered` | Customer received | Admin |

**State Flow:**
```
pending → shipped → in_transit → delivered
```

---

### 6.4 Admin Shipping Workflow

**Step 1: View Pending Shipments**
- List all orders with status = pending shipment
- Show customer name, address, products
- Sort by order date (oldest first)

**Step 2: Prepare Package**
- Print shipping label (from courier dashboard)
- Pack items
- Note any special handling

**Step 3: Enter Shipping Details**
- Select order
- Enter courier name (dropdown + other)
- Enter tracking number (AWB)
- Enter tracking URL (or auto-generate based on courier)
- Click "Mark as Shipped"

**Step 4: System Actions**
- Update order status to "Shipped"
- Create shipment record
- Trigger shipping confirmation email
- Log the action

---

### 6.5 Courier Tracking URLs

**Common Courier Patterns:**

| Courier | Tracking URL Format |
|---------|---------------------|
| India Post | https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consession={tracking} |
| Shiprocket | https://www.shiprocket.in/shipment-tracking/{tracking} |
| Delhivery | https://www.delhivery.com/track/package/{tracking} |
| Blue Dart | https://www.bluedart.com/tracking/{tracking} |
| DTDC | https://www.dtdc.in/trace.asp?cno={tracking} |

**URL Generation:**
- Pre-populate tracking URL based on courier selection
- Replace `{tracking}` with entered tracking number
- Allow manual override

---

### 6.6 Customer Tracking Notification

**Email Sent When Shipped:**
- Subject: "Your Zuley Order is On Its Way!"
- Contents:
  - Order ID
  - Courier name
  - Tracking number
  - Tracking link (clickable)
  - Expected delivery (if available)
  - Contact info for issues

---

### 6.7 Delivery Confirmation

**How It's Updated:**
- Admin manually marks as delivered
- OR customer confirms via email link (optional)
- Automatic via courier webhook (NOT building now)

**When Marked Delivered:**
- Order status → Delivered
- Shipment status → Delivered
- Delivered timestamp recorded
- Log the action

---

### 6.8 Address Display for Shipping

**Admin View Shows:**
```
Ship To:
━━━━━━━━━━━━━━━━━━━━━━━━
Rahul Sharma
123, Silver Lane, Sector 5
Near City Mall
Mumbai, Maharashtra - 400001
📞 9876543210
```

**Suitable for:**
- Printing labels
- Courier manifest
- Quick reference

---

### 6.9 Shipping Issues Handling

**Address Issue:**
- Admin can contact customer via phone/email
- Admin adds note to shipment
- If unresolvable → cancel and refund

**Lost in Transit:**
- Admin updates status with note
- Admin contacts courier
- If not resolved → refund customer

**Returned to Sender:**
- Admin receives returned package
- Inventory restored
- Customer contacted for refund or re-ship

---

## Not Building (Explicitly Out of Scope)

- ❌ Courier API integration
- ❌ Auto label generation
- ❌ Rate shopping across couriers
- ❌ Shipping cost calculation
- ❌ Real-time tracking updates
- ❌ Estimated delivery date calculation
- ❌ Shipping insurance
- ❌ Multiple shipments per order
- ❌ Split shipments
- ❌ Return shipping labels
- ❌ Pickup scheduling
- ❌ COD (Cash on Delivery)
- ❌ Serviceable pincode check
