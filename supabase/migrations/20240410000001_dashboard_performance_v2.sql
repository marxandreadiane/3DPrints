-- 1. Add Composite Index for Dashboard Filtering and Sorting
-- This significantly speeds up queries that filter by status and order by creation date
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- 2. Create RPC for Combined Dashboard Metrics
-- This function offloads heavy aggregation to the database and reduces network overhead
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'active_orders', (SELECT count(*) FROM orders WHERE status != 'Completed'),
        'total_clients', (SELECT count(*) FROM clients),
        'total_items', (
            SELECT count(*) 
            FROM items i 
            JOIN orders o ON i.order_id = o.id 
            WHERE o.status != 'Completed'
        ),
        'recent_orders', (
            SELECT jsonb_agg(o)
            FROM (
                SELECT 
                    o.id, 
                    o.status, 
                    o.created_at, 
                    jsonb_build_object('name', c.name) as clients
                FROM orders o
                LEFT JOIN clients c ON o.client_id = c.id
                WHERE o.status != 'Completed'
                ORDER BY o.created_at DESC
                LIMIT 50
            ) o
        )
    ) INTO result;
    
    RETURN result;
END;
$$;
