import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import profile from '../assets/student_assets/profile_icon.png';
import menu from '../assets/student_assets/menu_icon.png';
import dropdown_icon from '../assets/student_assets/dropdown_icon.png';
import { FiHome, FiBook, FiBarChart2, FiTrendingUp, FiMail, FiUser, FiLogOut, FiLogIn , FiMessageSquare } from 'react-icons/fi';

const Navbar = () => {
  const [visible, setvisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  // Remove known session data keys
  Object.keys(localStorage).forEach((key) => {
    if (
      key.includes(`_${userId}`) || // answers_, reviewStatus_, startedAt_
      key === 'token' ||
      key === 'user' ||
      key === 'userEmail'
    ) {
      localStorage.removeItem(key);
    }
  });

  setIsLoggedIn(false);
  navigate('/login');
};


  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-between py-4 px-4 sm:px-6 shadow-sm bg-white z-50 border-b border-gray-100'>
      {/* <Link to='/' className='flex items-center shrink-0 mr-2'>
        <span className='text-xl font-semibold text-indigo-600'>SmartExam</span>
      </Link> */}

      {/* Desktop Navigation - Updated for all screen sizes */}
      <div className='flex items-center flex-1 justify-end sm:justify-between'>
        <ul className='hidden sm:flex items-center gap-2 md:gap-3 lg:gap-4 overflow-x-auto max-w-[calc(100%-120px)]'>
          <NavLink 
            to='/' 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 rounded-lg transition text-sm whitespace-nowrap ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            <FiHome className="text-lg" />
            <span>Home</span>
          </NavLink>
          <NavLink 
            to='/test' 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 rounded-lg transition text-sm whitespace-nowrap ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            <FiBook className="text-lg" />
            <span>Tests</span>
          </NavLink>
          <NavLink 
            to='/report' 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 rounded-lg transition text-sm whitespace-nowrap ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            <FiBarChart2 className="text-lg" />
            <span>Reports</span>
          </NavLink>
          <NavLink 
            to='/analysis' 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 rounded-lg transition text-sm whitespace-nowrap ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            <FiTrendingUp className="text-lg" />
            <span>Analysis</span>
          </NavLink>
          <NavLink 
            to='/contact' 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 rounded-lg transition text-sm whitespace-nowrap ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            <FiMail className="text-lg" />
            <span>Contact</span>
          </NavLink>
        </ul>

        {/* Profile Dropdown - Always visible */}
        <div className='flex items-center gap-2 ml-2'>
          <div className='group relative'>
            <div className='flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100'>
              <img className='w-7 h-7 sm:w-8 sm:h-8 rounded-full' src={profile} alt="profile" />
            </div>
            <div className='group-hover:block hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1'>
              {isLoggedIn ? (
                <>
                  <button className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left'>
                    <FiUser />
                    <span>
  <Link to="/profile" className="hover:text-indigo-600 font-medium">
    My Profile
  </Link>
</span>
                  </button>
                  <button className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left'>
  <FiMessageSquare />
  <span>
    <Link to="/feedback" className="hover:text-indigo-600 font-medium">
      Feedback
    </Link>
  </span>
</button>
                  <button 
                    onClick={handleLogout}
                    className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left'
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLoginRedirect}
                  className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left'
                >
                  <FiLogIn />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={() => setvisible(true)} 
            className='sm:hidden p-1 rounded-lg hover:bg-gray-100'
          >
            <img src={menu} className='w-6 h-6' alt="menu" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          <div className='flex items-center justify-between p-4 border-b'>
            <span className='text-lg font-semibold text-indigo-600'>Menu</span>
            <button 
              onClick={() => setvisible(false)} 
              className='p-2 rounded-full hover:bg-gray-100'
            >
              <img src={dropdown_icon} className='w-5 h-5 rotate-180' alt="close" />
            </button>
          </div>
          <div className='flex flex-col p-2'>
            <NavLink 
              onClick={() => setvisible(false)} 
              to='/' 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiHome />
              <span>Home</span>
            </NavLink>
            <NavLink 
              onClick={() => setvisible(false)} 
              to='/test' 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiBook />
              <span>Tests</span>
            </NavLink>
            <NavLink 
              onClick={() => setvisible(false)} 
              to='/report' 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiBarChart2 />
              <span>Reports</span>
            </NavLink>
            <NavLink 
              onClick={() => setvisible(false)} 
              to='/improve' 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiTrendingUp />
              <span>Improve</span>
            </NavLink>
            <NavLink 
              onClick={() => setvisible(false)} 
              to='/contact' 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiMail />
              <span>Contact</span>
            </NavLink>
          </div>
          <div className='mt-auto p-4 border-t'>
            {isLoggedIn ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setvisible(false);
                }}
                className='flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg'
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  handleLoginRedirect();
                  setvisible(false);
                }}
                className='flex items-center gap-2 w-full px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg'
              >
                <FiLogIn />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;