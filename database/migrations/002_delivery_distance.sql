ALTER TABLE moca_orders
ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(6,1);
