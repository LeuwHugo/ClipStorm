-- Migration de correction pour les champs MVP aux campagnes
-- Gestion des colonnes qui existent déjà

-- Vérifier et ajouter tracking_code s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'tracking_code'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN tracking_code VARCHAR(8) UNIQUE;
    END IF;
END $$;

-- Vérifier et ajouter duration_days s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'duration_days'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN duration_days INTEGER DEFAULT 30;
    END IF;
END $$;

-- Vérifier et ajouter cpmv_rate s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'cpmv_rate'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN cpmv_rate NUMERIC(10, 2);
    END IF;
END $$;

-- Vérifier et ajouter youtube_video_id s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'youtube_video_id'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN youtube_video_id VARCHAR(20);
    END IF;
END $$;

-- Vérifier et ajouter youtube_validation_status s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'youtube_validation_status'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN youtube_validation_status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Ajouter des contraintes seulement si elles n'existent pas
DO $$
BEGIN
    -- Contrainte duration_days
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'campaigns_duration_days_positive'
    ) THEN
        ALTER TABLE campaigns 
        ADD CONSTRAINT campaigns_duration_days_positive 
        CHECK (duration_days > 0 AND duration_days <= 30);
    END IF;
    
    -- Contrainte cpmv_rate
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'campaigns_cpmv_rate_positive'
    ) THEN
        ALTER TABLE campaigns 
        ADD CONSTRAINT campaigns_cpmv_rate_positive 
        CHECK (cpmv_rate IS NULL OR cpmv_rate > 0);
    END IF;
    
    -- Contrainte tracking_code_format
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'campaigns_tracking_code_format'
    ) THEN
        ALTER TABLE campaigns 
        ADD CONSTRAINT campaigns_tracking_code_format 
        CHECK (tracking_code ~ '^[A-Z0-9]{8}$');
    END IF;
END $$;

-- Créer les index seulement s'ils n'existent pas
DO $$
BEGIN
    -- Index tracking_code
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_campaigns_tracking_code'
    ) THEN
        CREATE INDEX idx_campaigns_tracking_code ON campaigns(tracking_code) WHERE tracking_code IS NOT NULL;
    END IF;
    
    -- Index youtube_validation
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_campaigns_youtube_validation'
    ) THEN
        CREATE INDEX idx_campaigns_youtube_validation ON campaigns(youtube_validation_status);
    END IF;
END $$;

-- Fonction pour générer automatiquement un tracking code unique
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Générer un code alphanumérique de 8 caractères
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Vérifier si le code existe déjà
        SELECT COUNT(*) INTO exists_count 
        FROM campaigns 
        WHERE tracking_code = code;
        
        -- Si le code n'existe pas, on peut l'utiliser
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le tracking code lors de la création
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_code IS NULL THEN
        NEW.tracking_code := generate_tracking_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger seulement s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_set_tracking_code'
    ) THEN
        CREATE TRIGGER trigger_set_tracking_code
            BEFORE INSERT ON campaigns
            FOR EACH ROW
            EXECUTE FUNCTION set_tracking_code();
    END IF;
END $$;

-- Fonction pour extraire l'ID YouTube d'une URL
CREATE OR REPLACE FUNCTION extract_youtube_id(url TEXT)
RETURNS VARCHAR(20) AS $$
BEGIN
    -- Patterns pour différents formats d'URL YouTube
    IF url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})' THEN
        RETURN substring(url from 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})');
    ELSIF url ~ 'youtu\.be/([a-zA-Z0-9_-]{11})' THEN
        RETURN substring(url from 'youtu\.be/([a-zA-Z0-9_-]{11})');
    ELSIF url ~ 'youtube\.com/embed/([a-zA-Z0-9_-]{11})' THEN
        RETURN substring(url from 'youtube\.com/embed/([a-zA-Z0-9_-]{11})');
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql; 