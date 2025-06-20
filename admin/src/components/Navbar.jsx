import React from 'react';
import logo from '../assets/admin_assets/logo.png';
import { FiLogOut } from 'react-icons/fi';

const Navbar = ({ settoken }) => {
  return (
    <div className='flex items-center justify-between py-3 px-6 bg-white shadow-sm border-b border-gray-100'>
      <div className='flex items-center'>
        {/* <img className='w-10 h-10 mr-3' src={logo} alt="SmartExam Logo" /> */}
        <span className='text-xl font-semibold text-indigo-600 hidden sm:block'>Admin Panel</span>
      </div>
      
      <button 
        onClick={() => settoken('')} 
        className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all'
      >
        <FiLogOut className="text-lg" />
        <span className='text-sm sm:text-base'>Logout</span>
      </button>
    </div>
  )
}

export default Navbar;