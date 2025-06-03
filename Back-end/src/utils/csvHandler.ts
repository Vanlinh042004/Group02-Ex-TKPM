import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import fs from "fs";

/**
 * Đọc và phân tích dữ liệu từ file CSV
 * @param filePath Đường dẫn đến file CSV
 * @returns Promise<any[]> Mảng các đối tượng phân tích từ file
 */
export const importCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true, // Sử dụng header đầu tiên làm key cho mỗi row
        }),
      )
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

/**
 * Xuất dữ liệu ra file CSV
 * @param data Mảng các đối tượng cần xuất
 * @param filePath Đường dẫn file đích
 * @returns Promise<void>
 */
export const exportCSV = (data: any[], filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) return reject(err);

      fs.writeFile(filePath, output, (writeErr) => {
        if (writeErr) return reject(writeErr);
        resolve();
      });
    });
  });
};
