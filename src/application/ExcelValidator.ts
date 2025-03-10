import { error } from "console";

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
      let errors: { row: number; nameError? : string, ageError? : string, numsError? : string} | null = null;
      
  
      headers.forEach((header, colIndex) => {
        const expectedType = mapping[header as keyof typeof mapping];
        const cellValue = row[colIndex];
  
        if (!expectedType) return;
  
        if (expectedType === 'Number') {
          const numberValue = Number(cellValue);
          if (isNaN(numberValue)) {
            errors = {...errors, row: rowIndex + 1 , ageError : `Expected a Number but got '${cellValue}'`};
          }
        } else if (expectedType === 'String') {
          if (typeof cellValue !== 'string') {
            errors = {...errors, row: rowIndex + 1 , nameError : `Expected a String but got '${cellValue}'`};
          }
        } else if (expectedType === 'Array<Number>') {
          if (typeof cellValue !== 'string' || !cellValue.split(',').every(num => !isNaN(Number(num.trim())))) {
            errors = {...errors, row: rowIndex + 1 , numsError : `Expected an array of numbers but got '${cellValue}'`};
          }
        }
      });
  
      console.log(`🔍 Errores detectados en fila ${rowIndex + 1}:`, errors);
      return errors;
    }
  }
  
  
  export default ExcelValidator;