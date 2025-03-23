import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Home.scss";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Upload, message } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  searchStudent,
  getStudent,
  deleteStudent,
} from "../../Services/studentService";
import AddStudentModal from "../Home/AddStudentModal";
import EditStudentModal from "../Home/EditStudentModal";
import {
  exportStudentsToCSV,
  exportStudentsToJSON,
} from "../Home/ExportStudents";
import swal from "sweetalert";

function Home() {
  const [students, setStudents] = useState([]);
  const [check, setCheck] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [searchId, setSearchID] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchFaculty, setSearchFaculty] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await searchStudent(searchId, searchName, searchFaculty);
      setStudents(data);
    } catch (error) {
      // console.error("Lỗi khi tìm kiếm sinh viên:", error);
      swal("Không tìm thấy sinh viên", "Vui lòng thử lại", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      swal("Xóa thành công", "Sinh viên đã được xóa", "success");
      setCheck(!check);
    } catch (error) {
      console.error("Lỗi khi xóa sinh viên:", error);
    }
  };

  const showModal = () => setIsModalVisible(true);

  const showEditModal = (student) => {
    setStudentToEdit(student);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudent();
        setStudents(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
      }
    };
    fetchStudents();
  }, [check, isEditModalVisible, isModalVisible]);

  // Xử lý Import
  const handleImport = async (file) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const fileData = event.target.result;
      //console.log("File data:", fileData);

      if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(fileData);
          console.log("Parsed JSON data:", jsonData);
          if (!Array.isArray(jsonData)) {
            message.error("File JSON không hợp lệ!");
            return;
          }
          // Send JSON data to the backend
          const response = await axios.post("http://localhost:5000/api/student/import", { format: "json", data: jsonData });
          console.log('Response from server:', jsonData);
          setStudents(response.data.data);
          message.success("Import JSON thành công!");
        } catch (error) {
          message.error("Lỗi khi đọc file JSON!");
        }
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            if (!result.data || result.data.length === 0) {
              message.error("File CSV không hợp lệ hoặc trống!");
              return;
            }
            // Send CSV data to the backend
            const response = await axios.post("http://localhost:5000/api/student/import", { format: "csv", data: result.data });
            setStudents(response.data.data);
            message.success("Import CSV thành công!");
          },
          error: () => {
            message.error("Lỗi khi đọc file CSV!");
          },
        });
      } else {
        message.error("Chỉ hỗ trợ file CSV và JSON!");
      }
    };

    reader.readAsText(file);
    return false; // Ngăn không cho upload tự động lên server
  };

  return (
    <>
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="full-wrap">
                <div className="one-third search p-5">
                  <h3 className="text-center mb-4">Bạn muốn tìm kiếm?</h3>
                  <form className="course-search-form">
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Nhập Họ và Tên"
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Nhập Mã sinh viên"
                      onChange={(e) => setSearchID(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Nhập Tên khoa"
                      onChange={(e) => setSearchFaculty(e.target.value)}
                    />

                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={handleSearch}
                      style={{
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    >
                      Tìm kiếm
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nút chức năng */}
      <div className="container mt-5 d-flex justify-content-between">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          onClick={showModal}
        >
          Thêm Sinh viên
        </Button>

        <Upload
          beforeUpload={() => false}
          onChange={(info) => handleImport(info.file)}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            shape="round"
          >
            Import CSV/JSON
          </Button>
        </Upload>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          shape="round"
          onClick={() => exportStudentsToCSV(students)}
        >
          Export CSV
        </Button>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          shape="round"
          onClick={() => exportStudentsToJSON(students)}
        >
          Export JSON
        </Button>
      </div>

      {/* Modals */}
      <AddStudentModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        students={students}
        setStudents={setStudents}
      />
      <EditStudentModal
        isModalVisible={isEditModalVisible}
        setIsModalVisible={setIsEditModalVisible}
        student={studentToEdit}
        setStudents={setStudents}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {students.map((student, index) => (
              <div className="col-md-4 d-flex" key={index}>
                <div className="student-card align-self-stretch p-4 mb-4">
                  <h4 className="mb-3">{student.fullName}</h4>
                  <p>
                    <b>Mã số sinh viên:</b> {student.studentId}
                  </p>
                  <p>
                    <b>Ngày sinh:</b>{" "}
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p>
                    <b>Giới tính:</b> {student.gender}
                  </p>
                  <p>
                    <b>Khoa:</b> {student.faculty?.name || "N/A"}
                  </p>
                  <p>
                    <b>Khóa:</b> {student.course}
                  </p>
                  <p>
                    <b>Chương trình:</b> {student.program?.name} (
                    {student.program?.programId})
                  </p>
                  <p>
                    <b>Email:</b> {student.email}
                  </p>
                  <p>
                    <b>Điện thoại:</b> {student.phone}
                  </p>
                  <p>
                    <b>Trạng thái:</b> {student.status?.name || "N/A"}
                  </p>

                  {/* Địa chỉ thường trú */}
                  <p>
                    <b>Địa chỉ thường trú:</b>{" "}
                    {student.permanentAddress
                      ? `${student.permanentAddress.streetAddress}, ${student.permanentAddress.district}, ${student.permanentAddress.city}`
                      : "N/A"}
                  </p>

                  {/* Chứng minh nhân dân */}
                  <p>
                    <b>CMND:</b> {student.identityDocument?.number || "N/A"} -{" "}
                  </p>
                  <p>
                    <b>Nơi cấp:</b>{" "}
                    {student.identityDocument?.issuePlace || "N/A"}
                  </p>

                  <div className="d-flex justify-content-between">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      shape="round"
                      onClick={() => showEditModal(student)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={() => handleDelete(student.studentId)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;