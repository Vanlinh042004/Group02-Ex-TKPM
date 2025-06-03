import Papa from "papaparse";
import { saveAs } from "file-saver";

// Xuất CSV với dữ liệu đúng format
export const exportStudentsToCSV = (students) => {
  if (!students || students.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  // Chỉ chọn các trường cần thiết
  const formattedData = students.map((student) => ({
    Mã_SV: student.studentId,
    Họ_Tên: student.fullName,
    Ngày_Sinh: new Date(student.dateOfBirth).toLocaleDateString(),
    Giới_Tính: student.gender,
    Khoa: student.faculty?.name || "N/A",
    Chương_Trình: student.program?.name || "N/A",
    Khóa: student.course,
    Email: student.email,
    SĐT: student.phone,
    Trạng_Thái: student.status,
    CMND: student.identityDocument?.number || "N/A",
    "Nơi Cấp CMND": student.identityDocument?.issuePlace || "N/A",
    "Địa Chỉ Thường Trú": `${student.permanentAddress?.streetAddress || ""}, ${student.permanentAddress?.district || ""}, ${student.permanentAddress?.city || ""}`,
  }));

  // Chuyển thành CSV
  const csv = Papa.unparse(formattedData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "students.csv");
};

export const exportStudentsToJSON = (students) => {
  if (!students || students.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  // Chỉ chọn dữ liệu cần thiết
  const formattedData = students.map((student) => ({
    studentId: student.studentId,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    faculty: student.faculty?.name || "N/A",
    program: student.program?.name || "N/A",
    course: student.course,
    email: student.email,
    phone: student.phone,
    status: student.status,
    identityDocument: {
      number: student.identityDocument?.number || "N/A",
      issuePlace: student.identityDocument?.issuePlace || "N/A",
    },
    permanentAddress: {
      fullAddress: `${student.permanentAddress?.streetAddress || ""}, ${student.permanentAddress?.district || ""}, ${student.permanentAddress?.city || ""}`,
    },
  }));

  // Chuyển thành JSON
  const json = JSON.stringify(formattedData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  saveAs(blob, "students.json");
};
