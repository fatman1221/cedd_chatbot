import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

export const PendingApprovalPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const message = location.state?.message || t('registrationSubmitted');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('pendingApproval')}
            </h2>
            
            <div className="text-gray-600 mb-6 space-y-3">
              <p>{message}</p>
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">{t('pendingApprovalDescription')}：</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• {t('pendingApprovalStep1', '管理员已收到您的注册申请邮件')}</li>
                      <li>• {t('pendingApprovalStep2', '管理员将审核您的申请信息')}</li>
                      <li>• {t('pendingApprovalStep3', '审批结果将通过邮件通知您')}</li>
                      <li>• {t('pendingApprovalStep4', '审批通过后即可正常登录系统')}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-left">
                <p className="text-sm text-yellow-800">
                  <strong>{t('tip', '温馨提示')}：</strong>
                  {t('pendingApprovalTip', '请耐心等待审批结果，通常会在24小时内处理完成。如有紧急情况，请联系系统管理员。')}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToLogin')}
            </button>
            
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                {t('checkSpamFolder', '如果长时间未收到审批结果，请检查邮箱垃圾邮件文件夹')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};