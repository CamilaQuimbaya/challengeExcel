import * as xlsx from 'xlsx';
import { logger } from '../config/logger';

class ExcelProcessor {
    processFile(buffer: Buffer): { data: any[]; errors: any[] } {
        try {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });
            const { data, errors } = this.validateData(jsonData);

            return { data, errors };
        } catch (error) {
            logger.error('Error processing Excel file', error);
            throw new Error('Failed to process Excel file');
        }
    }

    private validateData(data: any[]): { data: any[]; errors: any[] } {
        const validData: any[] = [];
        const errors: any[] = [];
        
        data.forEach((row, index) => {
            const { name, age, nums } = row;
            const rowErrors: any[] = [];
            
            if (typeof name !== 'string') {
                rowErrors.push({ row: index + 2, col: 1 });
            }
            if (isNaN(Number(age))) {
                rowErrors.push({ row: index + 2, col: 2 });
            }
            if (!Array.isArray(nums)) {
                rowErrors.push({ row: index + 2, col: 3 });
            } else {
                row.nums = nums.map(Number).sort((a, b) => a - b);
            }

            if (rowErrors.length > 0) {
                errors.push(...rowErrors);
            } else {
                validData.push(row);
            }
        });

        return { data: validData, errors };
    }
}

export const excelProcessor = new ExcelProcessor();
