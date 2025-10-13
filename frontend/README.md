# Frontend (no camera): Paste code/URL → Modal → Fetch trace (multi-network)

- Không yêu cầu camera. Người dùng **nhập/paste code hoặc URL** đọc từ QR.
- Khi submit, frontend gọi **GET {BASE}/trace/:code** (hoặc URL đầy đủ nếu đã có `/trace/:code`) và mở modal hiển thị Product/Batch/Farm/Processing/Distributor/Price.
- Hỗ trợ **đa mạng** (LAN/Public/Local) qua env.

## Env
```
VITE_QR_TARGETS=LAN|http://192.168.1.50:5000;PUBLIC|https://yourdomain.com;LOCAL|http://localhost:5000
# Hoặc chỉ một mạng:
# VITE_PUBLIC_API_URL=http://localhost:5000

# (Tùy chọn) chạy demo không cần backend:
VITE_MOCK=1
```

## Cách dùng
```
npm i
npm run dev
```
Mở http://localhost:5173 → chọn mạng → dán **code** (vd BK001) hoặc **URL** (vd https://yourdomain.com/trace/BK001) → Fetch → modal bật với dữ liệu.

## Backend kỳ vọng
- Endpoint: `GET /trace/:code` trả JSON tổng hợp.
- CORS cho phép domain/port frontend.
