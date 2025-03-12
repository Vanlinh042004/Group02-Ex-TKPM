import React, { useState } from "react";
import { Modal, Input, Form, Select, Button, message } from "antd";
import axios from "axios";

// Biểu thức chính quy kiểm tra email hợp lệ
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Biểu thức chính quy kiểm tra số điện thoại hợp lệ (chỉ có chữ số và ít nhất 10 chữ số)
const phoneRegex = /^[0-9]{10,}$/;

const AddStudentModal = ({
  isModalVisible,
  setIsModalVisible,
  students,
  setStudents,
}) => {
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    fullName: "",
    dateOfBirth: "",
    gender: "Nam",
    faculty: "",
    course: "",
    program: "",
    address: "",
    email: "",
    phone: "",
    status: "Đang học",
  });

  // Kiểm tra trùng ID sinh viên trước khi thêm
  const checkIfIdExists = (id) => {
    // Kiểm tra xem ID đã tồn tại trong danh sách sinh viên chưa
    return students.some((student) => student.studentId === id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleAddStudent = () => {
    // Kiểm tra trùng ID sinh viên trước khi thêm vào
    if (checkIfIdExists(newStudent.studentId)) {
      // Nếu trùng ID, hiển thị thông báo lỗi
      message.error("Mã sinh viên đã tồn tại.");
      return;
    }

    // Nếu không trùng ID, gửi yêu cầu thêm sinh viên mới
    axios
      .post("http://localhost:5000/api/student/add", newStudent)
      .then((response) => {
        setStudents([...students, response.data]); // Thêm sinh viên mới vào danh sách
        setIsModalVisible(false); // Đóng modal
      })
      .catch((error) => {
        console.error("Lỗi khi thêm sinh viên:", error);
      });
  };

  return (
    <Modal
      title="Thêm Sinh viên"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={handleAddStudent}
    >
      <Form layout="vertical">
        <Form.Item
          label="Mã sinh viên"
          name="studentId"
          rules={[{ required: true, message: "Vui lòng nhập mã sinh viên!" }]}
        >
          <Input
            name="studentId"
            value={newStudent.studentId}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Tên sinh viên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên sinh viên!" }]}
        >
          <Input
            name="fullName"
            value={newStudent.fullName}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Ngày sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <Input
            name="dateOfBirth"
            type="date"
            value={newStudent.dateOfBirth}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select
            name="gender"
            value={newStudent.gender}
            onChange={(value) =>
              setNewStudent({ ...newStudent, gender: value })
            }
          >
            <Select.Option value="Nam">Nam</Select.Option>
            <Select.Option value="Nữ">Nữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Khoa"
          name="faculty"
          rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
        >
          <Select
            name="faculty"
            value={newStudent.faculty}
            onChange={(value) =>
              setNewStudent({ ...newStudent, faculty: value })
            }
          >
            <Select.Option value="Khoa Luật">Khoa Luật</Select.Option>
            <Select.Option value="Khoa Tiếng Anh thương mại">
              Khoa Tiếng Anh thương mại
            </Select.Option>
            <Select.Option value="Khoa Tiếng Nhật">
              Khoa Tiếng Nhật
            </Select.Option>
            <Select.Option value="Khoa Tiếng Pháp">
              Khoa Tiếng Pháp
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Khóa"
          name="course"
          rules={[{ required: true, message: "Vui lòng nhập khóa!" }]}
        >
          <Input
            name="course"
            value={newStudent.course}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Chương trình"
          name="program"
          rules={[{ required: true, message: "Vui lòng nhập chương trình!" }]}
        >
          <Input
            name="program"
            value={newStudent.program}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input
            name="address"
            value={newStudent.address}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { pattern: emailRegex, message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            name="email"
            value={newStudent.email}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: phoneRegex, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input
            name="phone"
            value={newStudent.phone}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select
            name="status"
            value={newStudent.status}
            onChange={(value) =>
              setNewStudent({ ...newStudent, status: value })
            }
          >
            <Select.Option value="Đang học">Đang học</Select.Option>
            <Select.Option value="Đã tốt nghiệp">Đã tốt nghiệp</Select.Option>
            <Select.Option value="Tạm dừng học">Tạm dừng học</Select.Option>
            <Select.Option value="Đã thôi học">Đã thôi học</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
