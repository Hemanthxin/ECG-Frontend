import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Heart, Activity, Shield } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginSignup() {
  const navigate  = useNavigate();
  const { setUser } = useUser();

  const [isLogin, setIsLogin]               = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword]     = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // --- STANDARD LOGIN / SIGNUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // --- Password Validation for Signup ---
    if (!isLogin) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setErrorMessage('Password must be at least 8 characters, with 1 uppercase letter, 1 number, and 1 special character.');
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload  = isLogin
      ? { email, password }
      : { full_name: fullName, email, password };

    try {
      const response = await fetch(`https://ecg-backend-production-af9b.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Something went wrong');

      if (isLogin) {
        localStorage.setItem('token', data.token);
        const existingUser  = JSON.parse(localStorage.getItem('user') || '{}');
        const fetchedName   = data.user?.name || data.user?.full_name || '';
        const nameParts     = fetchedName.trim().split(' ');
        const updatedUser   = {
          ...existingUser, ...data.user,
          firstName: nameParts[0]              || existingUser.firstName,
          lastName:  nameParts.slice(1).join(' ') || existingUser.lastName,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        navigate(data.user.is_profile_complete ? '/dashboard' : '/onboarding');
      } else {
        setIsLogin(true);
        setSuccessMessage('Account created successfully! Please log in.');
        setPassword('');
      }
    } catch (error) {
      setErrorMessage(
        error.name === 'TypeError'
          ? 'Cannot connect to server. Ensure backend is running.'
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE LOGIN HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`https://ecg-backend-production-af9b.up.railway.app/api/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Google authentication failed');

      localStorage.setItem('token', data.token);
      const existingUser  = JSON.parse(localStorage.getItem('user') || '{}');
      const fetchedName   = data.user?.name || data.user?.full_name || '';
      const nameParts     = fetchedName.trim().split(' ');
      const updatedUser   = {
        ...existingUser, ...data.user,
        firstName: nameParts[0]              || existingUser.firstName,
        lastName:  nameParts.slice(1).join(' ') || existingUser.lastName,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate(data.user.is_profile_complete ? '/dashboard' : '/onboarding');
      
    } catch (error) {
      setErrorMessage(
        error.name === 'TypeError'
          ? 'Cannot connect to server. Ensure backend is running.'
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('If an account exists with that email, a reset link has been sent.');
    }, 1500);
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setIsForgotPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
  };

  const features = [
    { icon: Activity, text: 'AI-powered 12-lead ECG digitization' },
    { icon: Shield,   text: 'Clinical-grade accuracy' },
    { icon: Heart,    text: 'nnUNet deep learning pipeline' },
  ];

  return (
    // Replace YOUR_GOOGLE_CLIENT_ID with your actual Google Client ID
    <GoogleOAuthProvider clientId="GOOGLE_CLIENT_ID">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">

        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 flex flex-col md:flex-row w-full max-w-5xl overflow-hidden md:min-h-[600px]">

          {/* ── LEFT — Blue brand panel ── */}
          <div className="flex w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-700 flex-col justify-center md:justify-between p-8 md:p-10 relative overflow-hidden shrink-0">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/30"/>
            <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-800/30"/>
            <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-blue-400/20"/>

            <div className="relative z-10 mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-6 md:mb-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Heart size={20} className="text-white"/>
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-tight">ECG Digitizer</div>
                  <div className="text-blue-200 text-xs">Powered by IIHMR.AI</div>
                </div>
              </div>

              <h2 className="text-white font-bold text-xl md:text-2xl leading-snug mb-2 md:mb-3">
                Clinical-grade ECG<br/>digitization with AI
              </h2>
              <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
                Transform paper ECG records into structured digital signals ready for analysis in seconds.
              </p>
            </div>

            <div className="relative z-10 space-y-3 md:space-y-4 mt-6 md:mt-0">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-white"/>
                  </div>
                  <span className="text-blue-100 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Form panel ── */}
          <div className="w-full md:w-7/12 flex flex-col justify-center p-8 md:p-12">

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {isForgotPassword ? 'Reset your password' : isLogin ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isForgotPassword
                  ? "Enter your email and we'll send a reset link"
                  : isLogin
                    ? 'Sign in to access your ECG dashboard'
                    : 'Start digitizing ECGs with AI accuracy'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠</span> {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
                <span className="mt-0.5">✅</span> {successMessage}
              </div>
            )}

            {!isForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input
                        type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="John Smith" required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                    {isLogin && (
                      <button type="button" onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {!isLogin && (
                     <p className="text-[10px] text-gray-400 mt-1.5">
                       Min. 8 characters, 1 uppercase, 1 number, 1 special character.
                     </p>
                  )}
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 mt-2">
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing…</>
                    : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={15}/></>
                  }
                </button>

                {/* --- GOOGLE LOGIN INTEGRATION --- */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 text-xs">Or continue with</span>
                  </div>
                </div>
                
                <div className="flex justify-center w-full">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMessage('Google Sign-In was unsuccessful. Please try again.')}
                    useOneTap
                    theme="outline"
                    width="100%"
                  />
                </div>

              </form>

            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="email" placeholder="your@email.com" required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"/>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  {isLoading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending…</>
                    : <>Send Reset Link <ArrowRight size={15}/></>
                  }
                </button>
                <button type="button" onClick={() => { setIsForgotPassword(false); setSuccessMessage(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2">
                  ← Back to login
                </button>
              </form>
            )}

            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"/>
                  </div>
                  <span className="relative bg-white px-4 text-xs text-gray-400">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                </div>
                <button
                  onClick={() => switchMode(!isLogin)}
                  className="w-full py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all">
                  {isLogin ? 'Create a free account' : 'Sign in instead'}
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing, you agree to our{' '}
              <button type="button" onClick={() => alert('Terms of Service will be available soon.')} className="text-blue-600 cursor-pointer hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" onClick={() => alert('Privacy Policy will be available soon.')} className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}