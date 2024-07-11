import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion"

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Here you would typically validate credentials against a backend
    // For this example, we'll use a simple check
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdmin', true);
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('username', username);
      navigate('/')

      alert('Logged in as admin');
    } else {
      localStorage.setItem('isAdmin', false);
      localStorage.setItem('isLoggedIn', true);
      alert('Logged in as regular user');
    }
    // Redirect or update state as needed
  };

  return (
    
    <div className='flex w-full justify-center pt-24'
    
        
      >

      <div className="relative bg-white p-8 rounded rounded-t-2xl shadow-md w-96 border">
        <div className='py-1 rounded-t-2xl absolute flex justify-center top-0 left-0 w-full bg-gradient-to-r from-red-600/100 to-rose-700'>
          <h2 className="text-white text-2xl font-bold mb-6 translate-y-3 unselectable">Login</h2>
        </div>
        <form onSubmit={handleLogin} className="mt-14 space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 text-black unselectable">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-black hover:border-black/50 border-black/20"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-black unselectable">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-black hover:border-black/50 border-black/20"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />
          </div>
          <div className='pt-3'>
            <button
              type="submit"
              className="outline outline-1 outline-slate-500 hover:outline-black hover:drop-shadow-sm hover:bg-black bg-gradient-to-r from-red-600/90 to-rose-700/90 w-full text-white rounded font-mono font-black text-xl hover:ease-out duration-200"
              >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;