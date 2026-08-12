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

The combined comparison confirms the selected three-pane composition is preserved: a dedicated Website/Marketplace workspace switch and page/section navigation on the left; a persistent status, device, draft, and publish toolbar; a real page preview in the middle; and a plain content inspector on the right. The implementation uses the live Wander site rather than recreating the light hero imagined by the mock. This is an intentional content-and-brand constraint: the CMS edits the existing public pages without replacing their approved layouts.

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
- Copy and content: The administrative copy is short and operational. Website and Marketplace are explicitly separate. The right rail exposes only content fields—text, images, alt text, and links—with no typography, color, spacing, or layout controls.
- Icons and controls: Lucide icons provide one consistent stroke family. Device toggles, navigation, upload, save, publish, and collapse controls all have semantic button or link roles and visible selected/disabled states.
- Responsiveness and accessibility: Desktop and mobile preview states were exercised. At the 1024 px shell the preview remains visible. Controls use labelled semantic elements; edit regions are keyboard focusable; images include editable alt text; preview links are safely disabled while editing; and unsaved navigation receives a confirmation guard.

## Primary interactions tested

- Navigated through Home, About, Pricing, How it works, Quick repair, Location, and FAQ. Every page loaded its own live iframe, section list, and editable field set.
- Changed the About headline and confirmed the corresponding live-preview heading updated immediately.
- Selected a section from the left rail and then selected Services by clicking the live preview; both updated the inspector.
- Exercised Desktop and Mobile preview toggles.
- Exercised local-preview Save draft and Publish success states.
- Verified unsaved-state enablement and the page-leave confirmation guard.
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
4. Final side-by-side pass
   - No actionable P0, P1, or P2 findings remain. The public page imagery and hero composition differ from the illustrative mock by design because the editor is rendering the real current website.

## Findings

No actionable P0, P1, or P2 findings remain.

## Open questions

None.

## Implementation checklist

- [x] Website and Marketplace are separate workspaces.
- [x] Seven core public Website pages have locked content schemas.
- [x] Text, image, alt text, and link replacement only; no style controls.
- [x] Live click-to-select preview with Desktop/Mobile states.
- [x] Draft and publish UI with protected persistence routes and version history.
- [x] Unsaved-change and character-limit safeguards.
- [x] Browser interaction, responsive shell, lint, unit tests, and production build verified.

## Follow-up polish

- P3: the selected reference uses a brighter waterfront hero while the real Homepage is intentionally dark. This can only be reconciled by redesigning the public homepage itself, which is outside this CMS task.

final result: passed
