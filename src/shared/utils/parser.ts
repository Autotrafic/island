import * as XLSX from 'xlsx';
import { MetaLead } from '../../modules/leads-uploader/interfaces';

export function parseDateToDDMMYYYY(dateString: Date | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function parseExcelData<T extends MetaLead>(
  file: File,
  requiredColumns: string[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data || !(data instanceof ArrayBuffer)) {
        reject(new Error('Failed to read file.'));
        return;
      }

      const uint8Array = new Uint8Array(data);
      const workbook = XLSX.read(uint8Array, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (json.length === 0) {
        reject(new Error('The Excel file is empty.'));
        return;
      }

      const headers = (json[0] as string[]).map((header) => header.trim());
      const columnIndices = requiredColumns.map((col) => headers.indexOf(col.trim()));

      if (columnIndices.includes(-1)) {
        reject(new Error('Some required columns are missing in the Excel file.'));
        return;
      }

      const royalties = json.slice(1).map((row: any) => {
        const royalty: Partial<T> = {};
        requiredColumns.forEach((col, index) => {
          const value = row[columnIndices[index]];
          royalty[col as keyof T] = value !== undefined && value !== null ? value : "";
        });
        return royalty as T;
      });

      resolve(royalties);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}