/** Route-level fallback while a lazy page chunk loads. */
export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__bit" aria-hidden="true">
        0 1 B
      </span>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
