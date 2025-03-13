import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Home.scss";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState, useEffect } from "react";
import {
  searchStudent,
  getStudent,
  deleteStudent,
} from "../../Services/studentService";
import AddStudentModal from "../Home/AddStudentModal";
import EditStudentModal from "../Home/EditStudentModal";
import swal from "sweetalert";
function Home() {
  const [students, setStudents] = useState([]);
  const [check, setCheck] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [search, setSearch] = useState("");

  const handerSearch = (e) => {
    e.preventDefault();
    setSearch(e.target[0].value);
  };
  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      //console.log(id);
      swal("Xóa thành công", "Sinh viên đã được xóa", "success");
      setCheck(!check);
    } catch (error) {
      console.error(
        "There was a problem with the delete student operation:",
        error
      );
    }
  };
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hiển thị modal chỉnh sửa
  const showEditModal = (student) => {
    setStudentToEdit(student);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (search.trim()) {
          const data = await searchStudent(search);
          // console.log(data);
          if (data.length === 0) {
            swal("Không tìm thấy kết quả nào", "Vui lòng thử lại", "error");
          }
          setStudents(data);
        } else {
          const data = await getStudent();
          // console.log(data);
          setStudents(data);
        }
      } catch (error) {
        console.error(
          "There was a problem with the get courses operation:",
          error
        );
      }
    };
    fetchStudents();
  }, [search, check, isEditModalVisible, isModalVisible]);

  return (
    <>
      <section className=" mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="full-wrap">
                <div className="one-third search p-5">
                  <h3 className=" text-center mb-4">Bạn muốn tìm kiếm ?</h3>
                  <form className="course-search-form" onSubmit={handerSearch}>
                    <div className="form-group d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập họ tên hoặc mã sinh viên"
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
      </div>

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
                    <b>Khoa:</b> {student.faculty}
                  </p>
                  <p>
                    <b>Khóa:</b> {student.course}
                  </p>
                  <p>
                    <b>Chương trình:</b> {student.program}
                  </p>
                  <p>
                    <b>Địa chỉ:</b> {student.address}
                  </p>
                  <p>
                    <b>Email:</b> {student.email}
                  </p>
                  <p>
                    <b>Điện thoại:</b> {student.phone}
                  </p>
                  <p>
                    <b>Trạng thái:</b> {student.status}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Button
                      className="btn-delete"
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      shape="round"
                      onClick={() => showEditModal(student)}
                    >
                      Sửa thông tin
                    </Button>
                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={() => handleDelete(student.studentId)}
                    >
                      <span>Xóa</span>
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
