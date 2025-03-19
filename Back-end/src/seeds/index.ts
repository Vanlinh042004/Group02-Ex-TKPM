import seedFaculties from './facultySeed';
import seedPrograms from './programSeed';
import seedStudents from './studentSeed';

const seed = async () => {
  await seedFaculties();
  await seedPrograms();
  await seedStudents();
};

seed();