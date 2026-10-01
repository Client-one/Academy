import { StudentNav } from "@/components/student-nav";
import { requireStudent } from "@/lib/security/guards";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudent();
  return (
    <>
      <StudentNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
