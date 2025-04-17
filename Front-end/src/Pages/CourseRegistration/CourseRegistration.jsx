import React, { useState, useEffect } from "react";

import jsPDF from "jspdf";
import "jspdf-autotable";

import "../../Utils/RobotoCondensed-Regular-normal"
import {
  Tab,
  Nav,
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
} from "react-bootstrap";
import { getClasses } from "../../Services/classService";
import {
  registerCourse,
  getRegistration,
  cancelRegistration,
  getTranscript
} from "../../Services/courseRegistrationService";
import swal from "sweetalert";

const CourseRegistration = () => {
  const [studentId, setStudentId] = useState("");
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [registrations, setRegistrations] = useState([]);


  // Fetch class list
  useEffect(() => {
    getClasses()
      .then((res) => {
        if (res.success) {
          setClassList(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch class list:", err));
  }, []);

  

  useEffect(() => {
  getRegistration()
  .then((res) => {
    if (res.data) {
//console.log("Fetched registrations:", res.data); // debug
      setRegistrations(res.data);
    }
  })
  .catch((err) => console.error("Failed to fetch class list:", err));
}, []);

const handleRegister = () => {
  if (!studentId || !selectedClass) {
    swal("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "error");
    return;
  }

  // Find the selected class object by _id
  const selectedClassObj = classList.find(cls => cls._id === selectedClass);

  if (!selectedClassObj) {
    swal("Lỗi", "Lớp học không hợp lệ!", "error");
    return;
  }

  // Use classId instead of _id for the request
  registerCourse({ studentId, classId: selectedClassObj.classId })
    .then((res) => {
     // console.log("Response from backend:", res); // debug

      // Optional: check res.data or res.message depending on your API
      const message = res.data?.message || "Đăng ký khóa học thành công!";
      swal("Thành Công", message, "success");

      // Optionally refresh registration list here if needed
      // return getRegistration(studentId);
    })
    .catch((err) => {
    //  console.error("Đăng ký thất bại:", err);

      // Try to extract error message from backend
      const errorMessage =
        err.message || "Đăng ký thất bại. Vui lòng thử lại.";

      swal("Lỗi", errorMessage, "error");
    });
};


const handlePrint = async (studentId) => {
  try {
    const res = await getTranscript(studentId);
    //console.log("Transcript data:", res);

    // Check if res and res.data are defined
    if (!res  ) {
      swal("Lỗi", "Không thể lấy bảng điểm!", "error");
      return;
    }

    const { studentInfo, courses, gpa, totalCredits } = res;

    const doc = new jsPDF();

    // Tiêu đề
    doc.setFontSize(16);
   // doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular); // RobotoRegular là biến từ file font js
doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
// doc.setFont("Roboto"); // Dùng font này
doc.setFont("RobotoCondensed-Regular");

    doc.text("BẢNG ĐIỂM SINH VIÊN", 70, 20);

    // Thông tin sinh viên
    doc.setFontSize(12);
    doc.text.setFont("RobotoCondensed-Regular")
    doc.text(`Họ tên: ${studentInfo.fullName}`, 10, 35);
    doc.text(`Mã SV: ${studentInfo.studentId}`, 10, 42);
    doc.text(`Email: ${studentInfo.email}`, 10, 49);
    doc.text(`Khoa: ${studentInfo.faculty.name}`, 10, 56);
    doc.text(`Chương trình: ${studentInfo.program.name}`, 10, 63);
    doc.text(`Trạng thái: ${studentInfo.status.name}`, 10, 70);

    // Bảng điểm
    const tableData = courses.map((course, index) => [
      index + 1,
      course.courseId,
      course.name,
      course.classId,
      course.credits,
      course.grade,
      course.status,
    ]);
    //console.log("doc", doc);
    //console.log("autoTable exists?", typeof doc.autoTable);
    doc.text.setFont("RobotoCondensed-Regular")
    doc.autoTable({
      startY: 80,
      head: [["#", "Mã MH", "Tên môn", "Lớp", "Số tín chỉ", "Điểm", "Kết quả"]],
      body: tableData,
      styles: {
        font: "RobotoCondensed-Regular",
        fontStyle: "normal",
        fontSize: 11, // Có thể chỉnh tùy ý
      },
    });
    
    console.log(doc.getFontList());


    const finalY = doc.autoTable.previous.finalY || 80;

    // GPA
    doc.setFontSize(12);
    doc.text(`Tổng số tín chỉ: ${totalCredits}`, 10, finalY + 10);
    doc.text(`GPA: ${gpa}`, 10, finalY + 17);

    // Xuất PDF
    doc.save(`bang_diem_${studentInfo.studentId}.pdf`);
  } catch (err) {
    console.error(err);
    swal("Lỗi", "In bảng điểm thất bại!", "error");
  }
};




const handleCancel = async (registrationId) => {
  const reason = await swal("Nhập lý do hủy đăng ký:", {
    content: "input",
    buttons: ["Hủy", "Xác nhận"],
  });

  if (!reason) return;
  //console.log("re",registrationId.registrationId);
  try {
    const res = await cancelRegistration(registrationId.registrationId, reason);
   
    const message = res?.data?.message || "Đã hủy đăng ký thành công!";
    
    swal("Thành Công", message, "success");

    // Optional: update state or refetch list if needed
    const refresh = await getRegistration(studentId);
    if (refresh.success) {
      setRegistrations(refresh.data);
    }
  } catch (error) {
    console.error("Cancel failed", error);
    const errMsg = error?.response?.data?.message || "Hủy đăng ký thất bại.";
    swal("Lỗi", errMsg, "error");
  }
};


  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center text-primary">
        📘 Đăng Ký Môn Học Cho Sinh Viên
      </h2>

      <Tab.Container defaultActiveKey="register">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="register">Đăng ký</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="cancel">Hủy đăng ký</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="transcript">In bảng điểm</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col sm={9}>
            <Tab.Content>
              {/* --- Đăng ký --- */}
              <Tab.Pane eventKey="register">
                <h4 className="mb-3">📌 Đăng ký môn học</h4>
                <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nhập mã sinh viên</Form.Label>
                  <Form.Control
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Nhập mã sinh viên"
                  />
                </Form.Group> 


                  <Form.Group className="mb-3">
                    <Form.Label>Chọn lớp học</Form.Label>
                    <Form.Select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">-- Chọn lớp --</option>
                      {classList.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.classId} - {cls.course?.name} ({cls.instructor})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" onClick={handleRegister}>
                    Đăng ký
                  </Button>
                </Form>
              </Tab.Pane>

              {/* --- Hủy đăng ký --- */}
              <Tab.Pane eventKey="cancel">
                <h4 className="mb-3">📌 Hủy đăng ký môn học</h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã SV</th>
                      <th>Môn học</th>
                      <th>Lớp</th>
                      <th>Giảng viên</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Không có đăng ký nào.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg, index) => (
                        <tr key={reg._id}>
                          <td>{index + 1}</td>
                          <td>{reg.student.studentId}</td>
                          <td>{reg.class.course.name}</td>
                          <td>{reg.class.classId}</td>
                          <td>{reg.class.instructor}</td>
                          <td>{reg.status === "cancelled" ? "Đã hủy" : "Đang hoạt động"}</td>
                          <td>
                            {reg.status !== "cancelled" && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                
                                  handleCancel({
                                    registrationId: reg._id,
                                    
                                  })
                                }
                              >
                                Hủy
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>



              {/* --- In bảng điểm --- */}
              <Tab.Pane eventKey="transcript">
                <h4 className="mb-3">📌 In bảng điểm</h4>

                {registrations.length === 0 ? (
                  <p>Không có sinh viên nào đang đăng ký lớp học.</p>
                ) : (
                  <>
                    <Table bordered>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Mã sinh viên</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, index) => (
                          <tr key={reg._id}>
                            <td>{index + 1}</td>
                            <td>{reg.student.studentId}</td>
                            <td>{reg.student.fullName}</td>
                            <td>{reg.student.email}</td>
                            <td>
                              <Button
                                variant="success"
                                onClick={() => handlePrint(reg.student.studentId)}
                              >
                                In bảng điểm
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Tab.Pane>


            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CourseRegistration;
