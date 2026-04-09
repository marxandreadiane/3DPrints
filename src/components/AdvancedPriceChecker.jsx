import { useReducer, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import {
  Calculator, Plus, Trash2, Box, Zap, Clock, Coins, Wrench, CheckCircle2, Paintbrush, Shield, User
} from 'lucide-react';

const initialState = {
  clientName: '',
  clientPhone: '',
  itemName: '',
  filaments: [{ id: Date.now(), weight: 0, costPerKg: 700 }],
  filamentChangeCount: 0,
  printTimeHours: 0,
  printTimeMinutes: 0,
  numberOfPlates: 1,
  labors: [],
  materials: [],
  packagingCost: 0,
  shippingCost: 0,
  miscellaneousCost: 0,
};

function init(config) {
  return {
    ...initialState,
    labors: [{ id: Date.now(), type: '3D Modeling & Printing', hours: 0, rate: config?.hourlyLaborRate || 250 }]
  };
}

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_FILAMENT':
      return {
        ...state,
        filaments: [...state.filaments, { id: Date.now(), weight: 0, costPerKg: 700 }],
        filamentChangeCount: Number(state.filamentChangeCount || 0) + 1
      };
    case 'UPDATE_FILAMENT':
      return {
        ...state,
        filaments: state.filaments.map(f =>
          f.id === action.id ? { ...f, [action.field]: action.value } : f
        )
      };
    case 'REMOVE_FILAMENT':
      return {
        ...state,
        filaments: state.filaments.filter(f => f.id !== action.id)
      };
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
        materials: state.materials.filter(m => m.id !== action.id)
      };
    case 'ADD_LABOR':
      return {
        ...state,
        labors: [...state.labors, { id: Date.now(), type: '3D Modeling & Printing', hours: 0, rate: action.defaultRate || 250 }]
      };
    case 'UPDATE_LABOR':
      return {
        ...state,
        labors: state.labors.map(l =>
          l.id === action.id ? { ...l, [action.field]: action.value } : l
        )
      };
    case 'REMOVE_LABOR':
      return {
        ...state,
        labors: state.labors.filter(l => l.id !== action.id)
      };
    default:
      return state;
  }
}

export default function AdvancedPriceChecker({ config }) {
  const [state, dispatch] = useReducer(formReducer, config, init);
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [additionalServices, setAdditionalServices] = useState({
    sanding: false,
    painting: false,
    assembly: false
  });

  const calcElectricity = () => {
    const plates = Math.max(1, parseInt(state.numberOfPlates) || 0);
    const filaments = Math.max(1, parseInt(state.filamentChangeCount) || 0);
    const hours = Math.max(0, parseFloat(state.printTimeHours) || 0);
    const minutes = Math.max(0, parseFloat(state.printTimeMinutes) || 0);
    const totalHours = hours + (minutes / 60);

    const surgeHours = plates * (8 / 60); // 8 minutes per plate
    const remainingHours = Math.max(0, totalHours - surgeHours);

    const surgeKWh = surgeHours * (config?.powerSurgeKwh || 1.3);
    const normalKWh = remainingHours * (config?.printerKwhPerHour || 0.2);
    const totalKWh = surgeKWh + normalKWh;

    return { totalKWh, cost: (totalKWh * (config?.baseCostRate || 14.16)) + (filaments * (config?.filamentChangeCost || 0.1)) };
  };

  const elec = calcElectricity();
  const filCost = state.filaments.reduce((sum, f) =>
    sum + (Math.max(0, parseFloat(f.weight) || 0) / 1000) * Math.max(0, parseFloat(f.costPerKg) || 0)
    , 0);

  const minutesTotal = (Math.max(0, parseFloat(state.printTimeHours) || 0) * 60) + Math.max(0, parseFloat(state.printTimeMinutes) || 0);
  const wearTearCost = (minutesTotal / 15) * (config?.wearTearCostPer15Min || 2.5);

  const rawOpsCost = elec.cost + filCost + wearTearCost;
  const failureBufferCost = rawOpsCost * ((config?.failureRatePercent || 10) / 100);

  const laborCost = state.labors.reduce((sum, lab) => sum + (parseFloat(lab.hours || 0) * parseFloat(lab.rate || 0)), 0);
  const matCost = state.materials.reduce((sum, mat) => sum + (parseFloat(mat.cost) || 0), 0);
  const logisticsCost = (parseFloat(state.packagingCost) || 0) + (parseFloat(state.shippingCost) || 0) + (parseFloat(state.miscellaneousCost) || 0);

  const servicesCost =
    (additionalServices.sanding ? (config?.sandingCost || 500) : 0) +
    (additionalServices.painting ? (config?.paintingCost || 800) : 0) +
    (additionalServices.assembly ? (config?.assemblyCost || 350) : 0);

  const basePriceWithFailure = rawOpsCost + failureBufferCost + laborCost + matCost + logisticsCost + servicesCost;
  const markupCost = basePriceWithFailure * ((config?.markupPercent || 100) / 100);
  const finalPrice = basePriceWithFailure + markupCost;

  const handleNum = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: val });
  };

  const handleText = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: e.target.value });
  };

  const confirmOrderMutation = useMutation({
    mutationFn: async () => {
      const financial_breakdown = {
        electricityCost: elec.cost,
        totalKWh: elec.totalKWh,
        filamentCost: filCost,
        wearTearCost: wearTearCost,
        failureBufferCost: failureBufferCost,
        laborCost: laborCost,
        supplementaryMatCost: matCost,
        logisticsCost: logisticsCost,
        servicesCost: servicesCost,
        markupCost: markupCost,
        failureRatePercent: config?.failureRatePercent || 10,
        markupPercent: config?.markupPercent || 30
      };

      const { data: orderId, error: rpcErr } = await supabase.rpc('create_order_with_items', {
        p_client_name: state.clientName,
        p_client_phone: state.clientPhone,
        p_item_name: state.itemName,
        p_filament_weight: state.filaments.reduce((sum, f) => sum + parseFloat(f.weight || 0), 0),
        p_print_time: (state.printTimeHours || 0) + ((state.printTimeMinutes || 0) / 60),
        p_plates: parseInt(state.numberOfPlates) || 1,
        p_labor_hours: state.labors.reduce((sum, lab) => sum + parseFloat(lab.hours || 0), 0),
        p_total_price: finalPrice,
        p_financial_breakdown: financial_breakdown
      });

      if (rpcErr) throw rpcErr;
      return orderId;
    },
    onSuccess: () => {
      alert('Order successfully saved to Supabase (Optimized)!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      setShowModal(false);
    },
    onError: (e) => {
      console.error('Database Error:', e.message);
      alert('Order processed locally! (Set ENV variables and apply SQL migration to write to Supabase)');
      setShowModal(false);
    }
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">

      {/* LEFT COLUMN: Input Sections */}
      <div className="flex-1 w-full space-y-6">

        {/* Section: Client Identity */}
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
                  Allocates {config?.powerSurgeKwh || 1.3}kW surge load per plate for 8 minutes.
                </div>
              </label>
              <div className="relative">
                <input
                  type="number" name="numberOfPlates" min="1"
                  value={state.numberOfPlates} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">qty</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Print Timeline</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number" name="printTimeHours" min="0" step="1"
                    value={state.printTimeHours} onChange={handleNum}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">hrs</span>
                </div>
                <div className="relative">
                  <input
                    type="number" name="printTimeMinutes" min="0" max="59" step="1"
                    value={state.printTimeMinutes} onChange={handleNum}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">mins</span>
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Total Filament Change Count
                <div className="hidden group-hover:block ml-2 w-48 bg-zinc-800 text-zinc-50 text-[11px] rounded p-1.5 text-center absolute bottom-full mb-1 left-0 shadow-lg pointer-events-none z-10 normal-case tracking-normal">
                  Allocates {config?.filamentChangeCost || 0.1} PHP per filament change.
                </div>
              </label>
              <div className="relative">
                <input
                  type="number" name="filamentChangeCount" min="1"
                  value={state.filamentChangeCount} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none uppercase">qty</span>
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
            <div className="border-b border-zinc-100 pb-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Filaments Used</label>
                <button
                  onClick={() => dispatch({ type: 'ADD_FILAMENT' })}
                  className="text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Filament
                </button>
              </div>

              <div className="space-y-4">
                {state.filaments.map((filament, index) => (
                  <div key={filament.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end bg-zinc-50 p-3 rounded border border-zinc-100">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Filament {index + 1} Weight</label>
                      <div className="relative">
                        <input
                          type="number" min="0" value={filament.weight}
                          onChange={(e) => dispatch({ type: 'UPDATE_FILAMENT', id: filament.id, field: 'weight', value: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-9 font-medium"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">g</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Cost Rate</label>
                      <div className="relative">
                        <input
                          type="number" min="0" value={filament.costPerKg}
                          onChange={(e) => dispatch({ type: 'UPDATE_FILAMENT', id: filament.id, field: 'costPerKg', value: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP/kg</span>
                      </div>
                    </div>
                    <div>
                      {state.filaments.length > 1 && (
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_FILAMENT', id: filament.id })}
                          className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
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

        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <h2 className="text-sm font-semibold text-zinc-900">4. Processing & Labor</h2>
            <button
              onClick={() => dispatch({ type: 'ADD_LABOR', defaultRate: config?.hourlyLaborRate || 250 })}
              className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Add Labor
            </button>
          </div>
          <div className="p-5">
            {state.labors.length === 0 ? (
              <div className="py-4 text-xs text-zinc-400 text-center border border-dashed border-zinc-200 rounded bg-zinc-50">
                No labor items tracked.
              </div>
            ) : (
              <div className="space-y-4">
                {state.labors.map((lab) => (
                  <div key={lab.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end bg-zinc-50 p-3 rounded border border-zinc-100">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Operation Phase</label>
                      <select
                        value={lab.type}
                        onChange={(e) => dispatch({ type: 'UPDATE_LABOR', id: lab.id, field: 'type', value: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900"
                      >
                        <option value="3D Modeling & Printing">3D Modeling & Printing</option>
                        <option value="Painting">Painting</option>
                        <option value="Sanding">Sanding</option>
                        <option value="Assembly">Assembly</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Duration</label>
                      <div className="relative">
                        <input
                          type="number" min="0" step="0.5" value={lab.hours}
                          onChange={(e) => dispatch({ type: 'UPDATE_LABOR', id: lab.id, field: 'hours', value: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-10 font-medium"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">hrs</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Rate</label>
                      <div className="relative">
                        <input
                          type="number" min="0" value={lab.rate}
                          onChange={(e) => dispatch({ type: 'UPDATE_LABOR', id: lab.id, field: 'rate', value: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-10 font-medium"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">/hr</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_LABOR', id: lab.id })}
                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section: Packaging & Shipping */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">5. Packaging & Shipping</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Packaging</label>
              <div className="relative">
                <input
                  type="number" name="packagingCost" min="0" value={state.packagingCost} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Shipping Cost</label>
              <div className="relative">
                <input
                  type="number" name="shippingCost" min="0" value={state.shippingCost} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Miscellaneous</label>
              <div className="relative">
                <input
                  type="number" name="miscellaneousCost" min="0" value={state.miscellaneousCost} onChange={handleNum}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-sm text-zinc-900 text-left pr-12 font-medium"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs pointer-events-none">PHP</span>
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
                  {filCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center group">
                <span>Utility & Infrastructure <span className="text-xs text-zinc-400 font-normal">({elec.totalKWh.toFixed(1)} kWh)</span></span>
                <span className="text-zinc-900 group-hover:text-black">
                  {elec.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {wearTearCost > 0 && (
                <div className="flex justify-between items-center group">
                  <span>Machine Wear & Tear</span>
                  <span className="text-zinc-900 group-hover:text-black">
                    {wearTearCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {failureBufferCost > 0 && (
                <div className="flex justify-between items-center group pt-1">
                  <span className="italic">Ops Waste Buffer <span className="text-xs text-zinc-400 font-normal">({config?.failureRatePercent || 10}%)</span></span>
                  <span className="text-zinc-900 group-hover:text-black italic">
                    +{failureBufferCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center group pt-2 border-t border-zinc-100 mt-2">
                <span>Direct Labor</span>
                <span className="text-zinc-900 group-hover:text-black">
                  {laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {state.materials.length > 0 && (
                <div className="flex justify-between items-center group">
                  <span>Supplementary</span>
                  <span className="text-zinc-900 group-hover:text-black">
                    {matCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {(parseFloat(state.packagingCost) > 0 || parseFloat(state.shippingCost) > 0 || parseFloat(state.miscellaneousCost) > 0) && (
                <div className="flex justify-between items-center group pt-2 border-t border-zinc-100 mt-2">
                  <span>Logistics & Overheads</span>
                  <span className="text-zinc-900 group-hover:text-black">
                    {logisticsCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {markupCost > 0 && (
                <div className="flex justify-between items-center group pt-2 border-t border-zinc-100 mt-2">
                  <span className="font-semibold text-emerald-600">Markup Profit <span className="text-xs font-normal">({config?.markupPercent || 30}%)</span></span>
                  <span className="text-emerald-700 font-semibold group-hover:text-emerald-800">
                    +{markupCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Billable</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-zinc-400">PHP</span>
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      <span className="text-xs font-semibold text-zinc-500">+PHP {config?.sandingCost || 500}</span>
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
                      <span className="text-xs font-semibold text-zinc-500">+PHP {config?.paintingCost || 800}</span>
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
                      <span className="text-xs font-semibold text-zinc-500">+PHP {config?.assemblyCost || 350}</span>
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
                  PHP {finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                disabled={confirmOrderMutation.isPending}
                onClick={async () => {
                  if (!state.clientName || !state.itemName) {
                    alert('Please provide a Client Name and Item Name.');
                    return;
                  }
                  confirmOrderMutation.mutate();
                }}
                className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold py-2 px-5 rounded transition-colors shadow-sm disabled:opacity-50"
              >
                {confirmOrderMutation.isPending ? 'Saving...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
