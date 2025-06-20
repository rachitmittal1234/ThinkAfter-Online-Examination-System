import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiPlus, FiList, FiBook, FiFileText, FiMenu, FiX, FiUsers } from 'react-icons/fi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button (only visible on small screens) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-indigo-500 focus:outline-none"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static z-40 w-[220px] min-h-screen bg-white border-r border-gray-200 shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button for mobile (only visible when sidebar is open) */}
        {isOpen && (
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full text-gray-500 hover:text-indigo-500 focus:outline-none"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        <div className='flex flex-col gap-2 p-4 mt-4 lg:mt-0'>
          <NavLink 
            to='/addtest'
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiPlus className="text-lg" />
            <span className='text-sm'>Add Test</span>
          </NavLink>
          
          <NavLink 
            to='/all-tests'
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiList className="text-lg" />
            <span className='text-sm'>View All Tests</span>
          </NavLink>
          
          <NavLink 
            to='/admin/questions/add'
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiBook className="text-lg" />
            <span className='text-sm'>Add New Question</span>
          </NavLink>
          
          <NavLink 
            to='/all-questions'
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiFileText className="text-lg" />
            <span className='text-sm'>View All Questions</span>
          </NavLink>

          {/* New View Users Button */}
          <NavLink 
            to='/admin/users'  // Make sure this matches your users route
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiUsers className="text-lg" />
            <span className='text-sm'>View Users</span>
          </NavLink>
          <NavLink 
            to='/admin/contact-messages'  // Make sure this matches your users route
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiUsers className="text-lg" />
            <span className='text-sm'>View Queries</span>
          </NavLink>
          <NavLink 
            to='/admin/feedback'  // Make sure this matches your users route
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-500'}
            `}
            onClick={() => setIsOpen(false)}
          >
            <FiUsers className="text-lg" />
            <span className='text-sm'>View Feedback</span>
          </NavLink>
        </div>
      </div>

      {/* Overlay for mobile (only visible when sidebar is open) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-blue-50 bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;