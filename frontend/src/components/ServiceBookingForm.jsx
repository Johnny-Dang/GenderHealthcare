import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from '@/configs/axios';
import { setBookingId, incrementCart } from '@/redux/features/userSlice';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function ServiceBookingForm({ open, onOpenChange, serviceId, bookingDetail, onSuccess }) {
  const dispatch = useDispatch();
  const accountId = useSelector(state => state.user.userInfo?.accountId);
  const bookingId = useSelector(state => state.user.bookingId);
  const isEdit = !!bookingDetail;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    gender: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && bookingDetail) {
      setForm({
        firstName: bookingDetail.firstName || '',
        lastName: bookingDetail.lastName || '',
        dateOfBirth: bookingDetail.dateOfBirth ? new Date(bookingDetail.dateOfBirth).toISOString().split('T')[0] : '',
        phone: bookingDetail.phone || '',
        gender: bookingDetail.gender ?? true,
      })
    }
  }, [isEdit, bookingDetail])

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        // Chế độ chỉnh sửa
        await axios.put(
          `/api/booking-details?bookingDetailId=${bookingDetail.bookingDetailId}`,
          {
            bookingDetailId: bookingDetail.bookingDetailId,
            ...form,
          }
        );
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        // Chế độ thêm mới
        let currentBookingId = bookingId;
        if (!currentBookingId) {
          const res = await axios.post('/api/bookings', { accountId });
          currentBookingId = res.data.bookingId;
          dispatch(setBookingId(currentBookingId));
        }
        await axios.post('/api/booking-details', {
          bookingId: currentBookingId,
          serviceId,
          ...form,
        });
        toast.success('Thêm vào giỏ hàng thành công!');
        dispatch(incrementCart());
      }
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error('Thao tác thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa dịch vụ' : 'Đặt dịch vụ'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin cho dịch vụ' : 'Vui lòng nhập thông tin để đặt dịch vụ'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Họ" required />
            <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Tên" required />
          </div>
          <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" required />
          <div className="flex items-center gap-2">
            <input name="gender" type="checkbox" checked={form.gender} onChange={handleChange} id="gender" />
            <label htmlFor="gender">Nam</label>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Giỏ Hàng')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 