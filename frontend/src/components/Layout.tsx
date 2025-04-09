// src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Menu } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const linkClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
      location.pathname === path || location.pathname.startsWith(path)
        ? 'bg-[var(--task-blue)] text-white'
        : 'hover:bg-[var(--task-muted)] text-[var(--task-text)]'
    }`;

  return (
    <div className="min-h-screen bg-[var(--task-bg)] flex text-[var(--task-text)]">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg fixed inset-y-0 left-0 z-20 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out md:relative md:w-64 flex-shrink-0`}>
        <div className="flex flex-col h-full border-r">
          <div className="p-5 border-b">
            <h1 className="text-xl font-bold text-[var(--task-blue)]">TaskAnalytics</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/tasks" className={linkClass('/tasks')}>
              <BarChart2 size={18} />
              <span>Tasks</span>
            </Link>
          </nav>
          <div className="p-4 text-xs text-muted border-t border-[var(--task-border)]">
            <p>© 2025 TaskAnalytics</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[var(--task-border)] p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden p-2 rounded-md hover:bg-[var(--task-muted)] transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="ml-4 md:ml-0 font-semibold">
            {location.pathname.includes('/tasks') && 'Tasks Management'}
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-[var(--task-blue)] text-white h-8 w-8 rounded-full flex items-center justify-center font-semibold">
              TA
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
