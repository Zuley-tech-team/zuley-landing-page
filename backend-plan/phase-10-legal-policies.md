# Phase 10: Legal Policy Enforcement

## Overview
Legal pages are frontend content, but the backend must enforce the rules. This phase ensures business logic respects refund policy, shipping policy, and terms.

---

## Policies to Enforce

### Refund Policy
- Refund window: X days from delivery
- Conditions for refund (damaged, wrong item, etc.)
- Non-refundable items (if any)
- Refund timeline (5-7 business days)

### Shipping Policy  
- Processing time: X business days
- Delivery timeframe: X-Y days
- Serviceable areas (if any restrictions)
- Shipping charges (if any)

### Terms & Conditions
- Order acceptance criteria
- Cancellation rights
- Liability limitations

---

## Backend Enforcement Rules

| Policy | Backend Rule |
|--------|--------------|
| Refund window | System prevents refund after X days from delivery date |
| Cancellation cutoff | Cannot cancel after shipping |
| Return eligibility | Track delivery date to enforce return window |

---

## Data Requirements

| Field | Purpose |
|-------|---------|
| `delivered_at` | Used to calculate refund window |
| `shipped_at` | Cancellation cutoff reference |
| `refund_reason` | Must be from allowed reasons |

---

## Admin Guardrails

**When Processing Refund:**
- System checks if within refund window
- Warning shown if outside window (admin can override)
- Reason required from predefined list

**When Cancelling:**
- System checks if already shipped
- Block cancellation if shipped (must go through return flow)

---

## Policy Display

**Backend Provides:**
- API endpoint returning policy content
- Version tracking for policies
- Last updated date

**Frontend Shows:**
- Checkout: Agree to T&C checkbox
- Order confirmation: Links to policies
- Footer: Links to all policies

---

## Not Building

- ❌ Policy content management in admin
- ❌ Policy versioning tracking
- ❌ Automated compliance checks
- ❌ Cookie consent management
