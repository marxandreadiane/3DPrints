-- 1. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_items_order_id ON items(order_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- 2. Create RPC for atomic Order Creation
-- This reduces network round-trips from 3 to 1
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_client_name TEXT,
    p_client_phone TEXT,
    p_item_name TEXT,
    p_filament_weight NUMERIC,
    p_print_time NUMERIC,
    p_plates INTEGER,
    p_labor_hours NUMERIC
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

    -- 2. Create Order
    INSERT INTO orders (client_id, status)
    VALUES (v_client_id, 'Pending')
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
