# QUẢN LÝ DANH SÁCH SINH VIÊN

## Cấu trúc source code:

- Chia Project thành hai phần: Back-end và Front-end
  - Back-end
    ```
    |   index.js
    |
    +---components
    |   \---student
    |       +---controllers
    |       |       StudentController.js
    |       |
    |       +---middlewares
    |       |       validateStudent.js
    |       |
    |       +---models
    |       |       Student.js
    |       |
    |       +---routes
    |       |       StudentRoute.js
    |       |
    |       +---seeds
    |       |       studentSeed.js
    |       |
    |       \---services
    |               StudentService.js
    |
    +---config
    |       database.js
    |
    +---routes
    |       index.js
    |
    \---utils
        mongoose.js
    ```
  - Front-end
    ```
    |   App.css
    |   App.js
    |   App.test.js
    |   index.css
    |   index.js
    |   logo.svg
    |   reportWebVitals.js
    |   setupTests.js
    |
    +---LayoutDefaut
    |   |   Layout.js
    |   |
    |   +---Footer
    |   |       indexFooter.js
    |   |
    |   \---Header
    |           indexHeader.js
    |
    +---Pages
    |   \---Home
    |           AddStudentModal.js
    |           EditStudentModal.js
    |           indexHome.js
    |
    +---Routes
    |       indexRoutes.js
    |       Routes.js
    |
    +---Services
    |       studentService.js
    |
    +---Style
    |       Header.scss
    |       Home.scss
    |       style.css
    |
    \---Utils
            request.js
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
