import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Home.scss";
import Modal from "react-modal";
import {
  DeleteOutlined,
  FullscreenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useState, useEffect } from "react";
import {
  searchStudent,
  getStudent,
  deleteStudent,
} from "../../Services/studentService";
import swal from "sweetalert";
function Home() {
  const [students, setStudents] = useState([]);
  const [check, setCheck] = useState(false);
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#d6dadf",
    },
  };
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
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
  }, [search, check]);

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
  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }
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
          onClick={openModal}
        >
          Thêm Sinh viên
        </Button>
        <Modal
          isOpen={showModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <form className=" px-3">
            <h2 className="text-center mb-4">Thông tin sinh viên</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="student_id"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Mã số sinh viên"
              />
              <input
                type="text"
                name="name"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Họ tên"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                name="dob"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Ngày sinh"
              />
              <select
                name="gender"
                className="w-full border rounded-lg py-3 px-5"
              >
                <option value="">Giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="faculty"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Khoa"
              />
              <input
                type="text"
                name="course"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Khóa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="program"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Chương trình"
              />
              <select
                name="status"
                className="w-full border rounded-lg py-3 px-5"
              >
                <option value="">Tình trạng</option>
                <option value="active">Đang học</option>
                <option value="graduated">Đã tốt nghiệp</option>
                <option value="suspended">Bảo lưu</option>
              </select>
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="address"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Địa chỉ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                name="email"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Email"
              />
              <input
                type="text"
                name="phone"
                className="w-full border rounded-lg py-3 px-5"
                placeholder="Số điện thoại"
              />
            </div>
            <div className="d-flex justify-content-between">
              <Button
                type="primary"
                size="large"
                shape="round"
                danger
                onClick={closeModal}
              >
                <span>Hủy</span>
              </Button>
              <Button
                className="btn-delete"
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                shape="round"
                style={{ color: "yellow !important" }}
              >
                Thêm sinh viên
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {students.map((student) => (
              <div className="col-md-4 d-flex" key={student._id}>
                <div className="student-card align-self-stretch p-4 mb-4">
                  <h4 className="mb-3">{student.fullName}</h4>
                  <p>
                    <b>Mã số sinh viên:</b> {student.studentId}
                  </p>
                  <p>
                    <b>Ngày sinh:</b> {student.dateOfBirth}
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
                      icon={<FullscreenOutlined />}
                      size="large"
                      shape="round"
                      style={{ color: "yellow !important" }}
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
