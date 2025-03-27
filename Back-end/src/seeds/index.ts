import seedFaculties from '../components/faculty/seeds';
import seedPrograms from '../components/program/seeds';
import seedStudents from '../components/student/seeds';
import seedStatuses from '../components/status/seeds';
import seedPhoneNumberConfigs from '../components/phone-number/seeds';

// Hàm này sẽ thực thi lần lượt các hàm seed dữ liệu cho các bảng
// Khi chạy lệnh `npm run seed`, các hàm này sẽ được gọi
const seed = async () => {
  await seedFaculties();
  await seedPrograms();
  await seedStatuses();
  await seedPhoneNumberConfigs();
  await seedStudents();
};

seed();