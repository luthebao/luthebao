---
title: "VPT Helper — Phần mềm hỗ trợ chơi game Vua Pháp Thuật"
date: 2016-05-20
lang: vi
---

**VPT Helper** là phần mềm hỗ trợ tự động (auto) dành cho game **Vua Pháp Thuật**, do mình phát triển và cập nhật trong nhiều năm. Bài viết này tổng hợp lại các thông tin cơ bản về phần mềm: yêu cầu hệ thống, hướng dẫn cài đặt, và các chức năng chính hiện có.

## Yêu cầu hệ thống

- Hệ điều hành: **Windows 10 64-bit** hoặc **Windows Server 2016 64-bit** trở về sau.
- Các tài khoản game cần để **chế độ hình ảnh cao nhất** trong game.
- Trong cài đặt Display của Windows: đặt **Scale màn hình về 100%**.

## Hướng dẫn cài đặt

**Bước 1 — Giải nén và phân quyền:**
Sau khi tải về, hãy giải nén vào ổ **D** hoặc **E** (không nên là ổ C để tránh các vấn đề về quyền admin). Tiếp đó, cấp **quyền Admin** cho toàn bộ thư mục auto. Nếu Windows Defender báo virus với file `VPTHelper.exe`, bạn cần **allow** nó trong Defender để phần mềm có thể chạy được.

**Lưu ý xử lý lỗi trị an / trừ ma:** Trước khi giải nén bản mới, chuột phải vào file `.zip` → chọn **Properties** → tích vào ô **Unblock** ở phía dưới → **Apply**. Bước này khắc phục lỗi do Windows chặn file tải từ Internet.

**Bước 2 — Mở chương trình:**
Mở file `VPTHelper.exe`. Từ phiên bản **3.2.0** trở đi, bạn **không cần kích hoạt** — phần mềm **hoàn toàn miễn phí**.

**Bước 3 — Sử dụng.**

## Quản lý key

Để quản lý key (đăng ký, gia hạn, kiểm tra trạng thái, đổi key cho các tính năng VIP), truy cập trang quản lý chính thức:

> 🔑 [**vpthelper.beyonderluu.com**](https://vpthelper.beyonderluu.com/)

Toàn bộ thao tác liên quan đến key đều được xử lý trên trang này. Bạn nên ghi lại key của mình ở nơi an toàn để tránh thất lạc.

## Các chức năng chính

1. **Auto Ngày mới** — chạy lần lượt các auto cơ bản theo lịch admin cài sẵn, bắt đầu từ 0h ngày mới: Auto phụ bản, Tu hành, Thần tu, Ước nguyện, nhận quà không gian điêu khắc, quà hành lang, và auto trồng cây, đấu pet lặp đi lặp lại.
    - Hoạt động từ **0h sáng đến 9h sáng** hàng ngày (sau 9h sẽ nghỉ tới 0h ngày hôm sau).
    - Hoạt động tất cả các ngày trừ giờ bảo trì.
2. **Auto Lập tức** — chạy ngay auto Phụ bản, Thần tu, Ước nguyện… mà không cần chờ tới 0h.
3. **Trị An** — chạy auto trị an. Hiện có thể chạy cho các tài khoản không VIP hoặc VIP thấp.
4. **Load Cache** — xoá cache và cập nhật cache mới nhất mà không cần load lại bản đồ. Sau khi sử dụng, đợi từ 5–10 phút để map được cập nhật.
5. **Trừ Ma** — chạy auto trừ ma, có thể party team để nhanh hơn. Không cần phù nhóm.
6. **VPT Login** — tích hợp từ VPT Login, các chức năng yêu cầu login qua VPT Login sẽ sử dụng được sau khi đăng nhập.
7. **Auto Clicks** — các chức năng bổ trợ: auto mở tàng bảo đồ, auto click ks shop limit, v.v.
8. **Auto Bắt Pet** — tự động bắt pet, hỗ trợ cả map chỉ có 1 NPC.
9. **Combo XT** — hướng dẫn bắn combo hệ cho xạ thủ, tích hợp **check realtime** để gợi ý skill theo hệ. Yêu cầu vào game bằng tính năng Login của phần mềm.
10. **Các tính năng VIP (đang phát triển)** — sẽ có thêm các chức năng VIP có tính phí, giá hợp lý, được mở khi đủ ổn định. Dự kiến bao gồm:
    - Auto Kỹ năng sống: Hái, Trồng, Câu.
    - Auto Đổi KP.
    - Auto Boss tộc.
    - Auto Nhiệm vụ 200 vòng.

## Ghi chú

Phần mềm được cập nhật thường xuyên. Những bạn đã sử dụng VPT Helper trước đây sẽ không lạ gì với phần lớn chức năng. Người dùng mới nên xem các video hướng dẫn để làm quen, đặc biệt là với **Auto Bắt Pet** và **Combo XT**.

Chúc anh em chơi game vui vẻ!
