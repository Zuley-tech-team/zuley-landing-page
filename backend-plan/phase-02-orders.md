# Phase 2: Order System

## Overview
Orders are created **only after successful payment**. This ensures we never have orphan orders or confusion about payment status. Each order is the single source of truth for what was purchased.

---

## Core Requirements

### 2.1 Order Creation Flow

**Trigger:** Called only from the payment success webhook handler.

**Sequence:**
1. Payment webhook verified ✓
2. Payment not already processed ✓
3. Fetch cart/order items from temp storage
4. Create order with all items
5. Generate human-readable order ID
6. Link payment record to order
7. Clear temporary cart data

**Critical Rule:** 
> Never create an order before payment is confirmed. No exceptions.

---

### 2.2 Order ID Generation

**Format:** `ZUL-YYMMDD-XXXX`

- `ZUL` = Brand prefix
- `YYMMDD` = Date (e.g., 250204 for Feb 4, 2025)
- `XXXX` = Sequential number for that day (0001, 0002, etc.)

**Example:** `ZUL-250204-0023` (23rd order on Feb 4, 2025)

**Requirements:**
- Must be unique across all orders
- Must be sequential within a day (no gaps preferred)
- Must be human-readable (for phone support)
- Must be short enough to fit on invoices

---

### 2.3 Order States

| State | Meaning | Who Changes It |
|-------|---------|----------------|
| `created` | Order just created after payment | System |
| `paid` | Payment confirmed | System |
| `shipped` | Package handed to courier | Admin |
| `delivered` | Customer received package | Admin |
| `cancelled` | Order cancelled (before shipping) | Admin |
| `refunded` | Money returned to customer | Admin |

**State Transitions:**

```
created → paid → shipped → delivered
                    ↓
              cancelled / refunded

paid → cancelled → refunded
```

**Rules:**
- Cannot ship a cancelled order
- Cannot cancel a delivered order
- Refund can happen from `paid`, `shipped`, `delivered`, or `cancelled`
- State changes are logged with timestamp and actor

---

### 2.4 Order Data Structure

**Order Header:**
| Field | Purpose |
|-------|---------|
| `id` | Internal database ID |
| `order_id` | Human-readable ID (ZUL-YYMMDD-XXXX) |
| `customer_id` | Link to customer record |
| `payment_id` | Link to payment record |
| `status` | Current order state |
| `total_amount` | Total paid (in paise) |
| `items_count` | Number of line items |
| `shipping_address` | Full address JSON |
| `created_at` | Order creation timestamp |
| `updated_at` | Last modification timestamp |

**Order Items (Line Items):**
| Field | Purpose |
|-------|---------|
| `id` | Internal ID |
| `order_id` | Parent order reference |
| `product_id` | Product reference |
| `product_name` | Snapshot of name at purchase |
| `variant_info` | Size/variant details |
| `quantity` | Units purchased |
| `unit_price` | Price per unit (paise) |
| `total_price` | quantity × unit_price |
| `gst_rate` | GST percentage applied |
| `gst_amount` | GST amount (paise) |

---

### 2.5 Order History (Immutable)

**Principle:** Orders are never deleted, only state-changed.

**Retention:**
- All orders stored permanently
- Order data cannot be modified after creation (only state changes)
- Item prices, quantities, addresses frozen at purchase time

**Why This Matters:**
- Legal requirement for financial records
- Customer dispute resolution
- Tax audit trail

---

### 2.6 Order State Change Logging

**Every state change logs:**
| Field | Purpose |
|-------|---------|
| `order_id` | Which order |
| `previous_status` | Status before change |
| `new_status` | Status after change |
| `changed_by` | Admin who made change (or "system") |
| `reason` | Optional reason text |
| `timestamp` | When change occurred |

---

## Order Validation Rules

### At Creation Time
- [ ] Payment must be verified and captured
- [ ] At least one item in order
- [ ] All items must have valid prices
- [ ] Total must match payment amount
- [ ] Customer data must be complete

### At State Change Time
- [ ] Valid state transition (see rules above)
- [ ] Actor must be authorized (admin or system)
- [ ] Cannot change terminal states (delivered stays delivered)

---

## Linking Orders

| Order Links To | Purpose |
|----------------|---------|
| Customer | Who bought it |
| Payment | How it was paid |
| Invoice | Legal document |
| Shipment | Delivery tracking |

All links are established immediately after order creation.

---

## Not Building (Explicitly Out of Scope)

- ❌ Order editing after creation
- ❌ Partial orders / split shipments
- ❌ Order merging
- ❌ Draft orders
- ❌ Quotes/estimates
- ❌ Pre-orders / backorders
- ❌ Complex state machines with branching
- ❌ Order notes/comments (can add later)
