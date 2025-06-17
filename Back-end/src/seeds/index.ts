import seedFaculties from "../components/faculty/seeds";
import seedPrograms from "../components/program/seeds";
import seedStudents from "../components/student/seeds";
import seedStatuses from "../components/status/seeds";
import seedPhoneNumberConfigs from "../components/phone-number/seeds";
import seedCourses from "../components/course/seeds";
import seedClasses from "../components/class/seeds";
import seedRegistrations from "../components/registration/seeds";
import seedEmailDomains from "../components/email-domain/seeds";

// Hàm này sẽ thực thi lần lượt các hàm seed dữ liệu cho các bảng
// Khi chạy lệnh `npm run seed`, các hàm này sẽ được gọi
const seed = async () => {
  await seedFaculties();
  await seedPrograms();
  await seedStatuses();
  await seedPhoneNumberConfigs();
  await seedEmailDomains();

  // Chạy seed data cho Course, Class, Registration
  await seedCourses();
  await seedClasses();
  await seedRegistrations();

  // Chạy seed data cho Student sau khi đã có đầy đủ data reference
  await seedStudents();
};

seed();
