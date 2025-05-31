# Gender Healthcare Service Management System - Fullstack Monorepo (React + ASP.NET Core Web API)

## 📁 Cấu trúc thư mục

---

## ✅ Yêu cầu môi trường

### Frontend (ReactJS)

- Node.js >= 18.x
- npm hoặc yarn

### Backend (ASP.NET Core)

- .NET 6 SDK trở lên (nên dùng .NET 8 nếu đã nâng cấp)
- (Tùy chọn) SQL Server nếu dùng Entity Framework

---

## 🚀 Cách cài đặt & chạy dự án

### 1. Clone repository

```bash
git clone git@github.com:Johnny-Dang/GenderHealthCareServiceManagementSystem.git
cd GenderHealthcareServiceManagementSystem

cd frontend
cp .env.example .env     # Tùy chỉnh biến môi trường nếu cần
npm install              # hoặc yarn
npm start                # Chạy React App

cd backend
cp appsettings.Development.json.example appsettings.Development.json

dotnet restore                       # Tải dependencies
dotnet ef database update            # Apply migration nếu có
dotnet run                           # Chạy backend API

```
