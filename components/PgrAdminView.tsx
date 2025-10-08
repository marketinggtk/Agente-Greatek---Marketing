import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import * as XLSX from 'xlsx';

const PgrAdminView: React.FC = () => {
    const { pgrSellers, setPgrSellers, logoutPgr, showToast } = useAppStore();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (fileToProcess: File) => {
        setError(null);
        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const newSellerMetas = new Map<string, Record<string, string>>();

                // Mapping from unique text in the user's sheet to our internal metric IDs
                const keyToMetricId: { [key: string]: string } = {
                    'Volume Financeiro': 'volFin',
                    'ENERGIA': 'energia', 'FIBRA - FERRAMENTAS': 'fibraFerramentas', 'FIBRA - PASSIVOS': 'fibraPassivos',
                    'Redes': 'redes', 'ONU': 'onu', 'CFTV': 'cftv', 'Enterprise': 'enterprise',
                    'Envio do Relatório completo': 'relatorio', 'Clientes Contados': 'clientes', 'Volumetria de ligações': 'ligacoes',
                    'Volumetria de atividades': 'atividades', 'Registro de atividades': 'registro',
                    "CNPJ's Faturados": 'cnpjs', 'Ticket Médio': 'ticket', 'Mix de produtos por cliente': 'mixCliente',
                    'Recompra 30 dias': 'recompra30', 'Recompra 60 dias': 'recompra60', 'Recompra 90 dias': 'recompra90',
                    'Preço': 'preco', 'Prazo': 'prazo', 'Projetos novos': 'projetos'
                };

                for (const sheetName of workbook.SheetNames) {
                    const sellerId = sheetName.trim();
                    const worksheet = workbook.Sheets[sheetName];
                    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                    let headerRowIndex = -1;
                    let colIndices = { desc: -1, ind: -1, meta: -1 };

                    for (let i = 0; i < Math.min(rows.length, 10); i++) { // Search for header in the first 10 rows
                        const row = rows[i];
                        if (!Array.isArray(row)) continue;
                        const descIndex = row.findIndex(cell => typeof cell === 'string' && cell.trim() === 'Descrição');
                        const indIndex = row.findIndex(cell => typeof cell === 'string' && cell.trim() === 'Indicador');
                        const metaIndex = row.findIndex(cell => typeof cell === 'string' && cell.trim() === 'Meta');
                        if (descIndex > -1 && indIndex > -1 && metaIndex > -1) {
                            headerRowIndex = i;
                            colIndices = { desc: descIndex, ind: indIndex, meta: metaIndex };
                            break;
                        }
                    }

                    if (headerRowIndex === -1) {
                        console.warn(`Pulando aba "${sellerId}": Cabeçalho (Descrição, Indicador, Meta) não encontrado.`);
                        continue;
                    }

                    const currentMetas: Record<string, string> = {};
                    let lastDesc = '';

                    for (let i = headerRowIndex + 1; i < rows.length; i++) {
                        const row = rows[i];
                        if (!row || row.every(cell => cell === null)) continue;

                        const descValue = row[colIndices.desc];
                        if (descValue !== null && typeof descValue === 'string' && descValue.trim() !== '') {
                            lastDesc = descValue.trim();
                        }
                        const currentDesc = lastDesc;
                        const ind = row[colIndices.ind] ? String(row[colIndices.ind]).trim() : '';
                        const meta = row[colIndices.meta] ?? '';

                        const metricId = keyToMetricId[currentDesc] || keyToMetricId[ind];
                        
                        if (metricId) {
                            currentMetas[metricId] = String(meta);
                        }
                    }
                    newSellerMetas.set(sellerId, currentMetas);
                }

                if (newSellerMetas.size === 0) {
                    throw new Error("Nenhuma meta de vendedor foi encontrada na planilha. Verifique o formato e o nome das abas.");
                }

                const currentSellers = pgrSellers;
                const updatedSellers = currentSellers.map(seller => {
                    if (newSellerMetas.has(seller.id)) {
                        return { ...seller, metas: newSellerMetas.get(seller.id)! };
                    }
                    return seller;
                });

                setPgrSellers(updatedSellers);
                showToast('Metas dos vendedores atualizadas com sucesso!', 'success');
                setFile(null);

            } catch (err: any) {
                console.error("Erro ao processar planilha:", err);
                setError(`Erro ao processar a planilha: ${err.message}`);
                showToast('Falha ao atualizar os dados. Verifique o formato da planilha.', 'error');
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            setError('Falha ao ler o arquivo.');
            setIsProcessing(false);
        };

        reader.readAsArrayBuffer(fileToProcess);
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const selectedFile = files[0];
            const fileNameLower = selectedFile.name.toLowerCase();

            if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Tipo de arquivo inválido. Por favor, selecione um arquivo .xlsx ou .xls');
                setFile(null);
            }
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(isOver);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileChange(files);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 bg-gray-50 overflow-y-auto custom-scrollbar animate-fade-in">
            <header className="flex-shrink-0 flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-greatek-dark-blue">Painel do Administrador - PGR</h1>
                <button onClick={logoutPgr} className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300">
                    <i className="bi bi-box-arrow-left"></i><span>Sair</span>
                </button>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-greatek-dark-blue">Atualizar Metas dos Vendedores</h2>
                <p className="text-sm text-text-secondary mt-1">
                    Faça o upload de uma planilha (.xlsx, .xls) com os dados de metas. Os dados existentes serão substituídos.
                </p>

                <div
                    className={`mt-4 p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-greatek-blue bg-greatek-blue/10' : 'border-gray-300 hover:border-greatek-blue'}`}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                    <i className="bi bi-cloud-arrow-up-fill text-4xl text-greatek-blue/50"></i>
                    <p className="mt-2 text-sm font-semibold text-text-primary">Arraste e solte o arquivo</p>
                    <p className="text-xs text-text-secondary">ou clique para selecionar</p>
                </div>

                {file && (
                    <div className="mt-4 p-3 bg-greatek-bg-light border border-greatek-border rounded-lg flex items-center justify-between text-left animate-fade-in">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <i className="bi bi-file-earmark-spreadsheet text-2xl text-greatek-dark-blue flex-shrink-0"></i>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-medium text-text-secondary truncate text-sm" title={file.name}>{file.name}</span>
                                <span className="text-xs text-text-secondary/80">{formatFileSize(file.size)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveFile}
                            className="p-1.5 rounded-full hover:bg-gray-300 flex-shrink-0 ml-2"
                            aria-label="Remover arquivo"
                        >
                            <i className="bi bi-x-lg text-sm"></i>
                        </button>
                    </div>
                )}

                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => file && processFile(file)}
                        disabled={isProcessing || !file}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isProcessing ? 'Processando...' : 'Processar Planilha'}
                    </button>
                </div>

                <div className="mt-6 text-xs text-gray-600 p-4 bg-gray-100 rounded-md">
                    <h4 className="font-semibold text-sm mb-2">Instruções para a Planilha:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>O arquivo deve ser no formato <strong>.xlsx</strong> ou <strong>.xls</strong>.</li>
                        <li>Coloque os dados de cada vendedor em uma <strong>aba separada</strong> dentro do mesmo arquivo.</li>
                        <li>O <strong>nome de cada aba</strong> deve corresponder exatamente ao 'id' do vendedor (ex: <code>rodrigo_santos</code>, <code>lucas_santos</code>).</li>
                        <li>A planilha em cada aba deve seguir o formato do relatório PGR, contendo as colunas '<strong>Descrição</strong>', '<strong>Indicador</strong>' e '<strong>Meta</strong>'.</li>
                        <li>O sistema lerá essas colunas para extrair os valores de meta para cada indicador automaticamente.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PgrAdminView;
