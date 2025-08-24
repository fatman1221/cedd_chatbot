import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService, RegisterRequest } from '../../services/authService';
import logo from '../assets/logo.png';

interface RegisterFormProps {
  onSuccess: (message: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    confirm_password: '',
    role: 'regular',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 验证密码
    if (formData.password !== formData.confirm_password) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      // 注册成功后跳转到等待审批页面
      navigate('/pending-approval', { 
        state: { 
          message: response.message || t('registrationSubmitted') 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '750px',
        height: '879px',
        margin: '0 auto'
      }}
    >
      <div 
        style={{ 
          width: '750px',
          height: '879px',
          background: 'linear-gradient(181deg, #D5E2FF 0%, rgba(255,255,255,0.35) 100%)',
          boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.06)',
          borderRadius: '16px',
          border: '1px solid rgba(16,65,243,0.37)',
          backdropFilter: 'blur(10px)',
          paddingTop: '12px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header with CEDD Logo */}
        <div className="flex items-center" style={{ width: '609px', height: '59px', margin: '48px 0 0 46px', gap: '12px' }}>
          <img src={logo} alt="CEDD Logo" style={{ width: '61px', height: '59px' }} />
          <span 
            style={{ 
              width: '530px',
              height: '44px',
              color: 'rgba(0, 0, 0, 1)',
              fontSize: '36px',
              fontFamily: 'Montserrat-ExtraBold',
              fontWeight: 'normal',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              lineHeight: '44px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Log in to the CEDD Chatbot
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Mail */}
          <span style={{ width: '52px', height: '12px', color: '#000', fontSize: '24px', fontFamily: 'Montserrat-SemiBold', lineHeight: '12px', margin: '35px 0 0 53px', display: 'block' }}>Mail</span>
          <div style={{ backgroundColor: 'rgba(129,133,143,0.16)', borderRadius: '6px', height: '76px', width: '646px', margin: '24px 0 0 52px' }}>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '30px 0 0 16px', outline: 'none', fontSize: '16px', color: '#000', fontFamily: 'Montserrat-Regular' }} placeholder="Please enter" />
          </div>

          {/* Company Position - merged agree text into one line group only once */}
          <span style={{ width: '228px', height: '12px', color: '#000', fontSize: '24px', fontFamily: 'Montserrat-SemiBold', lineHeight: '12px', margin: '24px 0 0 53px', display: 'block' }}>Company Position</span>
          <div style={{ width: '646px', height: '112px', margin: '24px 0 0 52px' }}>
            <div style={{ backgroundColor: 'rgba(129,133,143,0.16)', borderRadius: '6px', width: '646px', height: '76px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select id="role" name="role" value={formData.role} onChange={handleChange}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', paddingLeft: '16px', paddingRight: '60px', outline: 'none', fontSize: '24px', color: '#000', fontFamily: 'Montserrat-Regular', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}>
                <option value="regular">Regular user</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
              <div style={{ position: 'absolute', right: '18px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div style={{ width: '590px', margin: '17px 0 0 5px', fontSize: 0 }}>
              <span style={{ color: 'rgba(107,105,105,1)', fontSize: '16px', lineHeight: '19px', fontFamily: 'Montserrat-Regular' }}>By signing up, you agree to AI agent's </span>
              <span style={{ color: 'rgba(16,65,243,1)', fontSize: '16px', lineHeight: '19px', fontFamily: 'Montserrat-Regular' }}>Terms of Service</span>
              <span style={{ color: 'rgba(107,105,105,1)', fontSize: '16px', lineHeight: '19px', fontFamily: 'Montserrat-Regular' }}> and </span>
              <span style={{ color: 'rgba(16,65,243,1)', fontSize: '16px', lineHeight: '19px', fontFamily: 'Montserrat-Regular' }}>Privacy Policy</span>
              <span style={{ color: 'rgba(107,105,105,1)', fontSize: '16px', lineHeight: '19px', fontFamily: 'Montserrat-Regular' }}>.</span>
            </div>
          </div>

          {/* removed duplicate By signing up... block */}

          {/* Password */}
          <span style={{ width: '121px', height: '12px', color: '#000', fontSize: '24px', fontFamily: 'Montserrat-SemiBold', lineHeight: '12px', margin: '32px 0 0 53px', display: 'block' }}>Password</span>
          <div style={{ backgroundColor: 'rgba(129,133,143,0.16)', borderRadius: '6px', width: '646px', height: '76px', margin: '24px 0 0 52px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 16px', outline: 'none', fontSize: '16px', color: '#000', fontFamily: 'Montserrat-Regular', lineHeight: 'normal' }} placeholder="Please enter" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '18px', width: '24px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              {showPassword ? (<EyeOff className="h-5 w-5 text-gray-400" />) : (<Eye className="h-5 w-5 text-gray-400" />)}
            </button>
          </div>

          {/* Confirm password */}
          <span style={{ width: '308px', height: '12px', color: '#000', fontSize: '24px', fontFamily: 'Montserrat-SemiBold', lineHeight: '12px', margin: '24px 0 0 53px', display: 'block' }}>Confirm the secret again</span>
          <div style={{ backgroundColor: 'rgba(129,133,143,0.16)', borderRadius: '6px', width: '646px', height: '76px', margin: '24px 0 0 52px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input id="confirm_password" name="confirm_password" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirm_password} onChange={handleChange}
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 16px', outline: 'none', fontSize: '16px', color: '#000', fontFamily: 'Montserrat-Regular', lineHeight: 'normal' }} placeholder="Please enter" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '18px', width: '24px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              {showConfirmPassword ? (<EyeOff className="h-5 w-5 text-gray-400" />) : (<Eye className="h-5 w-5 text-gray-400" />)}
            </button>
          </div>

          {/* Footer buttons */}
          <div style={{ width: '650px', height: '121px', margin: '24px 0 28px 50px' }}>
            <button type="submit" disabled={loading} style={{ backgroundColor: 'rgba(124,163,255,1)', borderRadius: '8px', height: '76px', width: '650px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontFamily: 'Montserrat-Black' }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            <button type="button" onClick={onSwitchToLogin} style={{ width: '335px', height: '29px', color: '#1041F3', fontSize: '24px', fontFamily: 'Inter, Inter', fontWeight: 400, lineHeight: '29px', margin: '16px 0 0 315px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              Have an account? Log in now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};