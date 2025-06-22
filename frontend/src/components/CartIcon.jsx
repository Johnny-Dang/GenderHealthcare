import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CartIcon() {
  const cartCount = useSelector(state => state.user.cartCount);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/cart')}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {cartCount > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: 0, background: 'red', color: 'white',
          borderRadius: '50%', padding: '2px 6px', fontSize: 12
        }}>
          {cartCount}
        </span>
      )}
    </div>
  );
} 