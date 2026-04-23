# 📱 Hướng dẫn Build APK - One Piece Arena

## ✅ Project đã sẵn sàng!

Tất cả file đã được tạo trong thư mục `android-app/`

**Kích thước:** ~53MB (bao gồm âm thanh)

## 🚀 Cách build APK

### Cách 1: Dùng Android Studio (Dễ nhất)

1. **Mở Android Studio**
2. **File → Open** → Chọn thư mục:
   ```
   C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena\android-app
   ```
3. **Đợi Gradle sync** (lần đầu mất 2-5 phút)
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. **Đợi build xong** → Click "locate" để mở thư mục chứa APK

**APK sẽ ở:**
```
android-app\app\build\outputs\apk\debug\app-debug.apk
```

### Cách 2: Command Line (Nếu đã cài Gradle)

```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena\android-app"
gradlew.bat assembleDebug
```

## 📦 Cài đặt APK

### Trên điện thoại:

1. Copy file `app-debug.apk` vào điện thoại
2. Mở file APK
3. Cho phép "Install from unknown sources" nếu hỏi
4. Nhấn Install

### Qua ADB (nếu có):

```bash
adb install app-debug.apk
```

## 🎯 Tính năng APK

- ✅ Chạy hoàn toàn offline
- ✅ Âm thanh 3D stereo
- ✅ AI Bot (3 độ khó)
- ✅ Touch controls
- ✅ Auto-update system
- ✅ Fullscreen mode
- ✅ Hỗ trợ người khiếm thị

## 📋 Yêu cầu

- **Android:** 7.0 (API 24) trở lên
- **Dung lượng:** ~40MB
- **Permissions:**
  - Internet (cho multiplayer và auto-update)
  - Storage (cho tải APK mới)

## 🔧 Nếu gặp lỗi

### Android Studio không mở được project
- Cài Android Studio mới nhất: https://developer.android.com/studio
- Cài JDK 11: https://adoptium.net/

### Gradle sync failed
- Android Studio → File → Invalidate Caches / Restart
- Hoặc: Tools → SDK Manager → Cài Android SDK Platform 34

### APK không cài được
- Bật "Install from unknown sources" trong Settings
- Hoặc build release APK với signing key

## 📝 Build Release APK (Để publish)

1. Tạo keystore:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. Thêm signing config vào `app/build.gradle`

3. Build:
```bash
gradlew.bat assembleRelease
```

Xem chi tiết trong `BUILD-GUIDE.md`

## 🎮 Test APK

Sau khi cài:
1. Mở app "One Piece Arena"
2. Chọn "Chơi đơn (Offline)"
3. Chọn độ khó
4. Chọn hero
5. Chơi game!

## 📱 Upload lên server (cho auto-update)

Sau khi build xong:

1. Đổi tên APK:
```bash
cp app-debug.apk OnePieceArena-v2.0.0.apk
```

2. Upload lên server hoặc GitHub Releases

3. Cập nhật `version.json`:
```bash
node update-version.js 2.0.0 2 "https://url-to-apk.apk" "Offline mode" "AI Bot" "3D Audio"
```

4. Push lên GitHub:
```bash
git add version.json
git commit -m "Release v2.0.0"
git push
```

## ✨ Hoàn tất!

Project Android đã sẵn sàng build. Chỉ cần mở Android Studio và build APK!
