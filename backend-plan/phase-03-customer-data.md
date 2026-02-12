# Phase 3: Customer Data

## Overview
We are building a **guest checkout only** system. No user accounts, no login, no passwords. Customer data exists only in the context of orders. This is simpler and safer.

---

## Core Requirements

### 3.1 Customer Data Collection

**Captured at Checkout:**
| Field | Required | Validation |
|-------|----------|------------|
| Full Name | Yes | 2-100 characters |
| Email | Yes | Valid email format |
| Phone | Yes | Valid Indian mobile (10 digits) |
| Address Line 1 | Yes | Street address |
| Address Line 2 | No | Apartment/building |
| City | Yes | Text |
| State | Yes | Valid Indian state |
| Pincode | Yes | 6 digits, valid format |

---

### 3.2 One Order = One Customer Record

**Principle:** Each order creates its own customer snapshot.

**Why Not Link/Reuse:**
- No user accounts means no guaranteed way to match
- Same email might be family members
- Address changes between orders
- Keeps data isolated and simple

**Data Flow:**
```
Checkout Form → Validate → Create Customer Record → Link to Order
```

**Customer Record Created At:** Same time as order (in same transaction)

---

### 3.3 Customer Data Model

| Field | Purpose |
|-------|---------|
| `id` | Internal reference |
| `order_id` | Link to associated order |
| `full_name` | Customer name |
| `email` | Contact email |
| `phone` | Contact phone |
| `address_line1` | Street address |
| `address_line2` | Additional address |
| `city` | City name |
| `state` | State name |
| `pincode` | Postal code |
| `created_at` | When record created |

---

### 3.4 Address Handling

**Shipping Address:**
- Captured during checkout
- Stored as JSON in order record
- Frozen at time of purchase
- Used for courier dispatch

**Format for Display:**
```
{full_name}
{address_line1}
{address_line2}
{city}, {state} - {pincode}
Phone: {phone}
```

---

### 3.5 Data Validation

**Email Validation:**
- Must contain @ and valid TLD
- No spaces
- Lowercase stored
- Used for transactional emails only

**Phone Validation:**
- Indian mobile: 10 digits
- Starts with 6, 7, 8, or 9
- No country code required (assume +91)
- Used for shipping coordination

**Pincode Validation:**
- Exactly 6 digits
- First digit: 1-9 (not 0)
- Basic format check only

**State Validation:**
- Must be from predefined list
- 28 states + 8 UTs
- Dropdown selection (not free text)

---

### 3.6 Privacy & Data Handling

**Storage:**
- Customer data tied to order records
- No separate customer database
- No customer tracking across orders

**Access:**
- Admin can view customer data for orders
- No bulk export (to prevent misuse)
- Data shown only in order context

**Retention:**
- Same as order retention (permanent)
- Required for legal/tax purposes
- No auto-deletion

---

### 3.7 Guest Checkout Flow

```
1. Customer fills cart
2. Customer enters contact details
3. Customer enters shipping address
4. System validates all data
5. Customer proceeds to payment
6. On payment success → customer record created
7. Confirmation sent to email
```

**No Customer Account Means:**
- No login required
- No password reset flow
- No saved addresses
- No order history page (customer must save emails)
- No wishlist

---

## Validation Rules Summary

| Field | Rule |
|-------|------|
| Name | 2-100 chars, no special chars except space, period, apostrophe |
| Email | Valid email format |
| Phone | 10 digits, starts with 6/7/8/9 |
| Address | Min 10 chars |
| City | Min 2 chars |
| State | From predefined list |
| Pincode | Exactly 6 digits, starts with 1-9 |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Same email orders twice | Two separate customer records, no linking |
| Invalid pincode for state | Show error, ask to correct |
| Special characters in name | Allow only letters, spaces, periods, apostrophes |
| Very long address | Truncate at 500 chars |

---

## Not Building (Explicitly Out of Scope)

- ❌ User accounts / registration
- ❌ Login / logout
- ❌ Password management
- ❌ Saved addresses
- ❌ Customer profiles
- ❌ Purchase history (customer-facing)
- ❌ Wishlist
- ❌ Address validation via API
- ❌ Pincode to city/state auto-fill
- ❌ Phone SMS verification
- ❌ Email verification
