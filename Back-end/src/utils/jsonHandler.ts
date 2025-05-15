import fs from 'fs';

/**
 * Đọc và phân tích dữ liệu từ file JSON
 * @param filePath Đường dẫn đến file JSON
 * @returns Promise<any[]> Dữ liệu đọc được từ file
 */
export const importJSON = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (parseError) {
        reject(new Error(`Lỗi phân tích JSON: ${parseError.message}`));
      }
    });
  });
};

/**
 * Xuất dữ liệu ra file JSON
 * @param data Dữ liệu cần xuất
 * @param filePath Đường dẫn file đích
 * @returns Promise<void>
 */
export const exportJSON = (data: any[], filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFile(filePath, jsonString, 'utf8', (writeErr) => {
        if (writeErr) return reject(writeErr);
        resolve();
      });
    } catch (stringifyError) {
      reject(
        new Error(`Lỗi chuyển đổi dữ liệu sang JSON: ${stringifyError.message}`)
      );
    }
  });
};
