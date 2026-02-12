import { getSecurityLogs, getAuditLogs } from "@/lib/actions";
import AuditTerminal from "./AuditTerminal";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const [securityLogs, auditLogs] = await Promise.all([
    getSecurityLogs(),
    getAuditLogs()
  ]);

  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for") || "LOCALHOST";

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background text-foreground font-mono">
       <AuditTerminal 
         initialSecurityLogs={securityLogs} 
         initialAuditLogs={auditLogs}
         clientIp={clientIp}
       />
    </div>
  );
}
