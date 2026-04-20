# Hướng dẫn hệ thống Auto-Update

## Tổng quan

Hệ thống auto-update cho phép ứng dụng Android tự động kiểm tra và thông báo khi có phiên bản mới, sau đó tải về và cài đặt APK mới.

## Cách hoạt động

1. **Kiểm tra tự động**: Ứng dụng kiểm tra phiên bản mới mỗi 1 giờ
2. **Thông báo**: Hiển thị popup với danh sách thay đổi
3. **TTS**: Đọc thông báo cập nhật cho người khiếm thị
4. **Tải về**: Tải APK mới từ server
5. **Cài đặt**: Người dùng mở file APK để cài đặt

## Cấu trúc file

```
one-piece-arena/
├── version.json              # File cấu hình phiên bản
├── client/
│   ├── js/auto-update.js    # Logic auto-update
│   ├── css/auto-update.css  # Giao diện thông báo
│   └── index.html           # Đã tích hợp auto-update
└── server/index.js          # Serve version.json
```

## File version.json

```json
{
  "version": "2.0.0",
  "versionCode": 2,
  "releaseDate": "2026-04-20",
  "downloadUrl": "https://web-production-42989.up.railway.app/downloads/OnePieceArena-v2.0.0.apk",
  "changelog": [
    "Offline Mode - Chơi không cần internet",
    "AI Bot với 3 độ khó",
    "Âm thanh 3D stereo cho người khiếm thị"
  ],
  "minVersion": "1.0.0",
  "forceUpdate": false
}
```

### Các trường quan trọng

- **version**: Phiên bản dạng text (hiển thị cho user)
- **versionCode**: Số phiên bản (dùng để so sánh, phải tăng dần)
- **downloadUrl**: Link tải APK mới
- **changelog**: Danh sách thay đổi (hiển thị trong popup)
- **forceUpdate**: `true` = bắt buộc cập nhật, `false` = có thể bỏ qua

## Cách phát hành phiên bản mới

### Bước 1: Build APK mới

```bash
# Build APK với Cordova
cd one-piece-arena
cordova build android --release

# APK sẽ ở: platforms/android/app/build/outputs/apk/release/
```

### Bước 2: Upload APK lên server

Có 2 cách:

**Cách 1: Dùng Railway (khuyến nghị)**
```bash
# Tạo thư mục downloads trong project
mkdir -p client/downloads

# Copy APK vào
cp platforms/android/app/build/outputs/apk/release/app-release.apk \
   client/downloads/OnePieceArena-v2.1.0.apk

# Commit và push
git add client/downloads/
git commit -m "Add APK v2.1.0"
git push
```

**Cách 2: Dùng GitHub Releases**
1. Vào https://github.com/minhhieu180920/one-piece-arena/releases
2. Click "Create a new release"
3. Upload APK file
4. Copy download URL

### Bước 3: Cập nhật version.json

```bash
# Chạy script tự động (khuyến nghị)
node update-version.js 2.1.0 3 "https://url-to-apk.apk" "Tính năng 1" "Tính năng 2"

# Hoặc sửa thủ công version.json
```

### Bước 4: Deploy lên server

```bash
git add version.json
git commit -m "Update to v2.1.0"
git push

# Railway sẽ tự động deploy
```

## Script tự động cập nhật version.json

File `update-version.js` giúp cập nhật version.json nhanh chóng:

```bash
# Cú pháp
node update-version.js <version> <versionCode> <downloadUrl> [changelog...]

# Ví dụ
node update-version.js 2.1.0 3 \
  "https://web-production-42989.up.railway.app/downloads/OnePieceArena-v2.1.0.apk" \
  "Thêm hero mới: Sanji" \
  "Cải thiện AI bot" \
  "Sửa lỗi âm thanh"
```

## Kiểm tra thủ công

Người dùng có thể kiểm tra cập nhật bằng cách:

```javascript
// Trong console hoặc thêm button
autoUpdater.manualCheck();
```

## Tính năng cho người khiếm thị

1. **TTS thông báo**: Đọc to thông tin phiên bản mới
2. **Button lớn**: Dễ chạm trên màn hình
3. **ARIA labels**: Hỗ trợ screen reader
4. **Âm thanh xác nhận**: Khi bắt đầu tải

## Lưu ý quan trọng

### Bảo mật
- Chỉ dùng HTTPS cho downloadUrl
- Xác thực APK signature khi cài đặt
- Không lưu APK trong git (quá lớn)

### Android permissions
Cần thêm vào `config.xml` của Cordova:

```xml
<platform name="android">
  <config-file target="AndroidManifest.xml" parent="/*">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
  </config-file>
</platform>
```

### Testing
1. Test trên browser trước (localhost)
2. Test APK trên thiết bị thật
3. Test với kết nối chậm
4. Test với người khiếm thị thật

## Troubleshooting

### Không hiện thông báo cập nhật
- Kiểm tra console: `autoUpdater.manualCheck()`
- Xem network tab: có fetch `/version.json` không?
- Kiểm tra versionCode trong version.json > currentVersionCode

### Không tải được APK
- Kiểm tra downloadUrl có đúng không
- Kiểm tra CORS headers
- Kiểm tra file APK có tồn tại không

### Cài đặt APK bị lỗi
- Kiểm tra signature của APK
- Bật "Install from unknown sources" trên Android
- Kiểm tra permissions trong AndroidManifest.xml

## Roadmap

- [ ] Tích hợp Google Play In-App Updates
- [ ] Delta updates (chỉ tải phần thay đổi)
- [ ] Background download
- [ ] Rollback nếu cập nhật lỗi
- [ ] A/B testing cho phiên bản mới
