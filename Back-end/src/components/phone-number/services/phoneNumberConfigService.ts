import PhoneNumberConfig, { IPhoneNumberConfig } from '../models/PhoneNumberConfig';

// DTO interfaces kế thừa từ model interface
export interface IPhoneNumberConfigDTO {
  country: string;
  countryCode: string;
  regex: string;
}

export interface IUpdatePhoneNumberConfigDTO 
 extends Partial<Pick<IPhoneNumberConfig, 'countryCode' | 'regex'>> {}

class PhoneNumberConfigService {
 /**
  * Lấy danh sách các quốc gia có trong cấu hình
  * @returns Promise<IPhoneNumberConfig[]> Danh sách configs các quốc gia
  */
 async getAllPhoneNumberConfigs(): Promise<IPhoneNumberConfig[]> {
   try {
      return await PhoneNumberConfig.find({});
    } catch (error) {
      console.error('Error getting all phone number configs:', error);  
      throw error;
    }
  }

 /**
  * Lấy thông tin cấu hình số điện thoại theo quốc gia
  * @param country Tên quốc gia
  * @returns Promise<IPhoneNumberConfigResponseDTO | null> 
  * Thông tin mã quốc gia và biểu thức regex
  */
 async getPhoneNumberConfig(country: string): Promise<IPhoneNumberConfig> {
   try {
     if (!country) {
       throw new Error('Country is required');
     }

     const phoneConfig = await PhoneNumberConfig.findOne({ 
       country: { $regex: new RegExp(country, 'i') } 
     });

     if (!phoneConfig) {
       throw new Error(`No phone number configuration found for ${country}`);
     }

      return phoneConfig;
   } catch (error) {
     console.error(`Error getting phone number config for ${country}:`, error);
     throw error;
   }
 }

 /**
  * Thêm cấu hình số điện thoại mới
  * @param phoneNumberConfig Thông tin cấu hình số điện thoại
  * @returns Promise<IPhoneNumberConfigResponseDTO> Cấu hình số điện thoại đã được tạo
  */
 async addPhoneNumberConfig(
   phoneNumberConfig: IPhoneNumberConfigDTO
 ): Promise<IPhoneNumberConfig> {
   try {
     // Kiểm tra đầy đủ thông tin
     if (!phoneNumberConfig.country) {
       throw new Error('Country is required');
     }
     if (!phoneNumberConfig.countryCode) {
       throw new Error('Country code is required');
     }
     if (!phoneNumberConfig.regex) {
       throw new Error('Regex is required');
     }

     // Kiểm tra tính hợp lệ của regex
     try {
       new RegExp(phoneNumberConfig.regex);
     } catch (regexError) {
       throw new Error('Invalid regex pattern');
     }

     // Kiểm tra trùng lặp
     const existingConfig = await PhoneNumberConfig.findOne({ 
       country: phoneNumberConfig.country 
     });

     if (existingConfig) {
       throw new Error(`Phone number configuration for ${phoneNumberConfig.country} already exists`);
     }

     // Tạo cấu hình mới
      const newConfig = new PhoneNumberConfig(phoneNumberConfig);
      await newConfig.save();
      return newConfig;
   } catch (error) {
     console.error('Error adding phone number config:', error);
     throw error;
   }
 }

 /**
  * Cập nhật cấu hình số điện thoại
  * @param country Tên quốc gia
  * @param updateData Dữ liệu cập nhật
  * @returns Promise<IPhoneNumberConfigResponseDTO | null> Cấu hình đã cập nhật
  */
 async updatePhoneNumberConfig(
   country: string, 
   updateData: IUpdatePhoneNumberConfigDTO
 ): Promise<IPhoneNumberConfig> {
   try {
     // Kiểm tra tính hợp lệ của regex nếu có
     if (updateData.regex) {
       try {
         new RegExp(updateData.regex);
       } catch (regexError) {
         throw new Error('Invalid regex pattern');
       }
     }

     // Tìm và cập nhật
     const updatedConfig = await PhoneNumberConfig.findOneAndUpdate(
       { country }, 
       updateData, 
       { new: true }
     );

     if (!updatedConfig) {
        throw new Error(`No phone number configuration found for ${country}`);
     }

      return updatedConfig;
   } catch (error) {
     console.error(`Error updating phone number config for ${country}:`, error);
     throw error;
   }
 }

 /**
  * Xóa cấu hình số điện thoại
  * @param country Tên quốc gia
  * @returns Promise<boolean> Kết quả xóa
  */
 async deletePhoneNumberConfig(country: string): Promise<IPhoneNumberConfig> {
   try {
     const result = await PhoneNumberConfig.findOneAndDelete({ country });
     
     if (!result) {
        throw new Error(`No phone number configuration found for ${country}`);
     }

      return result;
   } catch (error) {
     console.error(`Error deleting phone number config for ${country}:`, error);
     throw error;
   }
 }
}

export default new PhoneNumberConfigService();