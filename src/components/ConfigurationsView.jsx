import { Settings, Save, Zap, Wrench } from 'lucide-react';

export default function ConfigurationsView() {
  return (
    <div className="max-w-4xl space-y-6 flex-1 h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1">System Configurations</h2>
        <p className="text-sm text-zinc-500 font-medium">Manage default values for operational metrics, labor constraints, and infrastructure pricing.</p>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Electricity Setup</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Base Cost Rate</label>
            <div className="relative">
              <input type="number" defaultValue="14.16" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP/kWh</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Per-Plate Power Surge</label>
            <div className="relative">
              <input type="number" defaultValue="1.2" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">kWh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Labor Rates</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Standard Hourly Labor Rate</label>
            <div className="relative">
              <input type="number" defaultValue="250" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold py-2 px-6 rounded transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

    </div>
  );
}
