import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseRegistration from "./CourseRegistration";

jest.mock("../../Services/classService", () => ({
  getClasses: jest.fn(),
}));

jest.mock("../../Services/courseRegistrationService", () => ({
  getRegistration: jest.fn(),
  registerCourse: jest.fn(),
  cancelRegistration: jest.fn(),
}));

jest.mock("sweetalert", () => jest.fn());

import * as classService from "../../Services/classService";
import * as courseRegistrationService from "../../Services/courseRegistrationService";
import swal from "sweetalert";

describe("CourseRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    swal.mockResolvedValue(true);
  });

  test("render trang đăng ký", () => {
    render(<CourseRegistration />);
    expect(screen.getByText(/📌 Đăng ký/i)).toBeInTheDocument();
  });

  test("render input nhập mã sinh viên", () => {
    render(<CourseRegistration />);
    expect(screen.getByPlaceholderText("Nhập mã sinh viên")).toBeInTheDocument();
  });

  test("render combobox lớp học", async () => {
    render(<CourseRegistration />);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  test("hiển thị lỗi khi studentId không tồn tại", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(new Error("Không tìm thấy sinh viên."));

    render(<CourseRegistration />);
    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), { target: { value: "SV0004" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "CSC10001-11" } });

    fireEvent.click(screen.getByRole('button', { name: /Xác nhận đăng ký/i }));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Không tìm thấy sinh viên.", "error");
    });
  });

  test("hiển thị lỗi khi lớp đã đủ người", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(new Error("Lớp đã đủ sinh viên."));

    render(<CourseRegistration />);
    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), { target: { value: "SV004" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "CSC10001-11" } });

    fireEvent.click(screen.getByRole('button', { name: /Xác nhận đăng ký/i }));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Lớp đã đủ sinh viên.", "error");
    });
  });

  test("hiển thị lỗi khi chưa học môn tiên quyết", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(new Error("Chưa học môn tiên quyết."));

    render(<CourseRegistration />);
    await waitFor(() => expect(classService.getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), { target: { value: "SV003" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "CSC10001-11" } });

    fireEvent.click(screen.getByText(/Xác nhận đăng ký/i));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
      expect(swal).toHaveBeenCalledWith("Lỗi", "Chưa học môn tiên quyết.", "error");
    });
  });

  test("hủy đăng ký thành công", async () => {
    render(<CourseRegistration />);
    await waitFor(() => expect(courseRegistrationService.getRegistration).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/🗑️ Hủy đăng ký/i));

    swal.mockResolvedValue("Không cần học nữa");

    const deleteBtn = await screen.findByRole("button", { name: "" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(courseRegistrationService.cancelRegistration).toHaveBeenCalled();
    });
  });

  test("load danh sách lớp thất bại", async () => {
    classService.getClasses.mockRejectedValue(new Error("Failed"));

    render(<CourseRegistration />);

    await waitFor(() => {
      expect(classService.getClasses).toHaveBeenCalled();
    });
  });

  test("nhập mã sinh viên thành công", () => {
    render(<CourseRegistration />);
    const input = screen.getByPlaceholderText("Nhập mã sinh viên");
    fireEvent.change(input, { target: { value: "SV001" } });
    expect(input.value).toBe("SV001");
  });

  test("chọn lớp học thành công", async () => {
    render(<CourseRegistration />);
    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "CSC10001-11" } });
      expect(select.value).toBe("CSC10001-11");
    });
  });

  test("click vào nút xác nhận đăng ký", async () => {
    render(<CourseRegistration />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Xác nhận đăng ký/i })).toBeInTheDocument());
  });

  test("hiển thị lỗi khi không chọn lớp", async () => {
    courseRegistrationService.registerCourse.mockRejectedValue(new Error("Chưa chọn lớp học"));

    render(<CourseRegistration />);
    fireEvent.change(screen.getByPlaceholderText("Nhập mã sinh viên"), { target: { value: "SV002" } });
    fireEvent.click(screen.getByRole("button", { name: /Xác nhận đăng ký/i }));

    await waitFor(() => {
      expect(courseRegistrationService.registerCourse).toHaveBeenCalled();
    });
  });

  test("load danh sách đăng ký thành công", async () => {
    render(<CourseRegistration />);
    await waitFor(() => {
      expect(courseRegistrationService.getRegistration).toHaveBeenCalled();
    });
  });

  test("load danh sách đăng ký lỗi", async () => {
    courseRegistrationService.getRegistration.mockRejectedValue(new Error("API error"));

    render(<CourseRegistration />);
    await waitFor(() => {
      expect(courseRegistrationService.getRegistration).toHaveBeenCalled();
    });
  });

  test("hủy đăng ký thất bại", async () => {
    courseRegistrationService.cancelRegistration.mockRejectedValue(new Error("Hủy thất bại"));

    render(<CourseRegistration />);
    await waitFor(() => {
      fireEvent.click(screen.getByText(/🗑️ Hủy đăng ký/i));
    });
  });

  test("xác nhận hủy đăng ký từ swal", async () => {
    render(<CourseRegistration />);
    await waitFor(() => expect(screen.getByText(/🗑️ Hủy đăng ký/i)).toBeInTheDocument());
    swal.mockResolvedValue("Lý do test");
  });
});
