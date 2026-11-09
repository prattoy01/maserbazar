import { LinkIcon } from "lucide-react";
import { connectorErrorRecovery } from "@/lib/connector-errors.mjs";

/** Render in the affected feature, leaving the rest of the Site usable. */
export function ConnectorError({
  error,
  connectorName,
  reconnectHref,
}: {
  error: { status: string; message: string };
  connectorName: string;
  reconnectHref: string;
}) {
  const recovery = connectorErrorRecovery(error, connectorName, reconnectHref);
  return (
    <div
      role="alert"
      className="flex min-w-0 flex-col items-start gap-3 text-sm"
    >
      <p className="break-words">{recovery.message}</p>
      {recovery.action && (
        <a
          href={recovery.action.href}
          target="_top"
          className="inline-flex h-auto min-h-9 max-w-full shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2 text-left text-sm font-medium whitespace-normal shadow-xs"
        >
          <LinkIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 break-words">{recovery.action.label}</span>
        </a>
      )}
    </div>
  );
}

