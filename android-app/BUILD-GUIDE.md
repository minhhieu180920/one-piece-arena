# Android Build Guide

## Cách build APK

### Option 1: Dùng Android Studio (Khuyến nghị)

1. Mở Android Studio
2. File → Open → Chọn thư mục `android-app`
3. Đợi Gradle sync xong
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. APK sẽ ở: `android-app/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Dùng Command Line

```bash
cd android-app

# Windows
gradlew.bat assembleDebug

# Linux/Mac
./gradlew assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`

## Build Release APK (Signed)

### Tạo keystore

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### Cấu hình signing

Thêm vào `app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("my-release-key.jks")
            storePassword "your-password"
            keyAlias "my-key-alias"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

### Build release

```bash
cd android-app
gradlew assembleRelease
```

APK output: `app/build/outputs/apk/release/app-release.apk`

## Cài đặt APK

```bash
# Qua ADB
adb install app-debug.apk

# Hoặc copy file APK vào điện thoại và mở
```

## Yêu cầu

- Android Studio Arctic Fox hoặc mới hơn
- JDK 8 hoặc 11
- Android SDK API 34
- Gradle 8.0+

## Troubleshooting

### Lỗi "SDK not found"
- Mở Android Studio → Tools → SDK Manager
- Cài Android SDK Platform 34

### Lỗi Gradle sync
- File → Invalidate Caches / Restart

### APK không chạy âm thanh
- Kiểm tra file sounds đã copy vào assets chưa
- Kiểm tra permissions trong AndroidManifest.xml
