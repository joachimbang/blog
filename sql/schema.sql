-- ============================================================================
-- SCHEMA DE LA BASE DE DONNEES BLOG
-- ============================================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TABLE USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    role TEXT DEFAULT 'utilisateur' CHECK (role IN ('utilisateur', 'auteur', 'admin')),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE BLOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auteur_id UUID NOT NULL,
    titre TEXT NOT NULL,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auteur FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE COMMENTAIRES
-- ============================================================================
CREATE TABLE IF NOT EXISTS commentaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    auteur_id UUID NOT NULL,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    CONSTRAINT fk_auteur_commentaire FOREIGN KEY (auteur_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT UNIQUE NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE BLOG_TAGS (RELATION N:M)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blog_id, tag_id),
    CONSTRAINT fk_blog_tag FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag_blog FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- -- ============================================================================
-- -- DONNEES DE TEST
-- -- ============================================================================
-- INSERT INTO users (email, password_hash, nom, prenom, role) VALUES
-- ('admin@blog.com', '$2b$10$rKZqYqYqYqYqYqYqYqYqYuYqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Admin', 'Admin', 'admin'),
-- ('auteur@blog.com', '$2b$10$rKZqYqYqYqYqYqYqYqYqYuYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Auteur', 'Test', 'auteur')
-- ON CONFLICT (email) DO NOTHING;

-- -- ============================================================================
-- -- INDEXES
-- -- ============================================================================
-- CREATE INDEX IF NOT EXISTS idx_blogs_auteur ON blogs(auteur_id);
-- CREATE INDEX IF NOT EXISTS idx_commentaires_blog ON commentaires(blog_id);
-- CREATE INDEX IF NOT EXISTS idx_commentaires_auteur ON commentaires(auteur_id);
