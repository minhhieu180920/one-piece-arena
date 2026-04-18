# ☁️ DEPLOY LÊN CLOUD - Game chạy 24/7

## Vấn đề hiện tại

- ❌ Server chạy trên máy bạn (localhost)
- ❌ Tắt máy = game offline
- ❌ Chỉ bạn chơi được

## Giải pháp: Deploy lên Railway

- ✅ Server chạy trên cloud 24/7
- ✅ Tắt máy vẫn chơi được
- ✅ Mọi người có thể vào chơi
- ✅ Miễn phí (500 giờ/tháng)

---

## 🚀 HƯỚNG DẪN DEPLOY - 3 BƯỚC

### BƯỚC 1: Tạo GitHub Repository

1. Vào: https://github.com/new
2. Tên repo: `one-piece-arena`
3. Chọn **Public**
4. **KHÔNG** chọn "Add README"
5. Click **Create repository**

### BƯỚC 2: Push code lên GitHub

Mở **Command Prompt** hoặc **Git Bash**, chạy:

```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"

git remote add origin https://github.com/YOUR_USERNAME/one-piece-arena.git
git branch -M main
git push -u origin main
```

**Thay `YOUR_USERNAME` bằng username GitHub của bạn!**

### BƯỚC 3: Deploy lên Railway

1. Vào: **https://railway.app**
2. Click **Login** → Đăng nhập bằng **GitHub**
3. Click **New Project**
4. Chọn **Deploy from GitHub repo**
5. Click **Configure GitHub App** (nếu lần đầu)
6. Authorize Railway truy cập repo
7. Chọn repo **one-piece-arena**
8. Railway tự động deploy!

### BƯỚC 4: Tạo Public URL

1. Trong Railway dashboard, click vào project
2. Click tab **Settings**
3. Scroll xuống **Networking**
4. Click **Generate Domain**
5. Railway tạo URL: `https://one-piece-arena-production.up.railway.app`

**XONG! Game đã online 24/7!**

---

## 🎮 Sau khi deploy

### URL game của bạn:
```
https://one-piece-arena-production.up.railway.app
```

### Share URL này để mọi người chơi!

- Gửi cho bạn bè
- Post lên mạng xã hội
- Mọi người trên thế giới có thể vào chơi
- Không cần máy bạn bật

---

## 📊 Railway Free Tier

- **Credit**: $5/tháng (~500 giờ)
- **Auto-sleep**: Sau 5 phút không dùng, app sleep
- **Wake time**: ~30 giây để wake up khi có người vào
- **WebSocket**: Hoạt động hoàn hảo

---

## ⚠️ Lưu ý quan trọng

### 1. Nếu app sleep
- Lần đầu vào sẽ mất ~30 giây để wake up
- Sau đó chạy bình thường
- Giải pháp: Upgrade Railway ($5/tháng) để không sleep

### 2. Nếu hết credit
- Railway free tier: 500 giờ/tháng
- Nếu hết, app sẽ tạm dừng
- Có thể upgrade hoặc đợi tháng sau

### 3. Monitoring
- Xem logs: `railway logs`
- Hoặc vào Railway dashboard → Deployments → Logs

---

## 🔧 Troubleshooting

### Lỗi: "Cannot push to GitHub"
```bash
# Kiểm tra remote
git remote -v

# Nếu chưa có, thêm remote
git remote add origin https://github.com/YOUR_USERNAME/one-piece-arena.git
```

### Lỗi: "Railway build failed"
- Vào Railway dashboard
- Click vào deployment
- Xem logs để biết lỗi gì
- Thường do thiếu dependencies

### Lỗi: "Port already in use"
- Railway tự động set PORT
- Code đã có: `process.env.PORT || 3000`
- Không cần sửa gì

---

## 🎯 TÓM TẮT

1. **Tạo GitHub repo** → Push code
2. **Vào Railway.app** → Deploy from GitHub
3. **Generate Domain** → Lấy URL
4. **Share URL** → Mọi người chơi!

**Thời gian**: ~5 phút
**Chi phí**: Miễn phí (500 giờ/tháng)
**Kết quả**: Game online 24/7, tắt máy vẫn chơi được!

---

## 📞 Cần hỗ trợ?

Nếu gặp khó khăn, cho tôi biết bước nào bạn đang gặp vấn đề:
- Tạo GitHub repo?
- Push code?
- Deploy Railway?
- Generate domain?

Tôi sẽ hướng dẫn chi tiết hơn!
