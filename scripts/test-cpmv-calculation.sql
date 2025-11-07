-- Script de test pour vérifier le calcul CPMV
-- Test des valeurs typiques pour s'assurer qu'il n'y a pas de dépassement

-- Test 1: CPMV basique (0.50€)
SELECT 
    0.50 as cpmv_rate,
    0.50 * 1000 as amount_per_million_views,
    CASE 
        WHEN 0.50 * 1000 < 999999999.99 THEN 'OK'
        ELSE 'ERREUR: Dépassement'
    END as test_result;

-- Test 2: CPMV élevé (10.00€)
SELECT 
    10.00 as cpmv_rate,
    10.00 * 1000 as amount_per_million_views,
    CASE 
        WHEN 10.00 * 1000 < 999999999.99 THEN 'OK'
        ELSE 'ERREUR: Dépassement'
    END as test_result;

-- Test 3: CPMV très élevé (100.00€)
SELECT 
    100.00 as cpmv_rate,
    100.00 * 1000 as amount_per_million_views,
    CASE 
        WHEN 100.00 * 1000 < 999999999.99 THEN 'OK'
        ELSE 'ERREUR: Dépassement'
    END as test_result;

-- Test 4: Vérifier la précision actuelle des colonnes
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN ('amount_per_million_views', 'cpmv_rate')
ORDER BY column_name;

-- Test 5: Simulation d'insertion avec des valeurs typiques
DO $$
DECLARE
    test_cpmv NUMERIC(12, 4) := 0.50;
    test_amount_per_million NUMERIC(12, 2);
BEGIN
    test_amount_per_million := test_cpmv * 1000;
    
    RAISE NOTICE 'Test CPMV: %€', test_cpmv;
    RAISE NOTICE 'Montant par million de vues: %€', test_amount_per_million;
    
    IF test_amount_per_million < 999999999.99 THEN
        RAISE NOTICE '✅ Test réussi: Pas de dépassement';
    ELSE
        RAISE NOTICE '❌ Test échoué: Dépassement détecté';
    END IF;
END $$; 