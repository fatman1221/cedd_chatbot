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
        height: '804px',
        backgroundImage: "url('https://lanhu-oss-proxy.lanhuapp.com/SketchPng218a48e28d5ecd4fbdd20e6173297680ab2aa3b0903807ab77a2015f303cc557')",
        backgroundPosition: '-12px -6px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '774px 828px',
        width: '750px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div 
        style={{ 
          // .group_1 from provided CSS
          width: '750px',
          height: '804px',
          backgroundImage: "url('https://lanhu-oss-proxy.lanhuapp.com/SketchPng9a6d50bddca539650da3ab03fcec0f6a058d5a5df5cab286bc00bfeb7a37b655')",
          backgroundPosition: '100% 0',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          paddingTop: '12px',
          boxSizing: 'border-box'
        }}
      >
          {/* .box_7 - Header with Logo and Title */}
          <div 
            className="flex justify-between"
            style={{ 
              width: '609px',
              height: '59px',
              margin: '50px 0 0 46px',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <img 
              src={logo} 
              alt="CEDD Logo" 
              style={{ width: '61px', height: '59px', objectFit: 'contain', marginTop: '6px' }}
            />
            <span 
              style={{ 
                width: '530px',
                height: '44px',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '36px',
                fontFamily: 'Montserrat-ExtraBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                lineHeight: '44px',
                marginTop: '9px'
              }}
            >
              Log in to the CEDD Chatbot
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center" style={{ margin: '24px 0 0 52px', width: '646px' }}>
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* .text_2 - Mail Label */}
            <span 
              style={{ 
                width: '52px',
                height: '12px',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '24px',
                fontFamily: 'Montserrat-SemiBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                lineHeight: '12px',
                margin: '51px 0 0 53px',
                display: 'block'
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
                height: '76px',
                width: '646px',
                margin: '24px 0 0 52px',
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
                  fontSize: '16px',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  lineHeight: '16px',
                  padding: '0 16px',
                  outline: 'none'
                }}
                placeholder="Please enter"
              />
            </div>

            {/* .text_4 - Password Label */}
            <span 
              style={{ 
                width: '121px',
                height: '12px',
                overflowWrap: 'break-word',
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '24px',
                fontFamily: 'Montserrat-SemiBold',
                fontWeight: 'normal',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                lineHeight: '12px',
                margin: '32px 0 0 53px',
                display: 'block'
              }}
            >
              Password
            </span>

            {/* .image-text_7 - Password Input Container */}
            <div 
              className="flex-col justify-between"
              style={{ 
                width: '646px',
                height: '112px',
                margin: '24px 0 0 52px'
              }}
            >
              {/* .group_2 - Password Input */}
              <div 
                style={{ 
                  backgroundColor: 'rgba(129, 133, 143, 0.16)',
                  borderRadius: '6px',
                  width: '646px',
                  height: '76px',
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
                    width: 'calc(100% - 60px)',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: 'rgba(0, 0, 0, 1)',
                    fontSize: '16px',
                    fontFamily: 'Montserrat-Regular',
                    fontWeight: 'normal',
                    textAlign: 'left',
                    lineHeight: '16px',
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
                    right: '18px',
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
                  width: '167px',
                  height: '19px',
                  overflowWrap: 'break-word',
                  color: 'rgba(16, 65, 243, 1)',
                  fontSize: '16px',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  lineHeight: '19px',
                  margin: '17px 0 0 5px',
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
                height: '76px',
                width: '650px',
                margin: '48px 0 0 48px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 1)',
                fontSize: '24px',
                fontFamily: 'Montserrat-Black',
                fontWeight: 'normal',
                lineHeight: '29px'
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* .box_8 - OR Divider */}
            <div 
              style={{ 
                width: '646px',
                height: '22px',
                margin: '32px 0 0 52px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
              <span 
                style={{ 
                  color: 'rgba(107, 105, 105, 1)',
                  fontSize: '16px',
                  fontFamily: 'PingFangSC-Regular',
                  lineHeight: '22px',
                  margin: '0 34px'
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
                width: '650px',
                height: '111px',
                margin: '21px 0 41px 48px'
              }}
            >
              {/* .text-wrapper_3 - SSO Button */}
              <button
                type="button"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderRadius: '8px',
                  height: '76px',
                  border: '1px solid rgba(234, 234, 236, 1)',
                  width: '650px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(115, 117, 120, 1)',
                  fontSize: '16px',
                  fontFamily: 'Montserrat-SemiBold',
                  fontWeight: 'normal',
                  lineHeight: '19px'
                }}
              >
                Log in with SSO
              </button>

              {/* .text_8 - Register Link */}
              <button
                type="button"
                onClick={onSwitchToRegister}
                style={{ 
                  width: '253px',
                  height: '19px',
                  overflowWrap: 'break-word',
                  color: 'rgba(16, 65, 243, 1)',
                  fontSize: '16px',
                  fontFamily: 'Montserrat-Regular',
                  fontWeight: 'normal',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  lineHeight: '19px',
                  margin: '16px 0 0 393px',
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