# Hướng dẫn chơi Multiplayer trên Android

## Tổng quan

One Piece Arena hỗ trợ 2 chế độ chơi trên Android:

### 1. Chế độ Offline (Chơi đơn với AI)
- ✅ Không cần internet
- ✅ Chơi với AI bot (3 độ khó)
- ✅ Hoạt động 100% offline
- ✅ Phù hợp khi không có mạng

### 2. Chế độ Online (Multiplayer)
- ✅ Chơi với người khác qua internet
- ✅ Kết nối server Railway
- ✅ Chơi được với cả web và Android
- ⚠️ Cần kết nối internet

---

## Cách chơi Multiplayer trên Android

### Bước 1: Cài đặt APK
1. Build APK theo hướng dẫn trong `ANDROID-BUILD.md`
2. Cài APK lên điện thoại Android
3. Mở app "One Piece Arena"

### Bước 2: Kết nối Internet
- Bật WiFi hoặc 4G/5G
- App sẽ tự động kết nối server: `https://web-production-42989.up.railway.app`

### Bước 3: Tạo phòng hoặc Join phòng

**Người chơi 1 (Tạo phòng):**
1. Chọn "Chơi Online"
2. Nhấn "Tạo phòng 1v1"
3. Chọn hero
4. Đợi người chơi 2

**Người chơi 2 (Vào phòng):**
1. Chọn "Chơi Online"
2. Thấy phòng trong danh sách → Nhấn vào
3. Chọn hero
4. Nhấn "Sẵn sàng"

**Cả 2 người nhấn "Sẵn sàng" → Game bắt đầu!**

---

## Chơi Cross-platform

### Android ↔ Android
- ✅ 2 điện thoại Android
- ✅ Cùng kết nối server Railway
- ✅ Tạo phòng và join như bình thường

### Android ↔ Web Browser
- ✅ 1 người dùng Android
- ✅ 1 người dùng web: https://web-production-42989.up.railway.app
- ✅ Cùng vào chung phòng

### Android ↔ PC (Local)
- ✅ PC chạy server local: `npm start`
- ✅ Android kết nối qua WiFi: `http://192.168.x.x:3000`
- ⚠️ Cần sửa code để trỏ đến IP local

---

## Cấu hình Server URL

APK đã được cấu hình tự động:
- **Localhost**: Kết nối `http://localhost:3000`
- **Production**: Kết nối `https://web-production-42989.up.railway.app`

Nếu muốn đổi server, sửa file `client/js/game.js`:

```javascript
const serverUrl = 'https://your-server-url.com';
this.socket = io(serverUrl);
```

---

## Troubleshooting

### Không kết nối được server
- Kiểm tra internet
- Thử truy cập: https://web-production-42989.up.railway.app
- Nếu Railway down → Chơi offline mode

### Không thấy phòng
- Đảm bảo cả 2 người cùng server
- Refresh lại app
- Tạo phòng mới

### Lag/Delay
- Kiểm tra tốc độ mạng
- Railway server ở US → có thể lag từ VN
- Khuyến nghị: WiFi tốc độ cao

### Âm thanh không hoạt động
- Bật âm lượng điện thoại
- Cho phép app truy cập audio
- Chạm vào màn hình để kích hoạt audio

---

## Lưu ý quan trọng

1. **Server Railway miễn phí có giới hạn**:
   - 500 giờ/tháng
   - Nếu hết quota → chơi offline mode

2. **Bảo mật**:
   - Server không lưu dữ liệu cá nhân
   - Chỉ relay messages giữa players
   - Không cần đăng ký tài khoản

3. **Hiệu năng**:
   - Game logic chạy trên client
   - Server chỉ relay → ít lag
   - Offline mode không lag

---

## Demo Video (Tương lai)

1. Mở 2 điện thoại Android
2. Cả 2 mở app One Piece Arena
3. Người 1: Tạo phòng 1v1
4. Người 2: Join phòng
5. Chọn hero → Ready → Chơi!

---

## Hỗ trợ

- GitHub Issues: https://github.com/minhhieu180920/one-piece-arena/issues
- Hướng dẫn chi tiết: `HUONG_DAN.md`
- Build Android: `ANDROID-BUILD.md`
