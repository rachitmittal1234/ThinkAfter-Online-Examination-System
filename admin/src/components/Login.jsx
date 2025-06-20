import axios from 'axios';
import React, { useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FiLock, FiMail, FiLogIn } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; 


const Login = ({ settoken }) => {
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const navigate = useNavigate(); // ✅ INIT NAVIGATE


    const onSubmitHandler = async (e) => {
    try {
        e.preventDefault();
        const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
        if (response.data.success) {
            settoken(response.data.token);
            toast.success("Admin login successful"); // ✅ SHOW TOAST
            navigate('/addtest'); // ✅ REDIRECT
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
};


    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4'>
            <div className='bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md'>
                {/* Header */}
                <div className='bg-indigo-600 text-white p-6 text-center'>
                    <h1 className='text-2xl font-bold flex items-center justify-center gap-2'>
                        <FiLogIn className="text-2xl" />
                        Admin Panel Login
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={onSubmitHandler} className='p-6'>
                    <div className='mb-6'>
                        <label className='block text-gray-700 mb-2 font-medium'>Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="text-gray-400" />
                            </div>
                            <input
                                onChange={(e) => setemail(e.target.value)}
                                value={email}
                                className='rounded-lg w-full pl-10 pr-3 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                type="email"
                                placeholder='your@email.com'
                                required
                            />
                        </div>
                    </div>

                    <div className='mb-6'>
                        <label className='block text-gray-700 mb-2 font-medium'>Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="text-gray-400" />
                            </div>
                            <input
                                onChange={(e) => setpassword(e.target.value)}
                                value={password}
                                className='rounded-lg w-full pl-10 pr-3 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                type="password"
                                placeholder='Enter your password'
                                required
                            />
                        </div>
                    </div>

                    <button
                        className='w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition flex items-center justify-center'
                        type='submit'
                    >
                        <FiLogIn className="mr-2" />
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;