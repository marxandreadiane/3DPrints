-- 1. Create tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filament_weight_g NUMERIC NOT NULL CHECK (filament_weight_g >= 0),
    print_time_hours NUMERIC NOT NULL CHECK (print_time_hours >= 0),
    number_of_plates INTEGER NOT NULL CHECK (number_of_plates >= 1),
    labor_hours NUMERIC NOT NULL CHECK (labor_hours >= 0)
);

-- 2. Custom Logic (The Electricity Surge)
-- TotalCost = ((Plates * 1.2) + (Hours * 0.2)) * 14.16.

CREATE OR REPLACE FUNCTION calculate_item_cost(
    plates INT,
    hours NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_cost NUMERIC;
BEGIN
    total_cost := ((plates * 1.2) + (hours * 0.2)) * 14.16;
    RETURN total_cost;
END;
$$;
