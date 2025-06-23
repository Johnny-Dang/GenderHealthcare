import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../configs/axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resetCart } from '@/redux/features/userSlice';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VnPayReturn() {
  const userInfo = useSelector(state => state.user.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    if (!userInfo || userInfo.role !== 'Customer') {
      navigate('/');
      return;
    }

    const processPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/vnpay-callback${window.location.search}`);
        setResult(response.data);
        if (response.data?.vnPayResponseCode === '00') {
          dispatch(resetCart());
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-6 text-primary-500" />
          <p className="text-lg text-gray-700 font-medium">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <Card className="w-full max-w-lg mx-auto p-8 shadow-xl rounded-2xl border-0">
        <div className="flex flex-col items-center">
          {error ? (
            <>
              <XCircle className="h-20 w-20 text-red-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
              <p className="text-gray-600 mb-6">{error}</p>
            </>
          ) : (
            <>
              {result?.success ? (
                <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
              ) : (
                <XCircle className="h-20 w-20 text-red-500 mb-4" />
              )}
              <h2 className={`text-3xl font-bold mb-2 ${result?.success ? 'text-green-700' : 'text-red-700'}`}>
                {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </h2>
              <p className="text-gray-600 mb-6">
                {result?.success
                  ? 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn hàng của bạn đã được ghi nhận.'
                  : 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
              </p>
              <div className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Mã giao dịch</p>
                    <p className="font-semibold text-gray-800 break-all">{result?.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số tiền</p>
                    <p className="font-semibold text-gray-800">{parseInt(result?.amount || 0).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phương thức</p>
                    <p className="font-semibold text-gray-800">{result?.paymentMethod || 'VNPAY'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mã phản hồi</p>
                    <p className="font-semibold text-gray-800">{result?.vnPayResponseCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          <Button className="w-full mt-2" onClick={() => navigate('/test-service')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </Card>
    </div>
  );
} 
