# ⚠️ Cần cài Java để build APK

## Vấn đề

Máy bạn chưa có Java JDK, cần thiết để build Android APK.

## Giải pháp

### Cách 1: Cài Java JDK (Khuyến nghị)

1. **Download Java JDK 11:**
   - Link: https://adoptium.net/temurin/releases/?version=11
   - Chọn: Windows x64, JDK 11 (LTS)
   - Download file `.msi`

2. **Cài đặt:**
   - Chạy file `.msi` vừa tải
   - Tick "Set JAVA_HOME variable"
   - Tick "Add to PATH"
   - Click Install

3. **Kiểm tra:**
   ```bash
   java -version
   ```
   Phải hiện: `openjdk version "11.x.x"`

4. **Build APK:**
   ```bash
   cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena\android-app"
   gradlew.bat assembleDebug
   ```

### Cách 2: Dùng Android Studio (Dễ hơn)

Android Studio đã có Java built-in, không cần cài riêng:

1. **Download Android Studio:**
   - Link: https://developer.android.com/studio
   - File: ~1GB

2. **Cài đặt:**
   - Chạy installer
   - Chọn "Standard" installation
   - Đợi download SDK (~3GB)

3. **Mở project:**
   - File → Open
   - Chọn: `C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena\android-app`
   - Đợi Gradle sync

4. **Build APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Đợi 2-5 phút
   - Click "locate" để mở thư mục chứa APK

**APK sẽ ở:**
```
android-app\app\build\outputs\apk\debug\app-debug.apk
```

## Khuyến nghị

**Dùng Android Studio** vì:
- ✅ Dễ dàng hơn (GUI)
- ✅ Có Java built-in
- ✅ Có tools debug
- ✅ Có emulator test
- ✅ Quản lý SDK tự động

**Dùng Java JDK + Gradle** nếu:
- ✅ Muốn build nhanh qua command line
- ✅ Đã quen với terminal
- ✅ Không cần GUI

## Sau khi cài xong

Chạy lại lệnh build:
```bash
cd "C:\Users\MINH HIEU\Downloads\lap trinh abk\one-piece-arena\android-app"
gradlew.bat assembleDebug
```

APK sẽ được tạo tại:
```
app\build\outputs\apk\debug\app-debug.apk
```

## Lưu ý

- Lần build đầu tiên sẽ lâu (5-10 phút) vì phải download dependencies
- Cần kết nối internet để download Gradle và Android SDK
- Cần ~5GB dung lượng trống

---

**Tóm tắt:** Cài Android Studio (dễ nhất) hoặc Java JDK 11, sau đó build APK.
