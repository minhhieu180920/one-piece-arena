# 🎮 HƯỚNG DẪN DEPLOY CHI TIẾT - TỪNG BƯỚC

## 📌 MỤC TIÊU
Sau khi làm xong, game sẽ:
- ✅ Chạy 24/7 trên internet
- ✅ Tắt máy vẫn hoạt động
- ✅ Mọi người có thể vào chơi
- ✅ Có URL riêng để share

---

## 🔧 CHUẨN BỊ

### Bạn cần có:
1. ✅ Tài khoản GitHub (miễn phí)
2. ✅ Git đã cài trên máy (đã có)
3. ✅ Code game đã sẵn sàng (đã có)

### Nếu chưa có tài khoản GitHub:
1. Vào: https://github.com/signup
2. Nhập email, tạo password
3. Xác nhận email
4. Xong!

---

## 📦 BƯỚC 1: TẠO GITHUB REPOSITORY (Kho lưu code)

### 1.1. Đăng nhập GitHub
- Vào: https://github.com
- Click **Sign in** (góc trên bên phải)
- Nhập username và password

### 1.2. Tạo Repository mới
1. Click nút **+** (góc trên bên phải)
2. Chọn **New repository**
3. Điền thông tin:
   - **Repository name**: `one-piece-arena`
   - **Description**: `One Piece fighting game with multiplayer`
   - **Public** (để mọi người xem được)
   - **KHÔNG** chọn "Add a README file"
   - **KHÔNG** chọn ".gitignore"
   - **KHÔNG** chọn "Choose a license"
4. Click **Create repository**

### 1.3. Sao chép URL
Sau khi tạo xong, bạn sẽ thấy trang hướng dẫn.
Tìm dòng có URL dạng:
```
https://github.com/YOUR_USERNAME/one-piece-arena.git
```
**Copy URL này** (sẽ dùng ở bước sau)

---

## 💻 BƯỚC 2: PUSH CODE LÊN GITHUB

### 2.1. Mở Command Prompt
- Nhấn **Windows + R**
- Gõ: `cmd`
- Nhấn **Enter**

### 2.2. Di chuyển vào thư mục project
Copy và paste lệnh này vào Command Prompt:
```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena"
```
Nhấn **Enter**

### 2.3. Kiểm tra git status
```bash
git status
```
Nhấn **Enter**

Bạn sẽ thấy:
```
On branch master
nothing to commit, working tree clean
```

### 2.4. Thêm remote GitHub
**QUAN TRỌNG**: Thay `YOUR_USERNAME` bằng username GitHub của bạn!

```bash
git remote add origin https://github.com/YOUR_USERNAME/one-piece-arena.git
```

**Ví dụ**: Nếu username GitHub của bạn là `nguyenvana`, thì lệnh sẽ là:
```bash
git remote add origin https://github.com/nguyenvana/one-piece-arena.git
```

Nhấn **Enter**

### 2.5. Đổi tên branch thành main
```bash
git branch -M main
```
Nhấn **Enter**

### 2.6. Push code lên GitHub
```bash
git push -u origin main
```
Nhấn **Enter**

**Nếu GitHub yêu cầu đăng nhập:**
- Nhập username GitHub
- Nhập password (hoặc Personal Access Token)

**Lưu ý về Personal Access Token:**
Nếu GitHub báo lỗi password, bạn cần tạo token:
1. Vào: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Chọn **repo** (tất cả các ô trong repo)
4. Click **Generate token**
5. Copy token (chỉ hiện 1 lần!)
6. Dùng token này thay cho password

### 2.7. Kiểm tra đã push thành công
Vào lại GitHub repo của bạn:
```
https://github.com/YOUR_USERNAME/one-piece-arena
```

Bạn sẽ thấy tất cả code đã lên!

---

## ☁️ BƯỚC 3: DEPLOY LÊN RAILWAY

### 3.1. Truy cập Railway
- Mở trình duyệt
- Vào: https://railway.app

### 3.2. Đăng nhập bằng GitHub
1. Click nút **Login** (góc trên bên phải)
2. Chọn **Login with GitHub**
3. Nếu lần đầu, GitHub sẽ hỏi: "Authorize Railway?"
4. Click **Authorize Railway**
5. Bạn sẽ được chuyển về Railway dashboard

### 3.3. Tạo Project mới
1. Click nút **New Project** (to, màu tím)
2. Chọn **Deploy from GitHub repo**

### 3.4. Cấp quyền truy cập repo (nếu lần đầu)
1. Railway sẽ hiện popup: "Install Railway on GitHub"
2. Chọn **Only select repositories**
3. Chọn repo **one-piece-arena**
4. Click **Install**

### 3.5. Chọn repo để deploy
1. Bạn sẽ thấy danh sách repos
2. Tìm và click vào **one-piece-arena**
3. Railway bắt đầu deploy tự động!

### 3.6. Đợi deploy xong
Bạn sẽ thấy:
- **Building...** (đang build, ~1-2 phút)
- **Deploying...** (đang deploy)
- **Success!** (thành công)

Màn hình sẽ hiện:
- ✅ Build logs
- ✅ Deploy logs
- ✅ Status: Active

---

## 🌐 BƯỚC 4: TẠO PUBLIC URL

### 4.1. Vào Settings
1. Trong Railway dashboard, click vào project **one-piece-arena**
2. Click tab **Settings** (bên trái)

### 4.2. Generate Domain
1. Scroll xuống phần **Networking**
2. Click nút **Generate Domain**
3. Railway tạo URL tự động, dạng:
   ```
   https://one-piece-arena-production.up.railway.app
   ```
4. **Copy URL này!**

### 4.3. Kiểm tra game
1. Mở tab mới trong trình duyệt
2. Paste URL vừa copy
3. Nhấn Enter
4. Game sẽ load lên!

**Nếu lần đầu mất ~30 giây** (app đang wake up)

---

## 🎉 HOÀN THÀNH!

### ✅ Bạn đã có:
- URL game: `https://one-piece-arena-production.up.railway.app`
- Game chạy 24/7
- Tắt máy vẫn hoạt động
- Mọi người có thể vào chơi

### 📤 Share game:
- Gửi URL cho bạn bè
- Post lên Facebook, Discord, etc.
- Mọi người trên thế giới có thể chơi!

---

## 🔍 KIỂM TRA VÀ MONITORING

### Xem logs (nếu có lỗi)
1. Vào Railway dashboard
2. Click vào project
3. Click tab **Deployments**
4. Click vào deployment mới nhất
5. Xem **Build Logs** và **Deploy Logs**

### Kiểm tra server đang chạy
Trong logs, bạn sẽ thấy:
```
🎮 One Piece Arena Server running on http://localhost:3000
📊 Max players: 7
⚔️  Game modes: 1v1, 2v2
🤖 AI Bot: Available
```

---

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "Git push failed - Authentication failed"
**Giải pháp:**
1. Tạo Personal Access Token:
   - Vào: https://github.com/settings/tokens
   - Generate new token (classic)
   - Chọn **repo**
   - Copy token
2. Dùng token thay cho password khi push

### Lỗi 2: "Railway build failed"
**Giải pháp:**
1. Kiểm tra logs trong Railway
2. Thường do thiếu dependencies
3. Đảm bảo `package.json` có đầy đủ dependencies

### Lỗi 3: "Cannot access game URL"
**Giải pháp:**
1. Đợi 30 giây (app đang wake up)
2. Refresh trang
3. Kiểm tra Railway dashboard xem app có đang chạy không

### Lỗi 4: "Port already in use"
**Giải pháp:**
- Code đã tự động xử lý: `process.env.PORT || 3000`
- Railway tự động set PORT
- Không cần sửa gì

---

## 💰 CHI PHÍ

### Railway Free Tier:
- **$5 credit/tháng** (~500 giờ)
- **Miễn phí** cho hobby projects
- **Auto-sleep** sau 5 phút không dùng
- **Wake time**: ~30 giây

### Nếu muốn không sleep:
- Upgrade Railway: $5/tháng
- App sẽ chạy 24/7 không sleep

---

## 📞 CẦN HỖ TRỢ?

Nếu bạn gặp khó khăn ở bước nào, cho tôi biết:
- Bước 1: Tạo GitHub repo?
- Bước 2: Push code?
- Bước 3: Deploy Railway?
- Bước 4: Generate domain?

Tôi sẽ hướng dẫn chi tiết hơn nữa!

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Tạo GitHub account
- [ ] Tạo repository `one-piece-arena`
- [ ] Push code lên GitHub
- [ ] Đăng nhập Railway
- [ ] Deploy from GitHub repo
- [ ] Generate domain
- [ ] Test game hoạt động
- [ ] Share URL cho bạn bè

**Chúc bạn thành công! 🚀**
