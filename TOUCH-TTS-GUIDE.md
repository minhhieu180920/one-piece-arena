# Hướng dẫn Cử chỉ và TTS cho Android

## ✅ Đã tích hợp sẵn

One Piece Arena đã có đầy đủ:
- ✅ **Touch Controls** - Cử chỉ vuốt cho Android
- ✅ **Google TTS** - Text-to-Speech tiếng Việt
- ✅ **Auto-detect Mobile** - Tự động kích hoạt khi chạy trên Android

---

## 📱 Cử chỉ điều khiển (Touch Controls)

### Chia màn hình làm 2 vùng:

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   BÊN TRÁI      │   BÊN PHẢI      │
│   Di chuyển     │   Kỹ năng       │
│                 │                 │
└─────────────────┴─────────────────┘
```

### Bên TRÁI (Di chuyển):
- **Vút trái** ← : Di chuyển sang trái
- **Vút phải** → : Di chuyển sang phải
- **Vút lên** ↑ : Nhảy

### Bên PHẢI (Kỹ năng):
- **Vút lên** ↑ : Kỹ năng 1 (Q)
- **Vút xuống** ↓ : Kỹ năng 2 (W)
- **Vút trái** ← : Kỹ năng 3 (E)
- **Vút phải** → : Kỹ năng 4 (R)

### Lưu ý:
- Khoảng cách vuốt tối thiểu: 50px
- Màn hình tự động khóa ngang (landscape)
- TTS sẽ đọc mỗi hành động

---

## 🔊 Google TTS (Text-to-Speech)

### Tự động đọc:
- ✅ Tên menu khi di chuyển
- ✅ Tên hero khi chọn
- ✅ Hành động game (nhảy, di chuyển, kỹ năng)
- ✅ Sát thương gây ra và nhận vào
- ✅ HP còn lại
- ✅ Kết quả trận đấu

### Giọng đọc:
- **Ưu tiên**: Tiếng Việt (nếu có)
- **Dự phòng**: Tiếng Anh
- **Tốc độ**: 1.0x (bình thường)
- **Âm lượng**: 100%

### Trên Android:
- Google TTS được cài sẵn trên hầu hết thiết bị Android
- Hỗ trợ tiếng Việt tự nhiên
- Không cần cài thêm gì

---

## 🎮 Ví dụ chơi game

### Bắt đầu trận đấu:
1. Mở app → TTS: "Chào mừng đến với One Piece Arena"
2. Chọn "Chơi đơn" → TTS: "Chế độ chơi đơn, độ khó Trung bình"
3. Chọn Luffy → TTS: "Đã chọn Luffy Gear 5"
4. Game bắt đầu → TTS: "Trận đấu bắt đầu! Bạn là Luffy Gear 5, đối thủ là Zoro Timeskip"

### Trong trận đấu:
- Vút trái (bên trái) → TTS: "Di chuyển trái"
- Vút lên (bên trái) → TTS: "Nhảy"
- Vút lên (bên phải) → TTS: "Dùng Gomu Gomu no Pistol. Sát thương 80"
- Đánh trúng → TTS: "Gây 80 sát thương. Đối thủ còn 920 máu"
- Bị đánh → TTS: "Bị tấn công! Mất 90 máu. Còn 910 máu"

### Kết thúc:
- Thắng → TTS: "Chiến thắng! Bạn đã thắng trận đấu"
- Thua → TTS: "Thất bại! Bạn đã thua trận đấu"

---

## ⚙️ Cấu hình Android WebView

Để TTS và Touch hoạt động tốt, cần cấu hình WebView:

### MainActivity.java
```java
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);
settings.setMediaPlaybackRequiresUserGesture(false); // Quan trọng cho TTS
```

### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
<activity
    android:screenOrientation="landscape"
    android:configChanges="orientation|screenSize">
</activity>
```

---

## 🧪 Test trên Android

### Test Touch Controls:
1. Mở app trên điện thoại
2. Vào chế độ chơi đơn
3. Thử vuốt bên trái → Nhân vật di chuyển
4. Thử vuốt bên phải → Dùng kỹ năng

### Test TTS:
1. Bật âm lượng điện thoại
2. Mở app
3. Nghe TTS: "Chào mừng đến với One Piece Arena"
4. Di chuyển menu → Nghe TTS đọc tên menu

### Test trên Chrome Android (trước khi build APK):
1. Mở Chrome trên Android
2. Truy cập: https://web-production-42989.up.railway.app
3. Test touch và TTS ngay trên web

---

## 🐛 Troubleshooting

### TTS không đọc:
- Kiểm tra âm lượng điện thoại
- Vào Settings → Accessibility → Text-to-speech
- Cài Google TTS từ Play Store (nếu chưa có)
- Tải gói ngôn ngữ tiếng Việt

### Touch không hoạt động:
- Kiểm tra màn hình có bị khóa không
- Thử chạm vào màn hình trước (để init audio)
- Kiểm tra WebView settings

### Màn hình không khóa ngang:
- Thêm `android:screenOrientation="landscape"` vào AndroidManifest.xml
- Hoặc tắt auto-rotate trong settings điện thoại

---

## 📊 So sánh với PC

| Tính năng | PC (Keyboard) | Android (Touch) |
|-----------|---------------|-----------------|
| Di chuyển | Arrow keys | Vút trái/phải |
| Nhảy | Space | Vút lên (bên trái) |
| Kỹ năng | Q/W/E/R | Vút 4 hướng (bên phải) |
| TTS | ✅ | ✅ |
| Âm thanh | ✅ | ✅ |
| Offline | ✅ | ✅ |
| Multiplayer | ✅ | ✅ |

---

## 🎯 Tối ưu cho người khiếm thị

### Đã làm:
- ✅ TTS đọc mọi hành động
- ✅ Cử chỉ đơn giản, dễ nhớ
- ✅ Phản hồi âm thanh ngay lập tức
- ✅ Không cần nhìn màn hình
- ✅ ARIA labels cho screen reader

### Có thể cải thiện:
- [ ] Rung (vibration) khi đánh trúng
- [ ] Âm thanh 3D (stereo) để định vị đối thủ
- [ ] Cử chỉ tùy chỉnh
- [ ] Tốc độ TTS có thể điều chỉnh

---

## 📝 Tóm tắt

**Cử chỉ:**
- Bên trái: Di chuyển (trái/phải/nhảy)
- Bên phải: Kỹ năng (4 hướng)

**TTS:**
- Google TTS tích hợp sẵn
- Đọc tiếng Việt tự động
- Đọc mọi hành động game

**Sẵn sàng:**
- ✅ Code đã hoàn chỉnh
- ✅ Chỉ cần build APK
- ✅ Test ngay trên Chrome Android
