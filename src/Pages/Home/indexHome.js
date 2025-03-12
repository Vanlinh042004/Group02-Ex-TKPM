import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Home.scss";
import {
  DeleteOutlined,
  FullscreenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
function Home() {
  const students = [
    {
      student_id: "SV001",
      name: "Nguyễn Văn A",
      dob: "2003-05-12",
      gender: "Nam",
      faculty: "Khoa Luật",
      course: "Khóa 2021",
      program: "Cử nhân Luật",
      address: "123 Nguyễn Trãi, Hà Nội",
      email: "nguyenvana@example.com",
      phone: "0987654321",
      status: "Đang học",
    },
    {
      student_id: "SV002",
      name: "Trần Thị B",
      dob: "2002-09-22",
      gender: "Nữ",
      faculty: "Khoa Tiếng Anh thương mại",
      course: "Khóa 2020",
      program: "Cử nhân Ngôn ngữ Anh",
      address: "456 Lê Lợi, TP.HCM",
      email: "tranthib@example.com",
      phone: "0976543210",
      status: "Đã tốt nghiệp",
    },
    {
      student_id: "SV003",
      name: "Lê Văn C",
      dob: "2004-02-15",
      gender: "Nam",
      faculty: "Khoa Tiếng Nhật",
      course: "Khóa 2022",
      program: "Cử nhân Ngôn ngữ Nhật",
      address: "789 Trần Phú, Đà Nẵng",
      email: "levanc@example.com",
      phone: "0965432109",
      status: "Tạm dừng học",
    },
    {
      student_id: "SV004",
      name: "Phạm Thị D",
      dob: "2001-12-10",
      gender: "Nữ",
      faculty: "Khoa Tiếng Pháp",
      course: "Khóa 2019",
      program: "Cử nhân Ngôn ngữ Pháp",
      address: "101 Hùng Vương, Huế",
      email: "phamthid@example.com",
      phone: "0954321098",
      status: "Đã thôi học",
    },
  ];
  return (
    <>
      <section className=" mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="full-wrap">
                <div className="one-third search p-5">
                  <h3 className=" text-center mb-4">Bạn muốn tìm kiếm ?</h3>
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
                  <form action="#" className="course-search-form">
                    <div className="form-group d-flex">
                      <select
                        className="form-control"
                        defaultValue=""
                        name="filter"
                      >
                        <option value="" disabled>
                          Chọn môn học
                        </option>
                        <option value="Toán">Toán</option>
                        <option value="Ngữ văn">Ngữ văn</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                        <option value="Lý">Lý</option>
                      </select>
                      <input
                        type="submit"
                        value="Lọc"
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
        >
          Thêm Sinh viên
        </Button>
      </div>

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {students.map((student) => (
              <div className="col-md-4 d-flex" key={student.student_id}>
                <div className="student-card align-self-stretch p-4 mb-4">
                  <h4 className="mb-3">{student.name}</h4>
                  <p>
                    <b>ID:</b> {student.student_id}
                  </p>
                  <p>
                    <b>Ngày sinh:</b> {student.dob}
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
