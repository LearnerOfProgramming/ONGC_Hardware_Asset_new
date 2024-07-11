import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('');

  const tabs = [
    { path: '', label: 'G&G DATA CENTER, WOB' },
    { path: 'vrc', label: 'VRC, WOB' },
    { path: 'dr', label: 'DR CENTER, WOB' },
    
  ];

  return (
    <>
        
    <div className="w-full flex flex-col">
      
      <nav className="fixed w-full z-10 bg-white shadow-md">
        <ul className="grid grid-cols-3">
          {tabs.map(({ path, label }) => (
            <li key={path} className="relative">
              <NavLink
                to={path}
                className={
                  activeTab === path
                  ? 'flex items-center justify-center h-14 text-red-800 font-semibold transition-colors duration-300'
                  : 'flex items-center justify-center h-14 text-gray-700 hover:bg-gray-100 transition-colors duration-300'
                }
                onClick={() => setActiveTab(path)}
                >
                {label}
              </NavLink>
              {activeTab === path && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800 rounded-t-full" />
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
          </>
  );
};

export default Admin;