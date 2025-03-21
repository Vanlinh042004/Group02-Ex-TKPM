import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import fs from 'fs';

export const importCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

export const exportCSV = (data: any[], filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) return reject(err);
      fs.writeFile(filePath, output, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};
