import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, X, Package, Layers, AlertTriangle } from 'lucide-react';

const FILAMENT_TYPES = ['PLA Basic', 'PLA Glow', 'PETG', 'ABS', 'TPU'];
const FILAMENT_BRANDS = ['Bambu Lab', 'eSun'];

const DEFAULT_FILAMENTS = [
  { id: 1, type: 'PLA', brand: '', color: 'White', weightGrams: 1000, costPerKg: 700, notes: '' },
  { id: 2, type: 'PETG', brand: '', color: 'Black', weightGrams: 1000, costPerKg: 850, notes: '' },
];

const DEFAULT_MATERIALS = [
  { id: 1, name: 'M3 Clicker Insert', category: 'Hardware', quantity: 50, unit: 'pcs', costPerUnit: 5, notes: '' },
];

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

const LOW_STOCK_THRESHOLD_GRAMS = 200;
const LOW_STOCK_THRESHOLD_QTY = 5;

// ─── Inline editable row ───────────────────────────────────────────────────

function FilamentRow({ filament, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(filament);

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(filament);
    setEditing(false);
  };

  const isLow = filament.weightGrams <= LOW_STOCK_THRESHOLD_GRAMS;

  if (editing) {
    return (
      <tr className="bg-zinc-50 border-b border-zinc-100">
        <td className="px-4 py-2">
          <select
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.type}
            onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
          >
            {FILAMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>
        <td className="px-4 py-2">
          <select
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.brand}
            onChange={e => setDraft(d => ({ ...d, brand: e.target.value }))}
          >
            <option value="">— select —</option>
            {FILAMENT_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </td>
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.color}
            onChange={e => setDraft(d => ({ ...d, color: e.target.value }))}
            placeholder="Color"
          />
        </td>
        <td className="px-4 py-2">
          <div className="relative">
            <input
              type="number" min="0"
              className="w-full text-sm border border-zinc-300 rounded px-2 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              value={draft.weightGrams}
              onChange={e => setDraft(d => ({ ...d, weightGrams: Number(e.target.value) }))}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-zinc-400 text-xs pointer-events-none">g</span>
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="relative">
            <input
              type="number" min="0"
              className="w-full text-sm border border-zinc-300 rounded px-2 py-1 pr-16 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              value={draft.costPerKg}
              onChange={e => setDraft(d => ({ ...d, costPerKg: Number(e.target.value) }))}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-zinc-400 text-xs pointer-events-none">PHP/kg</span>
          </div>
        </td>
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.notes}
            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
            placeholder="Notes"
          />
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-1">
            <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"><Check className="w-4 h-4" /></button>
            <button onClick={handleCancel} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors ${isLow ? 'bg-amber-50/40' : 'bg-white'}`}>
      <td className="px-4 py-3 text-sm font-semibold text-zinc-800 flex items-center gap-2">
        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Low stock" />}
        {filament.type || filament.name || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-500">{filament.brand || '—'}</td>
      <td className="px-4 py-3 text-sm text-zinc-500">{filament.color}</td>
      <td className="px-4 py-3">
        <span className={`text-sm font-bold ${isLow ? 'text-amber-600' : 'text-zinc-800'}`}>
          {filament.weightGrams.toLocaleString()}g
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600">PHP {filament.costPerKg.toLocaleString()}/kg</td>
      <td className="px-4 py-3 text-xs text-zinc-400 max-w-[140px] truncate">{filament.notes || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(filament.id)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

function MaterialRow({ material, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(material);

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };
  const handleCancel = () => {
    setDraft(material);
    setEditing(false);
  };

  const isLow = material.quantity <= LOW_STOCK_THRESHOLD_QTY;

  if (editing) {
    return (
      <tr className="bg-zinc-50 border-b border-zinc-100">
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="Name"
          />
        </td>
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.category}
            onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
            placeholder="Category"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="number" min="0"
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.quantity}
            onChange={e => setDraft(d => ({ ...d, quantity: Number(e.target.value) }))}
          />
        </td>
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.unit}
            onChange={e => setDraft(d => ({ ...d, unit: e.target.value }))}
            placeholder="unit"
          />
        </td>
        <td className="px-4 py-2">
          <div className="relative">
            <input
              type="number" min="0"
              className="w-full text-sm border border-zinc-300 rounded px-2 py-1 pr-10 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              value={draft.costPerUnit}
              onChange={e => setDraft(d => ({ ...d, costPerUnit: Number(e.target.value) }))}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-zinc-400 text-xs pointer-events-none">PHP</span>
          </div>
        </td>
        <td className="px-4 py-2">
          <input
            className="w-full text-sm border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            value={draft.notes}
            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
            placeholder="Notes"
          />
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-1">
            <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"><Check className="w-4 h-4" /></button>
            <button onClick={handleCancel} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors ${isLow ? 'bg-amber-50/40' : 'bg-white'}`}>
      <td className="px-4 py-3 text-sm font-semibold text-zinc-800 flex items-center gap-2">
        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Low stock" />}
        {material.name}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{material.category}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-bold ${isLow ? 'text-amber-600' : 'text-zinc-800'}`}>{material.quantity.toLocaleString()}</span>
        <span className="text-xs text-zinc-400 ml-1">{material.unit}</span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-500 hidden">{material.unit}</td>
      <td className="px-4 py-3 text-sm text-zinc-600">PHP {material.costPerUnit?.toLocaleString() ?? '—'}</td>
      <td className="px-4 py-3 text-xs text-zinc-400 max-w-[140px] truncate">{material.notes || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(material.id)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Inventory View ───────────────────────────────────────────────────

export default function InventoryView() {
  const [filaments, setFilaments] = useLocalStorage('inventory_filaments', DEFAULT_FILAMENTS);
  const [materials, setMaterials] = useLocalStorage('inventory_materials', DEFAULT_MATERIALS);
  const [activeSection, setActiveSection] = useState('filaments');

  // ── Filament CRUD ──────────────────────────────────────────────────────

  const addFilament = () => {
    setFilaments(prev => [...prev, {
      id: Date.now(),
      type: FILAMENT_TYPES[0],
      brand: FILAMENT_BRANDS[0],
      color: '',

      weightGrams: 1000,
      costPerKg: 700,
      notes: ''
    }]);
  };

  const updateFilament = (updated) => {
    setFilaments(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const deleteFilament = (id) => {
    if (window.confirm('Remove this filament from inventory?')) {
      setFilaments(prev => prev.filter(f => f.id !== id));
    }
  };

  // ── Material CRUD ──────────────────────────────────────────────────────

  const addMaterial = () => {
    setMaterials(prev => [...prev, {
      id: Date.now(),
      name: 'New Item',
      category: 'Hardware',
      quantity: 0,
      unit: 'pcs',
      costPerUnit: 0,
      notes: ''
    }]);
  };

  const updateMaterial = (updated) => {
    setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const deleteMaterial = (id) => {
    if (window.confirm('Remove this item from inventory?')) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const totalFilamentWeight = filaments.reduce((s, f) => s + f.weightGrams, 0);
  const lowFilaments = filaments.filter(f => f.weightGrams <= LOW_STOCK_THRESHOLD_GRAMS).length;
  const totalMatQty = materials.reduce((s, m) => s + m.quantity, 0);
  const lowMaterials = materials.filter(m => m.quantity <= LOW_STOCK_THRESHOLD_QTY).length;

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1">Inventory</h1>
        <p className="text-sm text-zinc-500 font-medium">Track filament stock and supplementary materials on-hand.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Filament Types"
          value={filaments.length}
          sub="tracked"
          icon={<Layers className="w-4 h-4" />}
        />
        <StatCard
          label="Total Filament"
          value={`${(totalFilamentWeight / 1000).toFixed(2)} kg`}
          sub="in stock"
          icon={<Layers className="w-4 h-4" />}
        />
        <StatCard
          label="Material SKUs"
          value={materials.length}
          sub="tracked"
          icon={<Package className="w-4 h-4" />}
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowFilaments + lowMaterials}
          sub="items"
          icon={<AlertTriangle className="w-4 h-4" />}
          alert={lowFilaments + lowMaterials > 0}
        />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveSection('filaments')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeSection === 'filaments' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Filaments
        </button>
        <button
          onClick={() => setActiveSection('materials')}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeSection === 'materials' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Materials & Hardware
        </button>
      </div>

      {/* ── Filaments Table ── */}
      {activeSection === 'filaments' && (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Filament Stock</h2>
              {lowFilaments > 0 && (
                <span className="ml-1 inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> {lowFilaments} low
                </span>
              )}
            </div>
            <button
              onClick={addFilament}
              className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Add Filament
            </button>
          </div>

          {filaments.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm border-b border-zinc-100">
              No filaments in inventory. Add one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70">
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Type</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Brand</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Color</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Weight</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Cost Rate</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Notes</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filaments.map(f => (
                    <FilamentRow key={f.id} filament={f} onUpdate={updateFilament} onDelete={deleteFilament} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
            <span className="text-xs text-zinc-400 font-medium">
              Total stock: <strong className="text-zinc-700">{(totalFilamentWeight / 1000).toFixed(3)} kg</strong> across {filaments.length} filament type{filaments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>
      )}

      {/* ── Materials Table ── */}
      {activeSection === 'materials' && (
        <section className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">Materials & Hardware</h2>
              {lowMaterials > 0 && (
                <span className="ml-1 inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> {lowMaterials} low
                </span>
              )}
            </div>
            <button
              onClick={addMaterial}
              className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm border-b border-zinc-100">
              No materials in inventory. Add one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70">
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Name</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Category</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Qty</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hidden">Unit</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Unit Cost</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Notes</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <MaterialRow key={m.id} material={m} onUpdate={updateMaterial} onDelete={deleteMaterial} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
            <span className="text-xs text-zinc-400 font-medium">
              Total: <strong className="text-zinc-700">{totalMatQty.toLocaleString()} units</strong> across {materials.length} item{materials.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>
      )}

    </div>
  );
}

function StatCard({ label, value, sub, icon, alert }) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${alert ? 'border-amber-200 bg-amber-50/40' : 'border-zinc-200'}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${alert ? 'text-amber-500' : 'text-zinc-400'}`}>
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-2xl font-extrabold tracking-tight ${alert ? 'text-amber-600' : 'text-zinc-900'}`}>{value}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>
    </div>
  );
}
