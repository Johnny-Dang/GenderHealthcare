import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import rootReducer from './rootReducer'

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Preloaded state để đảm bảo cấu trúc đúng ngay từ đầu
const preloadedState = {
  user: {
    userInfo: {},
    bookingId: '',
    cartCount: 0,
    cartShouldReload: false
  }
}

export const store = configureStore({
  reducer: persistedReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

// Function để đảm bảo Redux store luôn có cấu trúc đúng
export const ensureStoreStructure = () => {
  const state = store.getState()
  if (!state.user) {
    store.dispatch({
      type: 'user/initialize',
      payload: {
        userInfo: {},
        bookingId: '',
        cartCount: 0,
        cartShouldReload: false
      }
    })
  }
}
