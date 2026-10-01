import Link from "next/link";
import { LogoutButton } from "./logout-button";

const links = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/students", label: "الطلاب" },
  { href: "/admin/levels", label: "المستويات" },
  { href: "/admin/semesters", label: "الفصول" },
  { href: "/admin/courses", label: "المقررات" },
  { href: "/admin/content", label: "محتوى المقررات" },
  { href: "/admin/materials", label: "المواد" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-brand-800">لوحة الإدارة</span>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800">
              {adminName}
            </span>
          </div>
          <LogoutButton />
        </div>
        <nav className="mt-2 flex gap-1 overflow-x-auto text-sm font-semibold text-ink-600">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 hover:bg-ink-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
