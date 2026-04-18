# 🚀 HƯỚNG DẪN DEPLOY - THỰC HIỆN NGAY

## ⚡ Cách nhanh nhất: Deploy qua Railway Web UI

### Bước 1: Tạo GitHub Repository (nếu chưa có)

```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"

# Tạo repo trên GitHub
# Vào https://github.com/new
# Tên repo: one-piece-arena
# Public hoặc Private đều được

# Push code lên GitHub
git remote add origin https://github.com/YOUR_USERNAME/one-piece-arena.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy lên Railway

1. Truy cập: **https://railway.app**
2. Click **Login** → Đăng nhập bằng GitHub
3. Click **New Project**
4. Chọn **Deploy from GitHub repo**
5. Authorize Railway truy cập GitHub (nếu lần đầu)
6. Chọn repo **one-piece-arena**
7. Railway tự động:
   - Detect Node.js
   - Chạy `npm install`
   - Chạy `npm start`
   - Deploy thành công!

### Bước 3: Tạo Public URL

1. Trong Railway dashboard, click vào project
2. Click tab **Settings**
3. Scroll xuống **Networking**
4. Click **Generate Domain**
5. Railway tạo URL: `https://one-piece-arena-production.up.railway.app`

### Bước 4: Kiểm tra

Mở URL trong trình duyệt, game sẽ chạy!

---

## 🔧 Hoặc: Deploy qua Railway CLI (Terminal)

Mở **Command Prompt** hoặc **PowerShell** và chạy:

```bash
# 1. Đăng nhập
railway login

# 2. Vào thư mục project
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"

# 3. Khởi tạo
railway init

# 4. Deploy
railway up

# 5. Tạo domain
railway domain

# 6. Xem logs
railway logs
```

---

## 📋 Checklist Deploy

- [ ] Code đã commit đầy đủ
- [ ] package.json có đúng dependencies
- [ ] Procfile có sẵn (đã có)
- [ ] Push code lên GitHub (nếu dùng Web UI)
- [ ] Deploy qua Railway
- [ ] Generate domain
- [ ] Test game hoạt động

---

## ⚠️ Lưu ý

1. **Railway Free Tier**: $5 credit/tháng (~500 giờ)
2. **Auto-sleep**: App sleep sau 5 phút không dùng
3. **Wake time**: ~30 giây để wake up
4. **WebSocket**: Hoạt động hoàn hảo

---

## 🎮 Sau khi deploy thành công

Game sẽ có URL dạng:
- `https://one-piece-arena-production.up.railway.app`
- Hoặc custom: `https://your-name.railway.app`

Share URL này để mọi người chơi!

---

## ❓ Cần hỗ trợ?

Nếu gặp lỗi, check:
1. Railway logs: `railway logs`
2. Hoặc xem logs trong Railway dashboard
3. Đảm bảo PORT được set từ environment: `process.env.PORT || 3000`

---

## 🚀 BẮT ĐẦU NGAY

**Khuyến nghị: Dùng Railway Web UI** (dễ nhất)

1. Vào: https://railway.app
2. Login với GitHub
3. New Project → Deploy from GitHub
4. Chọn repo
5. Xong!

Thời gian: ~5 phút
