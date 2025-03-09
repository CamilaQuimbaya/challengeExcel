import xlsx from 'xlsx';
import UploadTaskRepository from '../infrastructure/persistence/UploadTaskRepository';

interface MappingFormat {
    [key: string]: 'String' | 'Number' | 'Array<Number>';
}

interface ErrorEntry {
    row: number;
    col: number;
}

class ExcelProcessor {
    private errors: ErrorEntry[] = [];

    async processFile(filePath: string, mapping: MappingFormat) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        const headers = rows.shift(); // Extraer encabezados
        if (!headers) throw new Error("Empty file or invalid format");
        
        this.validateHeaders(headers, mapping);
        
        const processedData = rows.map((row, rowIndex) => 
            this.mapRowToObject(row, headers, mapping, rowIndex + 2)
        ).filter(item => item !== null);

        return this.saveUploadTask(processedData, mapping, filePath);
    }

    private validateHeaders(headers: string[], mapping: MappingFormat) {
        const expectedHeaders = Object.keys(mapping);
        if (!expectedHeaders.every(header => headers.includes(header))) {
            throw new Error(`Invalid file format. Expected headers: ${expectedHeaders.join(', ')}`);
        }
    }

    private mapRowToObject(row: any[], headers: string[], mapping: MappingFormat, rowIndex: number) {
      const obj: any = {};
      let isValid = true;
  
      headers.forEach((header, colIndex) => {
          const type = mapping[header as keyof MappingFormat];
          if (!type) return; // Si la columna no está en el mapeo, ignorar
  
          const cellValue = row[colIndex];
  
          if (type === 'Number') {
              const numberValue = Number(cellValue);
              if (isNaN(numberValue)) {
                  this.errors.push({ row: rowIndex, col: colIndex + 1 }); // ❌ Guardar errores con fila y columna
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
  
      return isValid ? obj : null; // Si la fila tiene errores, se ignora
  }
  

    private parseNumber(value: any, rowIndex: number, colIndex: number): number | null {
        const numberValue = Number(value);
        if (isNaN(numberValue)) {
            this.errors.push({ row: rowIndex, col: colIndex + 1 });
            return null;
        }
        return numberValue;
    }

    private parseNumberArray(value: string): number[] {
        return value.split(',')
            .map((num) => parseFloat(num.trim()))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b);
    }

    private async saveUploadTask(processedData: any[], mapping: MappingFormat, filePath: string) {
      const taskId = await UploadTaskRepository.createTask(mapping, filePath, processedData);
      await UploadTaskRepository.updateTask(taskId, { status: 'processing', errors: this.errors });
      return { id: taskId, data: processedData, errors: this.errors };
  }
  
  

    getErrors(page: number, limit: number) {
        const startIndex = (page - 1) * limit;
        return this.errors.slice(startIndex, startIndex + limit);
    }
}

export default new ExcelProcessor();