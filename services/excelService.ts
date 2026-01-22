
import { read, utils } from 'xlsx';

export interface ExcelAnalysisResult {
    fullCsv: string;
    stats: {
        totalRows: number;
        uniqueCnpjs: number;
        sellers: Record<string, number>;
        headers: string[];
    };
}

const cleanCnpj = (value: any): string | null => {
    if (!value) return null;
    const str = String(value).replace(/[^\d]/g, '');
    return str.length >= 11 ? str : null; 
};

export const extractAndAnalyzeExcel = async (file: File): Promise<ExcelAnalysisResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: any[][] = utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length === 0) throw new Error("A planilha está vazia.");

                // Better header detection
                let headerRow = 0;
                for(let i=0; i<Math.min(10, jsonData.length); i++) {
                    if (jsonData[i].length > 1) { headerRow = i; break; }
                }

                const headers = jsonData[headerRow] as string[];
                const rows = jsonData.slice(headerRow + 1);
                
                const stats = {
                    totalRows: rows.length,
                    uniqueCnpjs: 0,
                    sellers: {} as Record<string, number>,
                    headers: headers
                };

                const uniqueCnpjSet = new Set<string>();

                rows.forEach((row) => {
                    const seller = row[0] ? String(row[0]).trim() : 'Não Identificado';
                    if (seller) stats.sellers[seller] = (stats.sellers[seller] || 0) + 1;

                    let foundCnpj = false;
                    for (const cell of row) {
                        const cleaned = cleanCnpj(cell);
                        if (cleaned && (cleaned.length === 14 || cleaned.length === 11)) {
                            uniqueCnpjSet.add(cleaned);
                            foundCnpj = true;
                            break;
                        }
                    }
                });

                stats.uniqueCnpjs = uniqueCnpjSet.size;
                const csvData = utils.sheet_to_csv(worksheet, { FS: ",", RS: "\n", blankrows: false });

                resolve({ fullCsv: csvData, stats: stats });

            } catch (err) {
                console.error("Excel parsing error:", err);
                reject(new Error("Falha ao ler e analisar o arquivo Excel."));
            }
        };
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
        reader.readAsArrayBuffer(file);
    });
};

export const extractTextFromExcel = async (file: File): Promise<string> => {
    const result = await extractAndAnalyzeExcel(file);
    return result.fullCsv;
};
