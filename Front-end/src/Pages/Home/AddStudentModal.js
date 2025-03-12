import React, { useState } from "react";
import { Modal, Input, Form, Select, Button, message } from "antd";
import axios from "axios";

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
        <Form.Item label="Mã sinh viên">
          <Input
            name="studentId"
            value={newStudent.studentId}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Tên sinh viên">
          <Input
            name="fullName"
            value={newStudent.fullName}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <Input
            name="dateOfBirth"
            type="date"
            value={newStudent.dateOfBirth}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Giới tính">
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
        <Form.Item label="Khoa">
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
        <Form.Item label="Khóa">
          <Input
            name="course"
            value={newStudent.course}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Chương trình">
          <Input
            name="program"
            value={newStudent.program}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Địa chỉ">
          <Input
            name="address"
            value={newStudent.address}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            name="email"
            value={newStudent.email}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Số điện thoại">
          <Input
            name="phone"
            value={newStudent.phone}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Trạng thái">
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
