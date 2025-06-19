import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../utils/RobotoCondensed-Regular-normal";

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
} from "react-bootstrap";

import { getClasses } from "../../services/classService";
import {
  registerCourse,
  getRegistration,
  cancelRegistration,
  getTranscript,
} from "../../services/courseRegistrationService";

import swal from "sweetalert";
import {
  BsPrinter,
  BsFillTrashFill,
  BsCheck2Circle,
  BsBook,
} from "react-icons/bs";

const CourseRegistration = () => {
  const { t } = useTranslation("registration");
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
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
      .then((res) => {
        if (res.data) {
          setRegistrations(res.data);
          console.log("data", res.data); // In ra dữ liệu mới
        }
      })
      .catch((err) => console.error("Failed to fetch registration list:", err));
  }, []);

  const handleRegister = () => {
    if (!studentId || !selectedClass) {
      swal("Lỗi", t("errors.missingInfo"), "error");
      return;
    }

    const selectedClassObj = classList.find((cls) => cls._id === selectedClass);
    if (!selectedClassObj) {
      swal("Lỗi", t("errors.invalidClass"), "error");
      return;
    }

    registerCourse({ studentId, classId: selectedClassObj.classId })
      .then((res) => {
        swal(
          "Thành Công",
          res.data?.message || t("success.registration"),
          "success",
        );
      })
      .catch((err) => {
        const errorMessage = err.message || t("errors.registrationFailed");
        swal("Lỗi", errorMessage, "error");
      });
  };

  const handlePrint = async (studentId) => {
    try {
      const res = await getTranscript(studentId);
      if (!res) return swal("Lỗi", t("errors.transcriptError"), "error");

      const { studentInfo, courses, gpa, totalCredits } = res;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setFont("RobotoCondensed-Regular");

      // Get all translations upfront using the correct paths from registration.json
      const translations = {
        title: t("transcript.title"),
        studentInfo: {
          name: t("transcript.studentInfo.name"),
          id: t("transcript.studentInfo.id"),
          email: t("transcript.studentInfo.email"),
          faculty: t("transcript.studentInfo.faculty"),
          program: t("transcript.studentInfo.program"),
          status: t("transcript.studentInfo.status"),
        },
        table: {
          no: t("transcript.table.no"),
          courseId: t("transcript.table.courseId"),
          courseName: t("transcript.table.courseName"),
          classId: t("transcript.table.classId"),
          credits: t("transcript.table.credits"),
          grade: t("transcript.table.grade"),
          result: t("transcript.table.result"),
        },
        summary: {
          totalCredits: t("transcript.summary.totalCredits"),
          gpa: t("transcript.summary.gpa"),
        },
      };

      // Center the title
      doc.text(translations.title, 70, 20);

      doc.setFontSize(12);
      doc.text(
        `${translations.studentInfo.name}: ${studentInfo.fullName}`,
        10,
        35,
      );
      doc.text(
        `${translations.studentInfo.id}: ${studentInfo.studentId}`,
        10,
        42,
      );
      doc.text(
        `${translations.studentInfo.email}: ${studentInfo.email}`,
        10,
        49,
      );
      doc.text(
        `${translations.studentInfo.faculty}: ${studentInfo.faculty.name}`,
        10,
        56,
      );
      doc.text(
        `${translations.studentInfo.program}: ${studentInfo.program.name}`,
        10,
        63,
      );
      doc.text(
        `${translations.studentInfo.status}: ${studentInfo.status.name}`,
        10,
        70,
      );

      const tableData = courses.map((course, index) => [
        index + 1,
        course.courseId,
        course.name[currentLang],
        course.classId,
        course.credits,
        course.grade,
        course.status,
      ]);

      doc.autoTable({
        startY: 80,
        head: [
          [
            t("transcript.table.no"),
            t("transcript.table.courseId"),
            t("transcript.table.courseName"),
            t("transcript.table.classId"),
            t("transcript.table.credits"),
            t("transcript.table.grade"),
            t("transcript.table.result"),
          ],
        ],
        body: tableData,
        styles: {
          font: "RobotoCondensed-Regular",
          fontStyle: "normal",
          fontSize: 11,
        },
      });

      const finalY = doc.autoTable.previous.finalY || 80;
      doc.text(
        `${translations.summary.totalCredits}: ${totalCredits}`,
        10,
        finalY + 10,
      );
      doc.text(`${translations.summary.gpa}: ${gpa}`, 10, finalY + 17);
      doc.save(`bang_diem_${studentInfo.studentId}.pdf`);
    } catch (err) {
      console.error(err);
      swal("Lỗi", t("errors.printError"), "error");
    }
  };

  const handleCancel = async (registrationId) => {
    const reason = await swal(t("cancel.reason"), {
      content: "input",
      buttons: [t("cancel.cancelButton"), t("cancel.confirmButton")],
    });
    if (!reason) return;

    try {
      const res = await cancelRegistration(
        registrationId.registrationId,
        reason,
      );
      swal(
        "Thành Công",
        res?.data?.message || t("success.cancellation"),
        "success",
      );

      const refresh = await getRegistration(studentId);
      refresh.success && setRegistrations(refresh.data);
    } catch (error) {
      swal(
        "Lỗi",
        error?.response?.data?.message || "Hủy đăng ký thất bại.",
        "error",
      );
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-lg">
        <h2 className="text-center text-primary mb-4">
          <BsBook className="me-2" /> {t("title")}
        </h2>

        <Tab.Container defaultActiveKey="register">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="register">{t("tabs.register")}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="cancel">{t("tabs.cancel")}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="transcript">
                    {t("tabs.transcript")}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            <Col sm={9}>
              <Tab.Content>
                {/* Đăng ký */}
                <Tab.Pane eventKey="register">
                  <Card className="p-3 shadow-sm">
                    <h5 className="mb-3">{t("registerForm.title")}</h5>
                    <Form>
                      <FloatingLabel
                        label={t("registerForm.studentId")}
                        className="mb-3"
                      >
                        <Form.Control
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder={t("registerForm.studentIdPlaceholder")}
                        />
                      </FloatingLabel>

                      <FloatingLabel
                        label={t("registerForm.selectClass")}
                        className="mb-3"
                      >
                        <Form.Select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          <option value="">
                            {t("registerForm.selectClassPlaceholder")}
                          </option>
                          {classList.map((cls) => (
                            <option key={cls._id} value={cls._id}>
                              {cls.classId} - {cls.course?.name[currentLang]} (
                              {cls.instructor})
                            </option>
                          ))}
                        </Form.Select>
                      </FloatingLabel>

                      <Button variant="success" onClick={handleRegister}>
                        <BsCheck2Circle className="me-2" />{" "}
                        {t("registerForm.submit")}
                      </Button>
                    </Form>
                  </Card>
                </Tab.Pane>

                {/* Hủy đăng ký */}
                <Tab.Pane eventKey="cancel">
                  <h5 className="mb-3">{t("registrationList.title")}</h5>
                  <Table responsive bordered hover>
                    <thead className="table-light">
                      <tr>
                        <th>{t("registrationList.table.no")}</th>
                        <th>{t("registrationList.table.studentId")}</th>
                        <th>{t("registrationList.table.course")}</th>
                        <th>{t("registrationList.table.class")}</th>
                        <th>{t("registrationList.table.instructor")}</th>
                        <th>{t("registrationList.table.status")}</th>
                        <th>{t("registrationList.table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            {t("registrationList.noRegistrations")}
                          </td>
                        </tr>
                      ) : (
                        registrations.map((reg, index) => (
                          <tr key={reg._id}>
                            <td>{index + 1}</td>
                            <td>
                              {reg.student ? reg.student.studentId : "N/A"}
                            </td>
                            <td>
                              {reg.class?.course?.name[currentLang] ||
                                t("common.notAvailable")}
                            </td>
                            <td>
                              {reg.class?.classId || t("common.notAvailable")}
                            </td>
                            <td>
                              {reg.class?.instructor ||
                                t("common.notAvailable")}
                            </td>
                            <td>
                              {reg.status === "cancelled"
                                ? t("registrationList.status.cancelled")
                                : t("registrationList.status.active")}
                            </td>
                            <td>
                              {reg.status !== "cancelled" && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleCancel({ registrationId: reg._id })
                                  }
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
                  <h5 className="mb-3">{t("transcript.printTitle")}</h5>
                  {registrations.length === 0 ? (
                    <Alert variant="info">{t("transcript.noStudents")}</Alert>
                  ) : (
                    <Table bordered hover>
                      <thead>
                        <tr>
                          <th>{t("transcript.table.no")}</th>
                          <th>{t("transcript.studentInfo.id")}</th>
                          <th>{t("transcript.studentInfo.name")}</th>
                          <th>{t("transcript.studentInfo.email")}</th>
                          <th>{t("transcript.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, index) => (
                          <tr key={reg._id}>
                            <td>{index + 1}</td>
                            <td>
                              {reg.student ? reg.student.studentId : "N/A"}
                            </td>
                            <td>
                              {reg.student ? reg.student.fullName : "N/A"}
                            </td>
                            <td>{reg.student ? reg.student.email : "N/A"}</td>

                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                  handlePrint(reg.student.studentId)
                                }
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
