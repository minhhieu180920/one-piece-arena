# One Piece Arena 🏴‍☠️

Game đối kháng One Piece với âm thanh từ Burning Blood.

## Tính năng

- ⚔️ 2 chế độ: 1v1 và 2v2
- 👥 Hỗ trợ tối đa 7 người online
- 🎮 3 Heroes: Luffy Gear 5, Zoro Timeskip, Sanji Raid Suit
- 🔊 Âm thanh đầy đủ cho skills và voice lines
- 📱 Chơi được trên cả PC và mobile

## Cài đặt

```bash
cd one-piece-arena
npm install
```

## Chạy server

```bash
npm start
```

Server sẽ chạy tại: http://localhost:3000

## Cách chơi

1. Mở trình duyệt vào http://localhost:3000
2. Tạo phòng hoặc vào phòng có sẵn
3. Chọn hero
4. Nhấn "Sẵn sàng"
5. Sử dụng phím Q, W, E, R để dùng skills

## Kỹ năng mỗi Hero

### Luffy Gear 5
- Q: Gomu Gomu no Pistol (80 damage, 2s cooldown)
- W: Gomu Gomu no Gatling (150 damage, 5s cooldown)
- E: Gomu Gomu no Bazooka (200 damage, 8s cooldown)
- R: Gear 5 Ultimate (350 damage, 15s cooldown)

### Zoro Timeskip
- Q: Oni Giri (90 damage, 2s cooldown)
- W: Santoryu Ogi (160 damage, 5s cooldown)
- E: Asura (220 damage, 8s cooldown)
- R: Ichidai Sanzen Daisen Sekai (380 damage, 15s cooldown)

### Sanji Raid Suit
- Q: Diable Jambe (85 damage, 2s cooldown)
- W: Concasse (155 damage, 5s cooldown)
- E: Hell Memories (210 damage, 8s cooldown)
- R: Ifrit Jambe (360 damage, 15s cooldown)

## Tech Stack

- Backend: Node.js + Express + Socket.io
- Frontend: HTML5 Canvas + Web Audio API
- Real-time: WebSocket

## Lưu ý

- Cần bật âm thanh trên trình duyệt
- Click vào trang web để kích hoạt audio
- Tối đa 7 người có thể online cùng lúc
