# Agentic Architect — Marketing Site

Static marketing website for the **Agentic Architect** Cursor persistence framework. Designed to convert visitors into buyers on the [Gumroad listing](https://agenticarchitect.gumroad.com/l/dotnet-persistence-kit).

## Files

| File | Purpose |
|---|---|
| `index.html` | Single-page conversion-optimized landing page |
| `styles.css` | Dark, developer-tuned premium styling |
| `script.js` | Countdown timer, sticky CTA, scroll reveals, exit-intent modal |
| `404.html` | On-brand error page |
| `favicon.svg` | Site icon |
| `og-image.svg` | Open Graph / social share image |
| `robots.txt` / `sitemap.xml` | SEO basics |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll processing |

## Deploy to GitHub Pages

1. Commit and push these files to the **`main`** branch of `agenticstandardcontact-byte/agentic-architect`.
2. In the repo: **Settings → Pages → Build and deployment**
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `/ (root)`
3. Save. The site will be live at:
   `https://agenticstandardcontact-byte.github.io/agentic-architect/`

> If you want to use a custom domain later, add a `CNAME` file containing the domain and configure DNS.

## Conversion techniques used

This site applies a deliberate stack of direct-response marketing tactics tuned for a senior-developer audience:

- **AIDA narrative flow** — Attention (hero) → Interest (problem/pain) → Desire (solution + proof) → Action (pricing + CTA).
- **Pain-Agitate-Solve** — explicit "Context Tax" framing with quantified time/money loss before the solution is introduced.
- **Founder's pricing + anchoring** — strikethrough £49 → £19.99 to anchor the value perception.
- **Scarcity / urgency** — rolling 48-hour countdown in the announcement bar (persisted in `localStorage`).
- **Risk reversal** — 14-day "Reclaim Your Mornings" no-questions refund guarantee.
- **Social proof** — three persona-specific testimonials covering distinct objections (DDD, hallucination, token budget).
- **Authority signals** — schema.org Product markup, MIT license callout, professional support email.
- **Concrete bullets > abstract copy** — every feature is mapped to a tangible developer outcome.
- **Before / After comparison** — side-by-side reframe of the buyer's daily reality.
- **Objection-handling FAQ** — covers the 8 most likely "but..." questions including "I could write this myself."
- **Value math** — explicit £/hour calculation that makes the price look trivial.
- **Multiple CTAs** — hero, mid-page, pricing card, final section, sticky floating button, exit-intent modal.
- **Sticky floating CTA** — appears once the user scrolls past the hero on every page.
- **Exit-intent modal** — desktop mouse-out trigger; scroll-tail fallback on mobile; shown once per session.
- **"Who it's for / who it's not for"** — counterintuitive disqualification builds trust.
- **Bonus stack** — Quickstart PDF, template, daily updates, lifetime updates pile up perceived value vs. price.
- **Accessibility-first** — proper landmarks, focus styles, `prefers-reduced-motion`, `aria-live` countdown.
- **Performance** — zero JS frameworks, no build step, system fonts fallback, single CSS file.

## Tweaking copy

All marketing copy lives in `index.html`. Search for these section IDs to edit fast:

- `#problem` — pain section
- `#solution` — before/after
- `#kit` — the 4 rules
- `#proof` — testimonials
- `#pricing` — offer + guarantee
- `#faq` — objection handling

## Local preview

```bash
# Any static server works. Example:
python -m http.server 8080
# then open http://localhost:8080
```

## License

The site content is part of the Agentic Architect project — © Agentic Architect.
