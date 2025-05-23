import React, { useState, useEffect, use } from "react";
import { Modal, Input, Form, Select } from "antd";
import swal from "sweetalert";
import { useWatch } from "antd/es/form/Form";
import {
  addStudent,
  getFaculty,
  getProgram,
  getStatus,
} from "../../services/studentService";
import { getAllowedEmails } from "../../services/emailService";
import { getCountries, getCountryConfig } from "../../services/phoneService";
const { Option } = Select;

const AddStudentModal = ({
  isModalVisible,
  setIsModalVisible,
  students,
  setStudents,
}) => {
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [form] = Form.useForm();
  const [countries, setCountries] = useState([]);
  const [phoneRegex, setPhoneRegex] = useState("");
  const [phoneNumberConfig, setPphoneNumberConfig] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faculties = await getFaculty();
        //console.log("Faculties:", faculties);
        if (faculties.data) {
          setFaculties(faculties.data || []);
        }
      } catch (error) {
        console.log(error);
      }

      try {
        const programs = await getProgram();
        //console.log("Programs:", programs);
        if (programs.data) {
          setPrograms(programs.data || []);
        }
      } catch (error) {
        console.log(error);
      }
      try {
        const statuses = await getStatus();
        //console.log("Statuses:", statuses);
        if (statuses.data) {
          setStatuses(statuses.data || []);
        }
      } catch (error) {
        console.log(error);
      }
      try {
        const email = await getAllowedEmails();
        //console.log("Email:", email.data);
        if (email.data) {
          setAllowedEmails(email.data);
        }
      } catch (error) {
        console.log(error);
      }
      try {
        const countries = await getCountries();
        //console.log("Countries:", countries);
        if (countries) {
          setCountries(countries || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const checkIfIdExists = (id) => {
    return students.some((student) => student.studentId === id);
  };

  const checkValidEmail = (email) => {
    const domain = email.split("@")[1];
    return allowedEmails.some((allowedEmail) => {
      return domain === allowedEmail.domain;
    });
  };
  const checkValidPhone = (phone) => {
    const allowedPhone = new RegExp(phoneRegex);
    return allowedPhone.test(phone);
  };
  const handleAddStudent = async () => {
    try {
      const values = await form.getFieldsValue();
      console.log(checkValidPhone(values.phone));
      if (checkIfIdExists(values.studentId)) {
        swal("Mã sinh viên đã tồn tại", "Vui lòng thử lại", "error");
        return;
      }
      if (!checkValidEmail(values.email)) {
        swal("Email không hợp lệ !", "Vui lòng thử lại", "error");
        return;
      }
      if (!checkValidPhone(values.phone)) {
        swal("Số điện thoại không hợp lệ !", "Vui lòng thử lại", "error");
        return;
      }
      //console.log('values',phoneNumberConfig);
      const requestBody = {
        ...values,
        faculty: values.faculty,
        program: values.program,
        status: values.status,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        phoneNumberConfig: phoneNumberConfig,
        identityDocument: {
          ...values.identityDocument,
          issueDate: new Date(values.identityDocument.issueDate).toISOString(),
          expiryDate: new Date(
            values.identityDocument.expiryDate
          ).toISOString(),
        },
      };
      // console.log('body',requestBody);

      try {
        const response = await addStudent(requestBody);
        console.log("response", response);
        if (response.message === "Student added successfully") {
          swal(
            "Thêm sinh viên thành công",
            "Sinh viên đã được thêm vào hệ thống",
            "success"
          );
          setStudents([...students, response.data]);
          setIsModalVisible(false);
          form.resetFields();
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      //console.log(error);
      swal("Vui lòng điền đầy đủ thông tin", "Vui lòng thử lại", "error");
    }
  };

  const documentType = useWatch(["identityDocument", "type"], form);

  return (
    <Modal
      title="Thêm Sinh viên"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={handleAddStudent}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Mã sinh viên *"
          name="studentId"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên sinh viên *"
          name="fullName"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ngày sinh *"
          name="dateOfBirth"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label="Giới tính *"
          name="gender"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Select>
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Email *"
          name="email"
          rules={[
            { required: true, message: "Trường này là bắt buộc" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                return checkValidEmail(value)
                  ? Promise.resolve()
                  : Promise.reject("Email không hợp lệ");
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại *"
          name="phone"
          rules={[
            { required: true, message: "Trường này là bắt buộc" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                return checkValidPhone(value)
                  ? Promise.resolve()
                  : Promise.reject("Số điện thoại không hợp lệ");
              },
            },
          ]}
        >
          <div className="d-flex align-items-center">
            <Select
              placeholder="Chọn mã quốc gia"
              className="me-2"
              onChange={async (value) => {
                const config = await getCountryConfig(value);
                const escapedRegex = config.regex
                  .replace(/\+/g, "\\+")
                  .replace(/d/g, "\\d");
                // console.log(config.regex);
                // console.log("country", config.country);

                setPhoneRegex(escapedRegex);
                setPphoneNumberConfig(config.country); // Lưu country (ví dụ: "Việt Nam")
                form.setFieldsValue({ phoneNumberConfig: config.country }); // Lưu country vào form
              }}
            >
              {Array.isArray(countries) ? (
                countries.map((country, index) => (
                  <Option key={index} value={country.country}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có dữ liệu</Option>
              )}
            </Select>
            <Input placeholder="Nhập số điện thoại " />
          </div>
        </Form.Item>
        {/* Quốc tịch */}
        <Form.Item
          name={["permanentAddress", "country"]}
          label="Quốc tịch"
          rules={[{ message: "Vui lòng chọn quốc tịch!" }]}
        >
          <Select
            placeholder="Chọn quốc tịch"
            onChange={(value) => {
              form.setFieldsValue({ permanentAddress: { country: value } }); // Cập nhật giá trị quốc tịch trong form
            }}
          >
            {Array.isArray(countries) ? (
              countries.map((country, index) => (
                <Select.Option key={index} value={country.country}>
                  {country.country}
                </Select.Option>
              ))
            ) : (
              <Select.Option disabled>Không có dữ liệu</Select.Option>
            )}
          </Select>
        </Form.Item>

        {/* Địa chỉ thường trú */}
        <Form.Item label="Địa chỉ thường trú *">
          <Form.Item
            name={["permanentAddress", "streetAddress"]}
            label="Số nhà, đường *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "ward"]}
            label="Phường/Xã *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "district"]}
            label="Quận/Huyện *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "city"]}
            label="Tỉnh/Thành phố *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "country"]}
            label="Quốc gia *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ tạm trú */}
        <Form.Item label="Địa chỉ tạm trú *">
          <Form.Item
            name={["temporaryAddress", "streetAddress"]}
            label="Số nhà, đường "
          >
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "ward"]} label="Phường/Xã ">
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "district"]}
            label="Quận/Huyện "
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "city"]}
            label="Tỉnh/Thành phố "
          >
            <Input />
          </Form.Item>
          <Form.Item name={["temporaryAddress", "country"]} label="Quốc gia ">
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ nhận thư */}
        <Form.Item label="Địa chỉ nhận thư *">
          <Form.Item
            name={["mailingAddress", "streetAddress"]}
            label="Số nhà, đường *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "ward"]}
            label="Phường/Xã *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "district"]}
            label="Quận/Huyện *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "city"]}
            label="Tỉnh/Thành phố *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "country"]}
            label="Quốc gia *"
            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
          >
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

        <Form.Item
          label="Khóa *"
          name="course"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        {/* Chương trình */}
        <Form.Item
          label="Chương trình *"
          name="program"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Select>
            {programs.map((program) => (
              <Option key={program._id} value={program._id}>
                {program.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Trạng thái */}
        <Form.Item
          label="Tình trạng sinh viên *"
          name="status"
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Select>
            {statuses.map((status) => (
              <Option key={status._id} value={status._id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Giấy tờ tùy thân */}
        <Form.Item
          label="Loại giấy tờ tùy thân *"
          name={["identityDocument", "type"]}
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Select>
            <Option value="CMND">CMND</Option>
            <Option value="CCCD">CCCD</Option>
            <Option value="Passport">Hộ chiếu</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Số giấy tờ *"
          name={["identityDocument", "number"]}
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ngày cấp *"
          name={["identityDocument", "issueDate"]}
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label="Nơi cấp *"
          name={["identityDocument", "issuePlace"]}
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ngày hết hạn *"
          name={["identityDocument", "expiryDate"]}
          rules={[{ required: true, message: "Trường này là bắt buộc" }]}
        >
          <Input type="date" />
        </Form.Item>

        {documentType === "CCCD" && (
          <Form.Item
            label="CCCD có gắn chip không?"
            name={["identityDocument", "hasChip"]}
          >
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        )}

        {documentType === "Passport" && (
          <>
            <Form.Item
              label="Quốc gia cấp *"
              name={["identityDocument", "issuingCountry"]}
              rules={[{ required: true, message: "Trường này là bắt buộc" }]}
            >
              <Input placeholder="Nhập quốc gia cấp hộ chiếu" />
            </Form.Item>
            <Form.Item
              label="Ghi chú (nếu có)"
              name={["identityDocument", "notes"]}
            >
              <Input placeholder="Ghi chú thêm (nếu có)" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
