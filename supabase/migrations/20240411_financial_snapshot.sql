-- 1. Upgrade the Orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total_price NUMERIC,
ADD COLUMN IF NOT EXISTS financial_breakdown JSONB;

-- 2. Update the RPC function to accept these new metrics
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_client_name TEXT,
    p_client_phone TEXT,
    p_item_name TEXT,
    p_filament_weight NUMERIC,
    p_print_time NUMERIC,
    p_plates INTEGER,
    p_labor_hours NUMERIC,
    p_total_price NUMERIC DEFAULT NULL,
    p_financial_breakdown JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
    v_order_id UUID;
BEGIN
    -- 1. Get or create client
    SELECT id INTO v_client_id FROM clients WHERE name = p_client_name LIMIT 1;
    
    IF v_client_id IS NULL THEN
        INSERT INTO clients (name, contact)
        VALUES (p_client_name, p_client_phone)
        RETURNING id INTO v_client_id;
    END IF;

    -- 2. Create Order WITH the financial snapshot
    INSERT INTO orders (client_id, status, total_price, financial_breakdown)
    VALUES (v_client_id, 'Pending', p_total_price, p_financial_breakdown)
    RETURNING id INTO v_order_id;

    -- 3. Create Item
    INSERT INTO items (
        order_id, 
        name, 
        filament_weight_g, 
        print_time_hours, 
        number_of_plates, 
        labor_hours
    )
    VALUES (
        v_order_id, 
        p_item_name, 
        p_filament_weight, 
        p_print_time, 
        p_plates, 
        p_labor_hours
    );

    RETURN v_order_id;
END;
$$;
