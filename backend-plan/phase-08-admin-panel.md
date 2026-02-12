# Phase 8: Admin Panel

## Overview
A simple, secure admin panel that gives you visibility and control. If you can see and fix things manually, you're safe. No fancy dashboards — just essential operations.

---

## Core Requirements

### 8.1 Admin Authentication

**Login:**
- Email + Password login
- Strong password requirement (min 12 chars)
- Rate limiting (5 attempts, then lockout)
- Session-based authentication
- Session timeout (4 hours)

**No Building:**
- Multiple admin roles
- Permission management
- OAuth / SSO
- 2FA (can add later)

---

### 8.2 Admin User Management

**For Launch:**
- Single admin account (manually created)
- Password change capability

**Later (Post-Launch):**
- Add more admins
- Disable admin accounts
- Audit log of admin actions

---

### 8.3 Admin Dashboard Sections

| Section | Purpose |
|---------|---------|
| Orders | View, search, update orders |
| Payments | View payment records |
| Inventory | Manage stock levels |
| Shipping | Update tracking info |
| Invoices | View, download invoices |
| Logs | View system logs |

---

## 8.4 Orders Section

**Orders List View:**
| Column | Content |
|--------|---------|
| Order ID | ZUL-YYMMDD-XXXX (clickable) |
| Date | Order date |
| Customer | Name |
| Total | ₹ Amount |
| Status | Badge (color-coded) |
| Actions | View, Update |

**Filters:**
- By status (All, Paid, Shipped, Delivered, Cancelled, Refunded)
- By date range
- Search by Order ID, Customer name, Email, Phone

**Order Detail View:**
- Order information
- Customer details
- Items list
- Payment info
- Shipment info (if any)
- Invoice link
- Status history/timeline
- Actions available based on current status

**Order Actions:**
| Current Status | Available Actions |
|----------------|-------------------|
| Paid | Mark Shipped, Cancel |
| Shipped | Mark Delivered, Cancel |
| Delivered | Initiate Refund |
| Cancelled | Initiate Refund |

---

## 8.5 Payments Section

**Payments List View:**
| Column | Content |
|--------|---------|
| Payment ID | Gateway payment ID |
| Date | Payment date |
| Order | Linked order ID |
| Amount | ₹ Amount |
| Status | captured / failed / refunded |
| Method | UPI / Card / etc. |

**Filters:**
- By status
- By date range
- By order ID

**Payment Detail View:**
- Full payment details
- Gateway response
- Linked order
- Timeline of status changes

**Actions:**
- View only (no modifications)
- Refunds handled via order, not directly

---

## 8.6 Inventory Section

**Inventory List View:**
| Column | Content |
|--------|---------|
| Product | Name + variant |
| SKU | Product SKU |
| Available | Current stock |
| Status | In Stock / Low / Out |
| Last Updated | Date |

**Filters:**
- By stock status (All, In Stock, Low Stock, Out of Stock)
- Search by product name

**Update Stock:**
- Select product
- Current quantity shown
- Enter new quantity
- Select reason (Restock / Correction / Damage / Other)
- Confirm change

**Stock History:**
- View all changes for a product
- Shows: Date, Previous, New, Reason, Changed By

---

## 8.7 Shipping Section

**Pending Shipments View:**
| Column | Content |
|--------|---------|
| Order ID | Link to order |
| Date | Order date |
| Customer | Name |
| Address | Truncated address |
| Products | Items list |
| Action | Add Tracking |

**Add Tracking Form:**
- Order ID (pre-filled)
- Courier Name (dropdown + other)
- Tracking Number (text)
- Tracking URL (auto-filled based on courier)
- Submit → Marks as Shipped

**Shipped Orders View:**
- List of shipped orders
- Tracking info
- Mark as Delivered action

---

## 8.8 Invoices Section

**Invoices List View:**
| Column | Content |
|--------|---------|
| Invoice # | INV-YYYY-XXXXX |
| Date | Invoice date |
| Order | Linked order ID |
| Customer | Name |
| Amount | ₹ Total |
| Actions | Download, Resend |

**Filters:**
- By date range
- Search by invoice number or order ID

**Actions:**
- Download PDF
- Resend to customer email

---

## 8.9 Logs Section

**Log Types:**
- Payment webhooks
- Order creation
- Invoice generation
- Errors

**Log View:**
| Column | Content |
|--------|---------|
| Timestamp | When it happened |
| Type | Log category |
| Message | Log message |
| Details | Expandable data |

**Filters:**
- By type
- By date range
- By severity (Info, Warning, Error)

---

## 8.10 Admin Actions Audit

**Every admin action logs:**
| Field | Purpose |
|-------|---------|
| `admin_id` | Who did it |
| `action` | What they did |
| `target_type` | order / inventory / shipment |
| `target_id` | Which record affected |
| `details` | Additional info |
| `timestamp` | When |
| `ip_address` | From where |

---

## Admin UI/UX Requirements

**Layout:**
- Simple sidebar navigation
- Clean, minimal design
- Mobile-responsive (basic)

**Performance:**
- Fast loading
- Pagination for lists
- Quick search

**Feedback:**
- Clear success/error messages
- Confirmation dialogs for destructive actions
- Loading states

---

## Not Building (Explicitly Out of Scope)

- ❌ Analytics dashboards
- ❌ Charts and graphs
- ❌ Role-based permissions
- ❌ Multiple admin levels
- ❌ Bulk actions
- ❌ Export to Excel/CSV
- ❌ Advanced reporting
- ❌ Notification center
- ❌ Dark mode
- ❌ Customizable dashboard
- ❌ Admin mobile app
