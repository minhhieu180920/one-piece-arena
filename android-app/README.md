# One Piece Arena - Android App

Android native app với WebView để chạy One Piece Arena game.

## Cấu trúc

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/onepiecearena/game/
│   │   │   └── MainActivity.java
│   │   ├── res/
│   │   │   ├── layout/activity_main.xml
│   │   │   ├── values/strings.xml
│   │   │   └── values/themes.xml
│   │   ├── assets/
│   │   │   ├── index.html
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── sounds/
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── BUILD-GUIDE.md
```

## Build APK

Xem chi tiết trong [BUILD-GUIDE.md](BUILD-GUIDE.md)

### Nhanh nhất:

1. Mở Android Studio
2. Open project → Chọn thư mục `android-app`
3. Build → Build APK(s)

### Hoặc dùng command line:

```bash
cd android-app
gradlew.bat assembleDebug
```

APK sẽ ở: `app/build/outputs/apk/debug/app-debug.apk`

## Tính năng

- ✅ WebView với JavaScript enabled
- ✅ Offline mode (tất cả file trong assets)
- ✅ Âm thanh 3D
- ✅ Touch controls
- ✅ Auto-update system
- ✅ Fullscreen immersive mode
- ✅ Back button navigation

## Yêu cầu

- Android 7.0 (API 24) trở lên
- ~40MB dung lượng (bao gồm âm thanh)

## Version

- App version: 2.0.0
- Version code: 2
- Target SDK: 34
