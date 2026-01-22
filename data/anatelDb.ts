
import { LeadData } from "../types";

// Define the structure based on the JSON provided
export interface AnatelRecord {
    "Ano Mês Grupo Econômico": string;
    "Empresa": string;
    "CNPJ": number | string;
    "Porte da PrestadorUF": string;
    "Município": string;
}

// Helper to clean CNPJ string (remove special chars)
const cleanCnpj = (cnpj: string | number): string => {
    return String(cnpj).replace(/[^\d]/g, '');
};

// Helper to normalize company name for fuzzy search
const normalizeString = (str: string): string => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, '').trim();
};

export const findInAnatelDb = (lead: LeadData): Partial<LeadData> | null => {
    if (!lead.cnpj && !lead.name && !lead.legal_name) return null;

    const targetCnpj = lead.cnpj ? cleanCnpj(lead.cnpj) : '';
    const targetName = normalizeString(lead.legal_name || lead.name || '');

    // Search Priority 1: CNPJ (Exact Match)
    let match = ANATEL_DB.find(record => {
        if (!record.CNPJ) return false;
        const dbCnpj = cleanCnpj(record.CNPJ);
        // Some records might have partial CNPJs, so we check mostly for exact match or includes if valid length
        return dbCnpj === targetCnpj; 
    });

    // Search Priority 2: Name (Fuzzy Match)
    if (!match && targetName.length > 3) {
        match = ANATEL_DB.find(record => {
            const dbName = normalizeString(record.Empresa);
            return dbName.includes(targetName) || targetName.includes(dbName);
        });
    }

    if (match) {
        // Extract meaningful info from the somewhat raw keys
        // "Porte da PrestadorUF": "Grande Porte      AM" -> "Grande Porte"
        const porteRaw = match["Porte da PrestadorUF"] || '';
        const porte = porteRaw.split('  ')[0].trim(); // Simple heuristic to split size from state
        
        // "Ano Mês Grupo Econômico" actually contains speed/tech info in many rows based on the provided data
        // Example: "500FTTH        Fibra         Pessoa FísicaINT"
        // This JSON structure provided is very irregular (it seems to have merged columns). 
        // We will try to extract Tech from the key "Empresa" in some rows where it holds tech info, 
        // BUT looking at the data, "Empresa" holds the Name usually.
        // Let's look at the actual data provided.
        // Row: "Empresa": "600FTTH        Fibra         Pessoa FísicaINT" 
        // It seems the data provided has shifted columns for many entries.
        
        // Heuristic for shifted data: If 'Empresa' contains 'FTTH' or 'Fibra', it's likely tech info, not a company name.
        // However, we found the 'match' based on a valid Company Name earlier. 
        // So we assume 'match' is a valid company record.
        
        return {
            anatel_verified: true,
            official_size: porte,
            // We can't reliably extract technology from this specific mixed JSON structure for a specific company
            // without a proper ID link, as the "Tech" rows seem disconnected or shifted.
            // We will simply mark as verified.
            official_tech: "Verificado na Base Anatel" 
        };
    }

    return null;
};

// The provided database (Subset for performance, but structure is ready for full load)
export const ANATEL_DB: AnatelRecord[] = [
  {
    "Ano Mês Grupo Econômico": "2025   3TELECOM AMERICAS",
    "Empresa": "CLARO",
    "CNPJ": "66970229000167",
    "Porte da PrestadorUF": "Grande Porte      AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OI",
    "Empresa": "OI",
    "CNPJ": "53420564000140",
    "Porte da PrestadorUF": "Grande Porte      AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Pronto Fibra Ltda",
    "CNPJ": "24404615000141",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEA TELECOM LTDA",
    "CNPJ": "25450139000168",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4TELEFONICA",
    "Empresa": "VIVO",
    "CNPJ": "2558157000162",
    "Porte da PrestadorUF": "Grande Porte      PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4TELECOM ITALIA",
    "Empresa": "TIM",
    "CNPJ": "2421421000111",
    "Porte da PrestadorUF": "Grande Porte      AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marabá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "AMAZONET TELECOMUNICACOES LTDA",
    "CNPJ": "17854435000104",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Conectlan Internet LTDA",
    "CNPJ": "9473770000126",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WORLDNET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "18456569000121",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Amazonia Telecomunicacoes Ltda",
    "CNPJ": "18311497000124",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SPEED TRAVEL COMUNICACAO MULTIMIDIA LTDA",
    "CNPJ": "7304055000134",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTERNETI PROVEDOR E INFORMATICA LTDA ME",
    "CNPJ": "10791708000161",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rolim Net Servicos & Internet Ltda",
    "CNPJ": "9337446000180",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Rolim de Mo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "OLLA SERVIÇOS & INTERNET LTDA",
    "CNPJ": "12973083000184",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WSP SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "7942413000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Bali Brasil Servicos de Banda Larga Ltda",
    "CNPJ": "53799731000105",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "As Sistemas de Telecomunicacoes Eireli",
    "CNPJ": "5751606000182",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Itacoatiara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Unonet Telecomunicacoes Ltda",
    "CNPJ": "10313079000164",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Cruzeiro do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MARIA NEUSA PEREIRA DE SOUSA E CIA LTDA",
    "CNPJ": "10140126000115",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Colinas do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "LUCARONI TELECOM LTDA - ME",
    "CNPJ": "17310450000183",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "STARLINK BRAZIL SERVICOS DE INTERNET LTDA.",
    "CNPJ": "40154884000153",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Tefé"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "GLOBOFIBER TELECOM LTDA",
    "CNPJ": "8741236000190",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WLAN SISTEMAS DE TELECOMUNICACOES EIRELI",
    "CNPJ": "14644092000157",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TERA TELECOM EIRELI",
    "CNPJ": "27015017000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDESUB SERVICOS & INTERNET LTDA",
    "CNPJ": "36173906000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Net Prime Telecomunicacoes Ltda.",
    "CNPJ": "27275682000100",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Caseara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Prime System Telecomunicacoes Ltda.",
    "CNPJ": "12356161000100",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Paraíso do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INFOTEL ENGENHARIA & TELECOMUNICACOES SCM EIRELI",
    "CNPJ": "10779392000192",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Porto Nacio"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "LV SERVIÇOS DE ITERNET LTDA",
    "CNPJ": "27071842000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Félix d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEM FRONTEIRAS TELECOMUNICACOES LTDA",
    "CNPJ": "11972556000166",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Senador Gui"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3SKY",
    "Empresa": "SKY",
    "CNPJ": "497373000110",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "F.A.A PROVEDOR LTDA",
    "CNPJ": "26133539000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Monte Negro"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Toledo Fibra Telecomunicacoes Ltda",
    "CNPJ": "9537386000140",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "A R BARROS - ME",
    "CNPJ": "11861585000150",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "São Sebasti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "PORTAL CONEXÃO LTDA - ME",
    "CNPJ": "17441754000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Bragança"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Turbo Net Telecom Ltda",
    "CNPJ": "9391548000184",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Buritis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Allfiber Telecom - Servicos de Telecomunicacoes - Ltda",
    "CNPJ": "23150425000182",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "As Sistemas de Telecomunicacoes Eireli",
    "CNPJ": "5751606000182",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Conceição d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Pau D'Arco"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Xinguara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JCL TELECOMUNICACOES EIRELI",
    "CNPJ": "26611936000142",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tucumã"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "VCNETWORK SOLUCOES TECNOLOGICAS LTDA. - ME",
    "CNPJ": "8362677000181",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Net Way Informatica Ltda",
    "CNPJ": "10563381000170",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Click Enter Ltda",
    "CNPJ": "10984041000113",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capitão Poç"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Linkfire Telecom Ltda",
    "CNPJ": "14122350000135",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "E. W. de Aguiar Lima Comercio Ltda",
    "CNPJ": "1057537000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Monte Alegr"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "M. Regina O. da Silva Ltda",
    "CNPJ": "9186797000138",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itaituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDE DE TELECOMUNICACOES CARAJAS EIRELI",
    "CNPJ": "4680405000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "L G C COMUNICACAO MULTIMIDIA LTDA",
    "CNPJ": "24722273000108",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "L. S. N. FERREIRA & CIA LTDA",
    "CNPJ": "17149900000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Rio Preto d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rv Connect Ltda",
    "CNPJ": "46603383000193",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Autazes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ECM PROVEDORES DE ACESSO DE COMUNICACOES LTDA - ME",
    "CNPJ": "21485579000108",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "e M Silva Eletronica",
    "CNPJ": "5782151000162",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Francis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "N Guerra da Silva Servicos de Comunicacao",
    "CNPJ": "48161792000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Vellon Servicos de Comunicacao Multimidia e Digitais Ltd",
    "CNPJ": "46870574000111",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "D & D INFORMATICA LTDA",
    "CNPJ": "3897438000102",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tailândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RJ CONNECT SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "19045139000180",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MBG TECNOLOGIA LTDA",
    "CNPJ": "26491296000184",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE TELECOMUNICACOES SERVICOS DE INTERNET LTDA",
    "CNPJ": "8968072000139",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "W DA S PAIXAO",
    "CNPJ": "27258311000101",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Viseu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J M SOUZA OLIVEIRA LTDA ME",
    "CNPJ": "9570711000176",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itaituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VALERIA NET COMUNICACAO LTDA",
    "CNPJ": "31083065000171",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Xapuri"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Sim Internet Ltda",
    "CNPJ": "7650444000111",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Win Time Ltda",
    "CNPJ": "2391867000140",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "FIBRACONN SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "33483541000177",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SIM PMW SUL PROVEDOR DE ACESSO AS REDES DE COMUNICACOES",
    "CNPJ": "28778758000174",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VIP SERVICOS DE TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9457528000169",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marabá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "PORTAL CONEXÃO LTDA - ME",
    "CNPJ": "17441754000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEM FRONTEIRAS TELECOMUNICACOES LTDA",
    "CNPJ": "11972556000166",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Rio Branco"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "G5 Norte Telecom Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "41623891000110",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Iranduba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "IBL - BANDA LARGA INTERNET INFORMATICA LTDA.",
    "CNPJ": "8854699000169",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "R V CONNECT TELECOMUNICACOES LTDA - ME",
    "CNPJ": "26370774000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WKVE-ASSES. EM SERV. DE INF. E TELECOMUNICACOES LTDA",
    "CNPJ": "989304000123",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Portal Eletronico Ltda",
    "CNPJ": "14937333000156",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WSP SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "7942413000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Jetz Telecom Ltda",
    "CNPJ": "44334408000175",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "FIBRACONN SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "33483541000177",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Jaru"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SKY POWER INFORMÁTICA LTDA - ME",
    "CNPJ": "12142514000160",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Miracema do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ISP MAIS TELECOM LTDA",
    "CNPJ": "14429925000167",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ourilândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "APEX TELECOMUNICACOES LTDA",
    "CNPJ": "26114525000141",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MARCOS CARRILHO CERVANTES - EPP",
    "CNPJ": "1648128000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tucuruí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "E QUARESMA NETO PROVEDORES EIRELI - ME",
    "CNPJ": "16384220000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VIRTUAL TELECOM LTDA",
    "CNPJ": "8407644000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Aurora do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "R A QUARESMA PROVEDOR LTDA",
    "CNPJ": "3714184000140",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "M.o. Servicos de Telecomunicacoes Ltda",
    "CNPJ": "40291217000112",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alto Paraís"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "M&KTEL SERVICOS DE TELECOMUNICACOES LTDA - ME",
    "CNPJ": "27502457000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Benevides"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "FARIAS NET SERVICO LTDA - ME",
    "CNPJ": "12661709000117",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "IP FIBRA TELECOM LTDA",
    "CNPJ": "18268845000128",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "W J A COMUNICACAO E MULTIMIDIA - SCM LTDA",
    "CNPJ": "35046573000130",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Vigia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "LSMR PROVEDOR DE INTERNET LTDA",
    "CNPJ": "33013315000122",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JULIO CESAR BATISTA DE OLIVEIRA ME",
    "CNPJ": "12134704000136",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Espigão D'O"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NOVANET MULTIMIDIA LTDA -ME",
    "CNPJ": "18669690000131",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NET WAY PARECIS TELECOMUNICACOES LTDA",
    "CNPJ": "19856906000130",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Parecis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VCNETWORK SOLUCOES TECNOLOGICAS LTDA. - ME",
    "CNPJ": "8362677000181",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE TELECOMUNICACOES SERVICOS DE INTERNET LTDA",
    "CNPJ": "8968072000139",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "N Guerra da Silva Servicos de Comunicacao",
    "CNPJ": "48161792000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NET WAY PARECIS TELECOMUNICACOES LTDA",
    "CNPJ": "19856906000130",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Parecis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NOVANET MULTIMIDIA LTDA -ME",
    "CNPJ": "18669690000131",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ISP MAIS TELECOM LTDA",
    "CNPJ": "14429925000167",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ourilândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE TELECOMUNICACOES SERVICOS DE INTERNET LTDA",
    "CNPJ": "8968072000139",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "F. V. Costa Comunicacao Multimidia",
    "CNPJ": "31003986000187",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Buriti do T"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "C P DA SILVA COMERCIO",
    "CNPJ": "10684727000199",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "W J A COMUNICACAO E MULTIMIDIA - SCM LTDA",
    "CNPJ": "35046573000130",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Vigia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fontenet Wili Telecom Ltda",
    "CNPJ": "48141182000147",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Assis Brasi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Redenção"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JULIO CESAR BATISTA DE OLIVEIRA ME",
    "CNPJ": "12134704000136",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Espigão D'O"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Sim Internet Ltda",
    "CNPJ": "7650444000111",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MARIA NEUSA PEREIRA DE SOUSA E CIA LTDA",
    "CNPJ": "10140126000115",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Tupiratins"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Z M Lisboa dos Santos Ltda",
    "CNPJ": "35343561000178",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "P. A. Thomaz Marcelino & Cia Ltda",
    "CNPJ": "17787718000172",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Lobo Conect Ltda",
    "CNPJ": "37164032000132",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Iranduba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTERCOM INFORMATICA LTDA - ME",
    "CNPJ": "5900718000158",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santa Luzia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MEGA ROTA INTERNET E FIBRA OPTICA EIRELI",
    "CNPJ": "33807142000114",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "MARCOS CARRILHO CERVANTES - EPP",
    "CNPJ": "1648128000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tucuruí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "PLENITUDE, SERVIÇOS DE COMUNICAÇÃO MULTIMÍDIA - EIRELI",
    "CNPJ": "12667706000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Connect Telecom Ltda",
    "CNPJ": "18578613000176",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VOOB TELECOM LTDA - EPP",
    "CNPJ": "23455799000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "MARCOS CARRILHO CERVANTES - EPP",
    "CNPJ": "1648128000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tucuruí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Connect Telecom Ltda",
    "CNPJ": "18578613000176",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Idnett Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "29817906000185",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SANNRES TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "20062032000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Redenção"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "A da S Batista",
    "CNPJ": "38306126000161",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Juruti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Infinity Servicos de Telecomunicacao Ltda",
    "CNPJ": "18702422000174",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ouro Preto"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Bit Byte Solucoes Tecnologica Eireli",
    "CNPJ": "9328720000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Breves"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "As Sistemas de Telecomunicacoes Eireli",
    "CNPJ": "5751606000182",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDE TOCANTINS DE TELECOMUNICACAO LTDA",
    "CNPJ": "27633701000114",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguatins"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INFOTEL ENGENHARIA & TELECOMUNICACOES SCM EIRELI",
    "CNPJ": "10779392000192",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Silvanópoli"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DELTA TELECOM LTDA - ME",
    "CNPJ": "18983623000197",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Brasil Novo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Corumbiara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SDMNET INFORMATICA LTDA - ME",
    "CNPJ": "9281606000117",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Feijó"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WORLDXAMBIOA INFORMATICA LTDA",
    "CNPJ": "9022737000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Geraldo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I M R TEIXEIRA ME",
    "CNPJ": "9115838000103",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Tabatinga"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Idnett Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "29817906000185",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SANNRES TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "20062032000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Redenção"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "A da S Batista",
    "CNPJ": "38306126000161",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Juruti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SDMNET INFORMATICA LTDA - ME",
    "CNPJ": "9281606000117",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Feijó"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Bit Byte Solucoes Tecnologica Eireli",
    "CNPJ": "9328720000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Breves"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Sim Internet Ltda",
    "CNPJ": "7650444000111",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rede Ultra M F Telecom Ltda",
    "CNPJ": "34671103000103",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Monte Alegr"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "O. P. DOS SANTOS & CIA LTDA",
    "CNPJ": "2905202000108",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Mirante da"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "R M SANCHES",
    "CNPJ": "30070310000143",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ZUM SERVICOS DE TELECOMUNICACOES LTDA ME",
    "CNPJ": "10548603000186",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Rede Ultra M F Telecom Ltda",
    "CNPJ": "34671103000103",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Monte Alegr"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Amapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "IBL - BANDA LARGA INTERNET INFORMATICA LTDA.",
    "CNPJ": "8854699000169",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Toledo Fibra Telecomunicacoes Ltda",
    "CNPJ": "9537386000140",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Tocantinópo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "C H C Silva Telecomunicacoes",
    "CNPJ": "32053073000138",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Goianésia d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Orixinet Telecom Ltda",
    "CNPJ": "8907298000120",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DELTA TELECOM LTDA - ME",
    "CNPJ": "18983623000197",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Brasil Novo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "E. B. DE MELO INFORMÁTICA E CONSULTORIA - ME",
    "CNPJ": "17179982000123",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Espigão D'O"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "C H C Silva Telecomunicacoes",
    "CNPJ": "32053073000138",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Afuá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Goianésia d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "YUNE NET INFORMATICA LTDA",
    "CNPJ": "10321821000183",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cabixi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cabixi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "R & B SERVIÇOS DE TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "19151627000171",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Porto Grand"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ANDERSON LUIS ANGELI",
    "CNPJ": "40474070000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDE DE TELECOMUNICACOES CARAJAS EIRELI",
    "CNPJ": "4680405000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Jacundá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J Menezes Servicos de Telecomunicacoes Ltda",
    "CNPJ": "40187391000110",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Alenquer"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J R Comercio e Servicos de Comunicacao Ltda",
    "CNPJ": "28005608000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Garrafão do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ANDERSON LUIS ANGELI",
    "CNPJ": "40474070000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Terra Santa"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Oiapoque"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Conectlan Internet LTDA",
    "CNPJ": "9473770000126",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Frohlich & Ferreira Ltda",
    "CNPJ": "13457409000183",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Terra Santa"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Oiapoque"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "YUNE NET INFORMATICA LTDA",
    "CNPJ": "10321821000183",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Machadinho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Click Enter Ltda",
    "CNPJ": "10984041000113",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RODRIGUES SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "20302836000158",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Linkfire Telecom Ltda",
    "CNPJ": "14122350000135",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rio Net Provedor Ltda",
    "CNPJ": "5588747000126",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Campo Novo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Xinguara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "APEX TELECOMUNICACOES LTDA",
    "CNPJ": "26114525000141",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "JC SERVICOS DE INTERNET LTDA",
    "CNPJ": "4955538000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Pau D'Arco"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Equatorial Telecomunicacoes S.a.",
    "CNPJ": "10995526000102",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Net Prime Telecomunicacoes Ltda.",
    "CNPJ": "27275682000100",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Caseara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Zum Provedor de Solucoes Ltda",
    "CNPJ": "18328345000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RORAIMANET TECNOLOGIA E TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "5640560000124",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SOFT TELECOM SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "9427868000147",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TURBONET SERVIÇOS DE COMUNICAÇÃO MULTIMÍDIA LTDA.",
    "CNPJ": "18019255000161",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Conectlan Internet LTDA",
    "CNPJ": "9473770000126",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE BRASIL NETWORK TELECOMUNICACOES LTDA",
    "CNPJ": "5492370000107",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTER.NET SERVICOS EM TELECOM LTDA",
    "CNPJ": "7819690000154",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manicoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Connect Tecnologia Ltda",
    "CNPJ": "14125874000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE TELECOMUNICACOES SERVICOS DE INTERNET LTDA",
    "CNPJ": "8968072000139",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE BRASIL NETWORK TELECOMUNICACOES LTDA",
    "CNPJ": "5492370000107",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTER.NET SERVICOS EM TELECOM LTDA",
    "CNPJ": "7819690000154",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manicoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Click Enter Ltda",
    "CNPJ": "10984041000113",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capitão Poç"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Orixinet Telecom Ltda",
    "CNPJ": "8907298000120",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "IP FIBRA TELECOM LTDA",
    "CNPJ": "18268845000128",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "F.A.A PROVEDOR LTDA",
    "CNPJ": "26133539000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "F.A.A PROVEDOR LTDA",
    "CNPJ": "26133539000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Buritis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "M MENDONCA DE OLIVEIRA",
    "CNPJ": "35864992000180",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Peixe"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Calçoene"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Vellon Servicos de Comunicacao Multimidia e Digitais Ltd",
    "CNPJ": "46870574000111",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Upnet Provedor de Internet Ltda",
    "CNPJ": "41145470000120",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cerejeiras"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "G5 Norte Telecom Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "41623891000110",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Caseara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ROCHA E CAMINHA LTDA.",
    "CNPJ": "30606499000146",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Nova Mamoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "M LIMA GOMES & CIA LTDA",
    "CNPJ": "12914389000160",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Placas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Sow Telecomunicacoes Ltda",
    "CNPJ": "29424145000100",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Caracaraí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RIDERSON MENDES BORGES",
    "CNPJ": "10802481000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "BR364 SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "35823676000160",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Nova Mamoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ION TELECOMUNICACOES LTDA",
    "CNPJ": "24826115000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Mais Net Telecom Ltda",
    "CNPJ": "43272893000137",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Acará"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "R A QUARESMA PROVEDOR LTDA",
    "CNPJ": "3714184000140",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "S V DE OLIVEIRA & CIA LTDA",
    "CNPJ": "7964399000170",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manicoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "e M Silva Eletronica",
    "CNPJ": "5782151000162",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Francis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manacapuru"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "G5 Norte Telecom Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "41623891000110",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manacapuru"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "P. A. Thomaz Marcelino & Cia Ltda",
    "CNPJ": "17787718000172",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WORLDNET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "18456569000121",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Autazes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Allfiber Telecom - Servicos de Telecomunicacoes - Ltda",
    "CNPJ": "23150425000182",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "GLOBOFIBER TELECOM LTDA",
    "CNPJ": "8741236000190",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RIBEIRO E ABREU PROVEDOR DE INTERNET LTDA - ME",
    "CNPJ": "24844772000178",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Breu Branco"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alta Flores"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Redenção"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "BR364 SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "35823676000160",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Itacoatiara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ALTERNATIVA TELECOM LTDA",
    "CNPJ": "1857112000126",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "PELIKAN NET LTDA - ME",
    "CNPJ": "13969568000167",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ji-Paraná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tailândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tailândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "M.o. Servicos de Telecomunicacoes Ltda",
    "CNPJ": "40291217000112",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alto Paraís"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Jetz Telecom Ltda",
    "CNPJ": "44334408000175",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ulianópolis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NETTCON - PROVEDOR DE INTERNET LTDA - ME",
    "CNPJ": "18396123000159",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Novo Progre"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NETTCON - PROVEDOR DE INTERNET LTDA - ME",
    "CNPJ": "18396123000159",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Novo Progre"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Santana"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Santana"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cujubim"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cujubim"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NETLIDERES - PROVEDOR DE INTERNET EIRELI",
    "CNPJ": "33824892000102",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Xapuri"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Autazes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Barcarena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "P. A. Thomaz Marcelino & Cia Ltda",
    "CNPJ": "17787718000172",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Vellon Servicos de Comunicacao Multimidia e Digitais Ltd",
    "CNPJ": "46870574000111",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Altamira"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Altamira"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4SKY",
    "Empresa": "SKY",
    "CNPJ": "497373000110",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Click Enter Ltda",
    "CNPJ": "10984041000113",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ourém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Necxus Telecomunicacoes Ltda",
    "CNPJ": "41036354000173",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Uruará"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "YUNE NET INFORMATICA LTDA",
    "CNPJ": "10321821000183",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "E QUARESMA NETO PROVEDORES EIRELI - ME",
    "CNPJ": "16384220000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "A & G TELECOMUNICAÇÕES LTDA EPP",
    "CNPJ": "13372724000108",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Cametá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Macedo Servicos de Telecomunicacoes Ltda",
    "CNPJ": "2639895000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SDMNET INFORMATICA LTDA - ME",
    "CNPJ": "9281606000117",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Tarauacá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WORLDXAMBIOA INFORMATICA LTDA",
    "CNPJ": "9022737000180",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Xambioá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "PCCONECT SERVICO LTDA - ME",
    "CNPJ": "7593083000119",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Macedo Servicos de Telecomunicacoes Ltda",
    "CNPJ": "2639895000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SDMNET INFORMATICA LTDA - ME",
    "CNPJ": "9281606000117",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Tarauacá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RORAIMANET TECNOLOGIA E TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "5640560000124",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Mucajaí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "OLIVEIRA ABREU COM. E SERV. DE TELECOMUNICACOES LTDA",
    "CNPJ": "32613301000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Click Enter Ltda",
    "CNPJ": "10984041000113",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Garrafão do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ZUM SERVICOS DE TELECOMUNICACOES LTDA ME",
    "CNPJ": "10548603000186",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "E. O. DA SILVA COMUNICACOES - ME",
    "CNPJ": "28804395000102",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "São Sebasti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDE DE TELECOMUNICACOES CARAJAS EIRELI",
    "CNPJ": "4680405000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itupiranga"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DELTA TELECOM LTDA - ME",
    "CNPJ": "18983623000197",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Brasil Novo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vale do Ana"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CONECT PROVEDOR DE INTERNET LTDA - EPP",
    "CNPJ": "23819712000132",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEM FRONTEIRAS TELECOMUNICACOES LTDA",
    "CNPJ": "11972556000166",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Assis Brasi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J L Comunicacao e Multimidia - Scm Ltda",
    "CNPJ": "45188649000116",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Vigia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEA TELECOM LTDA",
    "CNPJ": "25450139000168",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JDS TELECOM LTDA",
    "CNPJ": "18535066000141",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "São Sebasti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Jan Charles Rueckert Ltda",
    "CNPJ": "5011908000114",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cerejeiras"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WIT SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "22316347000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itaituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Jan Charles Rueckert Ltda",
    "CNPJ": "5011908000114",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cerejeiras"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "A & G TELECOMUNICAÇÕES LTDA EPP",
    "CNPJ": "13372724000108",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Cametá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alta Flores"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Click Servicos de Apps e Internet Ltda",
    "CNPJ": "45927788000114",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J R Comercio e Servicos de Comunicacao Ltda",
    "CNPJ": "28005608000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Garrafão do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WIT SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "22316347000180",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itaituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alta Flores"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "A do S S Oliveira Servicos e Com Cyberdata",
    "CNPJ": "31972975000105",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CYBER NET TELECOM LTDA",
    "CNPJ": "38729861000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Afuá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Corumbiara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "A do S S Oliveira Servicos e Com Cyberdata",
    "CNPJ": "31972975000105",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Afuá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Anajás"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Atalaia Fibra Ltda",
    "CNPJ": "52505200000108",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Salinópolis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J R Comercio e Servicos de Comunicacao Ltda",
    "CNPJ": "28005608000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Nova Espera"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "La Telecomunicacoes Ltda",
    "CNPJ": "39348199000189",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "E QUARESMA NETO PROVEDORES EIRELI - ME",
    "CNPJ": "16384220000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "La Telecomunicacoes Ltda",
    "CNPJ": "39348199000189",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Humaitá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Francis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INFOTEL ENGENHARIA & TELECOMUNICACOES SCM EIRELI",
    "CNPJ": "10779392000192",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Porto Nacio"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Francis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Infinity Servicos de Telecomunicacao Ltda",
    "CNPJ": "18702422000174",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ouro Preto"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WKVE-ASSES. EM SERV. DE INF. E TELECOMUNICACOES LTDA",
    "CNPJ": "989304000123",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Anajás"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Zum Provedor de Solucoes Ltda",
    "CNPJ": "18328345000134",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Itacoatiara"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Web Norte Servicos de Internet Ltda",
    "CNPJ": "30234839000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vale do Par"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Infinity Servicos de Telecomunicacao Ltda",
    "CNPJ": "18702422000174",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ouro Preto"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JDS TELECOM LTDA",
    "CNPJ": "18535066000141",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "São Sebasti"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VIRTUAL TELECOM LTDA",
    "CNPJ": "8407644000100",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Orx Telecom Ltda",
    "CNPJ": "46249153000178",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WIFI TECNOLOGIA E INFORMAÇÃO LTDA.",
    "CNPJ": "13367910000159",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Uruará"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Sow Telecomunicacoes Ltda",
    "CNPJ": "29424145000100",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Boa Vista"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Iranduba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Domingo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Vellon Servicos de Comunicacao Multimidia e Digitais Ltd",
    "CNPJ": "46870574000111",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SFAR COMUNICACOES LTDA",
    "CNPJ": "13030105000135",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alto Paraís"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "V. E. Servicos de Telecomunicacoes Eireli",
    "CNPJ": "32297708000142",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Dom Eliseu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Domingo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Domingo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTERCOM INFORMATICA LTDA - ME",
    "CNPJ": "5900718000158",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Cachoeira d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WKVE-ASSES. EM SERV. DE INF. E TELECOMUNICACOES LTDA",
    "CNPJ": "989304000123",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Domingo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Amapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Toledo Fibra Telecomunicacoes Ltda",
    "CNPJ": "9537386000140",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Orx Telecom Ltda",
    "CNPJ": "46249153000178",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WIFI TECNOLOGIA E INFORMAÇÃO LTDA.",
    "CNPJ": "13367910000159",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Uruará"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE.NET TELECOMUNICACOES LTDA",
    "CNPJ": "22729872000128",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santana do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "MARCOS CARRILHO CERVANTES - EPP",
    "CNPJ": "1648128000129",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tucuruí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Laranjal do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JULIO CESAR BATISTA DE OLIVEIRA ME",
    "CNPJ": "12134704000136",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Espigão D'O"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Veloso Net Servicos de Comunicacao Multimidia Ltda.",
    "CNPJ": "17654767000137",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Codajás"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RORAIMANET TECNOLOGIA E TELECOMUNICAÇÕES LTDA - ME",
    "CNPJ": "5640560000124",
    "Porte da PrestadorUF": "Pequeno Porte     RR",
    "Município": "Rorainópoli"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SEA TELECOM LTDA",
    "CNPJ": "25450139000168",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "São Caetano"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CONECT PROVEDOR DE INTERNET LTDA - EPP",
    "CNPJ": "23819712000132",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Win Time Ltda",
    "CNPJ": "2391867000140",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "C M Pereira Provedor de Internet",
    "CNPJ": "46960412000174",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Almas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "C M Pereira Provedor de Internet",
    "CNPJ": "46960412000174",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Almas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rv Connect Ltda",
    "CNPJ": "46603383000193",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Careiro"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Terra Santa"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Clk Servicos Ltda",
    "CNPJ": "52101655000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ZUM SERVICOS DE TELECOMUNICACOES LTDA ME",
    "CNPJ": "10548603000186",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Itaituba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "E QUARESMA NETO PROVEDORES EIRELI - ME",
    "CNPJ": "16384220000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Formoso do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INFOTEL ENGENHARIA & TELECOMUNICACOES SCM EIRELI",
    "CNPJ": "10779392000192",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Brejinho de"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INFOTEL ENGENHARIA & TELECOMUNICACOES SCM EIRELI",
    "CNPJ": "10779392000192",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Porto Nacio"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Formoso do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "C H C Silva Telecomunicacoes",
    "CNPJ": "32053073000138",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NET WAY PARECIS TELECOMUNICACOES LTDA",
    "CNPJ": "19856906000130",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Parecis"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "C H C Silva Telecomunicacoes",
    "CNPJ": "32053073000138",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Augusto Cor"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "VERDENET PROVEDOR DE INTERNET LTDA",
    "CNPJ": "7601386000136",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Boca do Acr"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Oriximiná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RIDERSON MENDES BORGES",
    "CNPJ": "10802481000102",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "BR364 SERVICOS DE TELECOMUNICACOES LTDA",
    "CNPJ": "35823676000160",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Nova Mamoré"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ION TELECOMUNICACOES LTDA",
    "CNPJ": "24826115000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Mais Net Telecom Ltda",
    "CNPJ": "43272893000137",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Acará"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "R A QUARESMA PROVEDOR LTDA",
    "CNPJ": "3714184000140",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Rondon do P"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "L. S. N. FERREIRA & CIA LTDA",
    "CNPJ": "17149900000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Rio Preto d"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rv Connect Ltda",
    "CNPJ": "46603383000193",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Autazes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Porto Grand"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Porto Grand"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ECM PROVEDORES DE ACESSO DE COMUNICACOES LTDA - ME",
    "CNPJ": "21485579000108",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Prime System Telecomunicacoes Ltda.",
    "CNPJ": "12356161000100",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Paraíso do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rv Connect Ltda",
    "CNPJ": "46603383000193",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Nova Olinda"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Veloso Net Servicos de Comunicacao Multimidia Ltda.",
    "CNPJ": "17654767000137",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Tefé"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ARANET COMUNICACAO LTDA-EPP",
    "CNPJ": "9503823000104",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Araguaína"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Provedor Santa Barbara Ltda",
    "CNPJ": "10299775000163",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santa Bárba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3SKY",
    "Empresa": "SKY",
    "CNPJ": "497373000110",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ALTERNATIVA TELECOM LTDA",
    "CNPJ": "1857112000126",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rolim Net Servicos & Internet Ltda",
    "CNPJ": "9337446000180",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Novo Horizo"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "SAO MIGUEL TELECOMUNICAÇÕES E INFORMÁTICA LTDA",
    "CNPJ": "13400311000190",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "IBL - BANDA LARGA INTERNET INFORMATICA LTDA.",
    "CNPJ": "8854699000169",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Paragominas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "R V CONNECT TELECOMUNICACOES LTDA - ME",
    "CNPJ": "26370774000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WKVE-ASSES. EM SERV. DE INF. E TELECOMUNICACOES LTDA",
    "CNPJ": "989304000123",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tailândia"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Sim Internet Ltda",
    "CNPJ": "7650444000111",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "AMAZONET TELECOMUNICACOES LTDA",
    "CNPJ": "17854435000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "J B Pinheiro de Oliveira Ltda",
    "CNPJ": "9019077000188",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Capanema"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE-TEL TELECOMUNICAÇÕES LTDA",
    "CNPJ": "84591775000179",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "São Miguel"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Altamira"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Altamira"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4SKY",
    "Empresa": "SKY",
    "CNPJ": "497373000110",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "NORTE TELECOMUNICACOES SERVICOS DE INTERNET LTDA",
    "CNPJ": "8968072000139",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "LSMR PROVEDOR DE INTERNET LTDA",
    "CNPJ": "33013315000122",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Linkfire Telecom Ltda",
    "CNPJ": "14122350000135",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "CPW TELECOM LTDA",
    "CNPJ": "11072400000129",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Colorado do"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CONECT PROVEDOR DE INTERNET LTDA - EPP",
    "CNPJ": "23819712000132",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Rolim Net Servicos & Internet Ltda",
    "CNPJ": "9337446000180",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Alvorada D'"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RIBEIRO E ABREU PROVEDOR DE INTERNET LTDA - ME",
    "CNPJ": "24844772000178",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Jacundá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Clk Telecom Ltda",
    "CNPJ": "52104927000175",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SP TELECOMUNICAÇÕES EIRELI",
    "CNPJ": "10271457000194",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Guaraí"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "GLOBOFIBER TELECOM LTDA",
    "CNPJ": "8741236000190",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Vellon Servicos de Comunicacao Multimidia e Digitais Ltd",
    "CNPJ": "46870574000111",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Mazagão"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Mazagão"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SIM PMW SUL PROVEDOR DE ACESSO AS REDES DE COMUNICACOES",
    "CNPJ": "28778758000174",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Palmas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Equatorial Telecomunicacoes S.a.",
    "CNPJ": "10995526000102",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "DUX TELECOM LTDA.",
    "CNPJ": "9443451000178",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Cacoal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Barcarena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "VIP SERVICOS DE TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9457528000169",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Vilhena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Barcarena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Brasil Digital Servicos de Informatica e Comercio Eireli",
    "CNPJ": "14629705000187",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "TMK NET TELECOMUNICACOES LTDA - ME",
    "CNPJ": "9354516000109",
    "Porte da PrestadorUF": "Pequeno Porte     TO",
    "Município": "Gurupi"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Barcarena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "AMAZONET TELECOMUNICACOES LTDA",
    "CNPJ": "17854435000104",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WLAN SISTEMAS DE TELECOMUNICACOES EIRELI",
    "CNPJ": "14644092000157",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Benevides"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WLAN SISTEMAS DE TELECOMUNICACOES EIRELI",
    "CNPJ": "14644092000157",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Benevides"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "CLICKIP SERVICOS DE COMUNICACAO LTDA",
    "CNPJ": "19402859000155",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Voce Telecomunicacoes Ltda",
    "CNPJ": "7656757000187",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Abaetetuba"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Coelho Tecnologia Eireli",
    "CNPJ": "8182940000150",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "UNIVERSO NET - PROVEDOR DE INTERNET E COMERCIO LTDA",
    "CNPJ": "15407584000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Tomé-Açu"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "JUPITER TELECOMUNICACOES E INFORMATICA LTDA",
    "CNPJ": "1625636000191",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marabá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marabá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Marabá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "REDESUB SERVICOS & INTERNET LTDA",
    "CNPJ": "36173906000155",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Belém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "GLOBOFIBER TELECOM LTDA",
    "CNPJ": "8741236000190",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "RONDON - TELECOM LTDA-ME",
    "CNPJ": "9256492000155",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ariquemes"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "INTLINK SERVICOS DE TELECOMUNICACAO LTDA",
    "CNPJ": "12839749000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "COMPUSERVICE EMPREENDIMENTOS LTDA",
    "CNPJ": "2985578000170",
    "Porte da PrestadorUF": "Pequeno Porte     AP",
    "Município": "Macapá"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "WLAN SISTEMAS DE TELECOMUNICACOES EIRELI",
    "CNPJ": "14644092000157",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "WLAN SISTEMAS DE TELECOMUNICACOES EIRELI",
    "CNPJ": "14644092000157",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Ananindeua"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "TERA TELECOM EIRELI",
    "CNPJ": "27015017000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "TERA TELECOM EIRELI",
    "CNPJ": "27015017000179",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Canaã dos C"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "AMAZONET TELECOMUNICACOES LTDA",
    "CNPJ": "17854435000104",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Santarém"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Fiber Network Servicos de Comunicacao Multimidia Ltda",
    "CNPJ": "22939150000106",
    "Porte da PrestadorUF": "Pequeno Porte     AM",
    "Município": "Manaus"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Castanhal"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "SPEED TRAVEL COMUNICACAO MULTIMIDIA LTDA",
    "CNPJ": "7304055000134",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Ji-Paraná"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "GLOBOFIBER TELECOM LTDA",
    "CNPJ": "8741236000190",
    "Porte da PrestadorUF": "Pequeno Porte     RO",
    "Município": "Porto Velho"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "ONLINE NORTE TELECOM LTDA",
    "CNPJ": "40104717000106",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Barcarena"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "I R TECNOLOGIA LTDA",
    "CNPJ": "9634107000166",
    "Porte da PrestadorUF": "Pequeno Porte     PA",
    "Município": "Parauapebas"
  },
  {
    "Ano Mês Grupo Econômico": "2025   4OUTROS",
    "Empresa": "Staff Computer - Eireli",
    "CNPJ": "4101555000180",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Rio Branco"
  },
  {
    "Ano Mês Grupo Econômico": "2025   3OUTROS",
    "Empresa": "Staff Computer - Eireli",
    "CNPJ": "4101555000180",
    "Porte da PrestadorUF": "Pequeno Porte     AC",
    "Município": "Rio Branco"
  }
];
