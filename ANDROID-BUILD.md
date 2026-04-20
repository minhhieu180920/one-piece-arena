# Hướng dẫn đóng gói Android

## Cách 1: Sử dụng Android Studio (Khuyến nghị)

### Bước 1: Tạo project Android mới
1. Mở Android Studio
2. New Project → Empty Activity
3. Đặt tên: `OnePieceArena`
4. Package name: `com.onepiecearena.game`
5. Language: Java hoặc Kotlin
6. Minimum SDK: API 24 (Android 7.0)

### Bước 2: Copy file game vào assets
1. Tạo thư mục `assets` trong `app/src/main/`
2. Copy toàn bộ thư mục `client` vào `assets/www/`
   - `assets/www/index.html`
   - `assets/www/js/`
   - `assets/www/css/`
   - `assets/www/sounds/`

### Bước 3: Cấu hình WebView

**File: `app/src/main/AndroidManifest.xml`**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="One Piece Arena"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize"
            android:screenOrientation="landscape"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**File: `app/src/main/java/.../MainActivity.java`**
```java
package com.onepiecearena.game;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // WebView settings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // Load game
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

**File: `app/src/main/res/layout/activity_main.xml`**
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</RelativeLayout>
```

### Bước 4: Build APK
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Đợi build xong
3. File APK sẽ ở: `app/build/outputs/apk/debug/app-debug.apk`

---

## Cách 2: Sử dụng Cordova (Nhanh hơn)

### Cài đặt Cordova
```bash
npm install -g cordova
```

### Tạo project
```bash
cordova create OnePieceArena com.onepiecearena.game "One Piece Arena"
cd OnePieceArena
```

### Copy file game
```bash
# Xóa www mặc định
rm -rf www/*

# Copy client vào www
cp -r ../one-piece-arena/client/* www/
```

### Thêm platform Android
```bash
cordova platform add android
```

### Cấu hình config.xml
```xml
<widget id="com.onepiecearena.game" version="2.0.0">
    <name>One Piece Arena</name>
    <description>Game đối kháng cho người khiếm thị</description>
    
    <preference name="Orientation" value="landscape" />
    <preference name="Fullscreen" value="true" />
    <preference name="DisallowOverscroll" value="true" />
    
    <platform name="android">
        <preference name="android-minSdkVersion" value="24" />
        <preference name="android-targetSdkVersion" value="33" />
    </platform>
</widget>
```

### Build APK
```bash
cordova build android
```

APK sẽ ở: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Cách 3: Sử dụng Capacitor (Modern)

### Cài đặt
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "One Piece Arena" com.onepiecearena.game
npm install @capacitor/android
npx cap add android
```

### Copy assets
```bash
npx cap copy android
```

### Build
```bash
npx cap open android
# Sau đó build trong Android Studio
```

---

## Lưu ý quan trọng

1. **Socket.io cho multiplayer**: Cần sửa URL kết nối
   ```javascript
   // Trong game.js, thay đổi:
   this.socket = io('https://web-production-42989.up.railway.app');
   ```

2. **Offline mode**: Game đã hỗ trợ chơi hoàn toàn offline với AI

3. **Âm thanh**: Đảm bảo tất cả file .wav đã được copy vào assets

4. **TTS**: Text-to-Speech hoạt động native trên Android

5. **Touch controls**: Đã được tích hợp sẵn

---

## Test trên thiết bị

### Cài APK qua USB
```bash
adb install app-debug.apk
```

### Hoặc copy APK sang điện thoại và cài thủ công

---

## Tối ưu cho production

1. **Minify code**: Sử dụng webpack/rollup
2. **Compress audio**: Chuyển WAV sang OGG/MP3
3. **Signed APK**: Tạo keystore và sign APK
4. **ProGuard**: Enable code obfuscation

```bash
# Build release APK
cordova build android --release
```
