import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useTranslation } from 'react-i18next';


export const ApprovalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleApproval = async () => {
      const token = searchParams.get('token');
      const action = searchParams.get('action') as 'approve' | 'reject';

      if (!token || !action) {
        setResult({ type: 'error', message: 'Invalid approval link' });
        setLoading(false);
        return;
      }

      try {
        const response = await authService.approveUser(token, action);
        setResult({
          type: 'success',
          message: response.message
        });
      } catch (error) {
        setResult({
          type: 'error',
          message: error instanceof Error ? error.message : 'Approval operation failed'
        });
      } finally {
        setLoading(false);
      }
    };

    handleApproval();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">t('pendingApprovalTip')</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {result?.type === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">t('approveSuccess')</h2>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">t('approveFail')</h2>
            </>
          )}

          <p className="text-gray-600 mb-6">{result?.message}</p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};