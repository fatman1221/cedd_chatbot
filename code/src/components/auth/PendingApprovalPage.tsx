import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      style={{ position: 'relative', width: '100vw', minHeight: '100vh', overflow: 'hidden', backgroundColor: 'rgba(245, 247, 255, 1)' }}
    >
      <div style={{ paddingTop: 'clamp(24px, 12.8vh, 138px)', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
        <div 
          style={{
            width: '750px',
            height: '958px',
            background: 'linear-gradient(181deg, #D5E2FF 0%, rgba(255,255,255,0.35) 100%)',
            boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(16,65,243,0.37)',
            backdropFilter: 'blur(10px)',
            margin: '61px auto 0 auto'
          }}
        >
          {/* 头部 */}
          <div style={{ width: '609px', height: '59px', margin: '48px 0 0 46px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={logo} alt="CEDD Logo" style={{ width: '61px', height: '59px' }} />
            <span style={{ width: '530px', height: '44px', color: 'rgba(0,0,0,1)', fontSize: '36px', fontFamily: 'Montserrat-ExtraBold', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '44px', display: 'flex', alignItems: 'center' }}>
              Log in to the CEDD Chatbot
            </span>
          </div>

          {/* 图 + 提示语 */}
          <div style={{ width: '598px', height: '207px', margin: '66px 0 0 76px' }}>
            <img 
              src={'https://lanhu-oss-proxy.lanhuapp.com/SketchPngca364da401a4479112f87ef8b9b3a6939d29b22cf73f6b640e51a341e1e9e697'}
              alt="waiting"
              style={{ width: '165px', height: '164px', marginLeft: '217px' }}
            />
            <span style={{ width: '598px', height: '29px', color: 'rgba(132,137,147,1)', fontSize: '24px', fontFamily: 'Montserrat-Regular', lineHeight: '29px', display: 'block', marginTop: '14px' }}>
              Your account is waiting for administrator approval
            </span>
          </div>

          {/* 白色信息卡片 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '16px', width: '658px', height: '212px', border: '1px solid rgba(255,255,255,1)', margin: '31px 0 0 46px' }}>
            <div style={{ width: '583px', height: '187px', margin: '9px 0 0 24px' }}>
              <span style={{ width: '583px', height: '74px', color: 'rgba(0,0,0,1)', fontSize: '24px', fontFamily: 'Montserrat-SemiBold', textAlign: 'left', lineHeight: '37px', display: 'block' }}>
                The administrator has received your registration application email
              </span>
              <span style={{ width: '467px', height: '108px', color: 'rgba(132,137,147,1)', fontSize: '16px', fontFamily: 'Montserrat-Regular', textAlign: 'left', lineHeight: '36px', marginTop: '5px', display: 'block' }}>
                ·The administrator will review your application information<br />·The approval result will be notified to you via email<br />·After approval, you can log in to the system normally
              </span>
            </div>
          </div>

          {/* 提示块 */}
          <div style={{ width: '655px', height: '75px', margin: '24px 0 0 49px', lineHeight: '25px' }}>
            <span style={{ color: 'rgba(0,0,0,1)', fontSize: '16px', fontFamily: 'Montserrat-SemiBold' }}>Kind reminder</span>
            <span style={{ color: 'rgba(132,137,147,1)', fontSize: '16px', fontFamily: 'Montserrat-Regular' }}>
              : Please be patient and wait for the approval result, which is usually processed within 24 hours. If there is an emergency situation, please contact the system administrator.
            </span>
          </div>

          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: 'rgba(16,65,243,1)', borderRadius: '8px', height: '76px', width: '650px', margin: '64px 0 0 50px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '24px', fontFamily: 'Montserrat-Black' }}
          >
            Return
          </button>

          {/* 底部说明 */}
          <span style={{ width: '641px', height: '38px', color: 'rgba(107,105,105,1)', fontSize: '16px', fontFamily: 'Montserrat-Regular', textAlign: 'left', lineHeight: '19px', margin: '25px 0 33px 57px', display: 'block' }}>
            If you have not received the approval result for a long time, please check your email spam folder
          </span>
        </div>
      </div>
    </div>
  );
};