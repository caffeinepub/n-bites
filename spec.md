# NÚBITES

## Current State
Full landing page exists with hero, about, mission, products, sustainability, lifestyle, testimonials, newsletter, and footer sections. Quick shop modal exists. No cart, no checkout flow. Screenshots from user uploads are used in some sections. No brand logo image.

## Requested Changes (Diff)

### Add
- Brand logo: use uploaded mascot image (Screenshot-2026-02-16-113800-1.png) as the logo in navigation and hero
- Packaging showcase section using package-.jpeg image
- Full cart sidebar/drawer (slide-in) with item list, quantity controls, remove item, subtotal
- Full checkout flow: cart review -> shipping info form -> order confirmation
- Cart icon in navbar with item count badge

### Modify
- Remove old screenshot images (Screenshot-17, Screenshot-18, Screenshot-19) from any sections they appear
- Product cards: "Add to Cart" now adds to the global cart state
- About/lifestyle sections: replace screenshot images with packaging image or mascot logo
- Navigation: add cart icon button with badge

### Remove
- Any usage of /assets/uploads/Screenshot-17--2.png, Screenshot-18--3.png, Screenshot-19--1.png

## Implementation Plan
1. Add global cart state (React context or useState lifted to App)
2. Create CartDrawer component with item list, quantity +/-, remove, subtotal, checkout button
3. Create CheckoutModal/page with multi-step: cart review, shipping form, confirmation
4. Update Navbar with cart icon + badge
5. Update product cards to use cart context addToCart
6. Replace screenshot images with packaging image and mascot logo
7. Add packaging showcase section using package-.jpeg
