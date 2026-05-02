# Rebranding Changes Log (Temporary)

Date: 2026-05-02
Purpose: Temporary copy rebrand for payment gateway approval by shifting brand language from "pure/925 silver" to "silver coating / silver-coated" positioning.

## Scope
- Only content/text wording was changed.
- No feature logic, API logic, routing, or component behavior was changed.

## Files Updated

1. `Client/src/components/home/CategorySection.tsx`
- Updated product category description wording from sterling-silver language to silver-coating language.

2. `Client/src/components/home/CraftsmanshipSection.tsx`
- Replaced 925/sterling/hallmark/purity claims with silver-coating and quality-assurance wording.
- Updated visible stat label from `925` to `Silver-Coated`.
- Updated badge text from hallmark-oriented language to quality-assured language.

3. `Client/src/components/home/Footer.tsx`
- Updated heading from `Redefining Silver Beyond Jewellery` to `Redefining Everyday Silver Accessories`.

4. `Client/src/components/home/HeroSection.tsx`
- Updated trust indicators (`925 Sterling`, `Hallmarked`) to neutral quality/silver-coating wording.
- Updated hero image overlay text from numeric purity cue (`925`) to `Silver-Coated` + `Premium Finish`.

5. `Client/src/components/home/HeroSection1.tsx`
- Updated trust bar copy from hallmark wording to quality-assured wording.

6. `Client/src/components/home/ProductSpotlight.tsx`
- Replaced pure/925/sterling positioning with silver-coated copy.
- Updated overlay stat text and certification wording to quality-certified wording.

7. `Client/src/components/products/QuickViewModal.tsx`
- Updated craftsmanship descriptor from 925 wording to silver-coating wording.

8. `Client/src/data/products.ts`
- Reworded product descriptions, long descriptions, features, and material labels to remove `pure/925/sterling` references and use silver-coating-oriented language.

9. `Client/src/pages/AboutPage.tsx`
- Updated brand heading to everyday silver accessories positioning.
- Updated quality promise bullet from hallmark wording to quality-backed wording.

10. `Client/src/pages/CorporatePage.tsx`
- Updated key reason line from hallmark-based claim to premium quality finish wording.

11. `Client/src/pages/CraftsmanshipPage.tsx`
- Updated section heading and process/checkpoint text to remove purity/hallmark cues.
- Replaced technical purity phrasing with quality/finish/certification phrasing.

12. `Client/src/pages/CustomizePage.tsx`
- Updated page description copy from 925 reference to silver-coating wording.

13. `Client/src/pages/ProductDetailPage.tsx`
- Updated product material highlight from `Pure 925 Silver` to `Silver Coating`.

14. `Client/src/pages/admin/AdminProductsPage.tsx`
- Updated product material placeholder example from `925 Sterling Silver` to silver-coating-oriented text.

## Verification Done
- Searched `Client/src` and removed occurrences of:
  - `pure silver`
  - `925 silver`
  - `925 sterling`
  - `sterling silver`
  - standalone `925`
  - `hallmark/hallmarked`
  - `jewellery`

## Safe Revert Strategy (Later)
When payment gateway approval is done, revert only these rebranding edits:

1. Use this file as the source of truth for affected files.
2. Revert selectively by file (recommended) so newer feature work remains intact.
3. For each file above, restore only copy/content lines related to this temporary rebrand.
4. Re-run keyword search to ensure old desired brand language is restored where intended.

Suggested check command at revert time:
- `rg -n --ignore-case "silver coating|silver-coated|quality assured|quality certified" Client/src`


## Additional Temporary Payment-Gateway Compliance Updates (2026-05-02)

Objective: Remove statements implying active online payment gateway support from legal/footer content until gateway approval is complete.

15. `Client/src/pages/legal/TermsConditionsPage.tsx`
- Updated payment section to indicate that `Cash on Delivery (COD)` is the currently available method.
- Removed the claim `Online payments via a Secured Payment Gateway`.
- Replaced online-payment specific wording with neutral future-ready language for payment methods.
- Updated refund wording to avoid `original payment method` / gateway-policy references.

16. `Client/src/pages/legal/PrivacyPolicyPage.tsx`
- Renamed section from `Payment Processing` to `Payment Information Handling`.
- Removed card/gateway-centric storage statement and replaced with current-state COD + refund transfer handling language.
- Replaced `Payment gateway providers` in data-sharing list with `Banking or payout partners (only when required for refunds)`.

17. `Client/src/pages/legal/RefundPolicyPage.tsx`
- Removed `Online payments` refund method line.
- Standardized refund mode to bank transfer/UPI confirmed by support at refund time.
- Replaced `payment gateway delays` with `banking network delays`.

18. `Client/src/components/home/Footer.tsx`
- Updated trust badge from `Secure Checkout` to `Secure Ordering` to avoid implying online gateway checkout.

### Verification for This Subset
- Checked policy/footer files for and removed these active-gateway phrases:
  - `online payment`
  - `secured payment gateway`
  - `original payment method`
  - `payment gateway`

### Revert Note for This Subset
- After payment gateway goes live, restore online-payment language only in these four files (items 15-18), without touching unrelated feature updates.
