-- Migration pour corriger la précision du champ amount_per_million_views
-- Augmenter la précision pour éviter les dépassements

-- Vérifier et modifier la précision du champ amount_per_million_views
DO $$
BEGIN
    -- Vérifier la précision actuelle
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'amount_per_million_views'
        AND numeric_precision = 10
        AND numeric_scale = 2
    ) THEN
        -- Augmenter la précision pour supporter des valeurs plus grandes
        ALTER TABLE campaigns 
        ALTER COLUMN amount_per_million_views TYPE NUMERIC(12, 2);
        
        RAISE NOTICE 'Précision de amount_per_million_views augmentée à NUMERIC(12, 2)';
    ELSE
        RAISE NOTICE 'Précision de amount_per_million_views déjà suffisante ou champ non trouvé';
    END IF;
END $$;

-- Vérifier et modifier la précision du champ cpmv_rate si nécessaire
DO $$
BEGIN
    -- Vérifier la précision actuelle
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'cpmv_rate'
        AND numeric_precision = 10
        AND numeric_scale = 2
    ) THEN
        -- Augmenter la précision pour supporter des valeurs plus grandes
        ALTER TABLE campaigns 
        ALTER COLUMN cpmv_rate TYPE NUMERIC(12, 4);
        
        RAISE NOTICE 'Précision de cpmv_rate augmentée à NUMERIC(12, 4)';
    ELSE
        RAISE NOTICE 'Précision de cpmv_rate déjà suffisante ou champ non trouvé';
    END IF;
END $$; 