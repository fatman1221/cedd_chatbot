import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      style={{ position: 'relative', width: '100vw', minHeight: '100vh', overflow: 'hidden', backgroundColor: 'rgba(245, 247, 255, 1)' }}
    >
      <div style={{ paddingTop: 'clamp(24px, 12.8vh, 138px)', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', paddingLeft: '16px', paddingRight: '16px' }}>
        <div 
          style={{
            width: '100%',
            maxWidth: '750px',
            minHeight: 'auto',
            background: 'linear-gradient(181deg, #D5E2FF 0%, rgba(255,255,255,0.35) 100%)',
            boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(16,65,243,0.37)',
            backdropFilter: 'blur(10px)',
            margin: '24px auto',
            padding: '0 16px',
            boxSizing: 'border-box'
          }}
        >
          {/* 头部 */}
          <div style={{ width: '100%', maxWidth: '609px', height: 'auto', margin: '48px auto 0 auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={logo} alt="CEDD Logo" style={{ width: '48px', height: '48px' }} />
            <span style={{ width: '100%', maxWidth: '530px', height: 'auto', color: 'rgba(0,0,0,1)', fontSize: 'clamp(20px, 5vw, 32px)', fontFamily: 'Montserrat-ExtraBold', textAlign: 'left', whiteSpace: 'normal', lineHeight: '1.3', display: 'flex', alignItems: 'center' }}>
              Log in to the CEDD Chatbot
            </span>
          </div>

          {/* 图 + 提示语 */}
          <div style={{ width: '100%', maxWidth: '598px', height: 'auto', margin: '32px auto 0 auto', textAlign: 'center' }}>
            <img 
              src={'https://lanhu-oss-proxy.lanhuapp.com/SketchPngca364da401a4479112f87ef8b9b3a6939d29b22cf73f6b640e51a341e1e9e697'}
              alt="waiting"
              style={{ width: '165px', height: '164px', margin: '0 auto' }}
            />
            <span style={{ width: '100%', maxWidth: '598px', height: 'auto', color: 'rgba(132,137,147,1)', fontSize: 'clamp(14px, 3.2vw, 20px)', fontFamily: 'Montserrat-Regular', lineHeight: '1.3', display: 'block', marginTop: '14px', textAlign: 'center' }}>
              Your account is waiting for administrator approval
            </span>
          </div>

          {/* 白色信息卡片 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '16px', width: '100%', maxWidth: '658px', height: 'auto', border: '1px solid rgba(255,255,255,1)', margin: '24px auto 0 auto' }}>
            <div style={{ width: '100%', maxWidth: '583px', height: 'auto', margin: '9px auto' }}>
              <span style={{ width: '100%', height: 'auto', color: 'rgba(0,0,0,1)', fontSize: 'clamp(14px, 3.2vw, 20px)', fontFamily: 'Montserrat-SemiBold', textAlign: 'left', lineHeight: '1.6', display: 'block' }}>
                The administrator has received your registration application email
              </span>
              <span style={{ width: '100%', maxWidth: '467px', height: 'auto', color: 'rgba(132,137,147,1)', fontSize: 'clamp(13px, 3vw, 16px)', fontFamily: 'Montserrat-Regular', textAlign: 'left', lineHeight: '1.8', marginTop: '5px', display: 'block' }}>
                ·The administrator will review your application information<br />·The approval result will be notified to you via email<br />·After approval, you can log in to the system normally
              </span>
            </div>
          </div>

          {/* 提示块 */}
          <div style={{ width: '100%', maxWidth: '655px', height: 'auto', margin: '16px auto 0 auto', lineHeight: '1.6' }}>
            <span style={{ color: 'rgba(0,0,0,1)', fontSize: 'clamp(13px, 3vw, 16px)', fontFamily: 'Montserrat-SemiBold' }}>Kind reminder</span>
            <span style={{ color: 'rgba(132,137,147,1)', fontSize: 'clamp(13px, 3vw, 16px)', fontFamily: 'Montserrat-Regular' }}>
              : Please be patient and wait for the approval result, which is usually processed within 24 hours. If there is an emergency situation, please contact the system administrator.
            </span>
          </div>

          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: 'rgba(16,65,243,1)', borderRadius: '8px', height: '56px', width: '100%', maxWidth: '650px', margin: '32px auto 0 auto', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 'clamp(16px, 3.6vw, 20px)', fontFamily: 'Montserrat-Black', display: 'block' }}
          >
            Return
          </button>

          {/* 底部说明 */}
          <span style={{ width: '100%', maxWidth: '641px', height: 'auto', color: 'rgba(107,105,105,1)', fontSize: 'clamp(13px, 3vw, 16px)', fontFamily: 'Montserrat-Regular', textAlign: 'left', lineHeight: '1.3', margin: '16px auto 24px auto', display: 'block' }}>
            If you have not received the approval result for a long time, please check your email spam folder
          </span>
        </div>
      </div>
    </div>
  );
};