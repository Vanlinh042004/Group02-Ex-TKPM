import seedFaculties from './facultySeed';
import seedPrograms from './programSeed';
import seedStudents from './studentSeed';
import seedStatuses from './statusSeed';

// Hàm này sẽ thực thi lần lượt các hàm seed dữ liệu cho các bảng
// Khi chạy lệnh `npm run seed`, các hàm này sẽ được gọi
const seed = async () => {
  await seedFaculties();
  await seedPrograms();
  await seedStatuses();
  await seedStudents();
};

seed();