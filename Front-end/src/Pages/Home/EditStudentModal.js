import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Select, message } from "antd";
import axios from "axios";
import swal from "sweetalert";

const { Option } = Select;

const EditStudentModal = ({ isModalVisible, setIsModalVisible, student, setStudents }) => {
  const [form] = Form.useForm();
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        ...student,
        dateOfBirth: student.dateOfBirth?.split("T")[0] || "",
        identityDocument: {
          ...student.identityDocument,
          issueDate: student.identityDocument?.issueDate?.split("T")[0] || "",
          expiryDate: student.identityDocument?.expiryDate?.split("T")[0] || "",
        },
      });

      setDocumentType(student.identityDocument?.type || "");
    }
  }, [student, form]);

  // useEffect(() => {
  //   axios.get("http://localhost:5000/api/faculty/").then((res) => setFaculties(res.data));
  //   axios.get("http://localhost:5000/api/program/").then((res) => setPrograms(res.data));
  //   axios.get("http://localhost:5000/api/status/").then((res) => setStatuses(res.data));
  // }, []);

  const handleUpdateStudent = () => {
    form.validateFields().then((values) => {
      const updatedStudentData = {
        ...values,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        identityDocument: {
          ...values.identityDocument,
          issueDate: new Date(values.identityDocument.issueDate).toISOString(),
          expiryDate: new Date(values.identityDocument.expiryDate).toISOString(),
        },
      };

      axios
        .patch(`http://localhost:5000/api/student/update/${student._id}`, updatedStudentData)
        .then((response) => {
          swal("Cập nhật thành công", "Thông tin sinh viên đã được cập nhật", "success");
          setStudents((prev) => prev.map((s) => (s._id === student._id ? response.data : s)));
          setIsModalVisible(false);
        })
        .catch((error) => {
          message.error(error.response?.data?.message || "Cập nhật thất bại.");
        });
    });
  };

  return (
    <Modal title="Chỉnh sửa thông tin sinh viên" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleUpdateStudent}>
      <Form layout="vertical" form={form}>
        <Form.Item label="Mã sinh viên" name="studentId"><Input disabled /></Form.Item>
        <Form.Item label="Tên sinh viên" name="fullName"><Input /></Form.Item>
        <Form.Item label="Ngày sinh" name="dateOfBirth"><Input type="date" /></Form.Item>
        <Form.Item label="Email" name="email"><Input /></Form.Item>
        <Form.Item label="Số điện thoại" name="phone"><Input /></Form.Item>
        <Form.Item label="Quốc tịch" name="nationality"><Input /></Form.Item>

        <Form.Item label="Khoa" name="faculty">
          <Select>{faculties.map(faculty => <Option key={faculty._id} value={faculty._id}>{faculty.name}</Option>)}</Select>
        </Form.Item>

        <Form.Item label="Chương trình học" name="program">
          <Select>{programs.map(program => <Option key={program._id} value={program._id}>{program.name}</Option>)}</Select>
        </Form.Item>

        <Form.Item label="Trạng thái" name="status">
          <Select>{statuses.map(status => <Option key={status._id} value={status._id}>{status.name}</Option>)}</Select>
        </Form.Item>

        <Form.Item label="Khóa học" name="academicYear">
          <Input placeholder="Nhập khóa học (VD: 2020 - 2024)" />
        </Form.Item>

        {["permanentAddress", "temporaryAddress", "mailingAddress"].map((addressType) => (
          <Form.Item key={addressType} label={
            addressType === "permanentAddress" ? "Địa chỉ thường trú" :
            addressType === "temporaryAddress" ? "Địa chỉ tạm trú" : "Địa chỉ nhận thư"
          }>
            <Input.Group compact>
              <Form.Item name={[addressType, "streetAddress"]}><Input placeholder="Số nhà, đường" /></Form.Item>
              <Form.Item name={[addressType, "ward"]}><Input placeholder="Phường/Xã" /></Form.Item>
              <Form.Item name={[addressType, "district"]}><Input placeholder="Quận/Huyện" /></Form.Item>
              <Form.Item name={[addressType, "city"]}><Input placeholder="Tỉnh/Thành phố" /></Form.Item>
            </Input.Group>
          </Form.Item>
        ))}

        <Form.Item label="Giấy tờ tùy thân" name={["identityDocument", "type"]}>
          <Select value={documentType} onChange={(value) => setDocumentType(value)}>
            <Option value="CMND">CMND</Option>
            <Option value="CCCD">CCCD</Option>
            <Option value="Passport">Hộ chiếu</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Số giấy tờ" name={["identityDocument", "number"]}><Input /></Form.Item>
        <Form.Item label="Ngày cấp" name={["identityDocument", "issueDate"]}><Input type="date" /></Form.Item>
        <Form.Item label="Nơi cấp" name={["identityDocument", "issuePlace"]}><Input /></Form.Item>
        <Form.Item label="Ngày hết hạn" name={["identityDocument", "expiryDate"]}><Input type="date" /></Form.Item>

        {documentType === "CCCD" && (
          <Form.Item label="CCCD có gắn chip?" name={["identityDocument", "hasChip"]}>
            <Select>
              <Option value="true">Có</Option>
              <Option value="false">Không</Option>
            </Select>
          </Form.Item>
        )}

        {documentType === "Passport" && (
          <>
            <Form.Item label="Quốc gia cấp" name={["identityDocument", "issuingCountry"]}>
              <Input placeholder="Nhập quốc gia cấp hộ chiếu" />
            </Form.Item>
            <Form.Item label="Ghi chú (nếu có)" name={["identityDocument", "notes"]}>
              <Input placeholder="Ghi chú thêm (nếu có)" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditStudentModal;
