# 🚀 HƯỚNG DẪN DEPLOY ĐƠN GIẢN - 5 PHÚT

## Cách 1: Railway (Đơn giản nhất - Không cần GitHub)

### Bước 1: Tạo tài khoản
1. Vào https://railway.app
2. Click "Login with GitHub" (tạo tài khoản GitHub nếu chưa có)

### Bước 2: Deploy
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Click "Deploy from GitHub repo" → "Configure GitHub App"
4. Chọn repository hoặc tạo mới:
   - Vào GitHub → New repository → Tên: `one-piece-arena`
   - Copy lệnh push:

```bash
cd one-piece-arena
git remote add origin https://github.com/YOUR-USERNAME/one-piece-arena.git
git branch -M main
git push -u origin main
```

5. Quay lại Railway → Chọn repo vừa tạo
6. Railway tự động deploy!

### Bước 3: Lấy link
1. Click vào project
2. Click "Settings" → "Generate Domain"
3. Link của bạn: `https://one-piece-arena-production.up.railway.app`

**✅ Xong! Chia sẻ link cho bạn bè chơi ngay!**

---

## Cách 2: Render (Miễn phí vĩnh viễn)

### Bước 1: Push lên GitHub
```bash
# Tạo repo mới trên github.com
git remote add origin https://github.com/YOUR-USERNAME/one-piece-arena.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy trên Render
1. Vào https://render.com
2. Đăng nhập bằng GitHub
3. Click "New +" → "Web Service"
4. Connect repository `one-piece-arena`
5. Cấu hình:
   - Name: `one-piece-arena`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click "Create Web Service"

### Bước 3: Đợi 3-5 phút
Link của bạn: `https://one-piece-arena.onrender.com`

---

## Cách 3: Ngrok (Nhanh nhất - Test ngay)

### Không cần tài khoản gì cả!

1. **Tải ngrok**: https://ngrok.com/download
2. **Giải nén** và mở terminal tại thư mục ngrok
3. **Chạy server** (terminal 1):
   ```bash
   cd one-piece-arena
   npm start
   ```
4. **Chạy ngrok** (terminal 2):
   ```bash
   ngrok http 3000
   ```
5. **Copy link** hiện ra (dạng `https://abc123.ngrok.io`)
6. **Chia sẻ** cho bạn bè!

⚠️ Lưu ý: Ngrok chỉ hoạt động khi máy bạn bật.

---

## So sánh nhanh

| Cách | Thời gian | Link vĩnh viễn | Khuyên dùng |
|------|-----------|----------------|-------------|
| Railway | 5 phút | ✅ | ⭐⭐⭐⭐⭐ |
| Render | 10 phút | ✅ | ⭐⭐⭐⭐ |
| Ngrok | 2 phút | ❌ | ⭐⭐⭐ (test) |

---

## ❓ Cần giúp đỡ?

**Nếu chưa có GitHub:**
1. Vào https://github.com/signup
2. Tạo tài khoản (miễn phí)
3. Làm theo hướng dẫn Railway ở trên

**Nếu gặp lỗi khi push GitHub:**
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

---

## 🎮 Sau khi có link

1. Mở link trên trình duyệt
2. Chia sẻ link cho bạn bè
3. Tạo phòng và chơi!

**Link hoạt động trên cả PC và điện thoại!**
