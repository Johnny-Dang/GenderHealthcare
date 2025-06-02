import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  server: {
    port: 3000, // ⚠️ đổi số port tùy ý (mặc định là 5173)
    open: true, // (tuỳ chọn) tự động mở trình duyệt khi chạy
  },
>>>>>>> 75143d0767bfade9a961644fdef2e8e9e0a62076
});
