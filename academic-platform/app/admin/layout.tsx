import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/security/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <>
      <AdminNav adminName={profile.full_name} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
