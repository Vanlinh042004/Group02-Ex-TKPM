import { connect } from '../config/database';
import Faculty from '../components/faculty/models/Faculty';

async function checkFacultyData() {
  try {
    await connect();
    console.log('✅ Connected to database');

    const faculties = await Faculty.find();
    console.log(`\n📊 Found ${faculties.length} faculties:`);

    faculties.forEach((faculty, index) => {
      console.log(`\n${index + 1}. Faculty:`);
      console.log(`   ID: ${faculty._id}`);
      console.log(`   facultyId: "${faculty.facultyId}"`);
      console.log(`   name: "${faculty.name}"`);
      console.log(`   createdAt: ${faculty.createdAt}`);
      console.log(`   updatedAt: ${faculty.updatedAt}`);

      // Check validation issues
      const facultyIdPattern = /^[A-Za-z0-9\-]{2,50}$/;
      const isValidFacultyId = facultyIdPattern.test(faculty.facultyId);
      console.log(`   ✓ Valid facultyId: ${isValidFacultyId}`);

      if (!isValidFacultyId) {
        console.log(
          `   ❌ Invalid characters in facultyId: "${faculty.facultyId}"`
        );
        console.log(
          `   🔍 Characters:`,
          Array.from(faculty.facultyId).map(
            (char) => `"${char}" (${char.charCodeAt(0)})`
          )
        );
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkFacultyData();
