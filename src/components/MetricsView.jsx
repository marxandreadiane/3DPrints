import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, TrendingUp, Users, Printer, Clock, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function MetricsView() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    activeOrders: 0,
    totalClients: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Fetch active orders with relational data
    const { data: pipelineData, error: pipelineErr } = await supabase
      .from('orders')
      .select('*, clients(*), items(*)')
      .neq('status', 'Completed')
      .order('created_at', { ascending: false });

    // 2. Count total clients
    const { count: clientCount, error: clientErr } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true });

    if (!pipelineErr && pipelineData) {
      setOrders(pipelineData);
      
      let itemsCount = 0;
      pipelineData.forEach(order => {
        if (order.items) itemsCount += order.items.length;
      });

      setMetrics({
        activeOrders: pipelineData.length,
        totalClients: clientCount || 0,
        totalItems: itemsCount
      });
    }

    setLoading(false);
  };

  const cycleStatus = async (id, currentStatus) => {
    const statuses = ['Pending', 'Printing', 'Post-Processing', 'Completed'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    // Optimistic UI update
    setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus } : o));

    try {
      await supabase.from('orders').update({ status: nextStatus }).eq('id', id);
      // Remove from list if it became Completed
      if (nextStatus === 'Completed') {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch(err) {
      console.error(err);
    }
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
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${colorClass}`}
      >
        {status}
      </button>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Active Orders</span>
            <FileText className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {loading ? '...' : metrics.activeOrders}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-2">Currently in pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Global Clients</span>
            <Users className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {loading ? '...' : metrics.totalClients}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-2">Registered in database</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Items Processing</span>
            <Printer className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {loading ? '...' : metrics.totalItems}
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
                <th className="px-6 py-4 font-semibold">Date Logged</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                    Loading pipeline from Supabase...
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-900">
                    {order.id.split('-')[0].toUpperCase()}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-700">
                    {order.clients?.name || 'Unknown Client'}
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
              
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                    No active orders found in the pipeline. Start building a quote!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
