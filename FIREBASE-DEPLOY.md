# Deploy lên Firebase

## Bước 1: Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
```

## Bước 2: Đăng nhập Firebase

```bash
firebase login
```

## Bước 3: Khởi tạo Firebase trong project

```bash
cd one-piece-arena
firebase init
```

Chọn:
- ✅ Hosting
- ✅ Functions (cho server Node.js)
- Chọn project: `game-one-piece-1053e`

## Bước 4: Cấu hình Firebase

### firebase.json
```json
{
  "hosting": {
    "public": "client",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "app"
      }
    ]
  },
  "functions": {
    "source": ".",
    "runtime": "nodejs18"
  }
}
```

### Cấu trúc sau khi deploy
```
one-piece-arena/
├── client/          # Static files (Hosting)
├── server/          # Server code (Functions)
├── shared/          # Shared code
├── package.json     # Dependencies
└── firebase.json    # Config
```

## Bước 5: Deploy

```bash
firebase deploy
```

Hoặc deploy riêng:
```bash
firebase deploy --only hosting    # Chỉ hosting
firebase deploy --only functions  # Chỉ functions
```

## Lưu ý quan trọng

### 1. Firebase Functions
Firebase Functions có giới hạn:
- Free tier: 125K invocations/month
- Timeout: 60s (có thể tăng lên 540s)
- Memory: 256MB default

### 2. WebSocket trên Firebase
Firebase Hosting + Functions **KHÔNG hỗ trợ WebSocket** trực tiếp!

**Giải pháp:**
- Dùng Firebase Realtime Database thay cho Socket.io
- Hoặc deploy server riêng (Heroku, Railway, Render)
- Hoặc dùng Cloud Run cho WebSocket

## Giải pháp thay thế

### Option 1: Firebase Realtime Database (Recommended)
Thay Socket.io bằng Firebase Realtime Database để sync real-time.

### Option 2: Hybrid Deploy
- **Firebase Hosting**: Serve client files
- **Heroku/Railway**: Host WebSocket server
- Client connect đến server riêng

### Option 3: Cloud Run
Deploy server lên Google Cloud Run (hỗ trợ WebSocket).

## Deploy nhanh (Static only)

Nếu chỉ muốn test giao diện:

```bash
firebase init hosting
# Chọn public directory: client
firebase deploy --only hosting
```

URL: https://game-one-piece-1053e.web.app

## Kết luận

Do game này dùng WebSocket (Socket.io), **không thể deploy trực tiếp lên Firebase Hosting + Functions**.

**Khuyến nghị:**
1. Deploy client lên Firebase Hosting
2. Deploy server lên Railway/Render (free tier, hỗ trợ WebSocket)
3. Update client để connect đến server URL

Hoặc refactor code để dùng Firebase Realtime Database thay Socket.io.
