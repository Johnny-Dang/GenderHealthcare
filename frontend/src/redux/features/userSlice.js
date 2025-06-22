import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null, 
  bookingId: '',
  cartCount: 0,
  cartShouldReload: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, actions) => {
      state.userInfo = actions.payload;
    },
    logout: (state) => {
      state.userInfo = null;
      state.bookingId = '';
      state.cartCount = 0;
      state.cartShouldReload = false;
    },
    setBookingId: (state, action) => {
      state.bookingId = action.payload;
    },
    incrementCart: (state) => {
      state.cartCount += 1;
    },
    setCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    setCartShouldReload: (state, action) => {
      state.cartShouldReload = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout, setBookingId, incrementCart, setCartCount, setCartShouldReload } = userSlice.actions;

export default userSlice.reducer;
