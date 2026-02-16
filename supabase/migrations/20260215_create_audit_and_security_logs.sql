CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    event_type TEXT NOT NULL,
    email TEXT,
    ip_address TEXT,
    device_type TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON public.security_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'security_logs'
          AND policyname = 'Admin Read Security Logs'
    ) THEN
        CREATE POLICY "Admin Read Security Logs"
            ON public.security_logs
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'security_logs'
          AND policyname = 'Allow Insert Security Logs'
    ) THEN
        CREATE POLICY "Allow Insert Security Logs"
            ON public.security_logs
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'audit_logs'
          AND policyname = 'Admin Read Audit Logs'
    ) THEN
        CREATE POLICY "Admin Read Audit Logs"
            ON public.audit_logs
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'audit_logs'
          AND policyname = 'Admin Insert Audit Logs'
    ) THEN
        CREATE POLICY "Admin Insert Audit Logs"
            ON public.audit_logs
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;
END $$;
