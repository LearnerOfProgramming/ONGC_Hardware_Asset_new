import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LuLogOut } from "react-icons/lu";

const Navbar = () => {
      const Separator = () => <div className=' mt-20 '></div>
      const navigate = useNavigate();

      const navItems = [
            { to: '/', label: 'Home' },
            { to: 'vendors', label: 'Vendors' },
            { to: 'assets', label: 'Assets' },
            { to: 'admin', label: 'Admin' },
            { to: 'reporting', label: 'Report' },
      ];

      const handleLogout = () => {
            window.localStorage.setItem('isAdmin', false)
            window.localStorage.setItem('isLoggedIn', false)
            window.localStorage.setItem('username', null)
            navigate('/login')
      }

      return (
            <>
  <nav className="fixed top-0 left-0 w-full z-50 bg-red-800 shadow-md">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">DATABASE GROUP</h1>
          <span className="text-lg text-gray-200">Western Offshore Basin</span>
        </div>
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
          {window.localStorage.getItem('isLoggedIn') === 'true' ? (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <LuLogOut size={20} />
            </button>
                  ) : <><Link key="login" to="login" className="text-white hover:text-gray-200 transition-colors duration-200">
                      Login
                  </Link></>}
        </div>
      </div>
    </div>
  </nav>
  
 
    <Separator />
    <Outlet />
  
</>
      )
}

export default Navbar