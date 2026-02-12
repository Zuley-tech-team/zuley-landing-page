# Phase 4: Inventory Management

## Overview
Simple inventory tracking to prevent overselling. Silver is expensive — selling what you don't have is a cash disaster. This system tracks stock levels and ensures we never sell more than available.

---

## Core Requirements

### 4.1 Stock Tracking

**Per Product Variant:**
| Field | Purpose |
|-------|---------|
| `product_id` | Which product |
| `variant_id` | Which size/variant (if applicable) |
| `available_quantity` | Current stock count |
| `reserved_quantity` | Reserved but not yet paid (optional) |
| `last_updated` | When stock was last modified |
| `updated_by` | Who modified (admin or system) |

---

### 4.2 Inventory Operations

**Decrement on Payment Success:**
```
1. Payment webhook verified
2. BEFORE creating order, check stock again
3. If stock available → decrement
4. If stock not available → CRITICAL ERROR (log, alert)
5. Continue with order creation
```

**Restore on Cancellation/Refund:**
```
1. Admin marks order as cancelled/refunded
2. System restores inventory for all order items
3. Log the restoration with reason
```

**Manual Edit by Admin:**
- Admin can set exact quantity
- Must provide reason (restock, correction, damage, etc.)
- All changes logged

---

### 4.3 Stock Check Points

| When | Action |
|------|--------|
| Add to cart | Soft check (show warning if low) |
| Checkout page | Hard check (block if unavailable) |
| Before payment intent | Verify stock, include in cart validation |
| Payment success (webhook) | Final decrement (critical) |
| Order cancelled | Restore stock |
| Order refunded | Restore stock |

---

### 4.4 Atomicity & Race Conditions

**Problem:** Two customers might try to buy the last item simultaneously.

**Solution:**
- Stock decrement happens in payment webhook handler
- Use database-level atomic operations
- Decrement only if quantity >= requested amount
- If decrement fails, payment was captured but no stock → manual intervention required

**Atomic Decrement Logic:**
```
UPDATE inventory 
SET available_quantity = available_quantity - {qty}
WHERE product_id = {id} 
  AND variant_id = {var}
  AND available_quantity >= {qty}
```
If affected rows = 0 → stock not available

---

### 4.5 Inventory Data Model

**Inventory Table:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | ID | Internal reference |
| `product_id` | Reference | Link to product |
| `variant_id` | Reference | Link to variant (nullable) |
| `available_qty` | Integer | Current stock |
| `updated_at` | Timestamp | Last modification |

**Inventory Log Table:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | ID | Internal reference |
| `inventory_id` | Reference | Which inventory item |
| `previous_qty` | Integer | Quantity before change |
| `new_qty` | Integer | Quantity after change |
| `change_qty` | Integer | Delta (+/-) |
| `reason` | Enum | sale / refund / restock / correction / damage |
| `order_id` | Reference | Related order (if applicable) |
| `changed_by` | String | Admin username or "system" |
| `created_at` | Timestamp | When change occurred |

---

### 4.6 Stock States

| State | Meaning | Frontend Display |
|-------|---------|------------------|
| `available_qty > 5` | In stock | "In Stock" (green) |
| `available_qty 1-5` | Low stock | "Only X left!" (orange) |
| `available_qty = 0` | Out of stock | "Out of Stock" (red, disable buy) |

---

### 4.7 Admin Inventory Functions

**View Inventory:**
- See all products with current stock
- Filter by in-stock / low-stock / out-of-stock
- Search by product name

**Update Stock:**
- Select product/variant
- Enter new quantity
- Select reason (restock / correction / damage / other)
- Confirm change
- System logs the change

**View Inventory History:**
- See all changes for a product
- Filter by date range
- See who made each change
- Useful for auditing

---

### 4.8 Critical Error Handling

**Payment Success but No Stock:**
This should rarely happen if checkout validates properly.

If it happens:
1. Log as CRITICAL error
2. Still create order (payment was captured)
3. Alert admin immediately
4. Admin must manually source the item or refund

**Prevention:**
- Always validate stock at checkout
- Keep small buffer in mind
- Don't allow negative inventory

---

## Inventory Change Reasons

| Reason | When Used |
|--------|-----------|
| `sale` | Customer purchased item |
| `refund` | Order refunded, stock restored |
| `cancellation` | Order cancelled, stock restored |
| `restock` | New inventory received |
| `correction` | Fixing count error |
| `damage` | Product damaged, removed from stock |
| `return` | Customer returned item (if applicable) |

---

## Not Building (Explicitly Out of Scope)

- ❌ Multiple warehouses
- ❌ Warehouse transfers
- ❌ Batch/lot tracking
- ❌ Expiry tracking
- ❌ Reserved inventory for cart (cart locking)
- ❌ Low stock alerts/notifications
- ❌ Reorder point automation
- ❌ Stock forecasting
- ❌ Supplier management
- ❌ Purchase orders
- ❌ Barcode/SKU scanning
