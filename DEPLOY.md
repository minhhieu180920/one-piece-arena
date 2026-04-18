# One Piece Arena - Deploy Guide

## Cách 1: Deploy lên Render (Miễn phí, Khuyên dùng)

### Bước 1: Tạo tài khoản
1. Vào https://render.com
2. Đăng ký bằng GitHub

### Bước 2: Push code lên GitHub
```bash
cd one-piece-arena
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Bước 3: Deploy trên Render
1. Vào Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Cấu hình:
   - Name: `one-piece-arena`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"

### Bước 4: Lấy link
- Sau vài phút, bạn sẽ có link: `https://one-piece-arena.onrender.com`
- Chia sẻ link này để mọi người chơi!

---

## Cách 2: Deploy lên Railway (Miễn phí)

### Bước 1: Tạo tài khoản
1. Vào https://railway.app
2. Đăng nhập bằng GitHub

### Bước 2: Deploy
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway tự động detect và deploy

### Bước 3: Lấy link
- Vào Settings → Generate Domain
- Link: `https://one-piece-arena.up.railway.app`

---

## Cách 3: Ngrok (Nhanh nhất, Test ngay)

### Bước 1: Cài ngrok
```bash
# Download từ https://ngrok.com/download
# Hoặc dùng npm
npm install -g ngrok
```

### Bước 2: Chạy server local
```bash
npm start
```

### Bước 3: Tạo tunnel
```bash
ngrok http 3000
```

### Bước 4: Lấy link
- Ngrok sẽ cho bạn link: `https://abc123.ngrok.io`
- Chia sẻ link này (chỉ hoạt động khi máy bạn bật)

---

## Cách 4: Glitch (Đơn giản nhất)

1. Vào https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Paste GitHub repo URL
4. Glitch tự động deploy
5. Link: `https://one-piece-arena.glitch.me`

---

## So sánh

| Platform | Miễn phí | Tốc độ | Link vĩnh viễn | Khuyên dùng |
|----------|----------|--------|----------------|-------------|
| Render   | ✅       | ⭐⭐⭐  | ✅             | ⭐⭐⭐⭐⭐   |
| Railway  | ✅       | ⭐⭐⭐⭐ | ✅             | ⭐⭐⭐⭐    |
| Ngrok    | ✅       | ⭐⭐⭐⭐⭐| ❌ (tạm thời)  | ⭐⭐⭐      |
| Glitch   | ✅       | ⭐⭐    | ✅             | ⭐⭐⭐      |

**Khuyên dùng: Render hoặc Railway** - Link vĩnh viễn, không cần máy bật.
