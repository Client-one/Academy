import { setStatusAction, moveAction } from "@/app/admin/actions/academics";
import { Button } from "@/components/ui/button";
import type { Status } from "@/lib/types";

type NativeFormAction = (formData: FormData) => Promise<void>;

function asNativeFormAction(action: (formData: FormData) => Promise<unknown>): NativeFormAction {
  return action as NativeFormAction;
}

export function StatusButtons({ kind, id, status }: { kind: string; id: string; status: Status }) {
  return (
    <div className="flex gap-1">
      {status !== "published" && (
        <form action={asNativeFormAction(setStatusAction)}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="published" />
          <Button type="submit" size="sm" variant="secondary">نشر</Button>
        </form>
      )}
      {status !== "draft" && (
        <form action={asNativeFormAction(setStatusAction)}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="draft" />
          <Button type="submit" size="sm" variant="ghost">مسودة</Button>
        </form>
      )}
      {status !== "archived" && (
        <form action={asNativeFormAction(setStatusAction)}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="archived" />
          <Button type="submit" size="sm" variant="ghost">أرشفة</Button>
        </form>
      )}
    </div>
  );
}

export function MoveButtons({ kind, id }: { kind: string; id: string }) {
  return (
    <div className="flex gap-1">
      {([1, -1] as const).map((d) => (
        <form key={d} action={asNativeFormAction(moveAction)}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="delta" value={d} />
          <Button type="submit" size="sm" variant="ghost">{d === 1 ? "↓" : "↑"}</Button>
        </form>
      ))}
    </div>
  );
}
