# Phase 1: Payment System

## Overview
The payment system is the **foundation** of the entire backend. Every other module depends on successful payment processing. If payment handling is wrong, nothing else matters.

---

## Core Requirements

### 1.1 Payment Gateway Integration
**What it does:** Connects to a single payment provider to accept customer payments.

**Required Capabilities:**
- Accept UPI, cards, netbanking, wallets (all via single gateway)
- Generate payment intent/order on gateway
- Receive payment confirmation
- Handle payment failures gracefully

**Not Building:**
- Multiple gateway fallback
- Gateway switching logic
- BNPL/EMI support

---

### 1.2 Payment Intent Creation

**Flow:**
1. Customer clicks "Pay Now"
2. Backend creates a payment intent on the gateway
3. Gateway returns payment link/session
4. Customer completes payment on gateway page
5. Gateway sends webhook on completion

**Required Data in Payment Intent:**
- Amount (in paise/smallest currency unit)
- Order reference (temporary ID)
- Customer email
- Customer phone
- Receipt/description

**Validation Before Creating Intent:**
- Cart is not empty
- All items are in stock
- Total amount is positive
- Customer contact is valid

---

### 1.3 Webhook Verification (HMAC)

> ⚠️ **CRITICAL**: This is the most important security layer

**What it does:** Verifies that incoming payment notifications are genuinely from the payment gateway and not spoofed.

**Implementation Requirements:**
- Verify HMAC signature on every incoming webhook
- Reject any webhook that fails signature verification
- Log all rejected webhooks with full payload (for debugging)
- Use constant-time comparison to prevent timing attacks

**Webhook Events to Handle:**
| Event | Action |
|-------|--------|
| `payment.captured` | Create order, deduct inventory, generate invoice |
| `payment.failed` | Log failure, notify customer (optional) |
| `payment.authorized` | Wait for capture (if using 2-step) |
| `refund.processed` | Update order status, restore inventory |

---

### 1.4 Idempotency (Prevent Duplicate Orders)

**Problem:** Gateway may send duplicate webhooks. Must not create duplicate orders.

**Solution:**
- Store `gateway_payment_id` as unique identifier
- Before processing any webhook, check if payment was already processed
- If already processed → acknowledge webhook but take no action
- Use database-level unique constraint on payment ID

**Idempotency Key Fields:**
- `gateway_payment_id` (primary)
- `order_id` (secondary reference)

---

### 1.5 Payment Success Handling

**On Successful Payment:**
1. Verify webhook signature ✓
2. Check idempotency (not already processed) ✓
3. Verify amount matches expected amount
4. Create order record
5. Link payment to order
6. Deduct inventory
7. Generate invoice
8. Queue confirmation email
9. Respond to webhook with success

**Data to Store:**
- Gateway payment ID
- Gateway order ID
- Amount paid
- Payment method used
- Timestamp
- Raw gateway response (for debugging)

---

### 1.6 Payment Failure Handling

**On Failed Payment:**
1. Verify webhook signature ✓
2. Log failure reason
3. Do NOT create order
4. Do NOT modify inventory
5. Optionally notify customer
6. Respond to webhook with success (so gateway doesn't retry)

**Failure Reasons to Log:**
- Insufficient funds
- Card declined
- Bank failure
- User cancelled
- Timeout

---

### 1.7 Manual Refund Capability

**Approach:** Refunds processed via gateway dashboard (not automated).

**Backend Requirements:**
- Admin can mark order as "Refund Initiated"
- Admin enters refund reference from gateway
- Order status updates to "Refunded"
- Inventory restored
- Refund confirmation email triggered

**Not Building:**
- Automated refund via API
- Partial refunds
- Refund time tracking

---

## Data Models

### Payment Record
| Field | Purpose |
|-------|---------|
| `id` | Internal reference |
| `gateway_payment_id` | Gateway's unique ID (indexed, unique) |
| `gateway_order_id` | Gateway's order reference |
| `order_id` | Link to our order (null until order created) |
| `amount` | Amount in paise |
| `currency` | INR |
| `status` | pending / captured / failed / refunded |
| `payment_method` | upi / card / netbanking / wallet |
| `gateway_response` | Full JSON response from gateway |
| `created_at` | When payment was initiated |
| `processed_at` | When webhook was processed |

---

## Edge Cases & Errors

| Scenario | Handling |
|----------|----------|
| Webhook arrives twice | Idempotency check → ignore duplicate |
| Webhook signature invalid | Reject, log full payload, return error |
| Amount mismatch | Log as fraud attempt, do not create order |
| Gateway timeout during intent creation | Return error to customer, they can retry |
| Payment successful but order creation fails | Critical error → alert admin, manual handling |

---

## Not Building (Explicitly Out of Scope)

- ❌ Multiple payment gateways
- ❌ Auto-retry on failure
- ❌ Payment link generation for manual orders
- ❌ Subscription/recurring payments
- ❌ Split payments
- ❌ International payments
- ❌ Automated refund processing
