import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpenText, ClipboardList, Home, LifeBuoy } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: BookOpenText },
  { to: "/survey", label: "Survey", icon: ClipboardList },
  { to: "/resources", label: "Resources", icon: LifeBuoy },
] as const;

/** Phone-only bottom navigation, mirroring the mobile design. */
export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${
                  active ? "text-brand" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
