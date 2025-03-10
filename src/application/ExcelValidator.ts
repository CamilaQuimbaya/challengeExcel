interface ValidationError {
    row: number;
    col: number;
    error: string;
  }
  
  interface MappingFormat {
    [key: string]: 'String' | 'Number' | 'Array<Number>';
  }
  
  class ExcelValidator {
    static validateRow(row: any[], headers: string[], mapping: Record<string, 'String' | 'Number' | 'Array<Number>'>, rowIndex: number) {
      const errors: { row: number; col: number; error: string }[] = [];
  
      headers.forEach((header, colIndex) => {
        const expectedType = mapping[header as keyof typeof mapping];
        const cellValue = row[colIndex];
  
        if (!expectedType) return;
  
        if (expectedType === 'Number') {
          const numberValue = Number(cellValue);
          if (isNaN(numberValue)) {
            errors.push({ row: rowIndex + 1, col: colIndex + 1, error: `Expected a Number but got '${cellValue}'` });
          }
        } else if (expectedType === 'String') {
          if (typeof cellValue !== 'string') {
            errors.push({ row: rowIndex + 1, col: colIndex + 1, error: `Expected a String but got '${cellValue}'` });
          }
        } else if (expectedType === 'Array<Number>') {
          if (typeof cellValue !== 'string' || !cellValue.split(',').every(num => !isNaN(Number(num.trim())))) {
            errors.push({ row: rowIndex + 1, col: colIndex + 1, error: `Expected an array of numbers but got '${cellValue}'` });
          }
        }
      });
  
      console.log(`🔍 Errores detectados en fila ${rowIndex + 1}:`, errors);
      return errors;
    }
  }
  
  
  export default ExcelValidator;