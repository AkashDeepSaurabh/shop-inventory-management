import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase'; // Import Firebase auth and Google provider
import { Mail, Lock, LogIn, UserPlus, LogIn as Google } from 'lucide-react';

const LoginPage = ({ setIsAuthenticated }) => {
  const [isSignup, setIsSignup] = useState(false); // Toggle between signup and login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
      navigate('/');
    }
  }, [setIsAuthenticated, navigate]);

  // Function to handle Google login
  const handleGoogleLogin = async () => {
    try {
      if (auth) {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        navigate('/');
      } else {
        throw new Error('Authentication instance is not available.');
      }
    } catch (error: any) {
      console.error('Error during Google login:', error.message);
      setError('Failed to log in with Google. Please try again.');
    }
  };

  // Function to handle email/password signup
  const handleSignup = async () => {
    try {
      if (auth) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (error: any) {
      setError('Signup failed. Please check your credentials and try again.');
    }
  };

  // Function to handle email/password login
  const handleLogin = async () => {
    try {
      if (auth) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (error: any) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative bg-gray-50 flex items-center justify-center overflow-hidden">
      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">
              {isSignup ? 'Create Account' : 'Welcome to Inventory'} Dashboard
            </h2>
            <p className="text-gray-600">
              {isSignup 
                ? 'Sign up to manage your construction inventory'
                : 'Login to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/80 backdrop-blur-sm"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/80 backdrop-blur-sm"
                required
              />
            </div>

            {!isSignup && (
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all shadow-md hover:shadow-lg"
              >
                <Google className="w-5 h-5" />
                Continue with Google
              </button>
            )}

            <button
              onClick={isSignup ? handleSignup : handleLogin}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-indigo-600 font-medium hover:text-indigo-700 focus:outline-none hover:underline transition-all"
              >
                {isSignup ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
