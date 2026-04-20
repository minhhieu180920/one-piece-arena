# 🔄 Auto-Update System

Hệ thống tự động cập nhật cho One Piece Arena Android App.

## Cách dùng nhanh

### 1. Phát hành phiên bản mới

```bash
# Cập nhật version.json
node update-version.js 2.1.0 3 "https://your-url.com/app.apk" "Feature 1" "Feature 2"

# Push lên server
git add version.json
git commit -m "Release v2.1.0"
git push
```

### 2. Ứng dụng tự động kiểm tra

- Kiểm tra mỗi 1 giờ
- Hiển thị popup thông báo
- TTS đọc cho người khiếm thị
- Tải APK và cài đặt

## Files

- `version.json` - Thông tin phiên bản hiện tại
- `client/js/auto-update.js` - Logic kiểm tra và cập nhật
- `client/css/auto-update.css` - Giao diện popup
- `update-version.js` - Script cập nhật version.json
- `AUTO-UPDATE-GUIDE.md` - Hướng dẫn chi tiết

## Test

```javascript
// Trong browser console
autoUpdater.manualCheck();
```

Xem chi tiết: [AUTO-UPDATE-GUIDE.md](AUTO-UPDATE-GUIDE.md)
