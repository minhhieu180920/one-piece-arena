# Deploy toàn bộ lên Railway - Hướng dẫn chi tiết

## Bước 1: Cài đặt Railway CLI

```bash
npm install -g @railway/cli
```

## Bước 2: Đăng nhập Railway

```bash
railway login
```

Trình duyệt sẽ mở, đăng nhập bằng GitHub.

## Bước 3: Khởi tạo project

```bash
cd one-piece-arena
railway init
```

Chọn:
- Create new project
- Đặt tên: one-piece-arena

## Bước 4: Deploy

```bash
railway up
```

Railway sẽ:
- Upload toàn bộ code
- Chạy `npm install`
- Chạy `npm start`
- Tạo URL public

## Bước 5: Tạo domain

```bash
railway domain
```

Hoặc vào dashboard: https://railway.app/dashboard

Game sẽ chạy tại: `https://one-piece-arena-production.up.railway.app`

## Bước 6: Kiểm tra logs

```bash
railway logs
```

## Lưu ý

- Railway free tier: 500 giờ/tháng ($5 credit)
- Hỗ trợ WebSocket đầy đủ
- Auto-deploy khi push code mới
- Có thể link với GitHub để auto-deploy

## Hoặc deploy qua Web UI

1. Truy cập: https://railway.app
2. New Project → Deploy from GitHub
3. Connect repo one-piece-arena
4. Railway tự động deploy

Xong!
