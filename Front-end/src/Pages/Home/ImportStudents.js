import React from "react";
import { Button, Upload, message } from "antd"; // ✅ Import message từ antd
import Papa from "papaparse"; // ✅ Import PapaParse để xử lý CSV

const ImportStudents = ({ setStudents }) => {
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target.result;

      if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(fileData);
          if (!Array.isArray(jsonData)) {
            message.error("File JSON không hợp lệ!"); // ✅ Sửa lỗi no-undef
            return;
          }
          setStudents(jsonData);
          message.success("Import JSON thành công!"); // ✅ Sửa lỗi no-undef
        } catch (error) {
          message.error("Lỗi khi đọc file JSON!"); // ✅ Sửa lỗi no-undef
        }
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (!result.data || result.data.length === 0) {
              message.error("File CSV không hợp lệ hoặc trống!"); // ✅ Sửa lỗi no-undef
              return;
            }
            setStudents(result.data);
            message.success("Import CSV thành công!"); // ✅ Sửa lỗi no-undef
          },
          error: () => {
            message.error("Lỗi khi đọc file CSV!"); // ✅ Sửa lỗi no-undef
          },
        });
      } else {
        message.error("Chỉ hỗ trợ file CSV và JSON!"); // ✅ Sửa lỗi no-undef
      }
    };

    reader.readAsText(file);
    return false; // Ngăn không cho upload tự động lên server
  };

  return (
    <Upload beforeUpload={handleFileUpload} showUploadList={false}>
      <Button type="primary">Import CSV/JSON</Button>
    </Upload>
  );
};

export default ImportStudents;