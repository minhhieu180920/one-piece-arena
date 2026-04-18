# 🎮 CHƠI NGAY - 3 BƯỚC

## Bước 1: Khởi động server

**Windows:**
- Double click file `START.bat`

**Mac/Linux:**
```bash
npm start
```

## Bước 2: Mở game

Trình duyệt tự động mở: http://localhost:3000

Hoặc mở thủ công: http://localhost:3000

## Bước 3: Chơi với bạn bè qua Internet

### Cách A: Ngrok (2 phút - Không cần tài khoản)

1. **Tải ngrok**: https://ngrok.com/download
2. **Giải nén** ngrok.exe
3. **Mở Command Prompt** tại thư mục ngrok
4. **Chạy lệnh**:
   ```
   ngrok http 3000
   ```
5. **Copy link** (dạng `https://abc123.ngrok-free.app`)
6. **Gửi link** cho bạn bè!

**Lưu ý**: Giữ cả 2 cửa sổ (server + ngrok) mở khi chơi.

---

### Cách B: Deploy lên Railway (Link vĩnh viễn)

Xem file `DEPLOY-SIMPLE.md` để có hướng dẫn chi tiết.

---

## 🎯 Điều khiển

- **WASD / Mũi tên**: Di chuyển
- **Spacebar**: Nhảy
- **Shift**: Né (cooldown 3s)
- **Q, W, E, R**: Skills 1-4

---

## ❓ Gặp vấn đề?

**Server không chạy?**
```bash
npm install
npm start
```

**Port 3000 đã được dùng?**
- Tắt ứng dụng đang dùng port 3000
- Hoặc đổi PORT trong `server/index.js`

**Ngrok không hoạt động?**
- Kiểm tra server đang chạy (http://localhost:3000)
- Chạy lại lệnh ngrok

---

## 🏴‍☠️ Chúc bạn chơi vui!

Tối đa 7 người có thể online cùng lúc.
Chế độ: 1v1 hoặc 2v2
