"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Today",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 3l8 8h-2v9a1 1 0 01-1 1h-3v-6a2 2 0 00-4 0v6H7a1 1 0 01-1-1v-9H4l8-8z" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 4l8 8-8 8-8-8 8-8z" />
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 3l2.4 5.4L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.6L12 3z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur border-t border-[color:var(--border)] safe-area-pb">
      <div className="max-w-md mx-auto flex">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 touch-manipulation transition-colors ${
                active ? "text-terracotta" : "text-ink-mute hover:text-ink-soft"
              }`}
            >
              {item.icon(active)}
              <span className={`text-[11px] ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
