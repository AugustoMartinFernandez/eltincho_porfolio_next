-- Habilitar extensión para UUIDs si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA SINGLETON: ABOUT_ME
CREATE TABLE IF NOT EXISTS about_me (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    short_bio_md TEXT,
    location TEXT,
    profile_image_url TEXT,
    cv_url TEXT,
    available_for_work BOOLEAN DEFAULT false,
    social_links JSONB DEFAULT '{}'::jsonb, -- { github, linkedin, email, etc }
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que solo haya una fila (Singleton Pattern en DB)
CREATE UNIQUE INDEX IF NOT EXISTS one_row_only_uidx ON about_me((true));

-- 2. TABLA: EXPERIENCE
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL significa "Actualidad"
    description_md TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb, -- Array de strings o objetos
    visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: EDUCATION
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name TEXT NOT NULL,
    degree_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE about_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Lectura pública (Cualquiera puede ver lo visible)
CREATE POLICY "Public Read About" ON about_me FOR SELECT USING (true);
CREATE POLICY "Public Read Experience" ON experience FOR SELECT USING (visible = true);
CREATE POLICY "Public Read Education" ON education FOR SELECT USING (visible = true);

-- Escritura solo Admin (Authenticated Users)
-- Asumimos que tu app solo permite login al admin. Si tienes usuarios públicos, añade check de rol.
CREATE POLICY "Admin Manage About" ON about_me FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Manage Experience" ON experience FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Manage Education" ON education FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. BUCKET DE STORAGE (Si no existe)
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Public Access Portfolio Images" ON storage.objects FOR SELECT USING ( bucket_id = 'portfolio' );
CREATE POLICY "Admin Upload Portfolio Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'portfolio' );
CREATE POLICY "Admin Update Portfolio Images" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'portfolio' );
CREATE POLICY "Admin Delete Portfolio Images" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'portfolio' );