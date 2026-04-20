# One Piece Arena v2.0 - Client-Side Edition

## Tổng quan thay đổi

Dự án đã được chuyển đổi từ **server-authoritative** sang **client-side game** để:
- ✅ Chạy hoàn toàn offline (không cần internet)
- ✅ Giảm tải server (server chỉ relay messages cho multiplayer)
- ✅ Sẵn sàng đóng gói thành APK Android
- ✅ Phản hồi nhanh hơn (không có network latency)

## Các file mới

### Client-side game engine
- `client/js/game-engine-client.js` - Game logic chạy trên client
- `client/js/ai-bot-client.js` - AI bot cho chế độ offline
- `client/js/heroes-data.js` - Dữ liệu heroes (copy từ shared)

### Âm thanh mới
- `client/sounds/menu/` - Âm thanh menu (move, select, back)
- `client/sounds/common/` - Âm thanh game (jump, walk, hit, miss, heal)

### Tài liệu
- `ANDROID-BUILD.md` - Hướng dẫn build APK Android

## Chế độ chơi

### 1. Offline Mode (Mới)
- Chơi đơn với AI bot
- 3 độ khó: Dễ, Trung bình, Khó
- Không cần internet
- Game logic chạy 100% trên client

### 2. Online Mode (Giữ nguyên)
- Multiplayer 1v1 hoặc 2v2
- Cần kết nối server: https://web-production-42989.up.railway.app
- Server chỉ làm relay, không tính toán game logic

## Kiến trúc mới

```
┌─────────────────────────────────────┐
│         CLIENT (Browser/App)        │
├─────────────────────────────────────┤
│  • Game Engine (Physics + Combat)   │
│  • AI Bot (3 difficulties)          │
│  • Heroes Data                      │
│  • Audio Manager                    │
│  • TTS Manager                      │
│  • Touch Controls                   │
└─────────────────────────────────────┘
              │
              │ (Optional - Multiplayer only)
              ▼
┌─────────────────────────────────────┐
│      SERVER (Railway/Node.js)       │
├─────────────────────────────────────┤
│  • WebSocket Relay                  │
│  • Room Management                  │
│  • Player Matching                  │
└─────────────────────────────────────┘
```

## Cách chạy

### Chế độ Offline (Không cần server)
1. Mở `client/index.html` trực tiếp trong browser
2. Chọn "Chơi đơn (Offline)"
3. Chọn độ khó AI
4. Chọn hero và bắt đầu

### Chế độ Online (Cần server)
1. Start server: `npm start`
2. Truy cập: http://localhost:3000
3. Tạo phòng hoặc vào phòng có sẵn

## Build Android

Xem chi tiết trong `ANDROID-BUILD.md`

**Nhanh nhất:**
```bash
npm install -g cordova
cordova create OnePieceArena com.onepiecearena.game "One Piece Arena"
cd OnePieceArena
rm -rf www/*
cp -r ../one-piece-arena/client/* www/
cordova platform add android
cordova build android
```

APK sẽ ở: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

## Lợi ích cho người khiếm thị

1. **Offline-first**: Không cần internet, chơi mọi lúc mọi nơi
2. **TTS native**: Text-to-Speech hoạt động tốt trên Android
3. **Touch controls**: Cử chỉ vuốt đơn giản, dễ nhớ
4. **Audio feedback**: Mọi hành động đều có âm thanh phản hồi
5. **No lag**: Game chạy local, không bị delay mạng

## Commits

```
6f4c065 Add Android build guide for WebView packaging
794aa41 Add offline client-side game mode for Android
d2cb4f8 Add new sound effects for menu and gameplay actions
```

## Tiếp theo

- [ ] Test APK trên thiết bị Android thật
- [ ] Thu thập feedback từ người khiếm thị
- [ ] Tối ưu audio (compress WAV → OGG)
- [ ] Publish lên Google Play Store
