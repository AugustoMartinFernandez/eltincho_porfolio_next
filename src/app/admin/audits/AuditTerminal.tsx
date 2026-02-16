"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldCheck,
  Activity,
  Cpu,
  AlertTriangle,
  X,
  Database,
  Lock,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

type Tab = "security" | "audit";

type AuditTerminalProps = {
  initialSecurityLogs: any[];
  initialAuditLogs: any[];
  clientIp: string;
  fetchError?: string | null;
};

export default function AuditTerminal({
  initialSecurityLogs,
  initialAuditLogs,
  clientIp,
  fetchError,
}: AuditTerminalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("audit");
  const [systemLoad, setSystemLoad] = useState(0);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(Math.floor(Math.random() * 30) + 10);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const securityLogs = Array.isArray(initialSecurityLogs)
    ? initialSecurityLogs
    : [];
  const auditLogs = Array.isArray(initialAuditLogs) ? initialAuditLogs : [];
  const logs = activeTab === "security" ? securityLogs : auditLogs;
  const selectedLogId = selectedLog
    ? String(selectedLog.id ?? selectedLog.record_id ?? "unknown")
    : "unknown";

  return (
    <div className="relative h-full flex flex-col p-4 md:p-6 gap-6">
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/20 pb-4 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <Terminal className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-primary">
              NetWatch <span className="text-xs text-muted-foreground">v2.0.4</span>
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> SECURE
              </span>
              <span className="text-primary/50">|</span>
              <span>ADMIN_IP: {clientIp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-48 bg-secondary/30 rounded-full h-2 overflow-hidden border border-primary/10">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${systemLoad}%` }}
              transition={{ type: "spring", bounce: 0 }}
            />
          </div>
          <div className="text-xs font-mono text-primary whitespace-nowrap">
            CPU: {systemLoad}%
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className={cn(
              "text-primary hover:bg-primary/10",
              isRefreshing && "animate-spin",
            )}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <TabButton
          active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
          icon={Lock}
          label="Security Logs"
        />
        <TabButton
          active={activeTab === "audit"}
          onClick={() => setActiveTab("audit")}
          icon={Database}
          label="Audit Trails"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide border border-primary/10 rounded-lg bg-black/20 p-1">
        <div className="grid grid-cols-1 gap-1">
          <AnimatePresence mode="popLayout">
            {logs.map((log: any, i: number) => (
              <motion.div
                key={log.id ?? `${log.record_id ?? "log"}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => setSelectedLog(log)}
                className="group flex items-center justify-between p-3 rounded border border-transparent hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <StatusBadge
                    status={
                      activeTab === "security"
                        ? log.event_type === "INTRUSION_ATTEMPT"
                          ? "ERROR"
                          : "OK"
                        : "INFO"
                    }
                  />

                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {activeTab === "security"
                        ? (log.event_type ?? "UNKNOWN_EVENT")
                        : (log.action ?? "UNKNOWN_ACTION")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  {activeTab === "security" ? (
                    <>
                      <span className="hidden md:inline-block">{log.ip_address}</span>
                      <span className="px-2 py-0.5 rounded bg-secondary/50 border border-border">
                        {log.ua_parsed?.os} / {log.ua_parsed?.browser}
                      </span>
                    </>
                  ) : (
                    <span className="uppercase tracking-wider">{log.table_name}</span>
                  )}
                  <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {logs.length === 0 && (
            <div className="py-20 text-center text-muted-foreground font-mono">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
              NO_DATA_FOUND_IN_SECTOR
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-primary/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 text-primary font-mono text-sm">
                  <Cpu className="h-4 w-4" />
                  MEMORY_DUMP_0x{selectedLogId.substring(0, 8)}
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto font-mono text-xs space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase text-[10px]">Timestamp</span>
                    <div className="text-foreground">{selectedLog.created_at}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase text-[10px]">Event ID</span>
                    <div className="text-foreground">{selectedLogId}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground uppercase text-[10px]">Raw Data Payload</span>
                  <div className="p-4 rounded bg-black border border-primary/10 text-green-500/80 overflow-x-auto">
                    <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                  </div>
                </div>

                {activeTab === "audit" && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                    <div>
                      <span className="text-red-400 uppercase text-[10px] mb-2 block">Old State</span>
                      <pre className="text-[10px] text-muted-foreground">
                        {JSON.stringify(selectedLog.old_data, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-emerald-400 uppercase text-[10px] mb-2 block">New State</span>
                      <pre className="text-[10px] text-muted-foreground">
                        {JSON.stringify(selectedLog.new_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-primary/20 bg-primary/5 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                  CLOSE_CONNECTION
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-all font-mono text-xs uppercase tracking-wider",
        active
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50",
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function StatusBadge({ status }: { status: "OK" | "ERROR" | "INFO" }) {
  const colors = {
    OK: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    ERROR: "text-red-500 bg-red-500/10 border-red-500/20",
    INFO: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-[10px] font-bold border font-mono",
        colors[status],
      )}
    >
      [{status}]
    </span>
  );
}
