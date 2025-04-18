import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseRegistration from "./CourseRegistration";


// Gộp mock services
jest.mock("../../Services/classService", () => ({
  getClasses: jest.fn(),
}));



jest.mock("../../Services/courseRegistrationService", () => ({
  getRegistration: jest.fn(),
  registerCourse: jest.fn(),
  cancelRegistration: jest.fn(),
}));

jest.mock("sweetalert", () => jest.fn());

// Import các mock
import * as classService from "../../Services/classService";
import * as courseRegistrationService from "../../Services/courseRegistrationService";
import swal from "sweetalert";

describe("CourseRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock mặc định
    classService.getClasses.mockResolvedValue({
      success: true,
      data: [{ _id: "67fab090c2ee7a71f3eb2787", classId: "CSC10001-11" }],
    });

    courseRegistrationService.getRegistration.mockResolvedValue({
      data: [
        {
          _id: "67fbde0d361222eec6cfd931",
          student: { studentId: "67fab093c2ee7a71f3eb27ef" },
          class: { course: { name: "Math" }, classId: "CSC10001-11", instructor: "Mr.A" },
          status: "active",
        },
      ],
    });

    swal.mockResolvedValue(true); // Mock swal confirm mặc định
  });

  test("hiển thị lỗi khi studentId không tồn tại", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(
      new Error("Không tìm thấy sinh viên.")
    );
  
    render(<CourseRegistration />);
  
    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());
  
    fireEvent.click(screen.getByText(/📌 Đăng ký/i));
  
    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), {
      target: { value: "SV0004" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "CSC10001-11" },
    });
  
    // 💥 THÊM DÒNG NÀY
    swal.mockResolvedValue(true);
  
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận đăng ký/i }));
  
    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Không tìm thấy sinh viên.", "error");
    });
  });
  

  test("hiển thị lỗi khi lớp đã đủ người", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(
      new Error("Lớp đã đủ sinh viên.")
    );
    

    render(<CourseRegistration />);

    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), {
      target: { value: "SV004" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "CSC10001-11" },
    });

    fireEvent.click(screen.getByRole(/Xác nhận đăng ký/i));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Lớp đã đủ sinh viên.", "error");
    });
  });

  test("hiển thị lỗi khi chưa học môn tiên quyết", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(
      new Error("Chưa học môn tiên quyết.")
    );
    

    render(<CourseRegistration />);

    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), {
      target: { value: "SV003" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "CSC10001-11" },
    });

    fireEvent.click(screen.getByText(/Xác nhận đăng ký/i));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Chưa học môn tiên quyết.", "error");
    });
  });

  test("hủy đăng ký thành công", async () => {
    render(<CourseRegistration />);

    await waitFor(() => expect(courseRegistrationService.getRegistration).toHaveBeenCalled());

    // Chuyển sang tab hủy đăng ký
    fireEvent.click(screen.getByText(/🗑️ Hủy đăng ký/i));

    // Giả lập nhập lý do hủy
    swal.mockResolvedValue("Không cần học nữa");

    const deleteBtn = await screen.findByRole("button", { name: "" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(courseRegistrationService.cancelRegistration).toHaveBeenCalledWith(
        "67fbde0d361222eec6cfd931",
        "Không cần học nữa"
      );
    });
  });
});
