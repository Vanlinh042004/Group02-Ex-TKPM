import { Button, message, Modal, Form, Input, InputNumber, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../styles/Courses.scss";
import { getFaculty } from "../../services/studentService";
import { addClass } from "../../services/classService";
import swal from "sweetalert";
import { useState, useEffect } from "react";
import {
  getCourses,
  addCourse,
  deleteCourse,
  deactivateCourse,
  updateCourse,
} from "../../services/coursesService";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("course");
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  console.log("Current Language:", currentLang);
  useEffect(() => {
    const fetchFaculties = async () => {
      const res = await getFaculty();
      setFaculties(res.data);
    };
    fetchFaculties();
    const fetchCourses = async () => {
      const res = await getCourses();
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  const showAddModal = () => setIsAddModalVisible(true);

  const handleCancel = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleAddCourse = async (values) => {
    try {
      if (values.credits < 2) {
        swal(t("failAdd"), t("failCredit"), "error");
        return;
      }
      await addCourse(values);
      swal(t("successAdd"), { icon: "success" });
      const res = await getCourses();
      setCourses(res.data);
      setIsAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(t("failAdd"));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setLoading(true);
      const result = await swal({
        title: t("confirmDeleteTitle"),
        text: t("confirmDeleteText"),
        icon: "warning",
        buttons: [t("confirmDeleteCancel"), t("confirmDeleteOk")],
        dangerMode: true,
      });

      if (result) {
        try {
          await deleteCourse(courseId);
          swal(t("successDelete"), { icon: "success" });
          const res = await getCourses();
          setCourses(res.data);
        } catch (error) {
          if (
            error.response?.data?.message ===
            "Không thể xóa khóa học vì đã có lớp học được mở"
          ) {
            const deactivateResult = await swal({
              title: t("cannotDeleteTitle"),
              text: t("cannotDeleteText"),
              icon: "warning",
              buttons: [t("cannotDeleteCancel"), t("cannotDeleteOk")],
              dangerMode: true,
            });

            if (deactivateResult) {
              await handleDeactivateCourse(courseId);
            }
          } else {
            swal(
              t("failDelete"),
              error.response?.data?.message || t("failDelete"),
              "error",
            );
          }
        }
      }
    } catch (error) {
      swal(t("failDelete"), t("failDelete"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateCourse = async (courseId) => {
    try {
      await deactivateCourse(courseId);
      swal(t("successDeactivate"), "success");
      const res = await getCourses();
      setCourses(res.data);
    } catch (error) {
      swal(
        t("failDeactivate"),
        error.response?.data?.message || t("failDeactivate"),
        "error",
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
      swal(t("successUpdate"), { icon: "success" });
      const res = await getCourses();
      setCourses(res.data);
      setIsEditModalVisible(false);
      editForm.resetFields();
      setSelectedCourse(null);
    } catch (error) {
      if (error.response?.data?.code === "HAS_REGISTRATIONS") {
        swal(t("hasRegistered"), t("hasRegistered"), "error");
      } else {
        swal(
          t("failUpdate"),
          error.response?.data?.message || t("failUpdate"),
          "error",
        );
      }
    }
  };

  const showAddClassModal = () => setIsAddClassModalVisible(true);

  const handleCancelAddClass = () => {
    setIsAddClassModalVisible(false);
    classForm.resetFields();
  };

  const handleAddClass = async (values) => {
    try {
      setLoading(true);
      const dataToSend = {
        ...values,
        course: values.courseId,
      };
      delete dataToSend.courseId;

      await addClass(dataToSend);
      swal(t("submit"), { icon: "success" });
      setIsAddClassModalVisible(false);
      classForm.resetFields();
    } catch (error) {
      swal(
        t("failAdd"),
        error.response?.data?.message || t("failAdd"),
        "error",
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
          {t("addCourse")}
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          onClick={showAddClassModal}
        >
          {t("openClass")}
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
                        <span className="deactivated-badge">
                          {t("deactivated")}
                        </span>
                      )}
                    </div>
                    <h4 className="mb-3">{course.name[currentLang]}</h4>
                    <p>
                      <b>{t("courseId")}:</b> {course.courseId}
                    </p>
                    <p>
                      <b>{t("credits")}:</b> {course.credits}
                    </p>
                    <p>
                      <b>{t("faculty")}:</b>{" "}
                      {course.faculty?.name[currentLang] || t("notAvailable")}
                    </p>
                    <p>
                      <b>{t("description")}:</b>{" "}
                      {course.description[currentLang] || t("noDescription")}
                    </p>
                    <p>
                      <b>{t("prerequisites")}:</b>{" "}
                      {course.prerequisites.length > 0
                        ? course.prerequisites
                            .map((item) => item.name)
                            .join(", ")
                        : t("noPrerequisite")}
                    </p>
                    <p>
                      <b>{t("createdAt")}:</b>{" "}
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
                        {t("edit")}
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
                        {course.isActive ? t("delete") : t("deactivatedBtn")}
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
        title={t("addCourseModalTitle")}
        open={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddCourse}>
          <Form.Item
            name="courseId"
            label={t("courseId")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("courseId")} />
          </Form.Item>

          <Form.Item
            name="name"
            label={t("addCourse")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("addCourse")} />
          </Form.Item>

          <Form.Item
            name="credits"
            label={t("credits")}
            rules={[
              { required: true, message: t("failAdd") },
              {
                type: "number",
                min: 2,
                message: t("failCredit"),
              },
            ]}
          >
            <InputNumber placeholder={t("credits")} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="faculty"
            label={t("faculty")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Select placeholder={t("faculty")}>
              {faculties.map((faculty) => (
                <Select.Option value={faculty._id} key={faculty._id}>
                  {faculty.name[currentLang]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={t("description")}>
            <Input.TextArea rows={4} placeholder={t("description")} />
          </Form.Item>

          <Form.Item name="prerequisites" label={t("prerequisites")}>
            <Select mode="multiple" placeholder={t("prerequisites")} allowClear>
              {courses.map((course) => (
                <Select.Option key={course._id} value={course._id}>
                  {course.name[currentLang]} ({course.courseId})
                </Select.Option>
              ))}
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
              <Button onClick={handleCancel}>{t("cancel")}</Button>
              <Button type="primary" htmlType="submit">
                {t("add")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal for editing course */}
      <Modal
        title={t("editCourseModalTitle")}
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditCourse}>
          <Form.Item
            name="name"
            label={t("addCourse")}
            rules={[{ required: true, message: t("failUpdate") }]}
          >
            <Input placeholder={t("addCourse")} />
          </Form.Item>

          <Form.Item
            name="credits"
            label={t("credits")}
            rules={[
              { required: true, message: t("failUpdate") },
              {
                type: "number",
                min: 2,
                message: t("failCredit"),
              },
            ]}
          >
            <InputNumber
              min={2}
              placeholder={t("credits")}
              style={{ width: "100%" }}
              disabled={selectedCourse?.hasRegisteredStudents}
            />
          </Form.Item>

          <Form.Item
            name="faculty"
            label={t("faculty")}
            rules={[{ required: true, message: t("failUpdate") }]}
          >
            <Select placeholder={t("faculty")}>
              {faculties.map((faculty) => (
                <Select.Option value={faculty._id} key={faculty._id}>
                  {faculty.name[currentLang]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={t("description")}>
            <Input.TextArea rows={4} placeholder={t("description")} />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleEditCancel}>{t("cancel")}</Button>
              <Button type="primary" htmlType="submit">
                {t("update")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal for adding class */}
      <Modal
        title={t("addClassModalTitle")}
        open={isAddClassModalVisible}
        onCancel={handleCancelAddClass}
        footer={null}
        width={800}
      >
        <Form form={classForm} layout="vertical" onFinish={handleAddClass}>
          <Form.Item
            name="classId"
            label={t("classId")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("classId")} />
          </Form.Item>

          <Form.Item
            name="courseId"
            label={t("selectCourse")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Select placeholder={t("selectCourse")}>
              {courses.map(
                (course) =>
                  course.isActive && (
                    <Select.Option key={course._id} value={course._id}>
                      {course.name[currentLang]} ({course.courseId})
                    </Select.Option>
                  ),
              )}
            </Select>
          </Form.Item>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="academicYear"
                label={t("academicYear")}
                rules={[{ required: true, message: t("failAdd") }]}
              >
                <Input placeholder="VD: 2023-2024" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="semester"
                label={t("semester")}
                rules={[{ required: true, message: t("failAdd") }]}
              >
                <Select placeholder={t("semester")}>
                  <Select.Option value="1">{t("semester1")}</Select.Option>
                  <Select.Option value="2">{t("semester2")}</Select.Option>
                  <Select.Option value="3">{t("semester3")}</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="instructor"
            label={t("instructor")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("instructor")} />
          </Form.Item>

          <Form.Item
            name="maxStudents"
            label={t("maxStudents")}
            rules={[
              {
                required: true,
                message: t("failAdd"),
              },
              {
                type: "number",
                min: 1,
                message: t("failAdd"),
              },
            ]}
          >
            <InputNumber
              min={1}
              placeholder={t("maxStudents")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="schedule"
            label={t("schedule")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("schedule")} />
          </Form.Item>

          <Form.Item
            name="classroom"
            label={t("classroom")}
            rules={[{ required: true, message: t("failAdd") }]}
          >
            <Input placeholder={t("classroom")} />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleCancelAddClass}>{t("cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("submit")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Course;
