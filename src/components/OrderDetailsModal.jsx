import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { X, User, Package, Clock, Scale, Wrench, Calendar, Hash, Calculator } from 'lucide-react';

export default function OrderDetailsModal({ orderId, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (*),
          items (*)
        `)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return orderData;
    },
    enabled: !!orderId,
  });

  if (!orderId) return null;

  const item = data?.items?.[0] || {};
  const client = data?.clients || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Hash className="w-5 h-5 text-zinc-400" />
              Order Details
            </h3>
            <p className="text-sm text-zinc-500 font-mono mt-1">{orderId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-8 w-1/3 bg-zinc-100 rounded pulse-light" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-zinc-100 rounded pulse-light" />
                <div className="h-24 bg-zinc-100 rounded pulse-light" />
                <div className="h-24 bg-zinc-100 rounded pulse-light" />
                <div className="h-24 bg-zinc-100 rounded pulse-light" />
              </div>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-500 font-semibold flex flex-col items-center">
               <X className="w-10 h-10 mb-3 opacity-50" />
               Failed to retrieve order details. Please try again.
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Header Status Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                 <div className="flex items-center gap-3">
                   <Calendar className="w-5 h-5 text-zinc-400" />
                   <div>
                     <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Logged On</p>
                     <p className="text-sm font-medium text-zinc-900">{new Date(data.created_at).toLocaleString()}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Current Status</p>
                   <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-zinc-900 text-white shadow-sm inline-block">
                     {data.status}
                   </span>
                 </div>
              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Client Box */}
                <div className="border border-zinc-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                    <User className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Client Identity</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Name</p>
                      <p className="font-medium text-zinc-900 text-base">{client.name}</p>
                    </div>
                    {client.contact && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Contact</p>
                        <p className="font-medium text-zinc-900 text-sm whitespace-pre-wrap">{client.contact}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Object Specifications */}
                <div className="border border-zinc-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Object Details</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Item Title</p>
                      <p className="font-medium text-zinc-900 text-base">{item.name || 'Unnamed Asset'}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Quantity</p>
                        <p className="font-semibold text-zinc-900 text-sm">{item.number_of_plates} Plates</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Metrics Row */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200">
                  <h4 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Operational Metrics</h4>
                </div>
                <div className="grid grid-cols-3 divide-x divide-zinc-200 bg-white">
                  
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <Scale className="w-5 h-5 text-zinc-400 mb-2" />
                    <p className="text-xl font-bold text-zinc-900">{parseFloat(item.filament_weight_g).toLocaleString()}g</p>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Total Weight</p>
                  </div>
                  
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <Clock className="w-5 h-5 text-zinc-400 mb-2" />
                    <p className="text-xl font-bold text-zinc-900">{parseFloat(item.print_time_hours).toFixed(1)}h</p>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Print Timeline</p>
                  </div>

                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <Wrench className="w-5 h-5 text-zinc-400 mb-2" />
                    <p className="text-xl font-bold text-zinc-900">{parseFloat(item.labor_hours).toFixed(1)}h</p>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Labor Allocated</p>
                  </div>

                </div>
              </div>

              {/* Financial Snapshot */}
              {data.financial_breakdown ? (
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <div className="bg-zinc-50 px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
                    <h4 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      Financial Snapshot
                    </h4>
                    <span className="text-xs text-zinc-500 font-medium tracking-wide bg-zinc-200/50 px-2 py-0.5 rounded">Fixed</span>
                  </div>
                  <div className="p-5 flex flex-col gap-3 text-sm text-zinc-600">
                    <div className="flex justify-between items-center group">
                      <span>Material Allocation</span>
                      <span className="text-zinc-900">{parseFloat(data.financial_breakdown.filamentCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <span>Utility & Infrastructure <span className="text-xs text-zinc-400">({parseFloat(data.financial_breakdown.totalKWh).toFixed(1)} kWh)</span></span>
                      <span className="text-zinc-900">{parseFloat(data.financial_breakdown.electricityCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {data.financial_breakdown.wearTearCost > 0 && (
                      <div className="flex justify-between items-center group">
                        <span>Machine Wear & Tear</span>
                        <span className="text-zinc-900">{parseFloat(data.financial_breakdown.wearTearCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {data.financial_breakdown.failureBufferCost > 0 && (
                      <div className="flex justify-between items-center italic text-zinc-500 group">
                        <span>Ops Waste Buffer <span className="text-xs text-zinc-400">({data.financial_breakdown.failureRatePercent}%)</span></span>
                        <span className="text-zinc-900">+{parseFloat(data.financial_breakdown.failureBufferCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1 group">
                      <span>Direct Labor</span>
                      <span className="text-zinc-900">{parseFloat(data.financial_breakdown.laborCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {data.financial_breakdown.supplementaryMatCost > 0 && (
                      <div className="flex justify-between items-center group">
                        <span>Supplementary</span>
                        <span className="text-zinc-900">{parseFloat(data.financial_breakdown.supplementaryMatCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {data.financial_breakdown.logisticsCost > 0 && (
                      <div className="flex justify-between items-center group">
                        <span>Logistics & Overheads</span>
                        <span className="text-zinc-900">{parseFloat(data.financial_breakdown.logisticsCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {data.financial_breakdown.markupCost > 0 && (
                      <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1 group">
                        <span className="font-semibold text-emerald-600">Markup Profit <span className="text-xs font-normal">({data.financial_breakdown.markupPercent}%)</span></span>
                        <span className="text-emerald-700 font-semibold">+{parseFloat(data.financial_breakdown.markupCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex flex-col items-end pt-5 border-t border-zinc-200 mt-2">
                       <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Billable</span>
                       <div className="flex items-baseline gap-1">
                         <span className="text-lg font-semibold text-zinc-400">PHP</span>
                         <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                           {parseFloat(data.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </span>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <Calculator className="w-6 h-6 text-zinc-300 mb-2" />
                  <p className="text-sm font-semibold text-zinc-500">Financial Snapshot Unavailable</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">Legacy orders processed prior to the database upgrade do not contain price snapshots.</p>
                </div>
              )}

            </div>
          )}
        </div>
        
        {/* Footer Area */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 text-sm font-semibold py-2 px-6 rounded transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
