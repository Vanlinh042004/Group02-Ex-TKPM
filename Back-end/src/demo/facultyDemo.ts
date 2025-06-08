/**
 * Faculty Clean Architecture Demo
 * Demonstrates Phase 2 migration with full domain entities
 */

import { connect as dbConnect } from '../config/database';
import {
  setupServices,
  getFacultyService,
  getFacultyRepository,
} from '../infrastructure/di/serviceRegistry';
import logger from '../utils/logger';

async function facultyDemo() {
  try {
    console.log('🚀 Starting Faculty Clean Architecture Demo...\n');

    // 1. Initialize infrastructure
    await dbConnect();
    console.log('✅ Database connected');

    await setupServices();
    console.log('✅ Clean Architecture services initialized\n');

    // 2. Get services from DI container
    const facultyService = getFacultyService();
    const facultyRepository = getFacultyRepository();

    console.log('📋 Testing Faculty Clean Architecture...\n');

    // 3. Test Create Faculty
    console.log('1️⃣ Testing Create Faculty:');
    const newFaculty = await facultyService.createFaculty({
      name: 'Khoa Công nghệ Thông tin',
    });
    console.log('✅ Faculty created:', {
      id: newFaculty.id,
      facultyId: newFaculty.facultyId,
      name: newFaculty.name,
    });

    // 4. Test Get All Faculties
    console.log('\n2️⃣ Testing Get All Faculties:');
    const allFaculties = await facultyService.getAllFaculties();
    console.log(`✅ Found ${allFaculties.length} faculties`);
    allFaculties.forEach((faculty, index) => {
      console.log(`   ${index + 1}. ${faculty.facultyId} - ${faculty.name}`);
    });

    // 5. Test Rename Faculty
    console.log('\n3️⃣ Testing Rename Faculty:');
    const renamedFaculty = await facultyService.renameFaculty({
      facultyId: newFaculty.facultyId,
      newName: 'Khoa CNTT & Truyền thông',
    });
    console.log('✅ Faculty renamed:', {
      oldName: newFaculty.name,
      newName: renamedFaculty.name,
      newFacultyId: renamedFaculty.facultyId,
    });

    // 6. Test Get Faculty by ID
    console.log('\n4️⃣ Testing Get Faculty by ID:');
    const foundFaculty = await facultyService.getFacultyById(
      renamedFaculty.facultyId
    );
    console.log('✅ Faculty found:', foundFaculty);

    // 7. Test Domain Entity Business Logic
    console.log('\n5️⃣ Testing Domain Entity Business Logic:');
    const facultyEntity = await facultyRepository.findByFacultyId(
      renamedFaculty.facultyId
    );
    if (facultyEntity) {
      console.log('✅ Domain entity validation:');
      console.log(
        `   - Can accept students: ${facultyEntity.canAcceptStudents()}`
      );
      console.log(`   - Faculty ID: ${facultyEntity.facultyId}`);
      console.log(`   - Name: ${facultyEntity.name}`);
      console.log(`   - Created: ${facultyEntity.createdAt}`);
      console.log(`   - Updated: ${facultyEntity.updatedAt}`);
    }

    // 8. Test Error Handling
    console.log('\n6️⃣ Testing Error Handling:');
    try {
      await facultyService.createFaculty({
        name: renamedFaculty.name, // Duplicate name
      });
    } catch (error: any) {
      console.log('✅ Duplicate name error handled:', error.message);
    }

    try {
      await facultyService.getFacultyById('non-existent-id');
    } catch (error: any) {
      console.log('✅ Not found error handled correctly');
    }

    // 9. Clean up
    console.log('\n7️⃣ Cleaning up:');
    const deleted = await facultyService.deleteFaculty(
      renamedFaculty.facultyId
    );
    console.log('✅ Faculty deleted:', deleted);

    console.log('\n🎉 Faculty Clean Architecture Demo completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Domain Entity with validation');
    console.log('   ✅ Repository pattern with MongoDB');
    console.log('   ✅ Application Service with business logic');
    console.log('   ✅ Dependency Injection container');
    console.log('   ✅ Error handling and validation');
    console.log('   ✅ Clean separation of concerns');
  } catch (error: any) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  facultyDemo();
}

export default facultyDemo;
