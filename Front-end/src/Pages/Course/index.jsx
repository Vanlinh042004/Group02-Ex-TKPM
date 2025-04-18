import { Button, message, Modal, Form, Input, InputNumber, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../Style/Courses.scss";
import { getFaculty } from "../../Services/studentService";
import { getClasses, addClass } from "../../Services/classService";
import swal from "sweetalert";
import { useState, useEffect } from "react";
import {
  getCourses,
  addCourse,
  deleteCourse,
  deactivateCourse,
  updateCourse,
} from "../../Services/coursesService";
import { useNavigate } from "react-router-dom";

function Course() {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddClassModalVisible, setIsAddClassModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [classForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculties = async () => {
      const res = await getFaculty();
      setFaculties(res.data);
    };
    fetchFaculties();
    const fetchCourses = async () => {
      const res = await getCourses();
      //console.log(res);
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddCourse = async (values) => {
    try {
      await addCourse(values);
      swal("Thêm khóa học thành công!", {
        icon: "success",
      });
      const res = await getCourses();
      setCourses(res.data);
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding course:", error);
      message.error("Có lỗi xảy ra khi thêm khóa học!");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setLoading(true);
      const result = await swal({
        title: "Xác nhận xóa?",
        text: "Bạn chỉ có thể xóa khóa học trong vòng 30 phút sau khi tạo và khi chưa có sinh viên đăng ký!",
        icon: "warning",
        buttons: ["Hủy", "Xóa"],
        dangerMode: true,
      });

      if (result) {
        try {
          await deleteCourse(courseId);
          swal("Xóa khóa học thành công!", {
            icon: "success",
          });
          // Refresh danh sách khóa học
          const res = await getCourses();
          setCourses(res.data);
        } catch (error) {
          if (error.response?.data?.code === "TIME_LIMIT_EXCEEDED") {
            const deactivateResult = await swal({
              title: "Không thể xóa!",
              text: "Khóa học đã tồn tại quá 30 phút. Bạn có muốn deactivate khóa học này không?",
              icon: "warning",
              buttons: ["Hủy", "Deactivate"],
              dangerMode: true,
            });

            if (deactivateResult) {
              await handleDeactivateCourse(courseId);
            }
          } else if (error.response?.data?.code === "HAS_REGISTRATIONS") {
            const deactivateResult = await swal({
              title: "Không thể xóa!",
              text: "Khóa học đã có sinh viên đăng ký. Bạn có muốn deactivate khóa học này không?",
              icon: "warning",
              buttons: ["Hủy", "Deactivate"],
              dangerMode: true,
            });

            if (deactivateResult) {
              await handleDeactivateCourse(courseId);
            }
          } else if (error.response?.data?.code === "IS_PREREQUISITE") {
            swal(
              "Không thể xóa!",
              "Khóa học này đang là môn tiên quyết cho các khóa học khác.",
              "error"
            );
          } else {
            swal(
              "Lỗi!",
              error.response?.data?.message ||
                "Có lỗi xảy ra khi xóa khóa học!",
              "error"
            );
          }
        }
      }
    } catch (error) {
      console.error("Error handling course deletion:", error);
      swal("Lỗi!", "Có lỗi xảy ra khi xử lý yêu cầu!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateCourse = async (courseId) => {
    try {
      await deactivateCourse(courseId);
      swal("Thành công!", "Khóa học đã được deactivate thành công!", "success");
      // Refresh danh sách khóa học
      const res = await getCourses();
      setCourses(res.data);
    } catch (error) {
      console.error("Error deactivating course:", error);
      swal(
        "Lỗi!",
        error.response?.data?.message ||
          "Có lỗi xảy ra khi deactivate khóa học!",
        "error"
      );
    }
  };

  const showEditModal = (course) => {
    setSelectedCourse(course);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      name: course.name,
      description: course.description,
      faculty: course.faculty?._id,
      credits: course.credits,
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedCourse(null);
    editForm.resetFields();
  };

  const handleEditCourse = async (values) => {
    try {
      if (!selectedCourse) return;
      
      await updateCourse(selectedCourse._id, values);
      swal("Cập nhật khóa học thành công!", {
        icon: "success",
      });
      const res = await getCourses();
      setCourses(res.data);
      setIsEditModalVisible(false);
      editForm.resetFields();
      setSelectedCourse(null);
    } catch (error) {
      if (error.response?.data?.code === "HAS_REGISTRATIONS") {
        swal(
          "Lỗi!",
          "Đã có sinh viên đăng ký!",
          "error"
        );
      } else {
        swal(
          "Lỗi!",
          error.response?.data?.message || "Có lỗi xảy ra khi cập nhật khóa học!",
          "error"
        );
      }
    }
  };

  const showAddClassModal = () => {
    setIsAddClassModalVisible(true);
  };

  const handleCancelAddClass = () => {
    setIsAddClassModalVisible(false);
    classForm.resetFields();
  };

  const handleAddClass = async (values) => {
    try {
      setLoading(true);
      // Map courseId to course before sending to backend
      const dataToSend = {
        ...values,
        course: values.courseId, // Map courseId to course
      };
      delete dataToSend.courseId; // Remove the original courseId field

      await addClass(dataToSend); // Send the modified data
      swal("Thêm lớp học thành công!", {
        icon: "success",
      });
      setIsAddClassModalVisible(false);
      classForm.resetFields();
    } catch (error) {
      console.error("Error adding class:", error);
      swal(
        "Lỗi!",
        error.response?.data?.message || "Có lỗi xảy ra khi thêm lớp học!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-5  d-flex ">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          className="me-5"
          onClick={showAddModal}
        >
          Thêm Khóa học
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          onClick={showAddClassModal}
        >
          Mở lớp học
        </Button>
      </div>

   

      <div className="container  d-flex justify-content-between">
        <section className="ftco-section">
          <div className="container">
            <div className="row">
              {courses?.map((course, index) => (
                <div className="col-md-4 d-flex mt-2" key={index}>
                  <div
                    className={`course-card align-self-stretch p-4 mb-4 ${
                      !course.isActive ? "inactive-course" : ""
                    }`}
                  >
                    <div className="course-status">
                      {!course.isActive && (
                        <span className="deactivated-badge">Đã deactivate</span>
                      )}
                    </div>
                    <h4 className="mb-3">{course.name}</h4>
                    <p>
                      <b>Mã số khóa học:</b> {course.courseId}
                    </p>
                    <p>
                      <b>Số tín chỉ:</b> {course.credits}
                    </p>
                    <p>
                      <b>Khoa phụ trách:</b> {course.faculty?.name || "N/A"}
                    </p>
                    <p>
                      <b>Mô tả:</b> {course.description}
                    </p>
                    <p>
                      <b>Ngày tạo:</b>{" "}
                      {new Date(course.createdAt).toLocaleString()}
                    </p>

                    <div className="d-flex justify-content-between">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="large"
                        shape="round"
                        disabled={!course.isActive}
                        onClick={() => showEditModal(course)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="large"
                        shape="round"
                        danger
                        loading={loading}
                        onClick={() => handleDeleteCourse(course._id)}
                        disabled={!course.isActive}
                      >
                        {course.isActive ? "Xóa" : "Đã deactivate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Modal
        title="Thêm Khóa Học Mới"
        open={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddCourse}>
          <Form.Item
            name="courseId"
            label="Mã khóa học"
            rules={[
              { required: true, message: "Vui lòng nhập mã khóa học!" },
            ]}
          >
            <Input placeholder="Nhập mã khóa học" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên khóa học"
            rules={[
              { required: true, message: "Vui lòng nhập tên khóa học!" },
            ]}
          >
            <Input placeholder="Nhập tên khóa học" />
          </Form.Item>

          <Form.Item
            name="credits"
            label="Số tín chỉ"
            rules={[
              { required: true, message: "Vui lòng nhập số tín chỉ!" },
              {
                type: "number",
                min: 2,
                message: "Số tín chỉ phải lớn hơn hoặc bằng 2!",
              },
            ]}
          >
            <InputNumber
              min={2}
              placeholder="Nhập số tín chỉ"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="faculty"
            label="Khoa phụ trách"
            rules={[
              { required: true, message: "Vui lòng chọn khoa phụ trách!" },
            ]}
          >
            <Select placeholder="Chọn khoa phụ trách">
              {faculties.map((faculty) => (
                <Select.Option value={faculty._id} key={faculty._id}>
                  {faculty.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả khóa học" />
          </Form.Item>

          <Form.Item name="prerequisite" label="Môn tiên quyết">
            <Select
              mode="multiple"
              placeholder="Chọn môn tiên quyết (nếu có)"
              allowClear
            >
              <Select.Option value="MON001">Lập trình cơ bản</Select.Option>
              <Select.Option value="MON002">Cơ sở dữ liệu</Select.Option>
              <Select.Option value="MON003">Cấu trúc dữ liệu</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm khóa học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chỉnh Sửa Khóa Học"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditCourse}>
          <Form.Item
            name="name"
            label="Tên khóa học"
            rules={[
              { required: true, message: "Vui lòng nhập tên khóa học!" },
            ]}
          >
            <Input placeholder="Nhập tên khóa học" />
          </Form.Item>

          <Form.Item
            name="credits"
            label="Số tín chỉ"
            rules={[
              { required: true, message: "Vui lòng nhập số tín chỉ!" },
              {
                type: "number",
                min: 2,
                message: "Số tín chỉ phải lớn hơn hoặc bằng 2!",
              },
            ]}
          >
            <InputNumber
              min={2}
              placeholder="Nhập số tín chỉ"
              style={{ width: "100%" }}
              disabled={selectedCourse?.hasRegisteredStudents}
            />
          </Form.Item>

          <Form.Item
            name="faculty"
            label="Khoa phụ trách"
            rules={[
              { required: true, message: "Vui lòng chọn khoa phụ trách!" },
            ]}
          >
            <Select placeholder="Chọn khoa phụ trách">
              {faculties.map((faculty) => (
                <Select.Option value={faculty._id} key={faculty._id}>
                  {faculty.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả khóa học" />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleEditCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mở Lớp Học Mới"
        open={isAddClassModalVisible}
        onCancel={handleCancelAddClass}
        footer={null}
        width={800}
      >
        <Form form={classForm} layout="vertical" onFinish={handleAddClass}>
          <Form.Item
            name="classId"
            label="Mã lớp học"
            rules={[
              { required: true, message: "Vui lòng nhập mã lớp học!" }
            ]}
          >
            <Input placeholder="Nhập mã lớp học" />
          </Form.Item>

          <Form.Item
            name="courseId"
            label="Khóa học"
            rules={[
              { required: true, message: "Vui lòng chọn khóa học!" }
            ]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Select.Option key={course._id} value={course._id}>
                  {course.name} ({course.courseId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="academicYear"
                label="Năm học"
                rules={[
                  { required: true, message: "Vui lòng nhập năm học!" }
                ]}
              >
                <Input placeholder="VD: 2023-2024" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="semester"
                label="Học kỳ"
                rules={[
                  { required: true, message: "Vui lòng chọn học kỳ!" }
                ]}
              >
                <Select placeholder="Chọn học kỳ">
                  <Select.Option value="1">Học kỳ 1</Select.Option>
                  <Select.Option value="2">Học kỳ 2</Select.Option>
                  <Select.Option value="3">Học kỳ hè</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="instructor"
            label="Giảng viên"
            rules={[
              { required: true, message: "Vui lòng nhập tên giảng viên!" }
            ]}
          >
            <Input placeholder="Nhập tên giảng viên" />
          </Form.Item>

          <Form.Item
            name="maxStudents"
            label="Số lượng sinh viên tối đa"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng sinh viên tối đa!" },
              { type: 'number', min: 1, message: "Số lượng sinh viên phải lớn hơn 0!" }
            ]}
          >
            <InputNumber min={1} placeholder="Nhập số lượng sinh viên tối đa" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Lịch học"
            rules={[
              { required: true, message: "Vui lòng nhập lịch học!" }
            ]}
          >
            <Input placeholder="VD: Thứ 2,4,6 - Tiết 1-3" />
          </Form.Item>

          <Form.Item
            name="classroom"
            label="Phòng học"
            rules={[
              { required: true, message: "Vui lòng nhập phòng học!" }
            ]}
          >
            <Input placeholder="Nhập phòng học" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button onClick={handleCancelAddClass}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo lớp học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Course;
