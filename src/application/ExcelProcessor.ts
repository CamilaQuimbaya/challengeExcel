import xlsx from 'xlsx';

class ExcelProcessor {
  static readFile(filePath: string): any[][] {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { header: 1 });
  }
}

export default ExcelProcessor;