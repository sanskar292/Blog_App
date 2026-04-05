# Design System Specification: High-End Editorial & Literary Multi-Format Platform

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built to transcend the "template" look of modern CMS platforms. Our Creative North Star is **The Digital Curator**—a philosophy that treats every screen like a high-end physical publication. 

Instead of rigid, symmetrical grids, we utilize **Intentional Asymmetry** and **Atmospheric Whitespace** to guide the eye. We break the "web box" feel by overlapping serif typography over imagery and using tonal depth rather than borders. The goal is to make the reader feel they are holding a heavy-stock linen paper magazine, where the content dictates the container, not the other way around.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "New Neutral" approach: moving away from stark white (#FFFFFF) and towards a sophisticated cream-based foundation that reduces eye strain and feels premium.

### Palette Roles
- **Primary (`#000000`):** Reserved for high-contrast headlines and structural "ink."
- **Secondary (`#725b35`):** Our muted gold. Used sparingly for curated accents, focus states, and signature callouts.
- **Tertiary/Neutral (`#444748`):** For metadata and secondary UI that shouldn't compete with content.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. 
- Use `surface_container_low` (#f5f3ee) for large content blocks.
- Transition to `surface` (#fbf9f4) for the main canvas.
- For high-focus "Featured" zones, use `surface_container_highest` (#e4e2dd).

### The "Glass & Signature Texture" Rule
To add "soul," use **Glassmorphism** for floating navigation and top-level headers. Apply a background-blur (12px–20px) to `surface_container_low` at 85% opacity. For Hero sections, use a subtle linear gradient transitioning from `primary` (#000000) to `primary_container` (#1c1b1b) to create a sense of infinite depth.

---

## 3. Typography: Editorial Authority
The interplay between **Noto Serif** and **Work Sans** creates a tension between classic literary tradition and modern utility.

| Token | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Noto Serif | 3.5rem | Poetry titles and immersive story openers. |
| **Headline-LG** | Noto Serif | 2.0rem | Standard article titles. |
| **Title-LG** | Work Sans | 1.375rem | Section headers and UI labels. |
| **Body-LG** | Work Sans | 1.0rem | Long-form article text (leading: 1.6). |
| **Label-MD** | Work Sans | 0.75rem | Metadata (Date, Author) and small UI. |

**Stylistic Note:** For Poetry, always use Noto Serif for body text to maintain atmosphere. For Articles, use Work Sans for body text to ensure maximum legibility.

---

## 4. Elevation & Tonal Layering
We reject the "drop shadow" of the early 2010s. Depth in this system is achieved through **Tonal Layering**.

- **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f5f3ee) background. This creates a soft, natural "lift" that mimics paper resting on a desk.
- **Ambient Shadows:** If a floating element (like a context menu) is required, use a shadow with a 32px blur at 5% opacity, tinted with the `on_surface` color (#1b1c19).
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (#c4c7c7) at **15% opacity**. A border should be felt, not seen.

---

## 5. Components & Signature Layouts

### Cards & Feed Items
**Prohibition:** No divider lines between list items. 
- Use the **Spacing Scale `8` (2.75rem)** to separate articles.
- For Stories, use "Full-Bleed" imagery that overlaps the `display-md` headline, using a -2rem margin on the text to create a bespoke, layered look.

### Buttons
- **Primary:** Filled `primary` (#000000) with `on_primary` (#ffffff) text. Use `md` (0.375rem) roundedness for a slightly softened architectural feel.
- **Secondary:** Transparent background with a `secondary` (#725b35) Ghost Border (20% opacity).

### Specialized Content Components
- **The Poetry Block:** Centered layout, using `16` (5.5rem) horizontal padding. Text is set in Noto Serif with a left-aligned "optical center" to allow the shape of the poem to provide the visual rhythm.
- **The Article Pull-Quote:** A `secondary_container` (#fedeae) vertical bar (2px wide) on the left, with text set in `headline-sm` Noto Serif.
- **Immersive Navigation:** A minimalist fixed bar using the **Glassmorphism** rule, ensuring the content is always visible through the UI.

---

## 6. Do’s and Don'ts

### Do:
- **Use "White Space as a Margin":** Allow Poetry to "breathe" by using Spacing Scale `20` (7rem) between stanzas.
- **Mix the Scales:** Pair a `display-lg` headline with a `label-sm` metadata tag for high-contrast editorial impact.
- **Use Tonal Shifting:** Change the background from `surface` to `surface_container` when a user scrolls from a Story into a Comment section to signal a change in context.

### Don't:
- **Don't use 100% Black for UI icons:** Use `on_surface_variant` (#444748) to keep the interface soft.
- **Don't use standard Dividers:** If you need to separate content, use a Spacing Scale `10` or a change in background color.
- **Don't center Article text:** Keep long-form articles left-aligned for readability; only Poetry and "Atmospheric Stories" should experiment with centering or asymmetrical offsets.
- **Don't use high-contrast shadows:** If a shadow looks like a shadow, it’s too dark. It should look like "ambient occlusion."

---

## 7. Accessibility & Motion
Ensure a minimum contrast ratio of 4.5:1 for all body text against its background. When transitioning between formats (e.g., Article to Story), use a **soft fade-and-slide** (duration: 400ms, easing: cubic-bezier(0.4, 0, 0.2, 1)). The UI should feel like it is "inhaling" and "exhaling," never snapping.