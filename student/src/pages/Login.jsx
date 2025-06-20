import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { FiUser, FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const url = currentState === 'Sign Up'
      ? `${backendUrl}/api/user/register`
      : `${backendUrl}/api/user/login`;

    const data = currentState === 'Sign Up'
      ? { name, email, password }
      : { email, password };

    try {
      const res = await axios.post(url, data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('userEmail', res.data.email || email);
        const user = {
          _id: res.data.userId,
          email: res.data.email || email,
          name: res.data.name || name
        };
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        alert(res.data.message || 'Something went wrong');
      }
    } catch (err) {
      alert('Server Error');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex items-center justify-center gap-3">
            {currentState === 'Login' ? (
              <FiLogIn className="text-2xl" />
            ) : (
              <FiUserPlus className="text-2xl" />
            )}
            <h2 className="text-2xl font-semibold">{currentState}</h2>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} className="p-6">
          {currentState === 'Sign Up' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
          >
            {currentState === 'Login' ? (
              <>
                <FiLogIn className="mr-2" />
                Sign In
              </>
            ) : (
              <>
                <FiUserPlus className="mr-2" />
                Sign Up
              </>
            )}
          </button>

          <div className="mt-4 text-center text-sm">
            {currentState === 'Login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentState('Sign Up')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentState('Login')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Login here
                </button>
              </p>
            )}
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;