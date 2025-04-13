import React, { useState } from "react";
import { Tab, Nav, Container, Row, Col, Form, Button, Table } from "react-bootstrap";

const CourseRegistration = () => {
  const [student, setStudent] = useState("");
  const [course, setCourse] = useState("");

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center text-primary">📘 Đăng Ký Môn Học Cho Sinh Viên</h2>

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
              {/* --- Tab 1: Đăng ký --- */}
              <Tab.Pane eventKey="register">
                <h4 className="mb-3">📌 Đăng ký môn học</h4>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn sinh viên</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã sinh viên hoặc chọn từ danh sách"
                      value={student}
                      onChange={(e) => setStudent(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Chọn môn học</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã môn hoặc chọn từ danh sách"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </Form.Group>

                  <Button variant="primary">Đăng ký</Button>
                </Form>
              </Tab.Pane>

              {/* --- Tab 2: Hủy đăng ký --- */}
              <Tab.Pane eventKey="cancel">
                <h4 className="mb-3">📌 Hủy đăng ký môn học</h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Môn học</th>
                      <th>Giảng viên</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Lập trình Web</td>
                      <td>Nguyễn Văn A</td>
                      <td>
                        <Button variant="danger" size="sm">Hủy</Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Tab.Pane>

              {/* --- Tab 3: In bảng điểm --- */}
              <Tab.Pane eventKey="transcript">
                <h4 className="mb-3">📌 In bảng điểm</h4>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Môn học</th>
                      <th>Điểm</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nhập môn lập trình</td>
                      <td>9.0</td>
                      <td>Đạt</td>
                    </tr>
                    <tr>
                      <td>Cấu trúc dữ liệu</td>
                      <td>7.5</td>
                      <td>Đạt</td>
                    </tr>
                  </tbody>
                </Table>
                <Button variant="success">In bảng điểm</Button>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CourseRegistration;
