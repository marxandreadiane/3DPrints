import { useState } from 'react';
import { Settings, Save, Zap, Wrench } from 'lucide-react';

export default function ConfigurationsView({ config, setConfig }) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleNum = (e) => {
    setLocalConfig(p => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };

  const handleSave = () => {
    setConfig(localConfig);
    alert('Configurations saved!');
  };

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
              <input type="number" name="baseCostRate" value={localConfig.baseCostRate} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP/kWh</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Printer's kWh per hour</label>
            <div className="relative">
              <input type="number" name="printerKwhPerHour" value={localConfig.printerKwhPerHour} onChange={handleNum} step="0.1" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">kWh</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Per-Plate Power Surge</label>
            <div className="relative">
              <input type="number" name="powerSurgeKwh" value={localConfig.powerSurgeKwh} onChange={handleNum} step="0.1" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
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
              <input type="number" name="hourlyLaborRate" value={localConfig.hourlyLaborRate} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Filament Change Cost</label>
            <div className="relative">
              <input type="number" name="filamentChangeCost" value={localConfig.filamentChangeCost || 0.1} onChange={handleNum} step="0.01" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Additional Services</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Sanding</label>
            <div className="relative">
              <input type="number" name="sandingCost" value={localConfig.sandingCost || 500} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Painting</label>
            <div className="relative">
              <input type="number" name="paintingCost" value={localConfig.paintingCost || 800} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Assembly</label>
            <div className="relative">
              <input type="number" name="assemblyCost" value={localConfig.assemblyCost || 350} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Margins & Depreciation</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Machine Wear & Tear</label>
            <div className="relative">
              <input type="number" name="wearTearCostPer15Min" value={localConfig.wearTearCostPer15Min || 2.5} onChange={handleNum} step="0.5" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">PHP/15m</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Failure Rate Buffer</label>
            <div className="relative">
              <input type="number" name="failureRatePercent" value={localConfig.failureRatePercent || 10} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Markup Profit Margin</label>
            <div className="relative">
              <input type="number" name="markupPercent" value={localConfig.markupPercent || 30} onChange={handleNum} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-900" />
              <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold py-2 px-6 rounded transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

    </div>
  );
}
