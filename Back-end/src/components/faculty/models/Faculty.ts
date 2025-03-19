import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  description?: string;
  abbreviation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },
    description: { 
      type: String 
    },
    abbreviation: { 
      type: String 
    }
  },
  {
    timestamps: true,
  }
);

// Middleware để khởi tạo dữ liệu mặc định
facultySchema.statics.initializeDefaultFaculties = async function() {
  const defaultFaculties = [
    {
      name: 'Khoa Luật',
      description: 'Khoa chuyên đào tạo về luật pháp và nhà nước',
      abbreviation: 'KL'
    },
    {
      name: 'Khoa Tiếng Anh Thương Mại',
      description: 'Khoa chuyên đào tạo tiếng Anh trong lĩnh vực thương mại',
      abbreviation: 'KTATT'
    },
    {
      name: 'Khoa Tiếng Nhật',
      description: 'Khoa chuyên đào tạo tiếng Nhật và văn hóa Nhật Bản',
      abbreviation: 'KTN'
    },
    {
      name: 'Khoa Tiếng Pháp',
      description: 'Khoa chuyên đào tạo tiếng Pháp và văn hóa Pháp',
      abbreviation: 'KTP'
    }
  ];

  // Đếm số lượng khoa hiện tại
  const facultyCount = await this.countDocuments();

  // Chỉ thêm nếu chưa có khoa nào
  if (facultyCount === 0) {
    try {
      await this.create(defaultFaculties);
      console.log('Đã khởi tạo các khoa mặc định');
    } catch (error) {
      console.error('Lỗi khi khởi tạo các khoa mặc định:', error);
    }
  }
};

// Thêm static method vào model
interface FacultyModel extends mongoose.Model<IFaculty> {
  initializeDefaultFaculties(): Promise<void>;
}

const Faculty = mongoose.model<IFaculty, FacultyModel>('Faculty', facultySchema);

// Gọi phương thức khởi tạo sau khi kết nối mongoose
mongoose.connection.once('open', async () => {
  await Faculty.initializeDefaultFaculties();
});

export default mongoose.model<IFaculty>('Faculty', facultySchema);