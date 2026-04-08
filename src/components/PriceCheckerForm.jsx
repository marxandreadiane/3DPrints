import { useReducer, useEffect, useState } from 'react';
import { Calculator, Save, Printer, Box, Clock } from 'lucide-react';
import clsx from 'clsx';

// Initial state for our complex form
const initialState = {
  name: '',
  filamentWeight: 0,
  printTimeHours: 0,
  numberOfPlates: 1,
  laborHours: 0,
};

// Reducer handles form updates
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function PriceCheckerForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [liveTotal, setLiveTotal] = useState(0);

  // Real-time calculation logic
  // In a real implementation with Supabase, this would call supabase.rpc('calculate_item_cost')
  // We use the exact formula: ((Plates * 1.2) + (Hours * 0.2)) * 14.16
  useEffect(() => {
    const plates = parseInt(state.numberOfPlates, 10) || 1;
    const hours = parseFloat(state.printTimeHours) || 0;
    
    // Validate inputs locally
    if (plates >= 1 && hours >= 0) {
      const electricityCost = ((plates * 1.2) + (hours * 0.2)) * 14.16;
      setLiveTotal(electricityCost);
    }
  }, [state.numberOfPlates, state.printTimeHours]);

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Basic validation to prevent negative values
    if (name === 'filamentWeight' && Number(value) < 0) return;
    if (name === 'printTimeHours' && Number(value) < 0) return;
    if (name === 'numberOfPlates' && Number(value) < 1) return;
    if (name === 'laborHours' && Number(value) < 0) return;

    dispatch({ type: 'UPDATE_FIELD', field: name, value: value === '' ? '' : Number(value) });
  };

  const handleTextChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto">
      
      {/* Left side: Form Inputs */}
      <div className="flex-1 p-8 border-r border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Box className="w-5 h-5 text-indigo-600" />
          Object Info & Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input 
              type="text" 
              name="name"
              value={state.name}
              onChange={handleTextChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Master Sword Prop"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filament Weight (g)</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="filamentWeight"
                  min="0"
                  value={state.filamentWeight}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Plates</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Printer className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="number" 
                  name="numberOfPlates"
                  min="1"
                  value={state.numberOfPlates}
                  onChange={handleNumberChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Print Time (Hours)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="number" 
                  name="printTimeHours"
                  min="0"
                  step="0.5"
                  value={state.printTimeHours}
                  onChange={handleNumberChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor Hours</label>
              <input 
                type="number" 
                name="laborHours"
                min="0"
                step="0.5"
                value={state.laborHours}
                onChange={handleNumberChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Live Total Cost Output */}
      <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Printer Costs
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm text-slate-600">
              <span>Plate Startup Surge</span>
              <span className="font-medium text-slate-800">{state.numberOfPlates} * 1.2 kWh</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-600">
              <span>Hourly Usage</span>
              <span className="font-medium text-slate-800">{state.printTimeHours} * 0.2 kWh</span>
            </div>
            
            <div className="h-px w-full bg-slate-200 my-4"></div>

            <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200 mt-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500 rounded-full opacity-50"></div>
              <div className="relative z-10">
                <div className="text-blue-100 text-sm font-medium mb-1">Live Final Price</div>
                <div className="text-4xl font-bold tracking-tight">
                  ${liveTotal.toFixed(2)}
                </div>
                <div className="text-blue-200 text-xs mt-2">
                  Calculated automatically based on electrical surge
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-8 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Save className="w-4 h-4" />
          Save Item to Order
        </button>
      </div>
    </div>
  );
}
