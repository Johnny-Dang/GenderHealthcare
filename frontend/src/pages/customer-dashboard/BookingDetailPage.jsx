import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';
import clsx from 'clsx';
import api from '@/configs/axios';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultModal, setResultModal] = useState({ open: false, loading: false, data: null, error: null });
  const user = useSelector(state => state.user);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, detail: null, content: '', rating: 5, loading: false });

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/booking-details/booking/${bookingId}`);
        setDetails(res.data);
      } catch (err) {
        setError('Lỗi khi tải chi tiết dịch vụ.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [bookingId]);

  const handleShowResult = async (bookingDetailId) => {
    setResultModal({ open: true, loading: true, data: null, error: null });
    try {
      const res = await api.get(`/api/TestResult/booking-detail/${bookingDetailId}`);
      setResultModal({ open: true, loading: false, data: res.data?.[0] || null, error: null });
    } catch (err) {
      setResultModal({ open: true, loading: false, data: null, error: 'Không thể tải kết quả.' });
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackModal.detail || !user?.accountId) return;
    setFeedbackModal(s => ({ ...s, loading: true }));
    try {
      await api.post('/api/Feedback', {
        serviceId: feedbackModal.detail.serviceId,
        accountId: user.accountId,
        detail: feedbackModal.content,
        rating: feedbackModal.rating
      });
      toast.success('Gửi feedback thành công!');
      setFeedbackModal({ open: false, detail: null, content: '', rating: 5, loading: false });
    } catch (err) {
      toast.error('Gửi feedback thất bại!');
      setFeedbackModal(s => ({ ...s, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <Navigation />
      <div className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>

          <Card className="border-0 shadow-xl overflow-hidden animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-purple-50 border-b border-primary-100">
              <CardTitle className="text-2xl text-primary-700 mb-1">Chi tiết dịch vụ trong đơn đặt lịch</CardTitle>
              <CardDescription>Mã đơn: <span className="font-semibold text-primary-600">{bookingId}</span></CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Đang tải dữ liệu...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : details.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Không có dịch vụ nào trong đơn này.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {details.map((detail, idx) => (
                    <Card
                      key={detail.bookingDetailId}
                      className={clsx(
                        'shadow-md border-0 hover:shadow-xl transition-all duration-300 animate-fade-in',
                        idx % 2 === 0 ? 'bg-white' : 'bg-primary-50'
                      )}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Tag className="h-5 w-5 text-primary-500" />
                          <span className="text-lg font-bold text-primary-700">{detail.serviceName}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-primary-400" />
                          <span className="font-medium">Khách:</span>
                          <span>{detail.lastName} {detail.firstName}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-primary-400" />
                          <span className="font-medium">Ngày sinh:</span>
                          <span>{detail.dateOfBirth}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Giới tính:</span>
                          <span>{detail.gender === true ? 'Nam' : 'Nữ'}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Giá dịch vụ:</span>
                          <span className="text-primary-600 font-bold">{detail.price?.toLocaleString()} VND</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Mã dịch vụ:</span>
                          <span>{detail.serviceId}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Mã chi tiết:</span>
                          <span>{detail.bookingDetailId}</span>
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Số điện thoại:</span>
                          <span>{detail.phone}</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="secondary" className="w-full" onClick={() => handleShowResult(detail.bookingDetailId)}>
                            Xem Kết Quả
                          </Button>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => setFeedbackModal({ open: true, detail, content: '', rating: 5, loading: false })}>
                            Feedback dịch vụ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <Dialog open={resultModal.open} onOpenChange={open => setResultModal(s => ({ ...s, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kết quả xét nghiệm</DialogTitle>
          </DialogHeader>
          {resultModal.loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader className="animate-spin mb-2 text-primary-500" />
              <span>Đang tải kết quả...</span>
            </div>
          ) : resultModal.error ? (
            <div className="text-red-500 text-center py-8">{resultModal.error}</div>
          ) : resultModal.data ? (
            <div className="space-y-3">
              <div><span className="font-semibold">Khách hàng:</span> {resultModal.data.customerName}</div>
              <div><span className="font-semibold">Dịch vụ:</span> {resultModal.data.serviceName}</div>
              <div><span className="font-semibold">Kết quả:</span> <span className="text-primary-700 font-bold">{resultModal.data.result}</span></div>
              <div><span className="font-semibold">Trạng thái:</span> {resultModal.data.status ? 'Đã trả kết quả' : 'Chưa có kết quả'}</div>
              <div><span className="font-semibold">Ngày tạo:</span> {resultModal.data.createdAt ? new Date(resultModal.data.createdAt).toLocaleString('vi-VN') : ''}</div>
              {resultModal.data.updatedAt && (
                <div><span className="font-semibold">Cập nhật lần cuối:</span> {new Date(resultModal.data.updatedAt).toLocaleString('vi-VN')}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">Không có dữ liệu kết quả.</div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={feedbackModal.open} onOpenChange={open => setFeedbackModal(s => ({ ...s, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback dịch vụ</DialogTitle>
            <DialogDescription>
              {feedbackModal.detail && (
                <>
                  Dịch vụ: <span className="font-semibold text-primary-600">{feedbackModal.detail.serviceName}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full border rounded p-3 min-h-[80px] focus:outline-primary-400"
            placeholder="Nhập ý kiến đánh giá của bạn về dịch vụ..."
            value={feedbackModal.content}
            onChange={e => setFeedbackModal(s => ({ ...s, content: e.target.value }))}
            disabled={feedbackModal.loading}
          />
          <div className="flex items-center gap-2 mt-3">
            <span className="font-medium">Đánh giá:</span>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                className={`text-xl ${feedbackModal.rating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                onClick={() => setFeedbackModal(s => ({ ...s, rating: star }))}
                disabled={feedbackModal.loading}
              >★</button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{feedbackModal.rating}/5</span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setFeedbackModal({ open: false, detail: null, content: '', rating: 5, loading: false })} disabled={feedbackModal.loading}>Huỷ</Button>
            <Button variant="secondary" disabled={!feedbackModal.content.trim() || feedbackModal.loading} onClick={handleSendFeedback}>
              {feedbackModal.loading ? 'Đang gửi...' : 'Gửi feedback'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BookingDetailPage; 