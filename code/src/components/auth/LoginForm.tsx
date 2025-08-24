import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService, LoginRequest } from '../../services/authService';
import logo from '../assets/logo.png';

interface LoginFormProps {
  onSuccess: (user: any, token: string) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      authService.saveToken(response.token);
      authService.saveUser(response.user);
      onSuccess(response.user, response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div 
      style={{ 
        // .block_1 from provided CSS
        minHeight: 'min(804px, 95vh)',
        background: 'linear-gradient(181deg, #D5E2FF 0%, rgba(255,255,255,0.35) 100%)',
        width: '100%',
        maxWidth: '750px',
        margin: '0 auto',
        position: 'relative',
        padding: '0 16px',
        boxSizing: 'border-box',
        borderRadius: '16px',
        border: '1px solid rgba(16,65,243,0.37)',
        boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          // .group_1 from provided CSS
          width: '100%',
          minHeight: 'min(804px, 95vh)',
          background: 'transparent',
          paddingTop: '12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
          {/* .box_7 - Header with Logo and Title */}
          <div 
            className="flex justify-between"
            style={{ 
              width: '100%',
              maxWidth: '609px',
              height: '59px',
              margin: '50px auto 0 auto',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <img 
              src={logo} 
              alt="CEDD Logo" 
              style={{ width: '48px', height: '48px', objectFit: 'contain', marginTop: '6px' }}
            />
            <span 
              style={{ 
                width: '100%',
                maxWidth: '530px',
                height: 'auto',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: 'clamp(20px, 5vw, 32px)',
                fontFamily: 'Montserrat-ExtraBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.3',
                marginTop: '9px'
              }}
            >
              Log in to the CEDD Chatbot
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center" style={{ margin: '24px auto 0 auto', width: '100%', maxWidth: '646px' }}>
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* .text_2 - Mail Label */}
            <span 
              style={{ 
                width: '100%',
                height: 'auto',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: 'clamp(14px, 3.2vw, 20px)',
                fontFamily: 'Montserrat-SemiBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.2',
                margin: '24px auto 0',
                display: 'block',
                maxWidth: '646px'
              }}
            >
              Mail
            </span>

            {/* .text-wrapper_1 - Mail Input */}
            <div 
              className="flex-col"
              style={{ 
                backgroundColor: 'rgba(129, 133, 143, 0.16)',
                borderRadius: '6px',
                height: '56px',
                width: '100%',
                maxWidth: '646px',
                margin: '12px auto 0',
                position: 'relative'
              }}
            >
              <input
                id="email"
                name="email"
                type="text"
                required
                value={formData.email}
                onChange={handleChange}
                style={{ 
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(0, 0, 0, 1)',
                  fontSize: 'clamp(14px, 3.2vw, 16px)',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  lineHeight: '1.2',
                  padding: '0 16px',
                  outline: 'none'
                }}
                placeholder="Please enter"
              />
            </div>

            {/* .text_4 - Password Label */}
            <span 
              style={{ 
                width: '100%',
                height: 'auto',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: 'clamp(14px, 3.2vw, 20px)',
                fontFamily: 'Montserrat-SemiBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.2',
                margin: '16px auto 0',
                display: 'block',
                maxWidth: '646px'
              }}
            >
              Password
            </span>

            {/* .image-text_7 - Password Input Container */}
            <div 
              className="flex-col justify-between"
              style={{ 
                width: '100%',
                maxWidth: '646px',
                height: 'auto',
                margin: '12px auto 0'
              }}
            >
              {/* .group_2 - Password Input */}
              <div 
                style={{ 
                  backgroundColor: 'rgba(129, 133, 143, 0.16)',
                  borderRadius: '6px',
                  width: '100%',
                  height: '56px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{ 
                    width: 'calc(100% - 48px)',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(0, 0, 0, 1)',
                    fontSize: 'clamp(14px, 3.2vw, 16px)',
                    fontFamily: 'Montserrat-Regular',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    lineHeight: '1.2',
                    paddingLeft: '16px',
                    outline: 'none'
                  }}
                  placeholder="Please enter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    width: '24px',
                    height: '24px',
                    position: 'absolute',
                    right: '12px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-500" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              </div>

              {/* .text-group_1 - Forgot Password Link */}
              <button
                type="button"
                onClick={onForgotPassword}
                style={{ 
                  width: 'auto',
                  height: 'auto',
                  overflowWrap: 'break-word',
                  color: 'rgba(16, 65, 243, 1)',
                  fontSize: 'clamp(13px, 3vw, 16px)',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  lineHeight: '1.2',
                  margin: '8px 0 0 5px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Forget the password
              </button>
            </div>

            {/* .text-wrapper_2 - Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ 
                backgroundColor: 'rgba(124, 163, 255, 1)',
                borderRadius: '8px',
                height: '56px',
                width: '100%',
                maxWidth: '650px',
                margin: '24px auto 0',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 1)',
                fontSize: 'clamp(16px, 3.6vw, 20px)',
                fontFamily: 'Montserrat-Black',
                fontWeight: 'normal',
                lineHeight: '1.2'
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* .box_8 - OR Divider */}
            <div 
              style={{ 
                width: '100%',
                maxWidth: '646px',
                height: '22px',
                margin: '20px auto 0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
              <span 
                style={{ 
                  color: 'rgba(107, 105, 105, 1)',
                  fontSize: 'clamp(13px, 3vw, 16px)',
                  fontFamily: 'PingFangSC-Regular',
                  lineHeight: '1.2',
                  margin: '0 16px'
                }}
              >
                OR
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            </div>

            {/* .image-text_8 - SSO Button and Register Link */}
            <div 
              className="flex-col justify-between"
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '650px',
                height: 'auto',
                margin: '20px auto 20px'
              }}
            >
              {/* .text-wrapper_3 - SSO Button */}
              <button
                type="button"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderRadius: '8px',
                  height: '56px',
                  border: '1px solid rgba(234, 234, 236, 1)',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(115, 117, 120, 1)',
                  fontSize: 'clamp(13px, 3vw, 16px)',
                  fontFamily: 'Montserrat-SemiBold',
                  fontWeight: 'normal',
                  lineHeight: '1.2'
                }}
              >
                Log in with SSO
              </button>

              {/* .text_8 - Register Link */}
              <button
                type="button"
                onClick={onSwitchToRegister}
                style={{ 
                  width: 'auto',
                  height: 'auto',
                  overflowWrap: 'break-word',
                  color: 'rgba(16, 65, 243, 1)',
                  fontSize: 'clamp(13px, 3vw, 16px)',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'right',
                  whiteSpace: 'normal',
                  lineHeight: '1.2',
                  margin: '16px 0 0 0',
                  alignSelf: 'flex-end',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                No account, please register one
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};