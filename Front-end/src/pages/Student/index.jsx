import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Home.scss";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  SketchSquareFilled,
} from "@ant-design/icons";
import { Button, Upload, message } from "antd";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  searchStudent,
  getStudent,
  deleteStudent,
  importStudent,
} from "../../services/studentService";
import AddStudentModal from "../../components/AddStudentModal";
import EditStudentModal from "../../components/EditStudentModal";
import ExportStudent from "../../components/ExportStudent";
import swal from "sweetalert";
import { useTranslation } from "react-i18next";

function Student() {
  const [students, setStudents] = useState([]);
  const [check, setCheck] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [searchId, setSearchID] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchFaculty, setSearchFaculty] = useState("");
  const { t } = useTranslation("student");
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { exportStudentsToCSV, exportStudentsToJSON } = ExportStudent();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudent();
        setStudents(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
      }
    };
    fetchStudents();
  }, [check, isEditModalVisible, isModalVisible]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await searchStudent(searchId, searchName, searchFaculty);
      setStudents(data.data);
    } catch (error) {
      swal(t("swalNotFoundTitle"), t("swalNotFoundText"), "error");
    }
  };
 
  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      swal(t("swalDeleteSuccessTitle"), t("swalDeleteSuccessText"), "success");
      setCheck(!check);
    } catch (error) {
      console.error("Lỗi khi xóa sinh viên:", error);
    }
  };

  const showModal = () => setIsModalVisible(true);

  const showEditModal = (student) => {
    setStudentToEdit(student);
    setIsEditModalVisible(true);
  };

  const handleImport = async (file) => {
    if (!file || !(file instanceof Blob)) {
      swal(t("swalDeleteSuccessTitle"), t("swalDeleteSuccessText"), "success");
      return false;
    }
    if (
      !(
        file.type === "application/json" ||
        file.name.endsWith(".json") ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv")
      )
    ) {
      swal("Lỗi", t("swalOnlyCSVJSON"), "error");
      return false;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target.result;
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(fileData);
          if (!Array.isArray(jsonData)) {
            message.error(t("swalImportError"));
            return;
          }
          const response = await importStudent(jsonData, "json");
          setStudents(response.data.data);
          swal(
            t("swalImportSuccessTitle"),
            t("swalImportSuccessText"),
            "success",
          );
        } catch (error) {
          message.error(t("swalImportError"));
        }
      } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            if (!result.data || result.data.length === 0) {
              swal("Lỗi", t("swalImportInvalid"), "error");
              return;
            }
            const response = await importStudent(result.data, "csv");
            setStudents(response.data.data);
            swal(
              t("swalImportSuccessTitle"),
              t("swalImportSuccessText"),
              "success",
            );
          },
          error: () => {
            message.error(t("swalImportError"));
          },
        });
      }
    };
    reader.readAsText(file);
    return false;
  };

  const beforeUpload = (file) => {
    if (
      !(
        file.type === "application/json" ||
        file.name.endsWith(".json") ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv")
      )
    ) {
      swal("Lỗi", t("swalOnlyCSVJSON"), "error");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  return (
    <>
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="full-wrap">
                <div className="one-third search p-5">
                  <h3 className="text-center mb-4">{t("searchTitle")}</h3>
                  <form className="course-search-form">
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder={t("searchName")}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder={t("searchId")}
                      onChange={(e) => setSearchID(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder={t("searchFaculty")}
                      onChange={(e) => setSearchFaculty(e.target.value)}
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={handleSearch}
                      style={{
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    >
                      {t("searchBtn")}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nút chức năng */}
      <div className="container mt-5 d-flex justify-content-between">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          shape="round"
          onClick={showModal}
        >
          {t("addBtn")}
        </Button>

        <Upload
          beforeUpload={beforeUpload}
          onChange={(info) => handleImport(info.file)}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            shape="round"
          >
            {t("importBtn")}
          </Button>
        </Upload>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          shape="round"
          onClick={() => exportStudentsToCSV(students)}
        >
          {t("exportCsvBtn")}
        </Button>

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          shape="round"
          onClick={() => exportStudentsToJSON(students)}
        >
          {t("exportJsonBtn")}
        </Button>
      </div>

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {students?.map((student, index) => (
              <div className="col-md-4 d-flex" key={index}>
                <div className="student-card align-self-stretch p-4 mb-4">
                  <h4 className="mb-3">{student.fullName}</h4>
                  <p>
                    <b>{t("studentId")}:</b> {student.studentId}
                  </p>
                  <p>
                    <b>{t("dateOfBirth")}:</b>{" "}
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p>
                    <b>{t("gender")}: </b>
                    {student.gender === "Nam"
                      ? "Male"
                      : "Female" || t("notAvailable")}
                  </p>
                  <p>
                    <b>{t("faculty")}:</b>{" "}
                    {student.faculty.name[currentLang] || t("notAvailable")}
                  </p>
                  <p>
                    <b>{t("course")}:</b> {student.course}
                  </p>
                  <p>
                    <b>{t("program")}:</b>{" "}
                    {student.program?.name[currentLang] ||
                      t("notAvailable")}{" "}
                  </p>
                  <p>
                    <b>{t("email")}:</b> {student.email}
                  </p>
                  <p>
                    <b>{t("phone")}:</b> {student.phone}
                  </p>
                  <p>
                    <b>{t("status")}:</b>{" "}
                    {student.status.name[currentLang] || t("notAvailable")}
                  </p>
                  {/* Địa chỉ thường trú */}
                  <p>
                    <b>{t("address")}:</b>{" "}
                    {student.permanentAddress
                      ? `${student.permanentAddress.streetAddress}, ${student.permanentAddress.district}, ${student.permanentAddress.city}`
                      : t("notAvailable")}
                  </p>
                  {/* Chứng minh nhân dân */}
                  <p>
                    <b>{t("identity")}:</b>{" "}
                    {student.identityDocument?.number || t("notAvailable")}{" "}
                    -{" "}
                  </p>
                  <p>
                    <b>{t("issuePlace")}:</b>{" "}
                    {student.identityDocument?.issuePlace || t("notAvailable")}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      shape="round"
                      onClick={() => showEditModal(student)}
                    >
                      {t("editBtn")}
                    </Button>
                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      size="large"
                      shape="round"
                      danger
                      onClick={() => handleDelete(student.studentId)}
                    >
                      {t("deleteBtn")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
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
    </>
  );
}

export default Student;
