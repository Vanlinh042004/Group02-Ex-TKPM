
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
  const [isAddFacultyModalVisible, setIsAddFacultyModalVisible] = useState(false);
  const [isAddProgramModalVisible, setIsAddProgramModalVisible] = useState(false);
  const [isAddStatusModalVisible, setIsAddStatusModalVisible] = useState(false);
  const [isEditFacultyModalVisible, setIsEditFacultyModalVisible] = useState(false);
  const [isEditProgramModalVisible, setIsEditProgramModalVisible] = useState(false);
  const [isEditStatusModalVisible, setIsEditStatusModalVisible] = useState(false);

  // State lưu dữ liệu nhập vào
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDuration, setNewProgramDuration] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusDescription, setNewStatusDescription] = useState("");

  // State để lưu ID của mục được chọn khi đổi tên
  const [selectedFaculty, setSelectedFaculty] = useState({ _id: null, facultyId: null });
  const [selectedProgram, setSelectedProgram] = useState({ _id: null, programId: null });
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
      console.log("Dữ liệu gửi lên backend:", updatedStudentData);

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

  // Xử lý thêm mới Khoa
  const handleAddFaculty = () => {
    const requestBody = { name: newFacultyName };
    console.log("Dữ liệu gửi lên backend:", requestBody);
    axios.post("http://localhost:5000/api/faculty/add", requestBody)
      .then((res) => {
        setFaculties([...faculties, res.data]);
        message.success("Thêm Khoa thành công!");
        setIsAddFacultyModalVisible(false);
        setNewFacultyName("");
      })
      .catch(() => message.error("Thêm Khoa thất bại!"));
  };

  // Xử lý thêm mới Chương trình học
  const handleAddProgram = () => {
    const requestBody = { name: newProgramName, duration: newProgramDuration };
    console.log("Dữ liệu gửi lên backend:", requestBody);
    axios.post("http://localhost:5000/api/program/add", requestBody)
      .then((res) => {
        setPrograms([...programs, res.data]);
        message.success("Thêm Chương trình học thành công!");
        setIsAddProgramModalVisible(false);
        setNewProgramName("");
        setNewProgramDuration("");
      })
      .catch(() => message.error("Thêm Chương trình học thất bại!"));
  };

  // Xử lý thêm mới Trạng thái
  const handleAddStatus = () => {
    const requestBody = { name: newStatusName, description: newStatusDescription };
    console.log("Dữ liệu gửi lên backend:", requestBody);
    axios.post("http://localhost:5000/api/status/add", requestBody)
      .then((res) => {
        setStatuses([...statuses, res.data]);
        message.success("Thêm Trạng thái thành công!");
        setIsAddStatusModalVisible(false);
        setNewStatusName("");
        setNewStatusDescription("");
      })
      .catch(() => message.error("Thêm Trạng thái thất bại!"));
  };

  // Update the handleUpdateFaculty function to use the new state structure
  const handleUpdateFaculty = () => {
    if (!selectedFaculty._id) return message.error("Vui lòng chọn một Khoa!");
    const requestBody = { newName: newFacultyName, facultyId: selectedFaculty.facultyId };
    console.log("Dữ liệu gửi lên backend:", requestBody);

    axios
      .patch(`http://localhost:5000/api/faculty/update/${selectedFaculty._id}`, requestBody)
      .then(() => {
        setFaculties(faculties.map(f => f._id === selectedFaculty._id ? { ...f, name: newFacultyName, facultyId: selectedFaculty.facultyId } : f));
        message.success("Đổi tên Khoa thành công!");
        setIsEditFacultyModalVisible(false);
        setNewFacultyName("");
      })
      .catch(() => message.error("Đổi tên Khoa thất bại!"));
  };

  // Update the handleUpdateProgram function to use the new state structure
  const handleUpdateProgram = () => {
    if (!selectedProgram._id) return message.error("Vui lòng chọn một Chương trình học!");
    const requestBody = { newName: newProgramName, programId: selectedProgram.programId };
    console.log("Dữ liệu gửi lên backend:", requestBody);

    axios
      .patch(`http://localhost:5000/api/program/update/${selectedProgram._id}`, requestBody)
      .then(() => {
        setPrograms(programs.map(p => p._id === selectedProgram._id ? { ...p, name: newProgramName, programId: selectedProgram.programId } : p));
        message.success("Đổi tên Chương trình học thành công!");
        setIsEditProgramModalVisible(false);
        setNewProgramName("");
      })
      .catch(() => message.error("Đổi tên Chương trình học thất bại!"));
  };

  // Update the handleUpdateStatus function to use the new state structure
  const handleUpdateStatus = () => {
    if (!selectedStatus) return message.error("Vui lòng chọn một Trạng thái!");
    const requestBody = { newName: newStatusName, statusId: selectedStatus };
    console.log("Dữ liệu gửi lên backend:", requestBody);

    axios
      .patch(`http://localhost:5000/api/status/update/${selectedStatus}`, requestBody)
      .then(() => {
        setStatuses(statuses.map(s => s._id === selectedStatus ? { ...s, name: newStatusName } : s));
        message.success("Đổi tên Trạng thái thành công!");
        setIsEditStatusModalVisible(false);
        setNewStatusName("");
      })
      .catch(() => message.error("Đổi tên Trạng thái thất bại!"));
  };

  return (
    <>
      <Modal title="Chỉnh sửa thông tin sinh viên" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleUpdateStudent}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Mã sinh viên" name="studentId"><Input disabled /></Form.Item>
          <Form.Item label="Tên sinh viên" name="fullName"><Input /></Form.Item>
          <Form.Item label="Ngày sinh" name="dateOfBirth"><Input type="date" /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="Số điện thoại" name="phone"><Input /></Form.Item>
          <Form.Item label="Quốc tịch" name="nationality"><Input /></Form.Item>

          <Form.Item label="Khoa" name="faculty">
            <Select
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsAddFacultyModalVisible(true)}>
                    + Thêm mới Khoa
                  </div>
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsEditFacultyModalVisible(true)}>
                    + Đổi tên Khoa
                  </div>
                </>
              )}
            >
              {faculties.map(faculty => <Option key={faculty._id} value={faculty._id}>{faculty.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Chương trình học" name="program">
            <Select
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsAddProgramModalVisible(true)}>
                    + Thêm mới Chương trình học
                  </div>
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsEditProgramModalVisible(true)}>
                    + Đổi tên Chương trình học
                  </div>
                </>
              )}
            >
              {programs.map(program => <Option key={program._id} value={program._id}>{program.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsAddStatusModalVisible(true)}>
                    + Thêm mới Trạng thái
                  </div>
                  <div style={{ padding: 8, cursor: 'pointer', color: 'blue' }} onClick={() => setIsEditStatusModalVisible(true)}>
                    + Đổi tên Trạng thái
                  </div>
                </>
              )}
            >
              {statuses.map(status => <Option key={status._id} value={status._id}>{status.name}</Option>)}
            </Select>
          </Form.Item>

          {/* <Form.Item label="Khóa học" name="academicYear">
            <Input placeholder="Nhập khóa học (VD: 2020 - 2024)" />
            <Form.Item label="Mã sinh viên" name="studentId"><Input disabled /></Form.Item>
          </Form.Item> */}
             <Form.Item label="Khóa học" name="course"><Input  /></Form.Item>

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
                <Form.Item name={[addressType, "country"]}><Input placeholder="Quốc gia" /></Form.Item>
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
            const faculty = faculties.find(f => f._id === value);
            setSelectedFaculty({ _id: faculty._id, facultyId: faculty.facultyId });
          }}
          style={{ width: "100%", marginBottom: 8 }}
        >
          {faculties.map((faculty) => (
            <Option key={faculty._id} value={faculty._id}>{faculty.name}</Option>
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
    const program = programs.find(p => p._id === value);
    setSelectedProgram({ _id: program._id, programId: program.programId });
  }}
  style={{ width: "100%", marginBottom: 8 }}
>
  {programs.map((program) => (
    <Option key={program._id} value={program._id}>{program.name}</Option>
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
      <Option key={status._id} value={status._id}>{status.name}</Option>
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
