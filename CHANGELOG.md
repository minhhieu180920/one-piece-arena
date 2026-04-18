# Changelog

## [1.0.1] - 2026-04-18

### Fixed
- Sửa lỗi undefined event trong heroSelected handler
- Thêm xử lý leaveRoom event trên server
- Sửa selectHero để highlight hero card đúng cách
- Cải thiện leaveRoom để reset game state đúng
- Loại bỏ code thừa trong updatePlayersInRoom

### Technical
- Sửa lỗi tham chiếu event không tồn tại
- Thêm emit leaveRoom từ client đến server
- Cải thiện xử lý disconnect và leave room

## [1.0.0] - 2026-04-18

### Added
- Game đối kháng One Piece multiplayer
- 3 heroes: Luffy Gear 5, Zoro Timeskip, Sanji Raid Suit
- 2 chế độ chơi: 1v1 và 2v2
- AI Bot với 3 độ khó: Easy, Medium, Hard
- Hệ thống âm thanh đầy đủ từ Burning Blood
- Di chuyển 2D với nhảy và né
- Real-time multiplayer qua WebSocket
- Hỗ trợ tối đa 7 người online
