import React, { useState } from "react";
import { Modal, Input, Form, Select, Button, message } from "antd";
import axios from "axios";
import swal from "sweetalert";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10,}$/;

const AddStudentModal = ({ isModalVisible, setIsModalVisible, students, setStudents }) => {
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    fullName: "",
    dateOfBirth: "",
    gender: "Nam",
    faculty: "",
    course: "",
    program: "",
    addressPermanent: "",
    addressTemporary: "",
    addressMailing: "",
    idType: "",
    idNumber: "",
    idIssueDate: "",
    idExpiryDate: "",
    idIssuePlace: "",
    idChip: "",
    nationality: "",
    passportNote: "",
    email: "",
    phone: "",
    status: "Đang học",
  });

  const checkIfIdExists = (id) => students.some((student) => student.studentId === id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleAddStudent = () => {
    if (checkIfIdExists(newStudent.studentId)) {
      swal("Mã sinh viên đã tồn tại", "Vui lòng thử lại", "error");
      return;
    }
    axios.post("http://localhost:5000/api/student/add", newStudent)
      .then((response) => {
        setStudents([...students, response.data]);
        setIsModalVisible(false);
        swal("Thêm sinh viên thành công", "Sinh viên đã được thêm", "success");
      })
      .catch((error) => {
        swal("Lỗi khi thêm sinh viên", "Vui lòng thử lại", "error");
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
        <Form.Item label="Mã sinh viên" required>
          <Input name="studentId" value={newStudent.studentId} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Tên sinh viên" required>
          <Input name="fullName" value={newStudent.fullName} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Ngày sinh" required>
          <Input name="dateOfBirth" type="date" value={newStudent.dateOfBirth} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ thường trú" required>
          <Input name="addressPermanent" value={newStudent.addressPermanent} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ tạm trú">
          <Input name="addressTemporary" value={newStudent.addressTemporary} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Địa chỉ nhận thư">
          <Input name="addressMailing" value={newStudent.addressMailing} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Loại giấy tờ tùy thân" required>
          <Select name="idType" value={newStudent.idType} onChange={(value) => setNewStudent({ ...newStudent, idType: value })}>
            <Select.Option value="CMND">CMND</Select.Option>
            <Select.Option value="CCCD">CCCD</Select.Option>
            <Select.Option value="Passport">Hộ chiếu</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Số giấy tờ" required>
          <Input name="idNumber" value={newStudent.idNumber} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Ngày cấp" required>
          <Input name="idIssueDate" type="date" value={newStudent.idIssueDate} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Ngày hết hạn">
          <Input name="idExpiryDate" type="date" value={newStudent.idExpiryDate} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Nơi cấp" required>
          <Input name="idIssuePlace" value={newStudent.idIssuePlace} onChange={handleInputChange} />
        </Form.Item>
        {newStudent.idType === "CCCD" && (
          <Form.Item label="CCCD có gắn chip không?">
            <Select name="idChip" value={newStudent.idChip} onChange={(value) => setNewStudent({ ...newStudent, idChip: value })}>
              <Select.Option value="Có">Có</Select.Option>
              <Select.Option value="Không">Không</Select.Option>
            </Select>
          </Form.Item>
        )}
        {newStudent.idType === "Passport" && (
          <Form.Item label="Ghi chú hộ chiếu">
            <Input name="passportNote" value={newStudent.passportNote} onChange={handleInputChange} />
          </Form.Item>
        )}
        <Form.Item label="Quốc tịch" required>
          <Input name="nationality" value={newStudent.nationality} onChange={handleInputChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
