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

#### Version 1.0

**_Back - end_**

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

**_Front - end_**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm start
```

---

#### Version 2.0

**_Back - end_**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm run dev
```

**_Front - end_**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm start
```

## Hình ảnh minh họa

**1. Cho phép đổi tên & thêm mới: khoa, tình trạng sinh viên, chương trình**

<img src="FeatureImg/Ex02/Feature1/AddFaculty.png" alt="AddFaculty" />
<img src="FeatureImg/Ex02/Feature1/AddProgram.png" alt="AddProgram" />
<img src="FeatureImg/Ex02/Feature1/AddStatus.png" alt="AddStatus" />
<img src="FeatureImg/Ex02/Feature1/RenameFaculty.png" alt="RenameFaculty" />
<img src="FeatureImg/Ex02/Feature1/RenameProgram.png" alt="RenameProgram" />
<img src="FeatureImg/Ex02/Feature1/RenameStatus.png" alt="RenameStatus" />

**2. Thêm chức năng tìm kiếm: tìm theo khoa, khoa + tên**

<img src="FeatureImg/Ex02/Feature2/SearchFaculty.png" alt="Search Faculty" width="500" height="300"/> 
<img src="FeatureImg/Ex02/Feature2/SearchName+Faculty.png" alt="Search Faculty" width="500" height="300"/>

**3. Hỗ trợ import/export dữ liệu: CSV, JSON, XML, Excel (chọn ít nhất 2)**

<img src="FeatureImg/Ex02/Feature3/Feature3.png" alt="Feature3" />
<img src="FeatureImg/Ex02/Feature3/Export.png" alt="Export" width="500" height="300"/>
<img src="FeatureImg/Ex02/Feature3/Export_csv.png" alt="Export_csv" width="500" height="300"/>
<img src="FeatureImg/Ex02/Feature3/Export_Json.png" alt="Export_Json" width="500" height="300"/>
<img src="FeatureImg/Ex02/Feature3/Import.png" alt="Import" width="500" height="300"/>

**4.Thêm logging mechanism để troubleshooting production issue & audit purposes**
<img src="FeatureImg/Ex02/Feature4/Feature4.png" alt="Feature4" />

#### Version 3.0

**_Back - end_**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm run dev
```

**_Front - end_**

1. Cài đặt các package cần thiêt:

```bash
npm install
```

2. Chạy chương trình:

```bash
npm start
```

## Hình ảnh minh họa

**1. MSSV phải là duy nhất**
<img src="FeatureImg/Ex03/Rule01/image1.png"  />
<img src="FeatureImg/Ex03/Rule01/image2.png"  />

**2. Email phải thuộc một tên miền nhất định và có thể cấu hình động (configurable)**
<img src="FeatureImg/Ex03/Rule02/image1.png"  />
<img src="FeatureImg/Ex03/Rule02/image2.png"  />
<img src="FeatureImg/Ex03/Rule02/image3.png"  />

**3. Số điện thoại phải có định dạng hợp lệ theo quốc gia (configurable)**
<img src="FeatureImg/Ex03/Rule03/image1.png"  />
<img src="FeatureImg/Ex03/Rule03/image2.png"  />
<img src="FeatureImg/Ex03/Rule03/image3.png"  />

**4.Tình trạng sinh viên chỉ có thể thay đổi theo một số quy tắc (configurable)**
<img src="FeatureImg/Ex03/Rule04/image1.png"  />
<img src="FeatureImg/Ex03/Rule04/image2.png"  />
<img src="FeatureImg/Ex03/Rule04/image3.png"  />

---
