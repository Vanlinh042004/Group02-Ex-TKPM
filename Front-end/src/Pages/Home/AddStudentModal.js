import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Select } from "antd";
import axios from "axios";
import swal from "sweetalert";
import { useWatch } from "antd/es/form/Form";

const { Option } = Select;

const AddStudentModal = ({ isModalVisible, setIsModalVisible, students, setStudents }) => {
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    axios.get("http://localhost:5000/api/faculty/list")
      .then((res) => {
        console.log("Dữ liệu khoa từ API:", res.data);
        setFaculties(res.data.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch khoa:", err);
        setFaculties([]);
      });

    axios.get("http://localhost:5000/api/program/list")
      .then((res) => {
        console.log("Dữ liệu chương trình từ API:", res.data);
        setPrograms(res.data.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch chương trình:", err);
        setPrograms([]);
      });

    axios.get("http://localhost:5000/api/status/list")
      .then((res) => {
        console.log("Dữ liệu trạng thái từ API:", res.data);
        setStatuses(res.data.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch trạng thái:", err);
        setStatuses([]);
      });
  }, []);

  const checkIfIdExists = (id) => students.some((student) => student.studentId === id);

  const handleAddStudent = () => {
    form.validateFields().then((values) => {
      if (checkIfIdExists(values.studentId)) {
        swal("Mã sinh viên đã tồn tại", "Vui lòng thử lại", "error");
        return;
      }

      const requestBody = {
        ...values,
        faculty: values.faculty,
        program: values.program,
        status: values.status,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        identityDocument: {
          ...values.identityDocument,
          issueDate: new Date(values.identityDocument.issueDate).toISOString(),
          expiryDate: new Date(values.identityDocument.expiryDate).toISOString(),
        },
      };
      console.log("Request body:", requestBody);  
      axios.post("http://localhost:5000/api/student/add", requestBody)
        .then((response) => {
          setStudents([...students, response.data]);
          setIsModalVisible(false);
          swal("Thêm sinh viên thành công", "Sinh viên đã được thêm", "success");
        })
        .catch(() => {
          swal("Lỗi khi thêm sinh viên", "Vui lòng thử lại", "error");
        });
    });
  };

  // Lắng nghe loại giấy tờ tùy thân
  const documentType = useWatch(["identityDocument", "type"], form);

  return (
    <Modal title="Thêm Sinh viên" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleAddStudent}>
      <Form layout="vertical" form={form}>
        <Form.Item label="Mã sinh viên *" name="studentId" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Tên sinh viên *" name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Ngày sinh *" name="dateOfBirth" rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Giới tính *" name="gender" rules={[{ required: true }]}>
          <Select>
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
            <Option value="Khác">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Email *" name="email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Số điện thoại *" name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* Quốc tịch */}
        <Form.Item label="Quốc tịch *" name="nationality" rules={[{ required: true }]}>
          <Input placeholder="Nhập quốc tịch" />
        </Form.Item>

        {/* Địa chỉ thường trú */}
        <Form.Item label="Địa chỉ thường trú *">
          <Form.Item name={["permanentAddress", "streetAddress"]} label="Số nhà, đường *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["permanentAddress", "ward"]} label="Phường/Xã *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["permanentAddress", "district"]} label="Quận/Huyện *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["permanentAddress", "city"]} label="Tỉnh/Thành phố *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["permanentAddress", "country"]} label="Quốc gia *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ tạm trú */}
        <Form.Item label="Địa chỉ tạm trú *">
          <Form.Item name={["temporaryAddress", "streetAddress"]} label="Số nhà, đường " >
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "ward"]} label="Phường/Xã " >
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "district"]} label="Quận/Huyện " >
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "city"]} label="Tỉnh/Thành phố ">
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "country"]} label="Quốc gia ">
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ nhận thư */}
        <Form.Item label="Địa chỉ nhận thư *">
          <Form.Item name={["mailingAddress", "streetAddress"]} label="Số nhà, đường *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["mailingAddress", "ward"]} label="Phường/Xã *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["mailingAddress", "district"]} label="Quận/Huyện *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["mailingAddress", "city"]} label="Tỉnh/Thành phố *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["mailingAddress", "country"]} label="Quốc gia *" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Khoa */}
        <Form.Item 
          label="Khoa *" 
          name="faculty" 
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Select>
            {Array.isArray(faculties) ? (
              faculties.map((faculty) => (
                <Option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </Option>
              ))
            ) : (
              <Option disabled>Không có dữ liệu</Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item label="Khóa *" name="course" rules={[{ required: true, message: "Trường này là bắt buộc" }]}>
          <Input />
        </Form.Item>

        {/* Chương trình */}
        <Form.Item label="Chương trình *" name="program" rules={[{ required: true, message: "Trường này là bắt buộc" }]}>
          <Select>
            {programs.map((program) => (
              <Option key={program._id} value={program._id}>{program.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Trạng thái */}
        <Form.Item label="Tình trạng sinh viên *" name="status" rules={[{ required: true, message: "Trường này là bắt buộc" }]}>
          <Select>
            {statuses.map((status) => (
              <Option key={status._id} value={status._id}>{status.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Giấy tờ tùy thân */}
        <Form.Item label="Loại giấy tờ tùy thân *" name={["identityDocument", "type"]} rules={[{ required: true }]}>
          <Select>
            <Option value="CMND">CMND</Option>
            <Option value="CCCD">CCCD</Option>
            <Option value="Passport">Hộ chiếu</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Số giấy tờ *" name={["identityDocument", "number"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Ngày cấp *" name={["identityDocument", "issueDate"]} rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Nơi cấp *" name={["identityDocument", "issuePlace"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Ngày hết hạn *" name={["identityDocument", "expiryDate"]} rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>

        {documentType === "CCCD" && (
          <Form.Item label="CCCD có gắn chip không?" name={["identityDocument", "hasChip"]}>
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        )}

        {documentType === "Passport" && (
          <>
            <Form.Item label="Quốc gia cấp *" name={["identityDocument", "issuingCountry"]} rules={[{ required: true }]}>
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

export default AddStudentModal;