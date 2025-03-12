# QUẢN LÝ DANH SÁCH SINH VIÊN

## Cấu trúc source code:

- Chia Project thành hai phần: Back-end và Front-end
  - Back-end
    ```
    ├───components
    |     └───student
    |          ├───controllers
    |          ├───middlewares
    |          ├───models
    |          ├───routes
    |          ├───seeds
    |          └───services
    ├───config
    ├───routes
    └───utils
    ```
  - Front-end
    ```
    ├───LayoutDefaut
    │     ├───Footer
    │     └───Header
    ├───Pages
    │     └───Home
    ├───Routes
    ├───Services
    ├───Style
    └───Utils
    ```

## Hướng dẫn cài đặt & chạy chương trình

**BACK - END**

1. Sử dụng file cấu hình .env để thiết lập các biến môi trường.

```properties
PORT=5000
MONGODB_URI=mongodb+srv://donalmun:eqia8yO1F0G3oBVx@tkpm.vufuh.mongodb.net/ex01?retryWrites=true&w=majority&appName=ex01
```

2. Cài đặt các package cần thiêt:
```bash
npm install
```
3. Chạy chương trình:
```bash
npm start
```

**FRONT - END**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm start
```
