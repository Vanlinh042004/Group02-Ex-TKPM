// import React from "react";
// import { Button, Upload, message } from "antd";
// import axios from "axios";
// import Papa from "papaparse";

// const ImportStudents = ({ setStudents }) => {
//   const handleFileUpload = (file) => {
//     console.log('File selected:', file);
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const fileData = event.target.result;
//       console.log('File data:', fileData);
//       console.log("File type:", file.type, "File name:", file.name);

//       if (file.type === "application/json" || file.name.endsWith(".json")) {
//         try {
//           const jsonData = JSON.parse(fileData);
//           console.log('Parsed JSON data:', jsonData);
//           if (!Array.isArray(jsonData)) {
//             message.error("File JSON không hợp lệ!");
//             return;
//           }
        
//           // Send JSON data to the backend
//           axios.post("http://localhost:5000/api/student/import", { format: "json", data: jsonData })
//             .then((response) => {
//               console.log('Response from server:', response);
//               if (Array.isArray(response.data.data)) {
//                 setStudents(response.data.data);
//                 message.success("Import JSON thành công!");
//               } else {
//                 message.error("Dữ liệu trả về không hợp lệ!");
//               }
//             })
//             .catch((error) => {
//               message.error("Lỗi khi import JSON!");
//               console.error("Error importing JSON:", error);
//             });
//         } catch (error) {
//           message.error("Lỗi khi đọc file JSON!");
//           console.error("Error parsing JSON:", error);
//         }
//       } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
//         Papa.parse(fileData, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (result) => {
//             console.log('Parsed CSV data:', result.data);
//             if (!result.data || result.data.length === 0) {
//               message.error("File CSV không hợp lệ hoặc trống!");
//               return;
//             }
//             // Send CSV data to the backend
//             axios.post("http://localhost:5000/api/student/import", { format: "csv", data: result.data })
//               .then((response) => {
//                 console.log('Response from server:', response);
//                 if (Array.isArray(response.data.data)) {
//                   setStudents(response.data.data);
//                   message.success("Import CSV thành công!");
//                 } else {
//                   message.error("Dữ liệu trả về không hợp lệ!");
//                 }
//               })
//               .catch((error) => {
//                 message.error("Lỗi khi import CSV!");
//                 console.error("Error importing CSV:", error);
//               });
//           },
//           error: (error) => {
//             message.error("Lỗi khi đọc file CSV!");
//             console.error("Error parsing CSV:", error);
//           },
//         });
//       } else {
//         message.error("Chỉ hỗ trợ file CSV và JSON!");
//       }
//     };

//     reader.readAsText(file);
//     return false; // Ngăn không cho upload tự động lên server
//   };

//   return (
//     <Upload beforeUpload={(file) => {
//       console.log("Before Upload Triggered:", file);
//       return handleFileUpload(file);
//     }} showUploadList={false}>
//       <Button type="primary">Import CSV/JSON</Button>
//     </Upload>
    
//   );
// };

// export default ImportStudents;