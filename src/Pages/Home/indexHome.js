import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Home.scss";
import { Button } from "antd";
import axios from "axios";
import AddStudentModal from "../Home/AddStudentModal";
import EditStudentModal from "../Home/EditStudentModal"; // Import modal chỉnh sửa
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Home() {
  const [students, setStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State cho modal chỉnh sửa
  const [studentToEdit, setStudentToEdit] = useState(null); // Dữ liệu sinh viên cần chỉnh sửa

  // Gọi API khi component được mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/student/list")
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error("Có lỗi khi lấy dữ liệu:", error);
      });
  }, []); // Chỉ gọi 1 lần khi component render

  // Hiển thị modal form thêm sinh viên
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa
  const showEditModal = (student) => {
    setStudentToEdit(student);
    setIsEditModalVisible(true);
  };

  // Xóa sinh viên
  const handleDeleteStudent = (studentId) => {
    axios
      .delete(`http://localhost:3000/api/student/delete/${studentId}`)
      .then((response) => {
        setStudents(students.filter((student) => student.studentId !== studentId));
        alert("Sinh viên đã được xóa");
      })
      .catch((error) => {
        console.error("Lỗi khi xóa sinh viên:", error);
      });
  };

  return (
    <>
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="full-wrap">
                <div className="one-third search p-5">
                  <h3 className="text-center mb-4">Bạn muốn tìm kiếm ?</h3>
                  <form className="course-search-form">
                    <div className="form-group d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập lớp học bạn muốn tìm kiếm"
                      />
                      <input
                        type="submit"
                        value="Tìm kiếm"
                        className="submit ml-2"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-5 d-flex justify-content-center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          style={{
            width: "30%",
            height: "70px",
            backgroundColor: "red",
            fontSize: "20px",
          }}
          onClick={showModal}
        >
          Thêm Sinh viên
        </Button>
      </div>

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
            {students.map((student) => (
              <div className="col-md-4 d-flex" key={student.studentId}>
                <div className="student-card align-self-stretch p-4 mb-4">
                  <h4 className="mb-3">{student.fullName}</h4>
                  <p><b>ID:</b> {student.studentId}</p>
                  <p><b>Ngày sinh:</b> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                  <p><b>Giới tính:</b> {student.gender}</p>
                  <p><b>Khoa:</b> {student.faculty}</p>
                  <p><b>Khóa:</b> {student.course}</p>
                  <p><b>Chương trình:</b> {student.program}</p>
                  <p><b>Địa chỉ:</b> {student.address}</p>
                  <p><b>Email:</b> {student.email}</p>
                  <p><b>Điện thoại:</b> {student.phone}</p>
                  <p><b>Trạng thái:</b> {student.status}</p>

                  <div className="d-flex justify-content-between">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      shape="round"
                      onClick={() => showEditModal(student)} // Mở modal chỉnh sửa
                    >
                      Sửa
                    </Button>
                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={() => handleDeleteStudent(student.studentId)} // Xóa sinh viên
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
