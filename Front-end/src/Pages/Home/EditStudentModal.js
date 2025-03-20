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
    permanentAddress: "",
    temporaryAddress: "",
    mailingAddress: "",
    email: "",
    phone: "",
    idDocument: {
      type: "",
      number: "",
      issueDate: "",
      issuePlace: "",
      expiryDate: "",
      hasChip: false,
      country: "",
      notes: "",
    },
    nationality: "",
    status: "Đang học",
  });

  useEffect(() => {
    if (student) {
      setUpdatedStudent({
        ...student,
        idDocument: student.idDocument || {
          type: "",
          number: "",
          issueDate: "",
          issuePlace: "",
          expiryDate: "",
          hasChip: false,
          country: "",
          notes: "",
        },
      });
    }
  }, [student]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStudent({ ...updatedStudent, [name]: value });
  };

  const handleIdDocumentChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStudent({
      ...updatedStudent,
      idDocument: { ...updatedStudent.idDocument, [name]: value },
    });
  };

  const handleUpdateStudent = () => {
    if (!emailRegex.test(updatedStudent.email)) {
      swal("Email không hợp lệ", "Vui lòng thử lại", "error");
      return;
    }
    if (!phoneRegex.test(updatedStudent.phone)) {
      swal("Số điện thoại không hợp lệ", "Vui lòng thử lại", "error");
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
        swal("Cập nhật thành công", "Sinh viên đã được cập nhật", "success");
        setStudents((prev) =>
          prev.map((s) => (s.studentId === studentData.studentId ? response.data : s))
        );
        setIsModalVisible(false);
      })
      .catch((error) => {
        swal("Cập nhật thất bại", "Vui lòng thử lại", "error");
        message.error(error.response?.data?.message || "Cập nhật thất bại.");
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
          <Input name="studentId" value={updatedStudent.studentId} disabled />
        </Form.Item>
        <Form.Item label="Tên sinh viên">
          <Input name="fullName" value={updatedStudent.fullName} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <Input name="dateOfBirth" type="date" value={updatedStudent.dateOfBirth} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ thường trú">
          <Input name="permanentAddress" value={updatedStudent.permanentAddress} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ tạm trú">
          <Input name="temporaryAddress" value={updatedStudent.temporaryAddress} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ nhận thư">
          <Input name="mailingAddress" value={updatedStudent.mailingAddress} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Quốc tịch">
          <Input name="nationality" value={updatedStudent.nationality} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Ghi chú giấy tờ tùy thân">
          <Input name="notes" value={updatedStudent.idDocument.notes} onChange={handleIdDocumentChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStudentModal;
