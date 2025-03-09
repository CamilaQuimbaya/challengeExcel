import xlsx from 'xlsx';
import UploadTaskRepository from '../infrastructure/persistence/UploadTaskRepository';
import RabbitMQService from '../infrastructure/messaging/RabbitMQService';

interface MappingFormat {
    [key: string]: 'String' | 'Number' | 'Array<Number>';
}

interface ErrorEntry {
    row: number;
    col: number;
}

class ExcelProcessor {
    async processFile(filePath: string, mapping: MappingFormat) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        const headers = rows.shift(); // Extraer encabezados
        if (!headers) throw new Error("Empty file or invalid format");
        
        this.validateHeaders(headers, mapping);
        
        let errors: ErrorEntry[] = [];
        const processedData = rows.map((row, rowIndex) => 
            this.mapRowToObject(row, headers, mapping, rowIndex + 2, errors)
        ).filter(item => item !== null);

        return this.saveUploadTask(processedData, mapping, filePath, errors);
    }

    private validateHeaders(headers: string[], mapping: MappingFormat) {
        const expectedHeaders = Object.keys(mapping);
        if (!expectedHeaders.every(header => headers.includes(header))) {
            throw new Error(`Invalid file format. Expected headers: ${expectedHeaders.join(', ')}`);
        }
    }

    private mapRowToObject(row: any[], headers: string[], mapping: MappingFormat, rowIndex: number, errors: ErrorEntry[]) {
        const obj: any = {};
        let isValid = true;
    
        headers.forEach((header, colIndex) => {
            const type = mapping[header as keyof MappingFormat];
            if (!type) return;
    
            const cellValue = row[colIndex];
    
            if (type === 'Number') {
                const numberValue = Number(cellValue);
                if (isNaN(numberValue)) {
                    errors.push({ row: rowIndex, col: colIndex + 1 });
                    isValid = false;
                } else {
                    obj[header] = numberValue;
                }
            } else if (type === 'String') {
                obj[header] = String(cellValue || '');
            } else if (type === 'Array<Number>') {
                obj[header] = cellValue
                    ? cellValue.split(',').map((num: string) => Number(num.trim())).filter((n: number) => !isNaN(n)).sort((a: number, b: number) => a - b)
                    : [];
            }
        });
    
        return isValid ? obj : null;
    }

    private async saveUploadTask(processedData: any[], mapping: MappingFormat, filePath: string, errors: ErrorEntry[]) {
        const taskId = await UploadTaskRepository.createTask(mapping, filePath, processedData);
        
        // Enviar tarea a RabbitMQ para su procesamiento asincrónico
        await RabbitMQService.publishMessage(JSON.stringify({ taskId, filePath, mapping }));
        
        // Actualizar la tarea como en proceso
        await UploadTaskRepository.updateTask(taskId, { status: 'processing', errors });
        return { id: taskId, data: processedData, errors };
    }
}

export default new ExcelProcessor();