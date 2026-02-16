import { getSecurityLogs, getAuditLogs } from "@/lib/actions";
import AuditTerminal from "./AuditTerminal";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const [securityLogsResult, auditLogsResult] = await Promise.all([
    getSecurityLogs(),
    getAuditLogs(),
  ]);

  // TEMP: diagnóstico de fetch para panel de auditoría.
  console.info("[admin/audits] fetch lens", {
    security_len: securityLogsResult.data?.length ?? 0,
    audit_len: auditLogsResult.data?.length ?? 0,
    security_error: securityLogsResult.error,
    audit_error: auditLogsResult.error,
  });

  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for") || "LOCALHOST";
  const fetchError = [securityLogsResult.error, auditLogsResult.error]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background text-foreground font-mono">
      <AuditTerminal
        initialSecurityLogs={securityLogsResult.data}
        initialAuditLogs={auditLogsResult.data}
        clientIp={clientIp}
        fetchError={fetchError || null}
      />
    </div>
  );
}
