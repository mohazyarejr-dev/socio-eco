import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { BRAND_NAME, BrandLogo } from "@/components/site/brand-mark";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About the Research" },
  { to: "/health-effects", label: "Health Effects" },
  { to: "/socio-economic-effects", label: "Socio-Economic Effects" },
  { to: "/findings", label: "Research Findings" },
  { to: "/resources", label: "Prevention & Resources" },
] as const;

const MORE_LINKS = [
  { to: "/survey", label: "Take the Survey" },
  { to: "/references", label: "References" },
  { to: "/privacy", label: "Privacy & Ethics" },
  { to: "/login", label: "Admin Login" },
] as const;

const PILLARS = ["Real awareness", "Better choices", "Healthier youth", "Stronger communities"];

export function SiteFooter() {
  return (
    <footer className="band-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="size-11 text-white" />
            <span className="text-lg font-extrabold tracking-tight">{BRAND_NAME}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-foreground/75">
            Healthy Youth • Stronger Communities. An independent research initiative studying
            the socio-economic and health-related effects of substance abuse among young
            people.
          </p>
        </div>

        <nav aria-label="Footer quick links">
          <h2 className="text-sm font-bold text-sky">Quick links</h2>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-navy-foreground/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer secondary links">
          <h2 className="text-sm font-bold text-sky">More</h2>
          <ul className="mt-4 space-y-2.5">
            {MORE_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-navy-foreground/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-sky">Contact us</h2>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              Nairobi, Kenya
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              <span>
                info@youthhealthmatters.example
                <span className="block text-xs text-navy-foreground/50">
                  (placeholder — replace with the study team's verified address)
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-2 text-sm font-semibold">
            {PILLARS.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                {i > 0 ? <span className="text-sky" aria-hidden="true">•</span> : null}
                <span className="text-white/90">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-navy-foreground/60">
            This platform is for research and education only. It does not provide medical
            diagnosis, treatment, or emergency care — if you or someone you know is in
            immediate danger, contact your local emergency services. Figures marked "sample"
            are demonstration data until verified research results are published.
          </p>
          <p className="mt-3 text-center text-xs text-navy-foreground/50">
            © {new Date().getFullYear()} {BRAND_NAME}. Survey responses are anonymous and used
            for research purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
