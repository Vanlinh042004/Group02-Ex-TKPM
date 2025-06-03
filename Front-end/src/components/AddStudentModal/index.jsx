import { useState, useEffect } from "react";
import { Modal, Input, Form, Select } from "antd";
import swal from "sweetalert";
import { useWatch } from "antd/es/form/Form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("student");

  const handleAddStudent = async () => {
    try {
      const values = await form.getFieldsValue();
      console.log(checkValidPhone(values.phone));
      if (checkIfIdExists(values.studentId)) {
        swal(t("addEditStudent.error"), t("addEditStudent.idExists"), "error");
        return;
      }
      if (!checkValidEmail(values.email)) {
        swal(
          t("addEditStudent.error"),
          t("addEditStudent.invalidEmail"),
          "error",
        );
        return;
      }
      if (!checkValidPhone(values.phone)) {
        swal(
          t("addEditStudent.error"),
          t("addEditStudent.invalidPhone"),
          "error",
        );
        return;
      }

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
            values.identityDocument.expiryDate,
          ).toISOString(),
        },
      };

      try {
        const response = await addStudent(requestBody);
        if (response.message === "Student added successfully") {
          swal(
            t("addEditStudent.success"),
            t("addEditStudent.successMessage"),
            "success",
          );
          setStudents([...students, response.data]);
          setIsModalVisible(false);
          form.resetFields();
        }
      } catch (error) {
        console.error(error);
        swal(
          t("addEditStudent.error"),
          t("addEditStudent.errorMessage"),
          "error",
        );
      }
    } catch (error) {
      swal(t("addEditStudent.error"), t("addEditStudent.required"), "error");
    }
  };

  const documentType = useWatch(["identityDocument", "type"], form);

  return (
    <Modal
      title={t("addEditStudent.title")}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={handleAddStudent}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label={`${t("studentId")} *`}
          name="studentId"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={`${t("fullName")} *`}
          name="fullName"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={`${t("dateOfBirth")} *`}
          name="dateOfBirth"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label={`${t("gender")} *`}
          name="gender"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Select>
            <Option value="Male">{t("genders.male")}</Option>
            <Option value="Female">{t("genders.female")}</Option>
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
          label={`${t("phone")} *`}
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
              placeholder={t("addEditStudent.selectCountryCode")}
              className="me-2"
              onChange={async (value) => {
                const config = await getCountryConfig(value);
                const escapedRegex = config.regex
                  .replace(/\+/g, "\\+")
                  .replace(/d/g, "\\d");

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
                <Option disabled>{t("addEditStudent.noData")}</Option>
              )}
            </Select>
            <Input placeholder={t("addEditStudent.inputPhonePlaceholder")} />
          </div>
        </Form.Item>
        {/* Quốc tịch */}
        <Form.Item
          name={["permanentAddress", "country"]}
          label={t("addEditStudent.nationality")}
          rules={[{ message: t("addEditStudent.selectNationality") }]}
        >
          <Select
            placeholder={t("addEditStudent.selectNationality")}
            onChange={(value) => {
              form.setFieldsValue({ permanentAddress: { country: value } });
            }}
          >
            {Array.isArray(countries) ? (
              countries.map((country, index) => (
                <Select.Option key={index} value={country.country}>
                  {country.country}
                </Select.Option>
              ))
            ) : (
              <Select.Option disabled>
                {t("addEditStudent.noData")}
              </Select.Option>
            )}
          </Select>
        </Form.Item>

        {/* Địa chỉ thường trú */}
        <Form.Item label={t("addEditStudent.permanentAddress")}>
          <Form.Item
            name={["permanentAddress", "streetAddress"]}
            label={t("addEditStudent.streetAddress")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "ward"]}
            label={t("addEditStudent.ward")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "district"]}
            label={t("addEditStudent.district")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "city"]}
            label={t("addEditStudent.city")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["permanentAddress", "country"]}
            label={t("addEditStudent.country")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ tạm trú */}
        <Form.Item label={t("addEditStudent.temporaryAddress")}>
          <Form.Item
            name={["temporaryAddress", "streetAddress"]}
            label={t("addEditStudent.streetAddress")}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "ward"]}
            label={t("addEditStudent.ward")}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "district"]}
            label={t("addEditStudent.district")}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "city"]}
            label={t("addEditStudent.city")}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["temporaryAddress", "country"]}
            label={t("addEditStudent.country")}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Địa chỉ nhận thư */}
        <Form.Item label={t("addEditStudent.mailingAddress")}>
          <Form.Item
            name={["mailingAddress", "streetAddress"]}
            label={t("addEditStudent.streetAddress")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "ward"]}
            label={t("addEditStudent.ward")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "district"]}
            label={t("addEditStudent.district")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "city"]}
            label={t("addEditStudent.city")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mailingAddress", "country"]}
            label={t("addEditStudent.country")}
            rules={[{ required: true, message: t("addEditStudent.required") }]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        {/* Khoa */}
        <Form.Item
          label={t("addEditStudent.faculty")}
          name="faculty"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Select>
            {Array.isArray(faculties) ? (
              faculties.map((faculty) => (
                <Option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </Option>
              ))
            ) : (
              <Option disabled>{t("addEditStudent.noData")}</Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label={t("addEditStudent.course")}
          name="course"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input />
        </Form.Item>

        {/* Chương trình */}
        <Form.Item
          label={t("addEditStudent.program")}
          name="program"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
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
          label={t("addEditStudent.status")}
          name="status"
          rules={[{ required: true, message: t("addEditStudent.required") }]}
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
          label={t("addEditStudent.identityType")}
          name={["identityDocument", "type"]}
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Select>
            <Option value="CMND">{t("addEditStudent.cmnd")}</Option>
            <Option value="CCCD">{t("addEditStudent.cccd")}</Option>
            <Option value="Passport">{t("addEditStudent.passport")}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("addEditStudent.identityNumber")}
          name={["identityDocument", "number"]}
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("addEditStudent.issueDate")}
          name={["identityDocument", "issueDate"]}
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label={t("addEditStudent.issuePlace")}
          name={["identityDocument", "issuePlace"]}
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("addEditStudent.expiryDate")}
          name={["identityDocument", "expiryDate"]}
          rules={[{ required: true, message: t("addEditStudent.required") }]}
        >
          <Input type="date" />
        </Form.Item>

        {documentType === "CCCD" && (
          <Form.Item
            label={t("addEditStudent.hasChip")}
            name={["identityDocument", "hasChip"]}
          >
            <Select>
              <Option value={true}>{t("addEditStudent.yes")}</Option>
              <Option value={false}>{t("addEditStudent.no")}</Option>
            </Select>
          </Form.Item>
        )}

        {documentType === "Passport" && (
          <>
            <Form.Item
              label={t("addEditStudent.issuingCountry")}
              name={["identityDocument", "issuingCountry"]}
              rules={[
                { required: true, message: t("addEditStudent.required") },
              ]}
            >
              <Input
                placeholder={t("addEditStudent.issuingCountryPlaceholder")}
              />
            </Form.Item>
            <Form.Item
              label={t("addEditStudent.notes")}
              name={["identityDocument", "notes"]}
            >
              <Input placeholder={t("addEditStudent.notesPlaceholder")} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
