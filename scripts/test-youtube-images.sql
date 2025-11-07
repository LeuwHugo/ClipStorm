-- Script de test pour vérifier les images YouTube
-- Test de création d'une campagne avec une URL YouTube

-- Test 1: Vérifier qu'une URL YouTube génère bien une miniature
DO $$
DECLARE
    test_url TEXT := 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    test_video_id VARCHAR(20);
    test_thumbnail TEXT;
BEGIN
    -- Extraire l'ID YouTube
    IF test_url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})' THEN
        test_video_id := substring(test_url from 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})');
    END IF;
    
    -- Générer l'URL de miniature
    test_thumbnail := 'https://img.youtube.com/vi/' || test_video_id || '/hqdefault.jpg';
    
    RAISE NOTICE 'URL de test: %', test_url;
    RAISE NOTICE 'ID vidéo extrait: %', test_video_id;
    RAISE NOTICE 'URL miniature générée: %', test_thumbnail;
    
    IF test_video_id IS NOT NULL THEN
        RAISE NOTICE '✅ Test réussi: ID YouTube extrait correctement';
    ELSE
        RAISE NOTICE '❌ Test échoué: Impossible d''extraire l''ID YouTube';
    END IF;
END $$;

-- Test 2: Vérifier les différents formats d'URL YouTube
SELECT 
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ' as test_url,
    CASE 
        WHEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})' 
        THEN '✅ Format standard supporté'
        ELSE '❌ Format standard non supporté'
    END as result;

SELECT 
    'https://youtu.be/dQw4w9WgXcQ' as test_url,
    CASE 
        WHEN 'https://youtu.be/dQw4w9WgXcQ' ~ 'youtu\.be/([a-zA-Z0-9_-]{11})' 
        THEN '✅ Format youtu.be supporté'
        ELSE '❌ Format youtu.be non supporté'
    END as result;

SELECT 
    'https://youtube.com/embed/dQw4w9WgXcQ' as test_url,
    CASE 
        WHEN 'https://youtube.com/embed/dQw4w9WgXcQ' ~ 'youtube\.com/embed/([a-zA-Z0-9_-]{11})' 
        THEN '✅ Format embed supporté'
        ELSE '❌ Format embed non supporté'
    END as result;

-- Test 3: Vérifier la fonction extract_youtube_id
SELECT 
    extract_youtube_id('https://www.youtube.com/watch?v=dQw4w9WgXcQ') as video_id_1,
    extract_youtube_id('https://youtu.be/dQw4w9WgXcQ') as video_id_2,
    extract_youtube_id('https://youtube.com/embed/dQw4w9WgXcQ') as video_id_3,
    extract_youtube_id('https://invalid-url.com') as video_id_invalid; 