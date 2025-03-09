import RabbitMQService from './RabbitMQService';
import { connectDatabase } from '../../config/database';
import UploadTaskRepository from '../persistence/UploadTaskRepository';
import { logger } from '../../config/logger';
import xlsx from 'xlsx';

async function processTaskMessage(msg: any) {
    if (!msg) return;

    try {
        const { taskId, filePath, mapping } = JSON.parse(msg.content.toString());
        logger.info(`📨 Processing task: ${taskId}`);

        // 📌 1. Leer el archivo Excel
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        // 📌 2. Validar encabezados
        const headers = rows.shift();
        if (!headers) throw new Error("Empty file or invalid format");

        let errors: { row: number; col: number }[] = [];
        const processedData = rows.map((row, rowIndex) => {
            const obj: any = {};
            let isValid = true;

            headers.forEach((header, colIndex) => {
                const type = mapping[header as keyof typeof mapping];
                if (!type) return;

                const cellValue = row[colIndex];

                if (type === 'Number') {
                    const numberValue = Number(cellValue);
                    if (isNaN(numberValue)) {
                        errors.push({ row: rowIndex + 2, col: colIndex + 1 });
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
        }).filter((item) => item !== null);

        // 📌 3. Guardar los datos procesados en MongoDB
        await UploadTaskRepository.updateTask(taskId, { status: 'done', processedData, errors });
        logger.info(`✅ Task ${taskId} completed with ${errors.length} errors.`);
    } catch (error) {
        logger.error(`❌ Error processing task: ${error instanceof Error ? error.message : error}`);
    }
}

async function startTaskProcessor() {
    await connectDatabase();
    await RabbitMQService.consumeMessages(processTaskMessage);
}

startTaskProcessor();
