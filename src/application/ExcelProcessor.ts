import * as XLSX from 'xlsx';
import { Readable } from 'stream';

interface ParsedRow {
  name?: string;
  age?: number;
  nums?: number[];
}

export class ExcelProcessor {
  static async parseExcel(fileBuffer: Buffer): Promise<{ data: ParsedRow[], errors: { row: number, col: number }[] }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    
    let errors: { row: number, col: number }[] = [];
    let data: ParsedRow[] = [];

    if (rows.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    const headers = rows[0];
    if (!headers.includes('Nombre') || !headers.includes('Edad') || !headers.includes('Nums')) {
      throw new Error('El archivo Excel no contiene los encabezados requeridos: Nombre, Edad, Nums');
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let parsedRow: ParsedRow = {};
      
      try {
        parsedRow.name = typeof row[0] === 'string' ? row[0] : (() => { errors.push({ row: i + 1, col: 1 }); return undefined; })();
        parsedRow.age = typeof row[1] === 'number' ? row[1] : (() => { errors.push({ row: i + 1, col: 2 }); return undefined; })();
        parsedRow.nums = Array.isArray(row[2]) || typeof row[2] === 'string' 
          ? row[2].toString().split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b) 
          : (() => { errors.push({ row: i + 1, col: 3 }); return undefined; })();
      } catch (err) {
        errors.push({ row: i + 1, col: 1 });
      }
      
      data.push(parsedRow);
    }

    return { data, errors };
  }
}
