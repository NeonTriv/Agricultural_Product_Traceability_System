# Hệ thống Truy xuất Nguồn gốc Nông sản (Agricultural Product Traceability System)

Dự án này là một hệ thống hoàn chỉnh bao gồm backend, frontend, và cơ sở dữ liệu để theo dõi và truy xuất nguồn gốc các sản phẩm nông nghiệp, từ nông trại đến tay người tiêu dùng.

## Công nghệ sử dụng

-   **Backend**: [NestJS](https://nestjs.com/) (Node.js framework), [TypeORM](https://typeorm.io/)
-   **Frontend**: [React](https://reactjs.org/) (với [Vite](https://vitejs.dev/))
-   **Cơ sở dữ liệu**: Microsoft SQL Server
-   **Ngôn ngữ**: TypeScript
-   **Quản lý môi trường**: npm Workspaces, PowerShell

## Cấu trúc thư mục

```
.
├── backend/         # Mã nguồn NestJS API
├── database/        # Scripts SQL (Schema, Seed data)
├── frontend/        # Mã nguồn React App
├── init-dev.ps1     # Script tự động cài đặt môi trường
└── README.md        # Hướng dẫn này
```

---

## Hướng dẫn Cài đặt và Chạy hệ thống

### Yêu cầu tiên quyết

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau trên máy của mình:

1.  **Node.js**: Phiên bản `20.x` hoặc cao hơn.
2.  **npm**: Thường đi kèm với Node.js.
3.  **SQL Server**: Một phiên bản SQL Server đang chạy (ví dụ: Express, Developer, hoặc Standard Edition).
    -   Đảm bảo đã bật chế độ "SQL Server and Windows Authentication mode" (Mixed Mode).
4.  **Git**: Để clone repository.

### Bước 1: Clone Repository

Mở terminal và chạy lệnh sau:

```bash
git clone <URL_CUA_REPOSITORY>
cd <TEN_THU_MUC_REPO>
```

### Bước 2: Cài đặt các thư viện (Dependencies)

Chạy lệnh sau ở thư mục gốc của dự án. Lệnh này sẽ tự động cài đặt các packages cho cả `frontend` và `backend`.

```bash
npm install
```

### Bước 3: Khởi tạo Môi trường (Tự động cài đặt Database)

Chạy lệnh sau để tự động thiết lập cơ sở dữ liệu.

```bash
npm run init
```

-   **Database**: Nó sẽ kiểm tra xem database `Traceability` đã tồn tại trên SQL Server của bạn hay chưa.
-   **Tự động cài đặt **:
    -   Nếu database chưa tồnTAIN, nó sẽ tự động **tạo database**, **chạy schema** để tạo các bảng, và **tạo user `test`** (mật khẩu `test`) với đầy đủ quyền.
    -   Nó cũng sẽ chạy **migration baseline** để TypeORM có thể quản lý các thay đổi về sau.
-   **Lưu ý**: Quá trình này có thể sẽ yêu cầu bạn nhập mật khẩu của user `sa` (System Administrator) trên SQL Server. Nếu bạn dùng Windows Authentication, bạn có thể bỏ trống và nhấn Enter.

### Bước 4: Chạy ứng dụng

Sau khi quá trình `init` hoàn tất, bạn có thể khởi động toàn bộ hệ thống bằng một lệnh duy nhất:

```bash
npm run dev
```

Lệnh này sẽ khởi động đồng thời:

-   **Backend Server** tại `http://localhost:5000`
-   **Frontend Server** tại `http://localhost:5001` (hoặc một cổng khác nếu 5173 đã được sử dụng)

Bây giờ bạn có thể mở trình duyệt và truy cập vào địa chỉ của Frontend để bắt đầu sử dụng.

---

## Thông tin đăng nhập

-   **Tài khoản Admin (trên giao diện web)**:
    -   Username: `admin`
    -   Password: `admin123`
-   **Tài khoản kết nối Database (trong file `config.env`)**:
    -   Username: `test`
    -   Password: `test`

## Các Scripts hữu ích khác

-   `npm run dev:fe`: Chỉ chạy frontend.
-   `npm run dev:be`: Chỉ chạy backend.
-   `npm --workspace ./backend run migration:generate -- -n MyNewMigration`: Tạo một migration mới sau khi bạn thay đổi các file entity trong backend.
