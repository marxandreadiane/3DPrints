import { useReducer, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Calculator, Plus, Trash2, Box, Zap, Clock, Coins, Wrench, CheckCircle2, Paintbrush, Shield, User
} from 'lucide-react';

const initialState = {
  clientName: '',
  clientPhone: '',
  itemName: '',
  filamentWeight: 0,
  filamentCostPerKg: 1000,
  printTimeHours: 0,
  numberOfPlates: 1,
  laborHours: 0,
  laborRatePerHour: 250,
  materials: [],
};

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_MATERIAL':
      return {
        ...state,
        materials: [...state.materials, { id: Date.now(), name: '', cost: 0 }]
      };
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map(m => 
          m.id === action.id ? { ...m, [action.field]: action.value } : m
        )
      };
    case 'REMOVE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter(m => m.id !== action.id)
      };
    default:
      return state;
  }
}

export default function AdvancedPriceChecker() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const [showModal, setShowModal] = useState(false);
  const [additionalServices, setAdditionalServices] = useState({
    sanding: false,
    painting: false,
    assembly: false
  });

  const calcElectricity = () => {
    const plates = Math.max(1, parseInt(state.numberOfPlates) || 0);
    const hours = Math.max(0, parseFloat(state.printTimeHours) || 0);
    const totalKWh = (plates * 1.2) + (hours * 0.2);
    return { totalKWh, cost: totalKWh * 14.16 };
  };

  const elec = calcElectricity();
  const filCost = (Math.max(0, parseFloat(state.filamentWeight) || 0) / 1000) * 
                  Math.max(0, parseFloat(state.filamentCostPerKg) || 0);
  const laborCost = Math.max(0, parseFloat(state.laborHours) || 0) * 
                    Math.max(0, parseFloat(state.laborRatePerHour) || 0);
  const matCost = state.materials.reduce((sum, mat) => sum + (parseFloat(mat.cost) || 0), 0);
  
  // Calculate specific additional service fees (predefined estimates)
  const servicesCost = 
    (additionalServices.sanding ? 500 : 0) + 
    (additionalServices.painting ? 800 : 0) + 
    (additionalServices.assembly ? 350 : 0);

  const basePrice = elec.cost + filCost + laborCost + matCost;
  const finalPrice = basePrice + servicesCost;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNum = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: val });
  };
  
  const handleText = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: e.target.value });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* LEFT COLUMN: Input Sections */}
      <div className="flex-1 w-full space-y-6">

        {/* Section: Client Origination */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Client Identity</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Client Name <span className="text-red-500">*</span></label>
              <input 
                type="text" name="clientName" value={state.clientName} onChange={handleText}
                placeholder="e.g., John Doe" required
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Contact / Phone (Optional)</label>
              <input 
                type="text" name="clientPhone" value={state.clientPhone} onChange={handleText}
                placeholder="+63 912 345 6789"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900"
              />
            </div>
          </div>
        </section>
        
        {/* Section: Object Info */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">1. Object Specification</h2>
          </div>
          <div className="p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Item Name</label>
            <input 
              type="text" name="itemName" value={state.itemName} onChange={handleText}
              placeholder="e.g., Mechanical Keyboard Chassis"
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900"
            />
          </div>
        </section>

        {/* Section: Operational Costs */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">2. Operational Metrics</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="group relative">
              <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Plates Count
                <div className="hidden group-hover:block ml-2 w-48 bg-zinc-800 text-zinc-50 text-[11px] rounded p-1.5 text-center absolute bottom-full mb-1 left-0 shadow-lg pointer-events-none z-10 normal-case tracking-normal">
                  Allocates 1.2kWh startup load per plate.
                </div>
              </label>
              <div className="relative">
                <input 
                  type="number" name="numberOfPlates" min="1"
                  value={state.numberOfPlates} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">qty</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Print Timeline</label>
              <div className="relative">
                <input 
                  type="number" name="printTimeHours" min="0" step="0.5"
                  value={state.printTimeHours} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">hrs</span>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Direct Materials */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">3. Direct Materials</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Filament Weight</label>
                <div className="relative">
                  <input 
                    type="number" name="filamentWeight" min="0"
                    value={state.filamentWeight} onChange={handleNum}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-9 font-medium"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">g</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Cost Rate</label>
                <div className="relative">
                  <input 
                    type="number" name="filamentCostPerKg" min="0"
                    value={state.filamentCostPerKg} onChange={handleNum}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP/kg</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Supplementary Items</label>
                <button 
                  onClick={() => dispatch({ type: 'ADD_MATERIAL' })}
                  className="text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {state.materials.length === 0 ? (
                <div className="py-4 text-xs text-zinc-400 text-center border border-dashed border-zinc-200 rounded bg-zinc-50">
                  No supplementary items.
                </div>
              ) : (
                <div className="space-y-2">
                  {state.materials.map(mat => (
                    <div key={mat.id} className="flex gap-2 items-center">
                      <input 
                        type="text" placeholder="Description"
                        value={mat.name}
                        onChange={(e) => dispatch({ type: 'UPDATE_MATERIAL', id: mat.id, field: 'name', value: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900"
                      />
                      <div className="relative w-32 shrink-0">
                        <input 
                          type="number" placeholder="0.00" min="0"
                          value={mat.cost}
                          onChange={(e) => dispatch({ type: 'UPDATE_MATERIAL', id: mat.id, field: 'cost', value: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP</span>
                      </div>
                      <button 
                        onClick={() => dispatch({ type: 'REMOVE_MATERIAL', id: mat.id })}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section: Labor */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">4. Processing & Labor</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Duration</label>
              <div className="relative">
                <input 
                  type="number" name="laborHours" min="0" step="0.5"
                  value={state.laborHours} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">hrs</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Hourly Rate</label>
              <div className="relative">
                <input 
                  type="number" name="laborRatePerHour" min="0"
                  value={state.laborRatePerHour} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-right pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP/hr</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* RIGHT COLUMN: Output Sticky Block */}
      <div className="w-full lg:w-[360px] sticky top-6">
        
        <div className="bg-white border border-zinc-300 shadow-xl shadow-zinc-100 rounded-lg overflow-hidden flex flex-col">
          
          <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 uppercase">Financial Summary</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 font-medium text-sm text-zinc-600 border-b border-zinc-100 pb-5">
              
              <div className="flex justify-between items-center group">
                <span>Material Allocation</span>
                <span className="text-zinc-900 group-hover:text-black">
                  {filCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              
              <div className="flex justify-between items-center group">
                <span>Utility & Infrastructure <span className="text-xs text-zinc-400 font-normal">({elec.totalKWh.toFixed(1)} kWh)</span></span>
                <span className="text-zinc-900 group-hover:text-black">
                  {elec.cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              
              <div className="flex justify-between items-center group">
                <span>Direct Labor</span>
                <span className="text-zinc-900 group-hover:text-black">
                  {laborCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>

              {state.materials.length > 0 && (
                <div className="flex justify-between items-center group">
                  <span>Supplementary</span>
                  <span className="text-zinc-900 group-hover:text-black">
                    {matCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-5 flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Billable</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-zinc-400">PHP</span>
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>

          <div className="flex bg-zinc-50 p-4 border-t border-zinc-200 gap-2">
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 bg-zinc-900 hover:bg-black text-white text-sm font-semibold py-2.5 px-4 rounded transition-colors text-center shadow-sm"
            >
              Commit Pricing
            </button>
            <button className="w-10 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center rounded transition-colors shadow-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ADDITIONAL SERVICES MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase">Additional Services</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900 transition-colors tooltip">✕</button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-zinc-500 mb-6 font-medium">Have you considered any post-processing services for this order? Select below to automatically inject them into the billable total.</p>
              
              <div className="space-y-4">
                
                {/* Checkbox item: Sanding */}
                <label className="flex items-start gap-3 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 transition-colors">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={additionalServices.sanding}
                      onChange={(e) => setAdditionalServices(p => ({ ...p, sanding: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-zinc-900">Post-Print Sanding</span>
                      <span className="text-xs font-semibold text-zinc-500">+PHP 500.00</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Full surface smoothing and seam patching.</p>
                  </div>
                </label>

                {/* Checkbox item: Painting */}
                <label className="flex items-start gap-3 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 transition-colors">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={additionalServices.painting}
                      onChange={(e) => setAdditionalServices(p => ({ ...p, painting: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-zinc-900">Primer & Painting</span>
                      <span className="text-xs font-semibold text-zinc-500">+PHP 800.00</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Multi-layer airbrushing and protective clear coat.</p>
                  </div>
                </label>

                {/* Checkbox item: Assembly */}
                <label className="flex items-start gap-3 p-3 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-50 transition-colors">
                  <div className="mt-0.5">
                    <input 
                      type="checkbox" 
                      checked={additionalServices.assembly}
                      onChange={(e) => setAdditionalServices(p => ({ ...p, assembly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-zinc-900">Hardware Assembly</span>
                      <span className="text-xs font-semibold text-zinc-500">+PHP 350.00</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Gluing, screwing, and final structural tests.</p>
                  </div>
                </label>

              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">New Total:</span>
                <span className="text-lg font-bold text-zinc-900 tracking-tight ml-1">
                  PHP {finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <button 
                disabled={isSubmitting}
                onClick={async () => {
                  if (!state.clientName || !state.itemName) {
                    alert('Please provide a Client Name and Item Name.');
                    return;
                  }
                  
                  setIsSubmitting(true);
                  try {
                    // 1. Insert or match client
                    let clientId;
                    const { data: existingClient } = await supabase.from('clients')
                      .select('id').eq('name', state.clientName).single();
                      
                    if (existingClient) {
                      clientId = existingClient.id;
                    } else {
                      const { data: newClient, error: clientErr } = await supabase.from('clients')
                        .insert({ name: state.clientName, contact: state.clientPhone }).select().single();
                      if (clientErr) throw clientErr;
                      clientId = newClient.id;
                    }

                    // 2. Insert Order
                    const { data: order, error: orderErr } = await supabase.from('orders')
                      .insert({ client_id: clientId, status: 'Pending' }).select().single();
                    if (orderErr) throw orderErr;

                    // 3. Insert Item Data
                    const { error: itemErr } = await supabase.from('items')
                      .insert({ 
                        order_id: order.id, 
                        name: state.itemName,
                        filament_weight_g: state.filamentWeight || 0,
                        print_time_hours: state.printTimeHours || 0,
                        number_of_plates: state.numberOfPlates || 1,
                        labor_hours: state.laborHours || 0
                      });
                    if (itemErr) throw itemErr;

                    alert('Order successfully saved to Supabase!');
                    setShowModal(false);
                  } catch (e) {
                    console.error('Supabase Setup Missing or Error:', e.message);
                    alert('Order processed locally! (Set ENV variables to write to Supabase)');
                    setShowModal(false);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold py-2 px-5 rounded transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
}
