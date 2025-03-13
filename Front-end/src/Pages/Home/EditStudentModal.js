import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Select, Button, message } from "antd";
import axios from "axios";
import swal from "sweetalert";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10,}$/;

const EditStudentModal = ({
  isModalVisible,
  setIsModalVisible,
  student,
  setStudents,
}) => {
  const [updatedStudent, setUpdatedStudent] = useState({
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

  useEffect(() => {
    if (student) {
      setUpdatedStudent({
        studentId: student.studentId,
        fullName: student.fullName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        faculty: student.faculty,
        course: student.course,
        program: student.program,
        address: student.address,
        email: student.email,
        phone: student.phone,
        status: student.status,
      });
    }
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStudent({ ...updatedStudent, [name]: value });
  };

  const handleUpdateStudent = () => {
    //console.log("Updated student data:", updatedStudent);
    if (!emailRegex.test(updatedStudent.email)) {
      swal("Email không hợp lệ", "Vui lòng thử lại", "error");
      console.error("Invalid email:", updatedStudent.email);
      return;
    }
    if (!phoneRegex.test(updatedStudent.phone)) {
      swal("Số điện thoại không hợp lệ", "Vui lòng thử lại", "error");
      console.error("Invalid phone:", updatedStudent.phone);
      return;
    }
    const formattedDate = new Date(updatedStudent.dateOfBirth).toISOString();

    const studentData = {
      ...updatedStudent,
      dateOfBirth: formattedDate,
    };
    axios
      .patch(
        `http://localhost:5000/api/student/update/${studentData.studentId}`,
        studentData
      )
      .then((response) => {
        swal(
          "Cập nhật sinh viên thành công",
          "Sinh viên đã được cập nhật",
          "success"
        );
        //message.success("Cập nhật sinh viên thành công!");
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.studentId === studentData.studentId ? response.data : s
          )
        );
        setIsModalVisible(false);
      })
      .catch((error) => {
        swal("Cập nhật sinh viên thất bại", "Vui lòng thử lại", "error");
        //console.error("Lỗi khi cập nhật sinh viên:", error.response?.data);
        message.error(
          error.response?.data?.message || "Cập nhật sinh viên thất bại."
        );
      });
  };

  return (
    <Modal
      title="Cập nhật thông tin sinh viên"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={handleUpdateStudent}
    >
      <Form layout="vertical">
        <Form.Item label="Mã sinh viên">
          <Input
            name="studentId"
            value={updatedStudent.studentId}
            disabled
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Tên sinh viên">
          <Input
            name="fullName"
            value={updatedStudent.fullName}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <Input
            name="dateOfBirth"
            type="date"
            value={updatedStudent.dateOfBirth}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Giới tính">
          <Select
            name="gender"
            value={updatedStudent.gender}
            onChange={(value) =>
              setUpdatedStudent({ ...updatedStudent, gender: value })
            }
          >
            <Select.Option value="Nam">Nam</Select.Option>
            <Select.Option value="Nữ">Nữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Khoa">
          <Select
            name="faculty"
            value={updatedStudent.faculty}
            onChange={(value) =>
              setUpdatedStudent({ ...updatedStudent, faculty: value })
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
            value={updatedStudent.course}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Chương trình">
          <Input
            name="program"
            value={updatedStudent.program}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Địa chỉ">
          <Input
            name="address"
            value={updatedStudent.address}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            name="email"
            value={updatedStudent.email}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Số điện thoại">
          <Input
            name="phone"
            value={updatedStudent.phone}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Trạng thái">
          <Select
            name="status"
            value={updatedStudent.status}
            onChange={(value) =>
              setUpdatedStudent({ ...updatedStudent, status: value })
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

export default EditStudentModal;
