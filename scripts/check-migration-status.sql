-- Script pour vérifier l'état actuel des colonnes MVP dans la table campaigns

-- Vérifier les colonnes existantes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN ('tracking_code', 'duration_days', 'cpmv_rate', 'youtube_video_id', 'youtube_validation_status')
ORDER BY column_name;

-- Vérifier les contraintes existantes
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE 'campaigns_%'
ORDER BY constraint_name;

-- Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'campaigns' 
AND indexname LIKE 'idx_campaigns_%'
ORDER BY indexname;

-- Vérifier les fonctions existantes
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname IN ('generate_tracking_code', 'set_tracking_code', 'extract_youtube_id')
ORDER BY proname;

-- Vérifier les triggers existants
SELECT 
    tgname,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname = 'trigger_set_tracking_code'; 