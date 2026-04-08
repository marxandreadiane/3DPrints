import { Home, Users, Settings, Package, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: Users, label: 'Clients', active: true },
    { icon: Package, label: 'Orders', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">3D</span>
          </div>
          PrintFlow
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href="#"
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                item.active 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm">
          <HelpCircle className="w-5 h-5" />
          Help & Support
        </a>
      </div>
    </div>
  );
}
