# Wander Bike Website CMS design QA

## Comparison target

- Source visual truth: `/Users/denniszhang/.codex/generated_images/019ff732-a608-7d30-977a-5e16972be7b5/exec-d67ab0cb-e9eb-4665-ad7d-a8d1628c7622.png`
- Final browser-rendered implementation: `/Users/denniszhang/Desktop/網站/wander-bike-rentals/design/qa/website-manager-1440x1024.png`
- Normalized side-by-side comparison: `/Users/denniszhang/Desktop/網站/wander-bike-rentals/design/qa/website-manager-comparison.png`
- Mobile-preview evidence: `/Users/denniszhang/Desktop/網站/wander-bike-rentals/design/qa/website-manager-mobile-preview-1440x1024.png`
- State: local development Website manager, Home page, Hero section selected, desktop preview active, no unsaved changes.
- CSS viewport: 1440 × 1024 px at 1× density.
- Source pixels: 1488 × 1058 px, normalized to 1440 × 1024 with proportional resampling.
- Implementation pixels: 1440 × 1024 px at 1× capture density.

## Full-view comparison evidence

The combined comparison confirms the selected three-pane composition is preserved: a dedicated Website/Marketplace workspace switch and page/section navigation on the left; a persistent automatic-save status, device, and publish toolbar; a real page preview in the middle; and a plain content inspector on the right. The Home preview now implements the reference's light, left-copy/right-waterfront-image hero instead of the previous dark full-bleed hero.

The relative density, column separation, cyan selected state, thin borders, white surfaces, and compact controls follow the reference. At 1440 px the preview is scaled to expose the complete desktop composition within the available center column. At 1024 px the adjusted 0.5 preview scale prevents the central iframe from disappearing behind its own overflow region.

## Focused-region comparison evidence

- The right inspector was inspected at native screenshot scale. Field labels, character counters, link icon treatment, focus state, image preview, replace action, and published timestamp are readable and aligned.
- The left navigation was checked across all seven editable pages. Each page changes the section list and inspector model instead of opening a Marketplace view.
- A separate mobile-preview capture verifies the preview-device control and 430 px responsive site frame without changing the surrounding CMS shell.
- A more granular crop was unnecessary after the native 1440 px capture because the reference and implementation fields are readable in the combined 2880 px comparison.

## Required fidelity surfaces

- Fonts and typography: The implementation keeps the product's existing sans-serif system and uses a clear 11–18 px admin hierarchy. The reference's compact administrative weight, uppercase eyebrow labels, and strong active labels are preserved. No truncation affects task comprehension; long content stays inside editable controls.
- Spacing and layout rhythm: Left navigation, top toolbar, center preview, and right inspector use consistent 1 px dividers and compact 8–24 px spacing. The 15 rem left rail and 22 rem inspector remain close to the reference proportions. The smaller live preview is an acceptable accommodation for the existing site's 1440 px layout.
- Colors and visual tokens: White and cool-grey surfaces, cyan/teal active states, amber unsaved state, green saved state, and teal publish action follow the reference's semantic palette and the existing Wander brand.
- Image quality and asset fidelity: The live preview uses the project's real Wander logo and site photography. The implementation did not replace any visible source asset with CSS art, emoji, or handcrafted SVG. Uploaded CMS imagery is displayed at its actual crop in both preview and inspector.
- Copy and content: The administrative copy is short and operational. Website and Marketplace are explicitly separate. The right rail exposes only content fields—text, images, alt text, and links—with no typography, color, spacing, or layout controls. Home uses the reference's Steveston-local headline and physical-shop/marketplace distinction.
- Icons and controls: Lucide icons provide one consistent stroke family. Device toggles, navigation, upload, publish, and collapse controls all have semantic button or link roles and visible selected/disabled states. Draft saving is automatic and communicated through status text instead of a separate action.
- Responsiveness and accessibility: Desktop and mobile preview states were exercised. At the 1024 px shell the preview remains visible. Controls use labelled semantic elements; edit regions are keyboard focusable; images include editable alt text; preview links are safely disabled while editing; and unsaved navigation receives a confirmation guard.

## Primary interactions tested

- Navigated through Home, About, Pricing, How it works, Quick repair, Location, and FAQ. Every page loaded its own live iframe, section list, and editable field set.
- Changed the About headline and confirmed the corresponding live-preview heading updated immediately.
- Selected a section from the left rail and then selected Services by clicking the live preview; both updated the inspector.
- Exercised Desktop and Mobile preview toggles.
- Verified the 700 ms automatic-save state transition and the direct Publish action, which flushes the latest content before publishing.
- Verified page navigation flushes a pending automatic save instead of showing an unsaved-change confirmation.
- Checked new browser-console errors after each of the seven page transitions: zero current errors.
- The local `.env.local` Supabase URL points at a different project than the repository's linked Supabase project, so local persistence correctly falls back to code defaults; the migrations were applied to the linked `wander-bike-rentals` project and the production environment must use that matching project for real saves.

## Comparison history

1. Initial implementation comparison
   - P2: the 1440 px public page was rendered at the center column's responsive width, producing a mobile-style header inside the desktop preview.
   - Fix: render the iframe at a real 1440 px width and scale the complete page canvas inside the center column.
   - Post-fix evidence: `/Users/denniszhang/Desktop/網站/wander-bike-rentals/design/qa/website-manager-1440x1024.png` shows the full desktop site navigation and hero.
2. Interaction QA
   - P1: rapid live-content messages could interrupt the public page's entry animation and leave a selected section at opacity 0, making the preview appear blank.
   - Fix: CMS preview sections now disable entry animations and force stable visible state without changing the public site outside preview mode.
   - Post-fix evidence: both final desktop and mobile-preview screenshots show fully visible content after live updates and device switching.
3. Responsive shell QA
   - P2: at a 1024 px shell the original desktop preview scale caused the wide iframe to be clipped out of the visible center region.
   - Fix: set responsive CMS preview scales to 0.5 at 1024 px, 0.58 at 1280 px, and 0.66 at 1600 px.
   - Post-fix browser evidence: the 1024 px shell displayed the header, hero, and review section while retaining the inspector and left rail.
4. Home-version correction
   - P1: the CMS rendered the old dark Homepage even though the selected visual reference showed a bright Steveston waterfront hero.
   - Fix: replaced the Home hero with the reference's light left-copy/right-image composition and Fisherman's Wharf asset while keeping the remaining public sections intact.
   - Post-fix evidence: live browser inspection confirmed the light Steveston waterfront hero, locked CMS field inventory, and the Collections section immediately below the preview hero.
5. Section-selection regression
   - P1: selecting How it works → Collections could leave the two cards transparent because the page reveal animation re-applied after a preview update.
   - Fix: preview mode now disables both section and cascade reveal opacity/transform states.
   - Post-fix evidence: live browser inspection confirmed both collection cards remain visible after selecting Collections and after content updates.
6. Final side-by-side pass
   - No actionable P0, P1, or P2 findings remain.

## Findings

No actionable P0, P1, or P2 findings remain.

## Open questions

None.

## Implementation checklist

- [x] Website and Marketplace are separate workspaces.
- [x] Seven core public Website pages have locked content schemas.
- [x] Text, image, alt text, and link replacement only; no style controls.
- [x] Live click-to-select preview with Desktop/Mobile states.
- [x] Automatic draft saving, direct publish, protected persistence routes, and version history.
- [x] Pending-save navigation and character-limit safeguards.
- [x] Browser interaction, responsive shell, lint, unit tests, and production build verified.

## Follow-up polish

- P3: the reference includes a decorative illustrated route line below the hero; the implementation keeps the existing Reviews section immediately below rather than introducing a new non-content visual asset.

## Metro Vancouver route-map extension — 12 August 2026

- Source visual truth: `design/qa/route-map-source-desktop-1440x1024.png` and `design/qa/route-map-source-mobile-390x844.png` captured from `https://www.letsgobiking.net/vancouver-route-map/`.
- Implementation evidence: `design/qa/route-map-implementation-desktop-1440x1024.png` and `design/qa/route-map-implementation-mobile-390x844.png` captured from `http://localhost:4173/guides/metro-vancouver-route-map`.
- Combined comparison evidence: `design/qa/route-map-comparison-desktop.png` and `design/qa/route-map-comparison-mobile.png`.
- Viewports: desktop 1440 × 1024 CSS px; mobile 390 × 844 CSS px. Source and implementation captures use the same CSS viewport and browser density with no downsampling.
- State: public page, initial route selected; desktop route explorer visible; mobile live map visible with compact selected-route control.
- Scope decision: this is a Wander-branded extension rather than a pixel clone. It preserves the source page's real public Google My Maps route layer and attribution, then adds Wander's search, difficulty filtering, route summaries, and city-guide links.

**Full-view comparison evidence**

- Desktop: the source's map-first composition and Google map layer remain recognizable; the Wander implementation improves scanability with a persistent route finder while retaining the source map's native controls and terms.
- Mobile: the same map layer remains the first main task surface; the implementation preserves map legibility and adds a compact selected-route affordance without covering the map's native controls.

**Focused-region comparison evidence**

- Map controls and attribution: checked at desktop and mobile sizes; Google controls, Terms, map data, Wander's source note, and the full-map link are visible.
- Route explorer: selected, filtered, empty, and search states were checked through the rendered DOM and visible browser state.
- Mobile route drawer: open and closed states were checked, including the city-guide link and source-route link.

**Required fidelity surfaces**

- Fonts and typography: Wander's existing Geist/Arial UI stack is consistent with the product; headings, route labels, status pills, helper text, and mobile wrapping remain readable. The source's serif/editorial font is intentionally not copied because this is a Wander product extension.
- Spacing and layout rhythm: desktop uses a stable sidebar/map split; mobile reorders to map before filters. No horizontal overflow at 390 px. Map controls, route card, Chatbase button, and fixed mobile action bar do not overlap.
- Colors and visual tokens: Wander navy, teal, white, and semantic difficulty tones remain consistent and meet visible contrast needs.
- Image quality and asset fidelity: the real Google My Maps embed is used; no hotlinked hero imagery, custom SVG map, CSS art, or placeholder image substitutes were introduced.
- Copy and content: page copy identifies the public source, separates Wander summaries from source route details, and tells riders to verify changing conditions.
- Icons: existing lucide-react icons match the Wander navigation and editorial UI already used throughout the product.
- Accessibility: labeled search, pressed-state filters, semantic buttons/links, keyboard focus styles, 40–48 px controls, dialog semantics, and non-overlapping mobile fixed UI were checked.

**Comparison history**

1. P2 — mobile information order placed the long route list ahead of the map. Fix: changed the explorer to a mobile flex layout with map first and sidebar second. Post-fix evidence: `design/qa/route-map-implementation-mobile-390x844.png`.
2. P2 — compact selected-route control overlapped the Chatbase control. Fix: reserved the right-side control lane and verified bounding boxes do not intersect. Post-fix evidence: `design/qa/route-map-implementation-mobile-390x844.png`.
3. P2 — a selected route could remain visible after a filter excluded it. Fix: selected-route resolution now occurs inside the filtered route set, falling back to the first matching result or no card for an empty state.

**Primary interactions tested**

- Search by area (`Burnaby` → one matching route).
- Difficulty filter (`Moderate` → three matching routes).
- Route selection (`Surrey Parks Loop` → matching summary and `/guides/surrey-bc-cycling-guide`).
- Mobile route-details drawer open/close and guide link.
- Guides desktop menu entry to `/guides/metro-vancouver-route-map`.
- Full Google map link and attributed source-route links.

**Console review**

- No app errors. Google My Maps emits upstream deprecation/performance warnings from its own embedded scripts; these are outside Wander's bundle and do not block use.

**Findings**

- No remaining P0, P1, or P2 findings.

**Follow-up polish**

- P3: a future data pass could add more curated route summary cards while keeping the full public 80+ route layer intact.

final result: passed
