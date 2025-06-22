import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from '@/configs/axios';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { setCartCount, setCartShouldReload } from '@/redux/features/userSlice';
import { Trash2, Pencil } from 'lucide-react';
import ServiceBookingForm from '@/components/ServiceBookingForm';

export default function CartPage() {
  const bookingId = useSelector(state => state.user.bookingId);
  const cartShouldReload = useSelector(state => state.user.cartShouldReload);
  const dispatch = useDispatch();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchServices = () => {
    if (bookingId) {
      setLoading(true);
      axios.get(`/api/booking-details/booking/${bookingId}`)
        .then(res => {
          setServices(res.data);
          dispatch(setCartCount(res.data.length));
        })
        .catch(() => setServices([]))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line
  }, [bookingId]);

  useEffect(() => {
    if (cartShouldReload) {
      fetchServices();
      dispatch(setCartShouldReload(false));
    }
  }, [cartShouldReload, dispatch]);

  const handleDelete = async (bookingDetailId) => {
    if (!window.confirm('Bạn có chắc muốn xoá dịch vụ này khỏi giỏ hàng?')) return;
    try {
      await axios.delete(`/api/booking-details/${bookingDetailId}`);
      fetchServices();
    } catch {
      alert('Xoá thất bại!');
    }
  };

  // Tính tổng tiền
  const total = services.reduce((sum, s) => sum + (s.price || 0), 0);

  const handlePayment = async () => {
    if (!bookingId || total <= 0) {
      alert('Không có dịch vụ nào để thanh toán!');
      return;
    }
    try {
      const res = await axios.post('/api/payments/create-vnpay-url', {
        bookingId,
        amount: total,
        orderDescription: 'Xét Nghiệm STis',
        orderType: 'Xét Nghiệm',
      });
      if (res.data && typeof res.data === 'string') {
        window.location.href = res.data;
      } else if (res.data && res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert('Không nhận được link thanh toán!');
      }
    } catch (err) {
      alert('Tạo link thanh toán thất bại!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary-700">Dịch vụ trong giỏ hàng</h2>
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></span>
            <span className="text-primary-500">Đang tải...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
              <path d="M6 6h15l-1.5 9h-13z" stroke="#888" strokeWidth="1.5" />
              <circle cx="9" cy="21" r="1" fill="#888" />
              <circle cx="20" cy="21" r="1" fill="#888" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">Bạn chưa thêm dịch vụ nào vào giỏ hàng.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div key={s.bookingDetailId} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-lg font-bold text-primary-700 flex items-center gap-2">
                      <span>{s.serviceName}</span>
                    </div>
                    <div className="text-pink-600 font-semibold text-xl mt-1">{s.price?.toLocaleString()} <span className="text-base font-normal">VNĐ</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-4">
                  <div><span className="font-medium">Họ:</span> {s.lastName}</div>
                  <div><span className="font-medium">Tên:</span> {s.firstName}</div>
                  <div><span className="font-medium">SĐT:</span> {s.phone}</div>
                  <div><span className="font-medium">Ngày sinh:</span> {s.dateOfBirth}</div>
                  <div><span className="font-medium">Giới tính:</span> {s.gender ? 'Nam' : 'Nữ'}</div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition shadow"
                    onClick={() => { setEditData(s); setEditOpen(true); }}
                    title="Chỉnh sửa dịch vụ"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Chỉnh sửa
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded transition shadow"
                    onClick={() => handleDelete(s.bookingDetailId)}
                    title="Xoá dịch vụ"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Tổng tiền và nút thanh toán */}
        {services.length > 0 && (
          <div className="mt-10 flex flex-col md:flex-row justify-end items-end gap-4">
            <div className="bg-white rounded-lg shadow px-8 py-4 text-lg font-bold text-primary-700 border border-primary-100">
              Tổng cộng: <span className="text-pink-600">{total.toLocaleString()} VNĐ</span>
            </div>
            <button
              className="bg-gradient-to-r from-pink-500 to-primary-500 text-white font-bold px-8 py-4 rounded-lg shadow hover:opacity-90 transition text-lg"
              onClick={handlePayment}
            >
              Thanh toán
            </button>
          </div>
        )}
      </div>
      
      {editOpen && (
        <ServiceBookingForm 
          open={editOpen}
          onOpenChange={setEditOpen}
          bookingDetail={editData}
          onSuccess={() => {
            fetchServices();
            setEditOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}