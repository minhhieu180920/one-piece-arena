# Hướng dẫn Deploy lên Firebase - Giải pháp Hybrid

## ⚠️ Vấn đề quan trọng

Game One Piece Arena sử dụng **WebSocket (Socket.io)** để multiplayer real-time.
Firebase Hosting + Functions **KHÔNG hỗ trợ WebSocket**.

## 🎯 Giải pháp: Hybrid Deploy

### Phương án 1: Firebase Hosting + Railway Server (Khuyến nghị)

**Ưu điểm:**
- Client trên Firebase (CDN nhanh, miễn phí)
- Server trên Railway (hỗ trợ WebSocket, free tier)
- Dễ setup, không cần refactor code

**Các bước:**

#### Bước 1: Deploy Server lên Railway

1. Truy cập: https://railway.app
2. Đăng nhập với GitHub
3. New Project → Deploy from GitHub repo
4. Chọn repo one-piece-arena
5. Railway tự động detect và deploy

**Hoặc dùng Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Bước 2: Deploy Client lên Firebase

```bash
# Tạo thư mục build cho client
mkdir firebase-client
cp -r client/* firebase-client/

# Init Firebase
firebase login
firebase init hosting

# Chọn:
# - Project: game-one-piece-1053e
# - Public directory: firebase-client
# - Single-page app: No
# - GitHub auto-deploy: No

# Deploy
firebase deploy --only hosting
```

#### Bước 3: Update Client để connect đến Railway server

Sửa file `client/js/game.js`:
```javascript
// Thay vì:
this.socket = io();

// Thành:
this.socket = io('https://your-railway-app.railway.app');
```

---

### Phương án 2: Deploy toàn bộ lên Railway

**Đơn giản nhất - Deploy cả client + server lên Railway:**

```bash
# Đã có sẵn package.json và Procfile
# Chỉ cần push lên Railway

railway login
railway init
railway up
```

Railway sẽ:
- Chạy `npm install`
- Chạy `npm start`
- Serve cả client và server
- Cung cấp URL: https://your-app.railway.app

---

### Phương án 3: Render.com (Alternative)

Tương tự Railway, miễn phí và hỗ trợ WebSocket:

1. Truy cập: https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Deploy

---

## 🚀 Khuyến nghị: Dùng Railway

**Lý do:**
- ✅ Miễn phí (500 giờ/tháng)
- ✅ Hỗ trợ WebSocket
- ✅ Auto-deploy từ GitHub
- ✅ Không cần refactor code
- ✅ Setup nhanh (5 phút)

**Các bước deploy lên Railway:**

```bash
# 1. Cài Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project
cd one-piece-arena
railway init

# 4. Deploy
railway up

# 5. Lấy URL
railway domain
```

Xong! Game sẽ chạy tại: `https://your-app.railway.app`

---

## 📝 Nếu vẫn muốn dùng Firebase

Cần **refactor code** để thay Socket.io bằng Firebase Realtime Database:

1. Xóa Socket.io
2. Dùng Firebase Realtime Database cho sync
3. Refactor toàn bộ event handlers
4. Deploy lên Firebase Hosting

**Thời gian ước tính:** 4-6 giờ refactor

---

## ❓ Bạn muốn chọn phương án nào?

1. **Railway** (khuyến nghị - nhanh nhất)
2. **Firebase Hosting + Railway Server** (hybrid)
3. **Render.com** (alternative)
4. **Refactor để dùng Firebase Realtime Database** (mất thời gian)
