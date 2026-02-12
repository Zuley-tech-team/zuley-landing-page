# Phase 5: Invoicing

## Overview
GST-compliant invoices are a **legal requirement** in India. Missing or incorrect invoices can result in penalties and notices. This phase ensures every successful payment has a proper invoice.

> ⚠️ **WARNING**: This is where founders get legal notices. Don't skip or shortcut this.

---

## Core Requirements

### 5.1 Invoice Generation Trigger

**When:** Immediately after order creation (in same transaction as payment success)

**Flow:**
```
Payment Success 
    → Order Created 
    → Invoice Generated 
    → Invoice Stored 
    → Invoice Emailed
```

**Rule:** No order exists without an invoice.

---

### 5.2 Invoice Number Format

**Format:** `INV-YYYY-XXXXX`

- `INV` = Invoice prefix
- `YYYY` = Financial year (April-March)
- `XXXXX` = Sequential number (00001, 00002, etc.)

**Example:** `INV-2025-00042` (42nd invoice in FY 2024-25)

**Requirements:**
- Sequential without gaps
- Unique across all invoices
- Resets each financial year
- Never reused (even if order cancelled)

**Financial Year Logic:**
- April 2024 - March 2025 = FY 2025
- April 2025 - March 2026 = FY 2026

---

### 5.3 Invoice Data Requirements

**Seller Details (Fixed):**
| Field | Value |
|-------|-------|
| Business Name | Zuley (or legal entity name) |
| GSTIN | 27XXXXX1234X1Z5 (actual GST number) |
| Address | Full registered address |
| State | Maharashtra |
| State Code | 27 |
| PAN | XXXXX1234X |

**Buyer Details (From Order):**
| Field | Source |
|-------|--------|
| Name | Customer full name |
| Address | Shipping address |
| State | Customer state |
| State Code | Derived from state |
| Phone | Customer phone |
| Email | Customer email |

**Invoice Details:**
| Field | Value |
|-------|-------|
| Invoice Number | Generated |
| Invoice Date | Order date |
| Order ID | Human-readable order ID |
| Place of Supply | Customer state |

---

### 5.4 Line Items

**For Each Product:**
| Field | Purpose |
|-------|---------|
| Sr. No. | 1, 2, 3... |
| Description | Product name + variant |
| HSN Code | Harmonized System Nomenclature code |
| Quantity | Units purchased |
| Unit Price | Price before tax |
| Taxable Value | Quantity × Unit Price |
| GST Rate | 3% for silver (or applicable rate) |
| CGST Amount | If intra-state |
| SGST Amount | If intra-state |
| IGST Amount | If inter-state |
| Total | Taxable + Tax |

---

### 5.5 GST Calculation Logic

**Intra-State (Seller & Buyer same state):**
- CGST = Taxable Value × (GST Rate ÷ 2)
- SGST = Taxable Value × (GST Rate ÷ 2)
- IGST = 0

**Inter-State (Seller & Buyer different states):**
- CGST = 0
- SGST = 0
- IGST = Taxable Value × GST Rate

**Example for Silver (3% GST, ₹10,000 taxable):**

| Scenario | CGST | SGST | IGST | Total Tax |
|----------|------|------|------|-----------|
| Intra-state | ₹150 | ₹150 | ₹0 | ₹300 |
| Inter-state | ₹0 | ₹0 | ₹300 | ₹300 |

---

### 5.6 Invoice PDF Generation

**Required Sections:**
1. Header (Logo, Invoice title, Invoice number, Date)
2. Seller details (Name, GSTIN, Address)
3. Buyer details (Name, Address, State) [right side / below buyer details]
4. Product table (Line items with tax breakup)
5. Summary (Subtotal, Tax totals, Grand total)
6. Amount in words
7. Footer (Terms, authorized signatory placeholder)

**Design Requirements:**
- Clean, professional layout
- Printable on A4
- Tax breakup clearly visible
- Invoice number prominent
- GST details compliant

---

### 5.7 HSN Codes

**What is HSN:** Harmonized System Nomenclature — standardized product codes for GST.

**Silver Products:**
| Category | HSN Code |
|----------|----------|
| Articles of silver jewellery | 7113 11 |
| Silver coins | 7118 10 |
| Silver bars/ingots | 7106 |
| Silver utensils | 7114 11 |

**Storage:**
- Each product must have HSN code in database
- Required field for product creation
- Used in invoice line items

---

### 5.8 Invoice Storage

**PDF Storage:**
- Generate PDF after order creation
- Store in secure file storage
- Link to order record
- Retain permanently (8+ years for tax)

**Database Record:**
| Field | Purpose |
|-------|---------|
| `id` | Internal reference |
| `invoice_number` | INV-YYYY-XXXXX |
| `order_id` | Link to order |
| `pdf_url` | Path to stored PDF |
| `total_amount` | Invoice total |
| `tax_amount` | Total tax charged |
| `created_at` | Generation timestamp |

---

### 5.9 Invoice Email

**Trigger:** After invoice PDF generated

**Email Contents:**
- Subject: "Your Zuley Invoice - {Invoice Number}"
- Body: Thank you message, order summary
- Attachment: Invoice PDF

**Fallback:** If email fails, invoice still stored. Admin can resend.

---

### 5.10 Invoice Accessibility

**Customer:** Receives via email only (no login to view)

**Admin:**
- View any invoice
- Download PDF
- Resend invoice email
- Search by invoice number, order ID, or date

---

## Invoice States

| State | Meaning |
|-------|---------|
| `generated` | Invoice created and stored |
| `emailed` | Sent to customer |
| `void` | Cancelled (for cancelled orders) |

**Note:** Voided invoices are never deleted, just marked. Invoice number never reused.

---

## Validation Rules

- [ ] Invoice number is unique
- [ ] Invoice number is sequential
- [ ] All line items have HSN codes
- [ ] Tax calculation is correct
- [ ] Seller GSTIN is present
- [ ] Buyer details are complete
- [ ] PDF generated successfully

---

## Not Building (Explicitly Out of Scope)

- ❌ Credit notes (manual process for now)
- ❌ Debit notes
- ❌ Pro-forma invoices
- ❌ Multiple invoice templates
- ❌ E-invoicing (IRN generation) - may add later if mandatory
- ❌ E-way bill generation
- ❌ Auto GST filing integration
- ❌ Invoice editing after generation
- ❌ Multi-currency invoices
