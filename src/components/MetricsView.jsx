import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FileText, TrendingUp, Users, Printer, Clock, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

export default function MetricsView() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const queryClient = useQueryClient();

  // Optimized parallel fetch using React Query
  const { data, isPending, isError, error: queryError, refetch } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Direct use of sanitized supabase client
      const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');
      if (statsError) throw statsError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, clients(*), items(name)')
        .neq('status', 'Completed')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (ordersError) throw ordersError;

      return {
        orders: ordersData || [],
        metrics: {
          activeOrders: statsData.active_orders || 0,
          totalClients: statsData.total_clients || 0,
          totalItems: statsData.total_items || 0
        }
      };
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  const orders = data?.orders || [];
  const metrics = data?.metrics || { activeOrders: 0, totalClients: 0, totalItems: 0 };
  const showSkeletons = isPending && !data;

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }) => {
      const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['dashboard-data'] });
      const previousData = queryClient.getQueryData(['dashboard-data']);
      
      queryClient.setQueryData(['dashboard-data'], (old) => {
        if (!old) return old;
        return {
          ...old,
          orders: nextStatus === 'Completed' 
            ? old.orders.filter(o => o.id !== id)
            : old.orders.map(o => o.id === id ? { ...o, status: nextStatus } : o)
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['dashboard-data'], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['completed-orders'] });
    }
  });

  const cycleStatus = (id, currentStatus) => {
    const statuses = ['Pending', 'Printing', 'Post-Processing', 'Completed'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    statusMutation.mutate({ id, nextStatus: statuses[nextIndex] });
  };

  const StatusBadge = ({ status, onClick }) => {
    let colorClass = '';
    switch(status) {
      case 'Pending': colorClass = 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'; break;
      case 'Printing': colorClass = 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'; break;
      case 'Post-Processing': colorClass = 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'; break;
      case 'Completed': colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'; break;
      default: colorClass = 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200';
    }

    return (
      <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${colorClass}`}
      >
        {status}
      </button>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Error State */}
      {isError && !data && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <TrendingUp className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-red-900 font-bold text-lg mb-2">Dashboard Connectivity Issue</h3>
          <p className="text-red-700 text-sm mb-6">
            We're having trouble connecting to the database. {queryError?.message || 'Please check your connection.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow-sm transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Active Orders</span>
            <FileText className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {showSkeletons ? <div className="h-9 w-16 bg-zinc-100 rounded animate-shimmer" /> : metrics.activeOrders}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-2">Currently in pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Global Clients</span>
            <Users className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {showSkeletons ? <div className="h-9 w-16 bg-zinc-100 rounded animate-shimmer" /> : metrics.totalClients}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-2">Registered in database</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Items Processing</span>
            <Printer className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {showSkeletons ? <div className="h-9 w-16 bg-zinc-100 rounded animate-shimmer" /> : metrics.totalItems}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-2">Across all active objects</span>
        </div>

      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Active Pipeline</h3>
            <p className="text-sm text-zinc-500 font-medium">Manage and track your pending and active print jobs.</p>
          </div>
          <button className="bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded text-sm font-semibold transition-colors shadow-sm">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-white border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">Date Logged</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {showSkeletons ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 rounded pulse-light" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded pulse-light" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded pulse-light" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded pulse-light" /></td>
                    <td className="px-6 py-4 flex justify-center"><div className="h-6 w-24 bg-zinc-100 rounded-full pulse-light" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-4 bg-zinc-100 rounded ml-auto pulse-light" /></td>
                  </tr>
                ))
              ) : orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-900">
                    {order.id.split('-')[0].toUpperCase()}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-700">
                    {order.clients?.name || 'Unknown Client'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-700 font-medium">
                    {order.items?.[0]?.name || 'Unknown Item'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={order.status} onClick={() => cycleStatus(order.id, order.status)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors tooltip" title="Manage Order">
                      <MoreHorizontal className="w-5 h-5 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {!isPending && orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-zinc-500">
                    No active orders found in the pipeline. Start building a quote!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal Overlay */}
      {selectedOrderId && (
        <OrderDetailsModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}
