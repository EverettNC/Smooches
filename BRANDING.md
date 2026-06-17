# Smooches Branding Task

**For Claude:** Please take ownership of branding and visual identity polish for the Smooches app. This is a high-priority creative task.

## Brand Essence
- **Name**: Smooches (playful, bold, flirty, intimate connections)
- **Core visual**: The red lips logo in `public/smooches-logo.jpeg` (vibrant red lips + "SMOOCHES" type). This is the hero asset — use it proudly and cleanly. (Red lips can serve as signal accent against the brass/dark base.)
- **Vibe**: "Goth Punk" — brass on near-black. Playful, bold, flirty, intimate connections with a dark, edgy, premium feel (live video, radio, clips, gifting, creator economy). Think bold kisses + late-night connections in a sophisticated goth-punk aesthetic.
- **Brand Colors** (from /Users/EverettN/Downloads/Christman AI Project — Brand Colors.pdf - "Goth Punk" theme operating as Luma Cognify AI):
  - **Brass (Primary Accent)**: 
    - Highlight --brass-hi: #F2D894 (sheen, top of gradient)
    - Brass --brass: #C9A24B (primary, headings, accents, selection)
    - Mid --brass-mid: #91702F (gradient body, shadow side)
    - Deep --brass-lo: #5E441B (gradient base, engraving)
  - **Backgrounds (Near-black greens)**:
    - --bg: #06100F (page background — darkest)
    - --panel: #0A1715 (card / panel surface)
    - --panel2: #0D1D1A (secondary / raised panel)
  - **Ink (Text)**:
    - Primary --ink: #EAE6D8 (body text — warm bone white)
    - Secondary --ink2: #A4B2AB (muted sage — sub-text)
    - Tertiary --ink3: #65746E (captions, dim labels)
  - **Borders**: --bbr: #C9A24B
  - **Signal Accents**:
    - Electric Teal --teal: #2DE1DC (roles, links, kicker labels)
    - Kill Green --kill: #00E676 (status / critical action)
  - **Brass Gradient**: linear-gradient(178deg, #F2D894 → #C9A24B → #91702F → #5E441B)
- **See also**: `theme.json`, `client/src/index.css` (brass vars + utilities), `public/smooches-logo.jpeg`
- **Tone**: Confident, playful, generous, creator-first. Dark, moody, premium.

## Current Problems (audit summary)
- Logo is over-processed in Header (heavy filters, animate-pulse, weird border).
- Scattered hard-coded colors: old copper `#8f5220`, `#c87941`, `orange-*`, `red-*`, random `blue-*/purple-*` (especially auth register button). Switch everything to the new brass/goth-punk palette above.
- Nav buttons use different accent colors per section (inconsistent).
- index.html favicon is a pink heart (off-brand); description is outdated (too "audio only").
- Gradients and CTAs are nice but not unified to one system.
- Some pages lean on theme tokens, others don't.
- Text "SMOOCHES" often uses clashing multi-color gradients.

## Your Mission (do this step-by-step)
1. **Read these files first** (use read_file):
   - `theme.json`
   - `client/src/index.css`
   - `client/src/components/header.tsx`
   - `client/index.html`
   - `client/src/pages/home-page.tsx`
   - `client/src/pages/auth-page.tsx`
   - `client/src/pages/live.tsx`
   - `tailwind.config.ts`
   - `client/src/App.tsx` (briefly)
   - Any other pages/components that feel off-brand.

2. **Logo & Brand Mark**
   - Clean up Header logo usage: use `/smooches-logo.jpeg` (or `/logo.jpeg`) without heavy filters/saturate/contrast/hue-rotate.
   - Reasonable size (w-10 h-10 or w-12 h-12 with rounded), subtle shadow or copper border if needed. Remove animate-pulse or keep very light.
   - Make the wordmark "SMOOCHES" use a brand-aligned gradient (copper → gold → warm red) or the `.smooches-logo` class.
   - Use the lips logo prominently on landing/auth/home headers where it fits.

3. **Color System Unification**
   - Prefer CSS variables + Tailwind tokens (`primary`, `accent`, `copper-*` utilities where defined).
   - Update or extend `theme.json` + `:root` in index.css if the current copper/gold needs a slightly redder primary to better match the lips logo (e.g. push hue toward red-copper).
   - Add/reinforce utilities if helpful: copper-btn, copper-gradient, etc.
   - Replace hard-coded colors across the app with tokens.
   - Keep strong red for LIVE states/indicators (it fits the lips).

4. **Header & Navigation Polish**
   - Unify all nav button hover/active states to brand colors (primary/accent or copper tones). Remove random blue/purple/red variants.
   - Clean flex layout, good active states.
   - Ensure mobile-friendly.

5. **index.html & Meta**
   - Update `<title>` and description to better capture "live social moments, video, radio, clips & connections".
   - Replace favicon with a simple brand-matching one (red/copper lips-inspired SVG data URL or keep simple).
   - Add/improve OG tags if easy.

6. **Key Pages & Components**
   - home-page, auth-page, live, feed, create-content, radio: Align headings (use primary/accent gradients where they exist), CTAs, cards, icons.
   - Auth: Make login/register buttons use the same warm copper/gold brand gradient (no blue-purple).
   - Live: Keep energy with red but tie accents to copper where possible.
   - Use existing `.copper-*` and gradient patterns consistently.
   - Buttons: Prefer `bg-primary` / copper-btn style or Tailwind variants.

7. **General Rules**
   - Read files before editing. Use search_replace for precise changes.
   - No new unnecessary files.
   - Do not break functionality (live signaling, auth, etc.).
   - Keep dark cozy aesthetic.
   - After changes run `npm run check` (or tsc) to verify.
   - Make the whole app feel like ONE brand.

## Success Criteria
- The lips logo looks sharp and intentional everywhere it's used.
- Palette feels warm, cohesive, and "Smooches" (red lips + copper/gold on dark).
- No random blue/purple accents in primary UI.
- Header is clean and on-brand.
- Buttons, cards, headings have consistent treatment.
- App feels fun, bold, and premium-cozy when you open it.

Start with the reads. Then make targeted edits. When done, give a short summary of changes + any remaining polish ideas.

You got this — make Smooches look 🔥 and kissable.
