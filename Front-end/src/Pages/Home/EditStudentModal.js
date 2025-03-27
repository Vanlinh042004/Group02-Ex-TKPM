import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Select, message, Space } from "antd";
import axios from "axios";
import swal from "sweetalert";
import {
  getFaculty,
  getProgram,
  getStatus,
  updateStudent,
  addFaculty,
  addProgram,
  addStatus,
  updateFaculty,
  updateProgram,
  updateStatus,
} from "../../Services/studentService";
const { Option } = Select;

const EditStudentModal = ({
  isModalVisible,
  setIsModalVisible,
  student,
  setStudents,
}) => {
  const [form] = Form.useForm();
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const [isAddFacultyModalVisible, setIsAddFacultyModalVisible] =
    useState(false);
  const [isAddProgramModalVisible, setIsAddProgramModalVisible] =
    useState(false);
  const [isAddStatusModalVisible, setIsAddStatusModalVisible] = useState(false);
  const [isEditFacultyModalVisible, setIsEditFacultyModalVisible] =
    useState(false);
  const [isEditProgramModalVisible, setIsEditProgramModalVisible] =
    useState(false);
  const [isEditStatusModalVisible, setIsEditStatusModalVisible] =
    useState(false);
  const allowedeEmail = process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN;
  const allowedPhone = new RegExp(process.env.REACT_APP_ALLOWED_PHONE);

  // State lưu dữ liệu nhập vào
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDuration, setNewProgramDuration] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusDescription, setNewStatusDescription] = useState("");
  const [check, setCheck] = useState(false);

  // State để lưu ID của mục được chọn khi đổi tên
  const [selectedFaculty, setSelectedFaculty] = useState({
    _id: null,
    facultyId: null,
  });
  const [selectedProgram, setSelectedProgram] = useState({
    _id: null,
    programId: null,
  });
  const [selectedStatus, setSelectedStatus] = useState(null);

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
        faculty: student.faculty?._id,
        program: student.program?._id,
        status: student.status?._id,
        permanentAddress: {
          ...student.permanentAddress,
          country: student.permanentAddress?.country || "",
        },
        temporaryAddress: {
          ...student.temporaryAddress,
          country: student.temporaryAddress?.country || "",
        },
        mailingAddress: {
          ...student.mailingAddress,
          country: student.mailingAddress?.country || "",
        },
      });

      setDocumentType(student.identityDocument?.type || "");
    }
  }, [student, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faculties = await getFaculty();
        //console.log("Faculties:", faculties);
        setFaculties(faculties.data || []);
      } catch (error) {
        console.log(error);
      }

      try {
        const programs = await getProgram();
        //console.log("Programs:", programs);
        setPrograms(programs.data || []);
      } catch (error) {
        console.log(error);
      }
      try {
        const statuses = await getStatus();
        //console.log("Statuses:", statuses);
        setStatuses(statuses.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [check]);
  const checkValidEmail = (email) => {
    const domain = "@" + email.split("@")[1];
    return domain === allowedeEmail;
  };
  const checkValidPhone = (phone) => {
    return allowedPhone.test(phone);
  };
  const handleUpdateStudent = () => {
    form
      .validateFields()
      .then((values) => {
        if (!checkValidEmail(values.email)) {
          //console.log(values.email);
          swal("Lỗi!", "Email không hợp lệ!", "error");
          return;
        }
        if (!checkValidPhone(values.phone)) {
          swal("Lỗi!", "Số điện thoại không hợp lệ!", "error");
          return;
        }
        const updatedStudentData = {
          ...values,
          dateOfBirth: new Date(values.dateOfBirth).toISOString(),
          identityDocument: {
            ...values.identityDocument,
            issueDate: new Date(
              values.identityDocument.issueDate
            ).toISOString(),
            expiryDate: new Date(
              values.identityDocument.expiryDate
            ).toISOString(),
          },
        };
        //console.log("Dữ liệu gửi lên backend:", updatedStudentData);

        updateStudent(student.studentId, updatedStudentData)
        console.log("Dữ liệu gửi lên backend:", updatedStudentData);
        axios
          .then(() => {
            setStudents((students) =>
              students.map((s) =>
                s._id === student._id ? { ...s, ...updatedStudentData } : s
              )
            );
            setIsModalVisible(false);
            swal(
              "Thành công!",
              "Cập nhật thông tin sinh viên thành công!",
              "success"
            );
            //message.success("Cập nhật thông tin sinh viên thành công!");
          })
          .catch(() => message.error("Cập nhật thông tin sinh viên thất bại!"));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Xử lý thêm mới Khoa
  const handleAddFaculty = async () => {
    const requestBody = { name: newFacultyName };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await addFaculty(requestBody);
      //console.log(res.data);
      setFaculties([...faculties, res.data]);
      setIsAddFacultyModalVisible(false);
      setNewFacultyName("");
      setCheck(!check);
      swal("Thành công!", "Thêm Khoa thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  // Xử lý thêm mới Chương trình học
  const handleAddProgram = async () => {
    const requestBody = { name: newProgramName, duration: newProgramDuration };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await addProgram(requestBody);
      //console.log(res.data);
      setPrograms([...programs, res.data]);
      setIsAddProgramModalVisible(false);
      setNewProgramName("");
      setNewProgramDuration("");
      setCheck(!check);
      swal("Thành công!", "Thêm Chương trình học thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  // Xử lý thêm mới Trạng thái
  const handleAddStatus = async () => {
    const requestBody = {
      name: newStatusName,
      description: newStatusDescription,
    };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await addStatus(requestBody);
      //console.log(res.data);
      setStatuses([...statuses, res.data]);
      setIsAddStatusModalVisible(false);
      setNewStatusName("");
      setNewStatusDescription("");
      setCheck(!check);
      swal("Thành công!", "Thêm Trạng thái thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  // Update the handleUpdateFaculty function to use the new state structure
  const handleUpdateFaculty = async () => {
    if (!selectedFaculty._id) {
      //return message.error("Vui lòng chọn một Khoa!");
      swal("Lỗi!", "Vui lòng chọn một Khoa!", "error");
      return;
    }
    const requestBody = {
      newName: newFacultyName,
      facultyId: selectedFaculty.facultyId,
    };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await updateFaculty(selectedFaculty._id, requestBody);
      //console.log(res.data);
      setFaculties(
        faculties.map((f) =>
          f._id === selectedFaculty._id
            ? {
                ...f,
                name: newFacultyName,
                facultyId: selectedFaculty.facultyId,
              }
            : f
        )
      );
      setIsEditFacultyModalVisible(false);
      setNewFacultyName("");
      setCheck(!check);
      swal("Thành công!", "Đổi tên Khoa thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProgram = async () => {
    if (!selectedProgram._id) {
      //return message.error("Vui lòng chọn một Chương trình học!");
      swal("Lỗi!", "Vui lòng chọn một Chương trình học!", "error");
      return;
    }
    const requestBody = {
      newName: newProgramName,
      programId: selectedProgram.programId,
    };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await updateProgram(selectedProgram._id, requestBody);
      //console.log(res.data);
      setPrograms(
        programs.map((p) =>
          p._id === selectedProgram._id
            ? {
                ...p,
                name: newProgramName,
                programId: selectedProgram.programId,
              }
            : p
        )
      );
      setIsEditProgramModalVisible(false);
      setNewProgramName("");
      setNewProgramDuration("");
      setCheck(!check);
      swal("Thành công!", "Đổi tên Chương trình học thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      //return message.error("Vui lòng chọn một Trạng thái!");
      swal("Lỗi!", "Vui lòng chọn một Trạng thái!", "error");
      return;
    }
    const requestBody = { newName: newStatusName, statusId: selectedStatus };
    //console.log("Dữ liệu gửi lên backend:", requestBody);
    try {
      const res = await updateStatus(selectedStatus, requestBody);
      //console.log(res.data);
      setStatuses(
        statuses.map((s) =>
          s._id === selectedStatus ? { ...s, name: newStatusName } : s
        )
      );
      setIsEditStatusModalVisible(false);
      setNewStatusName("");
      setNewStatusDescription("");
      setCheck(!check);
      swal("Thành công!", "Đổi tên Trạng thái thành công!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        title="Chỉnh sửa thông tin sinh viên"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdateStudent}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Mã sinh viên" name="studentId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Tên sinh viên" name="fullName">
            <Input />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="dateOfBirth">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Quốc tịch" name="nationality">
            <Input />
          </Form.Item>

          <Form.Item label="Khoa" name="faculty">
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsAddFacultyModalVisible(true)}
                  >
                    + Thêm mới Khoa
                  </div>
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsEditFacultyModalVisible(true)}
                  >
                    + Đổi tên Khoa
                  </div>
                </>
              )}
            >
              {faculties.map((faculty) => (
                <Option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Chương trình học" name="program">
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsAddProgramModalVisible(true)}
                  >
                    + Thêm mới Chương trình học
                  </div>
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsEditProgramModalVisible(true)}
                  >
                    + Đổi tên Chương trình học
                  </div>
                </>
              )}
            >
              {programs.map((program) => (
                <Option key={program._id} value={program._id}>
                  {program.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsAddStatusModalVisible(true)}
                  >
                    + Thêm mới Trạng thái
                  </div>
                  <div
                    style={{ padding: 8, cursor: "pointer", color: "blue" }}
                    onClick={() => setIsEditStatusModalVisible(true)}
                  >
                    + Đổi tên Trạng thái
                  </div>
                </>
              )}
            >
              {statuses.map((status) => (
                <Option key={status._id} value={status._id}>
                  {status.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Form.Item label="Khóa học" name="academicYear">
            <Input placeholder="Nhập khóa học (VD: 2020 - 2024)" />
            <Form.Item label="Mã sinh viên" name="studentId"><Input disabled /></Form.Item>
          </Form.Item> */}
          <Form.Item label="Khóa học" name="course">
            <Input />
          </Form.Item>

          {["permanentAddress", "temporaryAddress", "mailingAddress"].map(
            (addressType) => (
              <Form.Item
                key={addressType}
                label={
                  addressType === "permanentAddress"
                    ? "Địa chỉ thường trú"
                    : addressType === "temporaryAddress"
                    ? "Địa chỉ tạm trú"
                    : "Địa chỉ nhận thư"
                }
              >
                <Input.Group compact>
                  <Form.Item name={[addressType, "streetAddress"]}>
                    <Input placeholder="Số nhà, đường" />
                  </Form.Item>
                  <Form.Item name={[addressType, "ward"]}>
                    <Input placeholder="Phường/Xã" />
                  </Form.Item>
                  <Form.Item name={[addressType, "district"]}>
                    <Input placeholder="Quận/Huyện" />
                  </Form.Item>
                  <Form.Item name={[addressType, "city"]}>
                    <Input placeholder="Tỉnh/Thành phố" />
                  </Form.Item>
                  <Form.Item name={[addressType, "country"]}>
                    <Input placeholder="Quốc gia" />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            )
          )}

          <Form.Item
            label="Giấy tờ tùy thân"
            name={["identityDocument", "type"]}
          >
            <Select
              value={documentType}
              onChange={(value) => setDocumentType(value)}
            >
              <Option value="CMND">CMND</Option>
              <Option value="CCCD">CCCD</Option>
              <Option value="Passport">Hộ chiếu</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Số giấy tờ" name={["identityDocument", "number"]}>
            <Input />
          </Form.Item>
          <Form.Item label="Ngày cấp" name={["identityDocument", "issueDate"]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Nơi cấp" name={["identityDocument", "issuePlace"]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày hết hạn"
            name={["identityDocument", "expiryDate"]}
          >
            <Input type="date" />
          </Form.Item>

          {documentType === "CCCD" && (
            <Form.Item
              label="CCCD có gắn chip?"
              name={["identityDocument", "hasChip"]}
            >
              <Select>
                <Option value="true">Có</Option>
                <Option value="false">Không</Option>
              </Select>
            </Form.Item>
          )}

          {documentType === "Passport" && (
            <>
              <Form.Item
                label="Quốc gia cấp"
                name={["identityDocument", "issuingCountry"]}
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

      {/* Modal Thêm Khoa */}
      <Modal
        title="Thêm Khoa"
        open={isAddFacultyModalVisible}
        onOk={handleAddFaculty}
        onCancel={() => setIsAddFacultyModalVisible(false)}
      >
        <Input
          placeholder="Tên Khoa"
          value={newFacultyName}
          onChange={(e) => setNewFacultyName(e.target.value)}
        />
      </Modal>

      {/* Modal Đổi Tên Khoa */}
      <Modal
        title="Đổi Tên Khoa"
        open={isEditFacultyModalVisible}
        onOk={handleUpdateFaculty}
        onCancel={() => setIsEditFacultyModalVisible(false)}
      >
        <Select
          placeholder="Chọn Khoa"
          value={selectedFaculty._id}
          onChange={(value) => {
            const faculty = faculties.find((f) => f._id === value);
            setSelectedFaculty({
              _id: faculty._id,
              facultyId: faculty.facultyId,
            });
          }}
          style={{ width: "100%", marginBottom: 8 }}
        >
          {faculties.map((faculty) => (
            <Option key={faculty._id} value={faculty._id}>
              {faculty.name}
            </Option>
          ))}
        </Select>
        <Input
          placeholder="Tên mới"
          value={newFacultyName}
          onChange={(e) => setNewFacultyName(e.target.value)}
        />
      </Modal>

      {/* Modal Thêm Chương trình học */}
      <Modal
        title="Thêm Chương trình học"
        open={isAddProgramModalVisible}
        onOk={handleAddProgram}
        onCancel={() => setIsAddProgramModalVisible(false)}
      >
        <Input
          placeholder="Tên Chương trình"
          value={newProgramName}
          onChange={(e) => setNewProgramName(e.target.value)}
        />
        <Input
          placeholder="Thời gian học (năm)"
          value={newProgramDuration}
          onChange={(e) => setNewProgramDuration(e.target.value)}
        />
      </Modal>

      {/* Modal Đổi Tên Chương Trình Học */}
      <Modal
        title="Đổi Tên Chương trình học"
        open={isEditProgramModalVisible}
        onOk={handleUpdateProgram}
        onCancel={() => setIsEditProgramModalVisible(false)}
      >
        <Select
          placeholder="Chọn Chương trình"
          value={selectedProgram._id}
          onChange={(value) => {
            const program = programs.find((p) => p._id === value);
            setSelectedProgram({
              _id: program._id,
              programId: program.programId,
            });
          }}
          style={{ width: "100%", marginBottom: 8 }}
        >
          {programs.map((program) => (
            <Option key={program._id} value={program._id}>
              {program.name}
            </Option>
          ))}
        </Select>
        <Input
          placeholder="Tên mới"
          value={newProgramName}
          onChange={(e) => setNewProgramName(e.target.value)}
        />
      </Modal>

      {/* Modal Thêm Trạng thái */}
      <Modal
        title="Thêm Trạng thái"
        open={isAddStatusModalVisible}
        onOk={handleAddStatus}
        onCancel={() => setIsAddStatusModalVisible(false)}
      >
        <Input
          placeholder="Tên Trạng thái"
          value={newStatusName}
          onChange={(e) => setNewStatusName(e.target.value)}
        />
        <Input
          placeholder="Mô tả"
          value={newStatusDescription}
          onChange={(e) => setNewStatusDescription(e.target.value)}
        />
      </Modal>

      {/* Modal Đổi Tên Trạng Thái */}
      <Modal
        title="Đổi Tên Trạng thái"
        open={isEditStatusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setIsEditStatusModalVisible(false)}
      >
        <Select
          placeholder="Chọn Trạng thái"
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          style={{ width: "100%", marginBottom: 8 }}
        >
          {statuses.map((status) => (
            <Option key={status._id} value={status._id}>
              {status.name}
            </Option>
          ))}
        </Select>
        <Input
          placeholder="Tên mới"
          value={newStatusName}
          onChange={(e) => setNewStatusName(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default EditStudentModal;
