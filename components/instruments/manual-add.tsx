import { SubmitButton } from "@/components/base/submit-button";

// Hand-created instrument: for a company no provider covers. Plain form +
// server action — no client JS needed beyond the disclosure.
export function ManualAdd({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const field =
    "font-numeric w-full rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none";

  return (
    <details className="mt-3 rounded-xl border border-line bg-surface [&[open]]:border-brand/40">
      <summary className="cursor-pointer px-4 py-3 text-xs text-ink-muted transition hover:text-brand">
        Not in the list? Add a company by hand
      </summary>
      <div className="border-t border-line p-4">
        <p className="mb-3 text-xs text-ink-muted">
          For an unlisted company, or a market we have no adapter for. Nothing
          is fetched for it — you keep its price and statements yourself.
        </p>
        <form
          action={action}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="text-xs text-ink-muted lg:col-span-2">
            <span className="mb-1 block">Company name</span>
            <input
              name="name"
              required
              maxLength={120}
              placeholder="Acme Textiles Ltd."
              className={field}
            />
          </label>
          <label className="text-xs text-ink-muted">
            <span className="mb-1 block">Symbol</span>
            <input
              name="symbol"
              required
              maxLength={20}
              placeholder="ACME"
              pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
              className={`${field} uppercase`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-ink-muted">
              <span className="mb-1 block">Market</span>
              <select name="market" defaultValue="IN" className={field}>
                <option value="IN">IN</option>
                <option value="PK">PK</option>
                <option value="US">US</option>
              </select>
            </label>
            <label className="text-xs text-ink-muted">
              <span className="mb-1 block">Currency</span>
              <select name="currency" defaultValue="INR" className={field}>
                <option value="INR">INR</option>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          <div className="lg:col-span-4">
            <SubmitButton size="sm" pendingLabel="Creating…">
              Create hand-kept instrument
            </SubmitButton>
          </div>
        </form>
      </div>
    </details>
  );
}
