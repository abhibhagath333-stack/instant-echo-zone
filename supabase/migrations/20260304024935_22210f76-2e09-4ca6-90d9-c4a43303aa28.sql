
-- Fix: posts already in realtime, just need to verify active_crops table exists
-- If the previous migration partially applied, this is idempotent
SELECT 1;
