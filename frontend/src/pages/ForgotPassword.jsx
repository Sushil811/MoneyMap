import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../assets/api';
import { Mail, ChevronLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      const res = await apiService.forgotPassword(email);
      if (res.success) {
        setSubmitted(true);
        toast.success(res.message || 'Reset link sent to your email!');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Forgot Password?</h1>
            <p className="text-teal-100 text-sm opacity-90 mt-2">No worries, we'll send you reset instructions.</p>
          </div>

          <div className="p-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Instructions to reset your password have been sent to <strong>{email}</strong>.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Didn't receive it? Try again
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
