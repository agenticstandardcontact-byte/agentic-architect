"""Single source for static nav HTML (fallback + generator output). JS in script.js replaces on load."""
from __future__ import annotations

STRIPE_BUY = (
    "https://payhip.com/b/98aSq?utm_source=site&utm_medium=nav_buy&utm_campaign=paid_kit"
)

BRAND_SVG = (
    '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">'
    '<path d="M16 2L3 9v14l13 7 13-7V9L16 2z" fill="none" stroke="currentColor" '
    'stroke-width="2" stroke-linejoin="round"/>'
    '<path d="M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="2" '
    'stroke-linecap="round"/>'
    "</svg>"
)


def render_nav_shell(*, section: str = "root") -> str:
    """section: root | blog | hardware | learn"""
    in_subdir = section != "root"
    prefix = "../" if in_subdir else ""
    brand_href = "../" if in_subdir else "#top"
    free_kit = f"{prefix}#free-kit-signup"
    blog_href = "blog/" if section == "root" else ("./" if section == "blog" else f"{prefix}blog/")
    hardware_href = "hardware/" if section == "root" else ("./" if section == "hardware" else f"{prefix}hardware/")
    learn_href = "learn/" if section == "root" else ("./" if section == "learn" else f"{prefix}learn/")

    def link(href: str, label: str, current: bool = False) -> str:
        cur = ' aria-current="page"' if current else ""
        return f'        <a href="{href}"{cur}>{label}</a>'

    links = "\n".join(
        [
            link(f"{prefix}#problem", "The Problem"),
            link(f"{prefix}#kit", "What's Inside"),
            link(f"{prefix}#proof", "Proof"),
            link(f"{prefix}#pricing", "Pricing"),
            link(f"{prefix}#faq", "FAQ"),
            link(blog_href, "Blog", section == "blog"),
            link(hardware_href, "Hardware", section == "hardware"),
            link(learn_href, "Quick Fixes", section == "learn"),
            link(f"{prefix}#resources", "Guides"),
        ]
    )

    return f"""<header class="nav">
  <div class="container nav-inner" data-site-nav>
      <a href="{brand_href}" class="brand" aria-label="Agentic Architect home">
        {BRAND_SVG}
        <span class="brand-text">Agentic<span class="brand-accent">Architect</span></span>
      </a>
      <nav id="navMenu" class="nav-links nav-links-panel" aria-label="Primary">
{links}
        <div class="nav-menu-ctas">
          <a href="{free_kit}" class="btn btn-ghost btn-sm">Get the free kit</a>
          <a href="{STRIPE_BUY}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Buy now</a>
        </div>
      </nav>
      <div class="nav-ctas">
        <a href="{free_kit}" class="btn btn-ghost btn-sm nav-cta-free">Get the free kit</a>
        <a href="{STRIPE_BUY}" class="btn btn-primary btn-sm nav-cta-buy" target="_blank" rel="noopener">Buy now</a>
      </div>
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="navMenu" aria-label="Open menu"><span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span></button>
  </div>
</header>"""
