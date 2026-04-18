# Các bước deploy lên Railway - Thực hiện ngay

## Bước 1: Đăng nhập Railway

Chạy lệnh này trong terminal:

```bash
railway login
```

Trình duyệt sẽ tự động mở, đăng nhập bằng GitHub của bạn.

## Bước 2: Khởi tạo project

```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"
railway init
```

Chọn:
- **Create new project**
- Đặt tên: `one-piece-arena`

## Bước 3: Deploy

```bash
railway up
```

Railway sẽ:
1. Upload toàn bộ code
2. Tự động detect Node.js project
3. Chạy `npm install`
4. Chạy `npm start` (từ package.json)
5. Tạo URL public

## Bước 4: Tạo domain public

```bash
railway domain
```

Hoặc vào Railway dashboard để tạo domain.

## Bước 5: Kiểm tra

```bash
railway logs
```

Xem logs để đảm bảo server chạy thành công.

---

## Alternative: Deploy qua Web UI (Dễ hơn)

Nếu không muốn dùng CLI:

1. Truy cập: https://railway.app
2. Đăng nhập bằng GitHub
3. Click **New Project**
4. Chọn **Deploy from GitHub repo**
5. Authorize Railway truy cập GitHub
6. Chọn repo `one-piece-arena`
7. Railway tự động deploy

**Ưu điểm:**
- Không cần CLI
- Auto-deploy khi push code mới
- Dễ quản lý qua dashboard

---

## Sau khi deploy thành công

URL game sẽ là: `https://one-piece-arena-production.up.railway.app`

Hoặc custom domain: `https://your-custom-name.railway.app`

---

## Lưu ý quan trọng

1. **Railway free tier**: $5 credit/tháng (~500 giờ)
2. **WebSocket**: Hoạt động hoàn hảo
3. **Auto-sleep**: Sau 5 phút không dùng, app sẽ sleep (wake up khi có request)
4. **Environment variables**: Có thể set PORT, NODE_ENV, etc.

---

## Bạn muốn deploy bằng cách nào?

**Option 1: CLI** (đã cài sẵn)
```bash
railway login
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"
railway init
railway up
railway domain
```

**Option 2: Web UI** (khuyến nghị - dễ hơn)
- Vào https://railway.app
- Deploy from GitHub
- Chọn repo
- Xong!

Bạn muốn tôi hướng dẫn cách nào?
