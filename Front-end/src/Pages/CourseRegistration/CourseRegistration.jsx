import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../Utils/RobotoCondensed-Regular-normal";

import {
  Tab,
  Nav,
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  FloatingLabel,
  Alert,
  Stack,
} from "react-bootstrap";

import { getClasses } from "../../Services/classService";
import {
  registerCourse,
  getRegistration,
  cancelRegistration,
  getTranscript
} from "../../Services/courseRegistrationService";

import swal from "sweetalert";
import { BsPrinter, BsFillTrashFill, BsCheck2Circle, BsBook } from "react-icons/bs";

const CourseRegistration = () => {
  const [studentId, setStudentId] = useState("");
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    getClasses()
      .then((res) => res.success && setClassList(res.data))
      .catch((err) => console.error("Failed to fetch class list:", err));
  }, []);

  useEffect(() => {
    getRegistration()
      .then((res) => res.data && setRegistrations(res.data))
      .catch((err) => console.error("Failed to fetch registration list:", err));
  }, []);

  const handleRegister = () => {
    if (!studentId || !selectedClass) {
      swal("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    const selectedClassObj = classList.find(cls => cls._id === selectedClass);
    if (!selectedClassObj) {
      swal("Lỗi", "Lớp học không hợp lệ!", "error");
      return;
    }

    registerCourse({ studentId, classId: selectedClassObj.classId })
      .then((res) => {
        swal("Thành Công", res.data?.message || "Đăng ký thành công!", "success");
      })
      .catch((err) => {
        const errorMessage = err.message || "Đăng ký thất bại. Vui lòng thử lại.";
        swal("Lỗi", errorMessage, "error");
      });
  };

  const handlePrint = async (studentId) => {
    try {
      const res = await getTranscript(studentId);
      if (!res) return swal("Lỗi", "Không thể lấy bảng điểm!", "error");

      const { studentInfo, courses, gpa, totalCredits } = res;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setFont("RobotoCondensed-Regular");
      doc.text("BẢNG ĐIỂM SINH VIÊN", 70, 20);

      doc.setFontSize(12);
      doc.text(`Họ tên: ${studentInfo.fullName}`, 10, 35);
      doc.text(`Mã SV: ${studentInfo.studentId}`, 10, 42);
      doc.text(`Email: ${studentInfo.email}`, 10, 49);
      doc.text(`Khoa: ${studentInfo.faculty.name}`, 10, 56);
      doc.text(`Chương trình: ${studentInfo.program.name}`, 10, 63);
      doc.text(`Trạng thái: ${studentInfo.status.name}`, 10, 70);

      const tableData = courses.map((course, index) => [
        index + 1,
        course.courseId,
        course.name,
        course.classId,
        course.credits,
        course.grade,
        course.status,
      ]);

      doc.autoTable({
        startY: 80,
        head: [["#", "Mã MH", "Tên môn", "Lớp", "Số tín chỉ", "Điểm", "Kết quả"]],
        body: tableData,
        styles: { font: "RobotoCondensed-Regular", fontStyle: "normal", fontSize: 11 },
      });

      const finalY = doc.autoTable.previous.finalY || 80;
      doc.text(`Tổng số tín chỉ: ${totalCredits}`, 10, finalY + 10);
      doc.text(`GPA: ${gpa}`, 10, finalY + 17);
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

    try {
      const res = await cancelRegistration(registrationId.registrationId, reason);
      swal("Thành Công", res?.data?.message || "Hủy thành công!", "success");

      const refresh = await getRegistration(studentId);
      refresh.success && setRegistrations(refresh.data);
    } catch (error) {
      swal("Lỗi", error?.response?.data?.message || "Hủy đăng ký thất bại.", "error");
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-lg">
        <h2 className="text-center text-primary mb-4">
          <BsBook className="me-2" /> Đăng Ký Môn Học Cho Sinh Viên
        </h2>

        <Tab.Container defaultActiveKey="register">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item><Nav.Link eventKey="register">📌 Đăng ký</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="cancel">🗑️ Hủy đăng ký</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="transcript">🖨️ In bảng điểm</Nav.Link></Nav.Item>
              </Nav>
            </Col>

            <Col sm={9}>
              <Tab.Content>
                {/* Đăng ký */}
                <Tab.Pane eventKey="register">
                  <Card className="p-3 shadow-sm">
                    <h5 className="mb-3">Thông tin đăng ký</h5>
                    <Form>
                      <FloatingLabel label="Mã sinh viên" className="mb-3">
                        <Form.Control
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="Nhập mã sinh viên"
                        />
                      </FloatingLabel>

                      <FloatingLabel label="Chọn lớp học" className="mb-3">
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
                      </FloatingLabel>

                      <Button variant="success" onClick={handleRegister}>
                        <BsCheck2Circle className="me-2" /> Xác nhận đăng ký
                      </Button>
                    </Form>
                  </Card>
                </Tab.Pane>

                {/* Hủy đăng ký */}
                <Tab.Pane eventKey="cancel">
                  <h5 className="mb-3">Danh sách đăng ký</h5>
                  <Table responsive bordered hover>
                    <thead className="table-light">
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
                        <tr><td colSpan="7" className="text-center">Không có đăng ký nào.</td></tr>
                      ) : (
                        registrations.map((reg, index) => (
                          <tr key={reg._id}>
                            <td>{index + 1}</td>
                            <td>{reg.student.studentId}</td>
                            <td>{reg.class.course.name}</td>
                            <td>{reg.class.classId}</td>
                            <td>{reg.class.instructor}</td>
                            <td>{reg.status === "cancelled" ? "Đã hủy" : "Hoạt động"}</td>
                            <td>
                              {reg.status !== "cancelled" && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleCancel({ registrationId: reg._id })}
                                >
                                  <BsFillTrashFill />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Tab.Pane>

                {/* In bảng điểm */}
                <Tab.Pane eventKey="transcript">
                  <h5 className="mb-3">In bảng điểm sinh viên</h5>
                  {registrations.length === 0 ? (
                    <Alert variant="info">Không có sinh viên đang đăng ký.</Alert>
                  ) : (
                    <Table bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Mã SV</th>
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
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handlePrint(reg.student.studentId)}
                              >
                                <BsPrinter className="me-1" /> In PDF
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Card>
    </Container>
  );
};

export default CourseRegistration;
