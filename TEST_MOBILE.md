# Checklist Test TTS và Touch Controls trên Mobile

## Chuẩn bị
- [ ] Mở https://web-production-42989.up.railway.app trên điện thoại
- [ ] Bật âm lượng điện thoại
- [ ] Xoay màn hình ngang (landscape)

## Test TTS (Text-to-Speech)

### Test 1: Welcome Message
- [ ] Mở game lần đầu
- [ ] Chạm vào màn hình
- [ ] **Kỳ vọng**: Nghe "Chào mừng đến với One Piece Arena. Game đối kháng cho người khiếm thị"

### Test 2: Menu Sounds
- [ ] Chạm vào nút "Tạo phòng 1v1"
- [ ] **Kỳ vọng**: Nghe âm thanh click và TTS "Đang tạo phòng 1v1"
- [ ] Chạm vào nút "1v1 vs AI"
- [ ] **Kỳ vọng**: Nghe âm thanh menu

### Test 3: Hero Selection
- [ ] Vào phòng, chọn Luffy
- [ ] **Kỳ vọng**: Nghe âm thanh chọn hero
- [ ] Chọn Zoro
- [ ] **Kỳ vọng**: Nghe âm thanh khác

### Test 4: In-Game TTS
- [ ] Bắt đầu trận đấu với AI (độ khó Dễ)
- [ ] Dùng kỹ năng (vuốt bên phải)
- [ ] **Kỳ vọng**: Nghe "Bạn gây X sát thương"
- [ ] Bị AI đánh
- [ ] **Kỳ vọng**: Nghe "Bạn nhận X sát thương, HP còn Y"
- [ ] Dùng kỹ năng đang hồi chiêu
- [ ] **Kỳ vọng**: Nghe "Kỹ năng đang hồi chiêu"

## Test Touch Controls

### Test 5: Di chuyển (Bên trái màn hình)
- [ ] Vuốt trái → nhân vật di chuyển sang trái
- [ ] Vuốt phải → nhân vật di chuyển sang phải
- [ ] Vuốt lên → nhân vật nhảy
- [ ] **Kỳ vọng**: Nghe âm thanh nhảy

### Test 6: Kỹ năng (Bên phải màn hình)
- [ ] Vuốt lên → Kỹ năng 1 (Q)
- [ ] Vuốt phải → Kỹ năng 2 (W)
- [ ] Vuốt xuống → Kỹ năng 3 (E)
- [ ] Vuốt trái → Kỹ năng 4 (R)
- [ ] **Kỳ vọng**: Mỗi kỹ năng có âm thanh riêng từ One Piece

### Test 7: Độ nhạy cử chỉ
- [ ] Vuốt nhanh → phản hồi ngay
- [ ] Vuốt chậm → vẫn nhận diện
- [ ] Vuốt ngắn → hoạt động
- [ ] Vuốt dài → hoạt động

## Test với Screen Reader

### Test 8: VoiceOver (iPhone) / TalkBack (Android)
- [ ] Bật VoiceOver/TalkBack
- [ ] Vuốt qua các nút
- [ ] **Kỳ vọng**: Screen reader đọc aria-label của mỗi nút
- [ ] Chạm 2 lần để chọn
- [ ] **Kỳ vọng**: Nút được kích hoạt

### Test 9: Game với Screen Reader
- [ ] Chơi 1 trận với VoiceOver/TalkBack bật
- [ ] **Kỳ vọng**: TTS game vẫn hoạt động song song với screen reader
- [ ] Kiểm tra có bị xung đột âm thanh không

## Test Trình duyệt khác nhau

### Test 10: Chrome Mobile
- [ ] Mở game trên Chrome
- [ ] Test TTS
- [ ] Test touch controls
- [ ] **Kết quả**: ___________

### Test 11: Safari (iPhone)
- [ ] Mở game trên Safari
- [ ] Test TTS
- [ ] Test touch controls
- [ ] **Kết quả**: ___________

### Test 12: Firefox Mobile
- [ ] Mở game trên Firefox
- [ ] Test TTS
- [ ] Test touch controls
- [ ] **Kết quả**: ___________

## Test Edge Cases

### Test 13: Xoay màn hình
- [ ] Chơi ở chế độ ngang
- [ ] Xoay dọc
- [ ] **Kỳ vọng**: Game vẫn khóa ngang
- [ ] Xoay lại ngang
- [ ] **Kỳ vọng**: Hoạt động bình thường

### Test 14: Tắt/Bật âm thanh
- [ ] Chơi với âm lượng 100%
- [ ] Giảm xuống 50%
- [ ] Giảm xuống 0%
- [ ] **Kỳ vọng**: TTS vẫn hoạt động (dùng volume hệ thống)

### Test 15: Kết nối mạng
- [ ] Chơi với WiFi tốt
- [ ] Chuyển sang 4G/5G
- [ ] **Kỳ vọng**: Game vẫn mượt, TTS không bị delay
- [ ] Mất kết nối
- [ ] **Kỳ vọng**: Thông báo lỗi

## Bugs cần fix (nếu có)

### Bug 1: _________________
- **Mô tả**: 
- **Cách tái hiện**: 
- **Thiết bị**: 
- **Trình duyệt**: 

### Bug 2: _________________
- **Mô tả**: 
- **Cách tái hiện**: 
- **Thiết bị**: 
- **Trình duyệt**: 

## Kết luận
- [ ] TTS hoạt động tốt trên mobile
- [ ] Touch controls dễ sử dụng
- [ ] Không có bug nghiêm trọng
- [ ] Sẵn sàng cho người khiếm thị sử dụng

## Ghi chú thêm
___________________________________________
___________________________________________
___________________________________________
