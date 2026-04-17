import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSchool,
  FaMapMarkerAlt,
  FaUserGraduate,
  FaCheckCircle,
  FaUserPlus
} from 'react-icons/fa';
import { clearError, register } from '../../store/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isLoading, error } = useSelector(state => state.auth);

  const destinationForRole = (role) => {
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'admin') return '/admin';
    return '/student-dashboard';
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    school: '',
    city: '',
    state: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});

  const hasPasswordStrength = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

  const validateStep1 = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!hasPasswordStrength(formData.password)) {
      errors.password = 'Use 6+ chars with uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch') || 'Passwords do not match';
    }

    return errors;
  };

  const handleChange = (e) => {
    if (error) {
      dispatch(clearError());
    }
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
    if (e.target.name === 'password' && fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStep(1);
      return;
    }

    setFieldErrors({});

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      role: 'student',
      profile: {
        grade: formData.grade ? String(formData.grade) : undefined,
        school: formData.school || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined
      }
    };

    const result = await dispatch(register(payload));
    if (result.type === 'auth/register/fulfilled') {
      const next = destinationForRole(result.payload?.user?.role);
      navigate(next);
    }
  };

  const nextStep = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    if (step < 2) setStep(step + 1);
  };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email &&
    formData.password && formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    hasPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 50%, #f1f8e9 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #a5d6a7, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #c8e6c9, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-md"
              style={{ background: 'linear-gradient(135deg, #2e7d32, #43a047)' }}
            >
              <FaUserPlus className="text-2xl text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {t('auth.register_title') || 'Create Student Account 🌱'}
            </h1>
            <p className="text-sm text-gray-500">
              {t('auth.register_subtitle') || 'Student self-signup for EcoKids India'}
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
              <p className="text-xs font-semibold text-amber-800">
                Teacher/Admin accounts are created by school or district admins.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                If your institution has already created your account, use Log In instead of Sign Up.
              </p>
              <Link
                to="/login?mode=staff"
                className="mt-3 inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                Teacher/Admin Access - Continue to Staff Log In
              </Link>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8 relative">
            <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0" />
            <div className="absolute top-1/2 left-1/4 h-1 bg-green-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out" style={{ width: step === 2 ? '50%' : '0%' }} />

            <div className="flex items-center justify-between w-1/2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 1 ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                1
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 2 ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">

              {/* Step 1: Account Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.firstName') || 'First Name'}</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm font-medium focus:outline-none transition-all placeholder-gray-400 ${fieldErrors.firstName ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`} placeholder="Jane" required />
                      </div>
                      {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.lastName') || 'Last Name'}</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm font-medium focus:outline-none transition-all placeholder-gray-400 ${fieldErrors.lastName ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`} placeholder="Doe" required />
                      </div>
                      {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.email') || 'Email Address'}</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-800 text-sm font-medium focus:outline-none transition-all placeholder-gray-400 ${fieldErrors.email ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`} placeholder={t('auth.emailPlaceholder') || 'you@example.com'} required />
                    </div>
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.password') || 'Password'}</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-gray-800 text-sm font-medium focus:outline-none transition-all placeholder-gray-400 ${fieldErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`} placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700" tabIndex="-1">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.confirmPassword') || 'Confirm Password'}</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-green-400 focus:ring-green-100'}`} placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700" tabIndex="-1">
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button type="button" onClick={nextStep} disabled={!isStep1Valid} className="w-full py-3.5 rounded-xl font-bold text-green-700 bg-green-50 border-2 border-green-100 hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2">
                    {t('auth.nextStep') || 'Continue'} <FaCheckCircle />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Demographics */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('profile.grade') || 'Grade/Class'}</label>
                    <div className="relative">
                      <FaUserGraduate className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <select name="grade" value={formData.grade} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all appearance-none bg-white cursor-pointer">
                        <option value="" disabled hidden>{t('profile.selectGrade') || 'Select Grade'}</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{t('grades.grade') || 'Grade'} {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('profile.school') || 'School Name'}</label>
                    <div className="relative">
                      <FaSchool className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" placeholder={t('profile.schoolPlaceholder') || 'e.g., Central High'} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('profile.city') || 'City / District'}</label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" placeholder="New Delhi" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('profile.state') || 'State'}</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" placeholder="Delhi" />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={prevStep} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                      {t('common.back') || 'Back'}
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading} className="flex-[2] py-3.5 rounded-xl font-black text-white text-base shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: isLoading ? '#81c784' : 'linear-gradient(135deg, #2e7d32, #43a047)' }}>
                      {isLoading ? (
                        <span className="flex justify-center items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('loading.default') || 'Registering...'}
                        </span>
                      ) : (
                        t('auth.registerBtn') || 'Sign Up'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 text-red-700" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <span>⚠️</span>
                <span>{typeof error === 'string' ? error : t('errors.registerFailed') || 'Registration failed.'}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {t('auth.hasAccount') || 'Already have an account?'}{' '}
              <Link to="/login" className="font-black text-green-600 hover:text-green-800 transition-colors underline underline-offset-2 decoration-green-300 hover:decoration-green-600">
                {t('auth.loginLink') || 'Log In'}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;