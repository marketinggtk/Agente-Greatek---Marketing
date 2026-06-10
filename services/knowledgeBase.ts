// Este arquivo atua como o "banco de dados" de conhecimento da aplicação.
// Para atualizar, forneça o texto extraído dos seus PDFs.
// FIX: Imported KnowledgeBaseProduct from the central types file.
import { KnowledgeBaseProduct } from '../types';

// FIX: Added missing export for the Greatek logo URL.
export const GREATEK_LOGO_URL = "https://www.greatek.com.br/wp-content/uploads/2022/01/logo-greatek-branco.png";

export interface PartnerCompany {
  name: string;
  url: string;
  // FIX: Added missing logoUrl property.
  logoUrl: string;
  description: string;
  type: 'Master' | 'Partner';
}


export const PARTNER_COMPANIES: PartnerCompany[] = [
    { name: "TP-Link", url: "https://www.tp-link.com/br/", logoUrl: "https://logo.clearbit.com/tp-link.com", description: "Líder global em conectividade, oferecendo roteadores, switches, soluções Wi-Fi e produtos de casa inteligente.", type: "Master" },
    { name: "Omada", url: "https://www.omadanetworks.com/br/", logoUrl: "https://logo.clearbit.com/omadanetworks.com", description: "Marca independente da TP-Link focada em soluções de rede definidas por software (SDN) para ambientes de negócios (B2B), reconhecida no Quadrante Mágico do Gartner.", type: "Partner" },
    { name: "Tapo", url: "https://www.tapo.com/br/", logoUrl: "https://logo.clearbit.com/tapo.com", description: "Submarca da TP-Link para dispositivos de casa inteligente, como câmeras, plugues e iluminação.", type: "Partner" },
    { name: "Vigi", url: "https://www.vigi.com/br/", logoUrl: "https://logo.clearbit.com/vigi.com", description: "Submarca da TP-Link especializada em vigilância por vídeo profissional (câmeras e NVRs), totalmente integrada à plataforma Omada Central.", type: "Partner" },
    { name: "Mercusys", url: "https://www.mercusys.com.br/", logoUrl: "https://logo.clearbit.com/mercusys.com", description: "Submarca da TP-Link que oferece dispositivos de rede confiáveis e acessíveis.", type: "Partner" },
    { name: "Cabel Condutores Elétricos", url: "https://cabel.com.br/", logoUrl: "https://logo.clearbit.com/cabel.com.br", description: "Especialista em fios e cabos elétricos de alta qualidade para energia, telecomunicações e solar.", type: "Partner" },
    { name: "CG3 Telecom", url: "https://cg3telecom.com.br/", logoUrl: "https://logo.clearbit.com/cg3telecom.com.br", description: "Fabricante e fornecedor de uma linha completa de ferragens, pré-formados, produtos ópticos (Cabos Drop, CTOs, CEOs) e injetados plásticos para redes de telecomunicações e elétricas.", type: "Partner" },
    { name: "Lacerda Sistemas de Energia", url: "https://lacerdasistemas.com.br/", logoUrl: "https://logo.clearbit.com/lacerdasistemas.com.br", description: "Com 25 anos de mercado, é especialista em nobreaks corporativos (600 VA a 600 kVA), com assistência técnica própria e presença nacional. Oferece soluções de alta complexidade e criticidade em energia.", type: "Partner" },
    { name: "Volt", url: "https://volt.ind.br/", logoUrl: "https://logo.clearbit.com/volt.ind.br", description: "Empresa 100% brasileira, especialista em soluções de energia ininterrupta para telecom, incluindo fontes nobreak, inversores, controladores de carga solar, sistemas de monitoramento e racks.", type: "Partner" },
    { name: "XPS", url: "https://xps.com.br/", logoUrl: "https://logo.clearbit.com/xps.com.br", description: "Empresa 100% nacional, há mais de 33 anos entregando soluções de energia como Retificadores (homologados ANATEL), Inversores, Conversores e Quadros de Distribuição, com certificação ISO 9001.", type: "Partner" },
    { name: "Think Technology", url: "https://www.thinktechnology.com.br/", logoUrl: "https://logo.clearbit.com/thinktechnology.com.br", description: "Parceiro estratégico da Greatek. Indústria brasileira no setor de telecomunicações, oferecendo soluções inovadoras para redes de fibra óptica, infraestrutura e equipamentos de alto desempenho.", type: "Partner" },
    { name: "Seccon", url: "", logoUrl: "https://greatek.com.br/logos/seccon.png", description: "Fornecedor de soluções para cabeamento estruturado, incluindo patch cords, patch panels, conectores e pigtails ópticos.", type: "Partner" },
    { name: "2Flex", url: "", logoUrl: "https://greatek.com.br/logos/2flex.png", description: "Fornecedor de cabos ópticos, como Drop e ASU, para redes de telecomunicações.", type: "Partner" },
];


export const KNOWLEDGE_BASE_PRODUCTS: KnowledgeBaseProduct[] = [
  {
    name: "Máquina de Fusão Óptica X6 (MF30630X6)",
    keywords: ["máquina de fusão", "fusão óptica", "x6", "mf30630x6"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-x6/
- **Modelo:** MF30630X6
- **Terminologia Correta:** Máquina de Fusão (NÃO fusionadora de fibra)
- **Sistema de alinhamento:** Por núcleo ou casca
- **Quantidade de motores:** 6 motores
- **Tempo de emenda:** 8 segundos
- **Modo de aquecimento:** Customizável
- **Diâmetro da fibra:** 80 - 150 μm/ 100-1000μm
- **Modos de emendas:** Automático
- **Perda de fusão:** 0.025dB (SM) / 0.01dB (MM) / 0.04dB (DS/NZDS)
- **Tipos de Aplicação:** SM / MM / DS / NZDS
- **Capacidade da bateria:** 7800mA (200 ciclos)
- **Fonte de alimentação:** 100 -240V 50/60Hz
- **Ampliação (microscópio):** 300x
- **Comprimento de clivagem:** 8mm a 16mm
- **Protetor de emenda:** 60mm, 50mm, 40mm e 25mm
- **Teste de tensão:** 2N
- **Visor:** LCD Colorido 5,1”
- **Iluminação Externo:** Iluminação acoplada
- **Porta USB:** A porta USB pode carregar dispositivos
- **Armazenamento de dados:** Ilimitado (nuvem)
- **Atualização do software:** Atualização através do aplicativo MINHA MÁQUINA
- **Tempo de inicialização:** 5 segundos
- **Comunicação sem fios:** Bluetooth
- **Perda de retorno:** ≤ 60 db
- **Resistente:** Chuva, pó e quedas
- **Temperatura de operação:** - 15 a 50 ºC
- **Eletrodo:** 3000 emendas
- **Umidade:** 0 a 95%
- **Função Gestor:** Visualização remota do registro de fusões através do aplicativo MINHA MÁQUINA
- **Bloqueio Inteligente:** Limite de fusões ou tempo de trabalho
- **Peso Maleta Multifuncional:** 6975g
- **Dimensão Maleta Multifuncional:** 270x220x330mm`
  },
  {
    name: "Máquina de Fusão Óptica G-FUSION PRO (MFGFP3201)",
    keywords: ["máquina de fusão", "fusão óptica", "g-fusion pro", "gfusionpro", "mfgfp3201"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-gfusionpro/
- **Modelo:** MFGFP3201
- **Sistema de alinhamento:** Por núcleo
- **Quantidade de motores:** 6 motores
- **Tempo de emenda:** 5 segundos
- **Modo de aquecimento:** Pré-estabelecido em 11 segundos
- **Diâmetro da fibra:** 80 - 150 μm
- **Modos de emendas:** 41 modos predefinidos, 100 modos armazenáveis
- **Perda de fusão:** 0.025dB (SM) / 0.01dB (MM)/ 0.04dB (DS/NZDS)
- **Tipos de Aplicação:** SM / MM / DS / NZDS
- **Capacidade da bateria:** 7200mA (320 ciclos)
- **Fonte de alimentação:** 100 -240V AC / 12-15V DC
- **Ampliação (microscópio):** 380x
- **Comprimento de clivagem:** 8mm a 16mm
- **Protetor de emenda:** 20-60mm
- **Teste de tensão:** 2N
- **Visor:** 4,3" em alta resolução com tela touch
- **Iluminação Externo:** Iluminação acoplada
- **Porta USB:** A porta USB pode carregar dispositivos
- **Armazenamento de dados:** 20.000 registros mais recentes e 200 imagens
- **Tempo de inicialização:** 5 segundos
- **Comunicação sem fios:** Não possui
- **Atualização do software:** Não possui
- **Perda de retorno:** ≤ 60 db
- **Resistência:** Sem informação
- **Temperatura de operação:** - 15 a 50 ºC
- **Umidade:** 0 a 95% não condensada
- **Quantidade de ciclos:** 320 (ciclos + aquecimento)
- **Eletrodo:** 5.000 emendas
- **Medidor de potência óptica:** 850nm/ 1300nm/ 1310nm/1490nm/ 1550nm/ 1625nm
- **Faixa de medição:** -50 ~ +26 dB | Erro absoluto: <0,3 dB
- **Localizador Visual de Falhas (VFL):** 15mw, 2Hz modo fixo e pulsante
- **Métodos de operação:** Botão e touchscreen
- **V-Groove:** Ativo
- **Diâmetro Maleta:** 135,1 x 205,9 x 130,4 mm
- **Peso Máquina:** 1,750 Kg (Somente a máquina)`
  },
  {
    name: "Máquina de Fusão Portátil 2 Eixos (MF2140X01)",
    keywords: ["máquina de fusão", "fusão portátil", "2 eixos", "mf2140x01"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-portatil-greatek/
- **Modelo:** MF2140X01
- **Descrição Geral:** A máquina de fusão MF2140X01 possui tudo de melhor que uma máquina de fusão produzida na Suécia tem a oferecer. É ideal para construção de projetos de pequeno a grande porte, como: datacenter e redes FTTx.
- **Modo de Emenda:** Automático
- **Tipo de alinhamento:** Automático através do revestimento
- **Perda:** 0,03db (SM) / 0,01db (MM)
- **Quantidade de motores:** 2 motores
- **V-Groove:** Fixo
- **Ampliação:** 140x
- **Monitor:** LCD colorido 2,8ʺ (320×240 pixels)
- **Suportes de fibras:** 3 pares (250um, 900um e 900um (tubo loose))
- **Tempo de emenda:** 7 segundos
- **Tempo de aquecimento:** 35 segundos (protetor 40mm)
- **Características do forno:** Aquecedor cerâmico
- **Bateria:** 3400mAh (60 ciclos)
- **Comunicação:** Mini USB, Cartão SD (até 32GB)
- **Memória:** 1MB interna
- **Fonte de alimentação:** 6V/1,5A
- **Peso:** 800g
- **Dimensões:** 230 x 98 x 53 mm
- **Temperatura operacional:** -20 a 45 graus
- **Umidade:** 0 a 95% sem condensação
- **Conteúdo da Embalagem:** Máquina, Fonte, Maleta, Clivador com Lixeira, Alicate Decapador, 3 Pares de Suporte para Fibra.`
  },
  {
    name: "Bateria de Lítio Sunwoda (LB48V100AHSW)",
    keywords: ["sunwoda", "bateria", "lítio", "48v", "100ah", "energia", "LB48V100AHSW", "xps"],
    details: `- **Modelo:** LB48V100AHSW
- **Marca Parceira / Fabricante:** SUNWODA (comercializada por GREATEK)
- **Descrição Geral:** A Bateria de Lítio 100Ah da Sunwoda, agora com Certificação XPS homologada, oferece alta densidade de energia em um design compacto, robusto e modular — ideal para aplicações que exigem durabilidade, desempenho e escalabilidade. Com ciclo de vida prolongado de mais de 10 anos, sistema de gerenciamento remoto via SNMP ou Smart BMS, é a escolha certa para projetos que priorizam confiabilidade operacional, segurança normativa e otimização de espaço. Produto com qualidade internacional Sunwoda, reconhecida mundialmente no segmento de armazenamento de energia, agora homologado para atender aos mais exigentes padrões técnicos do mercado nacional.
- **Declaração de Compatibilidade e Homologação:**
    - Empresas: XPS Tecnologia Ltda. e GTK Indústria e Comércio de Produtos Eletrônicos Ltda. (Greatek)
    - Declaram que a bateria modelo LB48V100AHSW encontra-se oficialmente homologada, compatível e tecnicamente aprovada em termos de comunicação para uso com os produtos da XPS.
    - Testes e ensaios foram conduzidos em conjunto pelas engenharias da XPS e da Greatek.
    - Data de Homologação: São Paulo, 02 de junho de 2025.
    - Pessoas responsáveis: Robert Jansen Costa de Araujo (Coordenador de Engenharia - Greatek) e Valmir Costa (Engenheiro de Qualidade - XPS).
- **Especificações Técnicas:**
    - Densidade de energia superior em 3U de altura para rack.
    - BMS integrado para proteger o sistema e aumentar a vida útil.
    - Giroscópio anti-furto e anti-furto de comunicação.
    - Porta de comunicação SNMP.
    - Tensão Nominal: 48V
    - Capacidade Nominal: 100Ah @0.5C, 25ºC
    - Corrente Máxima de Carga: 100A (1C)
    - Tensão Máxima de Carga: 55V
    - Corrente Nominal de Descarga: 50A (0.5C)
    - Corrente Máxima de Descarga: 100A (1C)
    - Tensão Final de Descarga: 40.5V
    - Temperatura de Operação: Carga: 0-55ºC | Descarga: -20-60ºC
    - Temperatura de Armazenamento: -20~45ºC (em 1 mês) | 15~35ºC (em 6 meses)
    - Umidade Relativa: 5%-95%
    - Autodescarga: ≤3% por mês @25ºC
    - Vida útil projetada: ≥10 anos
    - Vida útil cíclica: 5000 ciclos @0.5C 25ºC 80%DOD
    - Comunicação: RS485, RS232, SNMP
    - Dimensões (W*D*H): 442mm*413mm*130mm (excluindo abas de montagem)
    - Peso: 40kg`
  },
  {
    name: "Clivador GROTATEpro (FCLV48KCC- 1)",
    keywords: ["clivador", "grotatepro", "grotate pro", "fclv48kcc-1", "rotação automática"],
    details: `- **Modelo:** FCLV48KCC-1
- **Descrição Geral:** Rotação de posição automática.
- **Especificações Técnicas:**
    - Quantidade de clivagens: 48.000 mil
    - Quantidade de posições: 16 posições de clivagem
    - Diâmetro da Fibra: 125 μm
    - Tipos de Fibra: Single Core (Ø 0,25 & 0,9 mm)
    - Ângulo de clivagem: 0.5°
    - Comprimento de Corte: 7 ~ 16 mm
    - Tamanho: 64x81x60 mm
    - Peso: 328g`
  },
  {
    name: "Clivador de Alta Precisão 48K (FCLV048KCL)",
    keywords: ["clivador", "alta precisão", "48k", "fclv048kcl"],
    details: `- **Modelo:** FCLV048KCL
- **Especificações Técnicas:**
    - Tipo de Fibra: SM / MM
    - Diâmetro da fibra: 125 μm
    - Diâmetro do revestimento: 0,5 ~ 0,9 mm
    - Dimensões: 60x57x46mm
    - Ângulo de clivagem: 0,5º
    - Vida útil da lâmina: 48.000 clivagens
    - Peso: 266g`
  },
  {
    name: "CLVMFAI7C - Clivador de Alta Precisão",
    keywords: ["clivador", "clvmfai7c", "alta precisão", "lixeira", "16 posições"],
    details: `- **Modelo:** CLVMFAI7C
- **Especificações Técnicas:**
    - Posições de lâmina: 16 posições
    - Vida útil da lâmina: 48k clivagens
    - Ângulo de clivagem: 0.5°
    - Tipo de fibra: SM, MM
    - Diâmetro da fibra: 125µm
    - Diâmetro do revestimento: 0.25~0.9mm
    - Lixeira (coletor de resíduos): Sim`
  },
  {
    name: "Clivador de Alta Precisão 50K (FCLV50K)",
    keywords: ["clivador", "alta precisão", "50k", "fclv50k"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/clivador-de-alta-precisao-50k/
- **Modelo:** FCLV50K
- **Lâmina:** 24 posições
- **Quantidade de clivagens:** 50.000
- **Ângulo de clivagem:** ≤0.5°
- **Comprimento de Corte:** 5 ~ 20 mm
- **Tipos de Fibra:** Single Core (0.25mm, 0.9mm, 3.0mm) e Cabo Drop Flat
- **Diferenciais:** Coletor de resíduos (lixeira), precisão elevada.`
  },
  {
    name: "Fonte Nobreak Multiuso (FNBUPS001)",
    keywords: ["fonte", "nobreak", "fnbups001", "mini nobreak"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/fonte-nobreak-greatek/
- **Modelo:** FNBUPS001
- **Capacidade:** 4000mAh (14.8Wh)
- **Entrada:** AC 100-240V
- **Saída:** 12V1A / 9V1A / 5V2A (Ajustável)
- **Bateria:** 18650 Bateria de Lítio
- **Proteção:** Sobrecarga // Baixa tensão // Sobrecorrente
- **Temperatura:** -20~60ºC
- **Dimensões:** 125*96*50mm
- **Peso líquido/bruto:** 205g/230g
- **Interface:** DC5.5*2.1mm ou customizável
- **Conector:** P4`
  },
  {
    name: "OTDR Greatek (OTDRMFO001 / FOTDR0001)",
    keywords: ["otdr", "otdrmfo001", "fotdr0001", "medidor óptico", "optical time domain reflectometer"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/otdr-greatek/
- **Modelos:** OTDRMFO001 / FOTDR0001 / Reflectômetro Óptico no Domínio do Tempo
- **Especificações Técnicas:**
    - Comprimento de onda: 1310/1550/1625nm
    - Faixa dinâmica: 35/33/33dB
    - Evento Zona morta: 1m
    - Zona morta de atenuação: 5m
    - Largura do pulso: 3ns, 5ns, 10ns, 20ns, 50ns, 100ns, 200ns, 500ns, 1μs, 2μs, 5μs, 10μs, 20μs3μs (nota: suporte a largura de pulso estendida de 3μs no modelo FOTDR0001)
    - Distância de teste: 500m ~ 160km
    - Tempo de mensuração: Medição em tempo real ou definido pelo usuário (link inteligente)
    - Linearidade: <0.05dB/dB
    - Perda de limite: 0,01dB
    - Resolução de perda: 0,01dB
    - Resolução de distância: 0,01m
    - Resolução de amostragem: 0,25m
    - Ponto de amostragem: 128.000 pontos
    - Precisão da distância: ±(1m+distância de mediçãox3x10-5+resolução de amostragem)
    - Visual interno: 10mw, CW/2Hz
    - Fonte de laser estável: >-5dBm
    - Armazenamento de dados: 80.000 medições
    - Interface: 3x USB
    - Tela: 7" polegadas touchscreen
- **Recursos Integrados adicionais:**
    - **Medidor de potência óptica (OPM):** 850/1300/1310/1490/1550/1625nm; -50 ~ +26db
    - **Fonte de luz óptica (LS):** 1310/1550nm
    - **Localizador Visual de Falhas (VFL):** 10mw, CW/2Hz (Visual interno)
    - **Fonte de laser estável:** >-5dBm`
  },
  {
    name: "Caixa de Terminação Óptica (CTO) Trava Dupla 16FO / CTODT16A12F",
    keywords: ["cto", "caixa de terminação", "ctodt16a12f", "16fo", "trava dupla"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/cto-de-trava-dupla/
- **Modelo:** CTODT16A12F / CTO TRAVA DUPLA
- **Especificações Técnicas:**
    - Quantidade de adaptadores (SC): Até 16 adaptadores APC ou UPC.
    - Acomodação de fusões: Até 12 fusões.
    - Interface de entrada e saída de cabo AS: 4 interfaces para cabos de até 13mm.
    - Sistema de vedação: Travas mecânicas e borracha de vedação.
    - Grau de proteção: IP66
    - Dimensões do produto (mm): 230 x 285 x 86 (L x C x A)
    - Peso: 1.1 Kg`
  },
  {
    name: "Caixa de Emenda Óptica (CEO)",
    keywords: ["ceo", "caixa de emenda", "ceo12f048", "ceo24f120"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/caixa-de-emenda-optica/
- **Material:** Composto PP resistente com proteção UV
- **Índice de Proteção:** IP68
- **Montagem:** Aérea (horizontal) e em postes
- **Componentes:** Cabeçote, Junta de vedação, Bandejas, Abraçadeira de fechamento, Cúpula.
- **Modelo CEO12F048:**
  - **Capacidade:** Expansível até 48 Fibras Ópticas (suporta 4 bandejas de 12)
  - **Portas:** 1 Porta oval para sangria, 3 Portas circulares de 18mm
- **Modelo CEO24F120:**
  - **Capacidade:** Expansível até 120 Fibras Ópticas (suporta 5 bandejas de 24)
  - **Portas:** 1 Porta oval para sangria, 4 Portas circulares de 20mm`
  },
  {
    name: "Distribuidor Óptico Interno 12 Fibras (DIO12FO)",
    keywords: ["dio", "dio12fo", "distribuidor óptico", "rack 19", "12fo"],
    details: `- **Modelo:** DIO12FO
- **Especificações Técnicas:**
    - Capacidade máxima: 12 Fibras
    - Dimensões: 435 x 320 x 43,8mm - 1U
    - Peso: 3,5kg
    - Temperatura de operação: 0 ºC ~ 36ºC
    - Tipo de conector: SC
    - Tipo de polimento: APC ou UPC
    - Acabamento: Pintura eletroestática preta
    - Aplicação: Cenários FTTH, LAN/WAN
    - Montagem: Indicado para Rack de 19”
    - Fabricação: Aço laminado a frio
- **Acessórios Inclusos:**
    - Bandeja para emendas ópticas: 1 unidade
    - Protetores de emendas ópticas: 12 unidades
    - Pig tails coloridos: 12 unidades
    - Parafusos para fixação de suporte no rack: 4 unidades
    - Suportes para rack: 2 unidades
    - Abraçadeiras plásticas: 6 unidades
    - Entradas e saídas para fibras: 4 unidades
    - Fixadores para fibras: 4 unidades
    - Fixadores para o elemento de tração: 4 unidades
    - Adaptadores ópticos SC/APC ou SC/UPC: 12 unidades`
  },
  {
    name: "Distribuidor Óptico Interno 24 Fibras (DIO24FO)",
    keywords: ["dio", "dio24fo", "distribuidor óptico", "rack 19", "24fo"],
    details: `- **Modelo:** DIO24FO
- **Especificações Técnicas:**
    - Capacidade máxima: 24 Fibras
    - Dimensões: 435 x 320 x 43,8mm - 1U
    - Peso: 3,7kg
    - Temperatura de operação: 0 ºC ~ 36ºC
    - Tipo de conector: SC
    - Tipo de polimento: APC ou UPC
    - Acabamento: Pintura eletroestática preta
    - Aplicação: Cenários FTTH, LAN/WAN
    - Montagem: Indicado para Rack de 19”
    - Fabricação: Aço laminado a frio
- **Acessórios Inclusos:**
    - Bandeja para emendas ópticas: 2 unidades
    - Protetores de emendas ópticas: 24 unidades
    - Pig tails coloridos: 24 unidades
    - Parafusos para fixação de suporte no rack: 4 unidades
    - Suportes para rack: 2 unidades
    - Abraçadeiras plásticas: 6 unidades
    - Entradas e saídas para fibras: 4 unidades
    - Fixadores para fibras: 4 unidades
    - Fixadores para o elemento de tração: 4 unidades
    - Adaptadores ópticos SC/APC ou SC/UPC: 24 unidades`
  },
  {
    name: "Adaptador Óptico Sem Flange - SC/APC e SC/UPC",
    keywords: ["adaptador", "sem flange", "adaptador óptico", "sc/apc sem flange", "sc/upc sem flange", "6802ADP03", "6802ADP04"],
    details: `- **Códigos:** 6802ADP03 (SC/APC) e 6802ADP04 (SC/UPC)
- **Descrição Geral:** Os adaptadores ópticos da Greatek garantem o alinhamento apropriado das fibras ópticas com alta precisão e alta estabilidade. Ideal para uso em distribuição de sinais ópticos, sistema FTTx, Redes PON, Redes de Telecomunicações, Redes Locais (LANs), Data Center, Redes de Longa distância, (WANs), CATV.
- **Especificações Técnicas:**
    - Polimento: APC e UPC
    - Tipo de conector: SC
    - Perda de inserção Mínimo: 0.1dB
    - Perda de inserção Máxima: 0.2dB
    - Durabilidade: 1000 conexões
    - Força de retenção: 0.2 ~ 0.6Kg
    - Temperatura de operação: -40°C ~ 85°C`
  },
  {
    name: "Adaptador Óptico Com Flange - SC/APC e SC/UPC",
    keywords: ["adaptador", "com flange", "adaptador óptico", "sc/apc com flange", "sc/upc com flange", "6802ADP01", "6802ADP02"],
    details: `- **Códigos:** 6802ADP01 (SC/APC) e 6802ADP02 (SC/UPC)
- **Descrição Geral:** Os adaptadores ópticos da Greatek garantem o alinhamento apropriado das fibras ópticas com alta precisão e alta estabilidade. Ideal para uso em distribuição de sinais ópticos, sistema FTTx, Redes PON, Redes de Telecomunicações, Redes Locais (LANs), Data Center, Redes de Longa distância, (WANs), CATV.
- **Especificações Técnicas:**
    - Polimento: APC e UPC
    - Tipo de conector: SC
    - Perda de inserção Mínima: 0.1dB
    - Perda de inserção Máxima: 0.2dB
    - Durabilidade: 1000 conexões
    - Força de retenção: 0.2 ~ 0.6Kg
    - Temperatura de operação: -40°C ~ 85°C`
  },
  {
    name: "Conectores de Campo SC (APC/UPC) - Modelos C03, C04, C11",
    keywords: ["conector", "conector de campo", "conector de rosca", "conector reutilizável", "conector anatel", "sc/apc", "sc/upc", "cnscapc03", "cnscupc03", "cnscapc04", "cnscupc04", "cnscapc11", "cnscupc11"],
    details: `- **Link da Família:** https://www.greatek.com.br/produto/conectores-de-campo-greatek/
- **Descrição Geral:** Os conectores ópticos de campo Greatek fornecem conexões estáveis, de fácil implantação e sem a necessidade de fusão.
---
### Conector Óptico de Campo SC/APC e SC/UPC C03
- **Códigos:** CNSCAPC03 e CNSCUPC03
- **Aplicação:** Disseminação de sinais ópticos, Estrutura de distribuição FTTx, Infraestrutura de telecomunicações, Redes locais (LAN) e redes (WAN) e Redes de acesso óptico passivo (PON).
- **Características:** Formado por dois ferrolhos de Zircônia, garantindo consistência na conexão e um melhor desempenho. Alta performance. Alta durabilidade. Fácil instalação. Reutilizáveis sem perda significativa. Baixa perda por inserção. Projetado para cabos Drop Flat de até 3 mm.
- **Especificações Técnicas:**
    - Aplicação: 3.0*2.0mm Cabos tipo Drop
    - Polimento: APC e UPC
    - Diâmetro da fibra: 125μm
    - Tipo de fibra: Monomodo/Multimodo
    - Tempo de instalação: ≤ 3 minutos
    - Durabilidade: ≥ 30 anos
    - Quantidade de ferrolhos: 2
    - Material do ferrolho: Zircônia
    - Perda de inserção Méd.: ≤ 0.3dB e Máx. ≤ 0.5dB
    - Perda de retorno: APC: ≥ 50dB e UPC: ≥ 45dB
    - Resistência á tração: ≥40N
    - Temperatura de Operação: -40 ~ +85ºC
---
### Conector Óptico de Campo SC/APC e SC/UPC C04
- **Códigos:** CNSCAPC04 e CNSCUPC04
- **Descrição:** Os conectores ópticos de campo SC/UPC e APC são de alta performance, alta durabilidade e de fácil instalação. Projetado para cabos Drop Flat de até 3 mm e cordões ópticos de 2mm ou 3mm. Os conectores são reutilizáveis e operam com baixa perda por inserção.
- **Especificações Técnicas:**
    - Aplicação: 3.0 * 2.0 mm cabo tipo drop
    - Pré-Polimento: APC/UPC
    - Diâmetro da Fibra: 125µm (657A & 657B)
    - Tipo de fibra: Monomodo e Multimodo
    - Tempo de instalação: ≤ 3 min
    - Durabilidade: ≥ 30 anos
    - Perda de inserção: Méd. ≤ 0.3dB e Máx. ≤ 0.5dB
    - Perda de retorno: UPC ≥ 45 APC ≥ 55dB
    - Resistência á tração: ≥ 50N
    - Temp. de Operação: -40 ~ +85ºC
---
### Conector Óptico de Campo SC/APC C11
- **Código:** CNSCAPC11
- **Características:** Tamanho compacto, uso direto na ONU, aplicação no projeto FTTH, redução de soquetes e adaptadores, economia de custo, cabo interno montável em campo.
- **Especificações Técnicas:**
    - Escopo do cabo: 3,0 x 2,0 mm
    - Tamanho: 58*9*7,4 mm
    - Diâmetro da fibra: 125μm (G652D e G657A)
    - Modo: SM
    - Tempo de operação: 15s
    - Perda de inserção: ≤ 0,5dB
    - Perda de retorno: ≥55 dB
    - Reutilização: 10 vezes
    - Resistência ao aperto da fibra: 5N
    - Resistência à tração: 50N
    - Temperatura: -40~+85C
    - Teste de resistência à tração: Faixa de IL ≤0,3dB Faixa de RL ≤5dB
    - Durabilidade mecânica (500 vezes): Faixa de IL ≤0,3dB Faixa de RL ≤5dB
---
### Conector Óptico de Campo SC/UPC C11
- **Código:** CNSCUPC11
- **Especificações Técnicas:**
    - Escopo do cabo: 3,0 x 2,0 mm
    - Tamanho: 58*9*7,4 mm
    - Diâmetro da fibra: 125μm (G652D e G657A)
    - Modo: SM
    - Tempo de operação: 15s
    - Perda de inserção: ≤ 0,5dB
    - Perda de retorno: ≥45 dB
    - Reutilização: 10 vezes
    - Resistência ao aperto da fibra: 5N
    - Resistência à tração: 50N
    - Temperatura: -40~+85C
    - Teste de resistência à tração: Faixa de IL ≤0,3dB Faixa de RL ≤5dB
    - Durabilidade mecânica (500 vezes): Faixa de IL ≤0,3dB Faixa de RL ≤5dB`
  },
  {
      name: "TP-Link Roteadores e Soluções Wi-Fi (Consumo)",
      keywords: ["tp-link", "roteador", "router", "archer", "deco", "mesh", "repetidor", "extensor", "adaptador", "switch", "wi-fi 7", "wi-fi 6", "wi-fi 5", "BE900", "AX72", "X50", "RE705X", "TL-SG108"],
      details: `- **Visão Geral**: A TP-Link, distribuída pela Greatek, oferece uma linha completa de soluções de conectividade para residências e pequenos escritórios (SOHO), desde roteadores de alta performance a sistemas Mesh que garantem cobertura total.
---
### Roteadores Wi-Fi Archer
- **Foco**: Desempenho, velocidade e recursos avançados para diferentes perfis de usuário.
- **Destaques**:
  - **Wi-Fi 7**: **Archer BE900** (Quad-Band BE24000) e **Archer BE550** (Tri-Band BE9300) com portas Multi-Gigabit para performance extrema em jogos e streaming 8K.
  - **Wi-Fi 6**: **Archer AX72** (AX5400) para casas com muitos dispositivos e alta demanda de banda.
  - **Wi-Fi 5**: **Archer C80** (AC1900) oferece excelente custo-benefício com MU-MIMO.
---
### Sistemas Wi-Fi Mesh Deco
- **Foco**: Cobertura Wi-Fi total e inteligente, eliminando zonas mortas com uma rede unificada e roaming contínuo.
- **Destaques**:
  - **Wi-Fi 7**: **Deco BE65** (BE11000) une a cobertura Deco com a velocidade do Wi-Fi 7.
  - **Wi-Fi 6**: **Deco X50** (AX3000) é uma solução popular e versátil com ótima cobertura e velocidade. **Deco X50-Outdoor** com proteção IP65 para áreas externas.
---
### Repetidores de Sinal (Range Extenders)
- **Foco**: Expandir de forma simples a cobertura de uma rede Wi-Fi existente.
- **Destaques**: Modelos como o **RE705X** (Wi-Fi 6) e **RE650** (Wi-Fi 5) suportam EasyMesh para criar uma rede unificada.
---
### Adaptadores de Rede
- **Foco**: Conectar ou atualizar desktops e laptops com as tecnologias de rede mais recentes.
- **Destaques**:
  - **PCIe**: **Archer TX50E** (Wi-Fi 6 + Bluetooth 5.2). **TX401** (Ethernet 10 Gigabit).
  - **USB**: **Archer TX20U Nano** (Wi-Fi 6), **Archer T4U** (Wi-Fi 5).
  - **Ethernet**: **UE300C** (USB-C para Gigabit).
  - **Bluetooth**: **UB500** (Nano USB para Bluetooth 5.3).
---
### Switches SOHO
- **Foco**: Expandir a rede cabeada de forma fácil (Plug and Play) e silenciosa.
- **Destaques**:
  - **Linha Metálica (TP-Link/LiteWave)**: **TL-SG108** e **LS108G** (8 portas Gigabit) são robustos e possuem QoS para priorização de tráfego.`
    },
    {
    name: "O que é WiFi Mesh? (Tecnologia TP-Link Deco)",
    keywords: ["mesh", "wi-fi mesh", "deco", "roaming", "rede unificada", "o que é mesh", "home shield", "ai mesh", "iot"],
    details: `- **O que é WiFi Mesh?** É um sistema WiFi para toda a casa, criado para eliminar áreas de sombra e fornecer WiFi ininterrupto. O sistema Mesh permite que os dispositivos tenham velocidades mais rápidas, maior cobertura e uma conexão mais confiável, com vários pontos de acesso (nós) que trabalham juntos.
- **Como funciona?** Uma unidade (nó) se conecta ao modem e se torna a principal. As outras unidades capturam e retransmitem o sinal, criando uma rede sem fio eficiente com um único nome de rede e senha.
---
### Benefícios do Sistema Deco Mesh:
- **Eliminador de zonas mortas de Wi-Fi:** Cada unidade Deco trabalha em conjunto para cobrir toda a casa com uma poderosa rede Wi-Fi.
- **Roaming Contínuo (Seamless Roaming):** Mantém você conectado enquanto se desloca pela casa sem perder o sinal ou precisar se conectar a uma nova rede.
- **Configuração e Gerenciamento Simples:** O aplicativo TP-Link Deco guia a configuração e permite gerenciar a rede de qualquer lugar.
- **Rede Mesh com IA (AI-Driven Mesh):** Aprende e se aprimora automaticamente para criar um Wi-Fi personalizado, escolhendo a melhor configuração e banda para seus dados (Adaptive Routing).
- **Self-Healing:** Se um nó falhar, a rede redireciona automaticamente os dados para garantir que você continue online.
- **Segurança HomeShield:** Aumenta a segurança com QoS, antivírus, controle dos pais e proteção de dispositivos IoT.
- **Rede IoT:** Conecta dispositivos de casa inteligente via Wi-Fi em um único sistema.
---
### Diferença entre Mesh e Repetidor (Range Extender):
- **Rede Única:** O Mesh opera em uma única rede com protocolos de roaming. Repetidores geralmente criam redes separadas, exigindo que você mude de rede manualmente.
- **Inteligência:** O Mesh usa tecnologias como self-healing e adaptive routing para manter a rede estável. Repetidores apenas duplicam o sinal original.
- **Velocidade e Eficiência:** O Mesh é mais rápido e eficiente na transmissão do sinal Wi-Fi, pois cada nó se comunica com os outros para otimizar o tráfego.`
},
{
    name: "TP-Link Deco - Sistemas Wi-Fi Mesh para Toda a Casa",
    keywords: ["deco", "mesh", "wi-fi mesh", "be85", "be65", "be22", "xe75", "x50", "x50-outdoor", "x10", "s7", "m5", "m4"],
    details: `- **Visão Geral**: A linha Deco da TP-Link oferece sistemas Wi-Fi Mesh para toda a casa, projetados para eliminar áreas de sinal fraco e fornecer Wi-Fi rápido, estável e ininterrupto. Todas as unidades trabalham juntas para formar uma rede unificada com um único nome e senha, com roaming contínuo e gerenciamento fácil pelo aplicativo Deco.
---
### Deco BE85 (Wi-Fi 7)
- **Velocidade:** BE22000 Tri-Band (11520 Mbps em 6GHz + 8640 Mbps em 5GHz + 1376 Mbps em 2.4GHz)
- **Portas:** 1x 10G SFP+/RJ45 Combo, 1x 10G RJ45, 2x 2.5G RJ45
- **Destaques:** Wi-Fi 7, MLO, canais de 320 MHz, backhaul combinado, CPU Quad-Core, suporte a Matter. Conecta +200 dispositivos.
---
### Deco BE65 (Wi-Fi 7)
- **Velocidade:** BE11000 Tri-Band (5764 Mbps em 6GHz + 4324 Mbps em 5GHz + 688 Mbps em 2.4GHz)
- **Portas:** 4x 2.5G RJ45
- **Destaques:** Wi-Fi 7, MLO, canais de 320 MHz, backhaul combinado, HomeShield. Conecta +200 dispositivos.
---
### Deco BE22 (Wi-Fi 7)
- **Velocidade:** BE3600 Dual-Band (2882 Mbps em 5GHz + 688 Mbps em 2.4GHz)
- **Portas:** 2x 1.0G RJ45
- **Destaques:** Wi-Fi 7, MLO, backhaul combinado, Roaming com IA, HomeShield. Conecta +150 dispositivos.
---
### Deco XE75 (Wi-Fi 6E)
- **Velocidade:** AXE5400 Tri-Band (2402 Mbps em 6GHz + 2402 Mbps em 5GHz + 574 Mbps em 2.4GHz)
- **Portas:** 3x Gigabit por unidade
- **Destaques:** Banda de 6 GHz dedicada, HomeShield, Roaming com IA. Conecta até 200 dispositivos.
---
### Deco X50 (Wi-Fi 6)
- **Velocidade:** AX3000 Dual-Band (2402 Mbps em 5GHz + 574 Mbps em 2.4GHz)
- **Portas:** 3x Gigabit por unidade
- **Destaques:** Canal de 160 MHz (HE160), HomeShield, Roaming com IA. Conecta até 150 dispositivos.
---
### Deco X50-Outdoor (Wi-Fi 6)
- **Velocidade:** AX3000 Dual-Band (2402 Mbps em 5GHz + 574 Mbps em 2.4GHz)
- **Portas:** 2x Gigabit
- **Destaques:** Proteção IP65 para uso externo, alimentação via PoE ou AC, montagem flexível. Conecta +150 dispositivos.
---
### Deco X10 (Wi-Fi 6)
- **Velocidade:** AX1500 Dual-Band (1201 Mbps em 5GHz + 300 Mbps em 2.4GHz)
- **Portas:** 2x Gigabit por unidade
- **Destaques:** OFDMA, MU-MIMO, Controle Parental. Conecta até 120 dispositivos.
---
### Deco S7 (Wi-Fi 5)
- **Velocidade:** AC1900 Dual-Band (1300 Mbps em 5GHz + 600 Mbps em 2.4GHz)
- **Portas:** 3x Gigabit por unidade
- **Destaques:** 3x3 MU-MIMO, modos Roteador e Access Point. Conecta +100 dispositivos.
---
### Deco M5 (Wi-Fi 5)
- **Velocidade:** AC1300 Dual-Band (867 Mbps em 5GHz + 400 Mbps em 2.4GHz)
- **Portas:** 2x Gigabit por unidade
- **Destaques:** TP-Link HomeCare com Antivírus e QoS. Conecta até 100 dispositivos.
---
### Deco M4 (Wi-Fi 5)
- **Velocidade:** AC1200 Dual-Band (867 Mbps em 5GHz + 300 Mbps em 2.4GHz)
- **Portas:** 2x Gigabit por unidade
- **Destaques:** Modos Roteador e Access Point. Conecta até 100 dispositivos.`
},
  {
    name: "Ecossistema de Casa Inteligente TP-Link Tapo",
    keywords: ["tapo", "casa inteligente", "smart home", "câmeras", "iluminação", "tomadas", "sensores", "robôs aspiradores", "automação residencial"],
    details: `- **Visão Geral**: A Tapo é a submarca da TP-Link dedicada a tornar a vida mais fácil, segura e inteligente através de um portfólio completo de dispositivos para casa conectada, todos controlados pelo aplicativo Tapo. A Greatek é distribuidora master da TP-Link e seu ecossistema.
- **Filosofia**: Inteligente, Seguro, Fácil.
- **Categorias de Produtos**:
    - **Hubs Inteligentes**: O coração da casa inteligente, conectando sensores e outros dispositivos. Ex: Tapo H100, Tapo H110 (com controle infravermelho universal).
    - **Câmeras de Segurança**: Modelos internos e externos, com e sem fio (bateria/solar), com recursos de IA como detecção de pessoas, veículos e animais. Ex: Tapo C200 (interna), C410 (solar), C520WS (externa Pan/Tilt).
    - **Tomadas Inteligentes**: Controle remoto de aparelhos e monitoramento de consumo de energia. Ex: Tapo P110.
    - **Iluminação Inteligente**: Lâmpadas e fitas LED multicoloridas para criar ambientes e rotinas. Ex: Tapo L530E, Tapo L930-5.
    - **Sensores Inteligentes**: Sensores de movimento (T100), contato (T110) e temperatura/umidade (T315) para criar automações.
    - **Robôs Aspiradores**: Soluções de limpeza automatizada com mapeamento LiDAR e doca de autoesvaziamento. Ex: Tapo RV30 Max Plus.
- **Diferenciais**:
    - **Aplicativo Centralizado**: Controle todos os dispositivos, crie rotinas (Smart Actions) e monitore sua casa de qualquer lugar.
    - **Compatibilidade**: Integração com as principais plataformas de casa inteligente: Google Home, Amazon Alexa, Apple Home e Samsung SmartThings.
    - **TapoCare**: Serviço de assinatura para armazenamento de vídeo em nuvem por 30 dias e notificações inteligentes.`
  },
  {
    name: "Cabel Condutores Elétricos - Linhas Completas",
    keywords: ["cabel", "condutores", "cabo flexível", "cordão paralelo", "cabo pp", "cabo hepr", "cabo coaxial", "cabo de rede", "cat5e", "fibra óptica", "drop", "cabo solar", "fotovoltaico"],
    details: `- **Parceiro**: Cabel Condutores Elétricos, empresa brasileira com certificações **INMETRO** e **ANATEL**.
---
### Linha Energia (NBR 247-3, 247-5, 7286)
- **Cabo Flexível 450/750V**: Para instalações internas de força e luz.
- **Cordão Paralelo 300/300V**: Para extensões e aparelhos portáteis.
- **Cabo PP 300/500V**: Para ferramentas e eletrodomésticos, com cobertura brilhante.
- **Cabo HEPR 0,6/1KV**: Para instalações fixas e linhas subterrâneas.
---
### Linha Telecom
- **Cabos Coaxiais (ANATEL)**: Blindados (malha de 67% a 90%) para CATV, CFTV e antenas.
- **Cabos de Rede (ANATEL)**: **CAT5e** (4 pares) e **CAT3** (2 pares) para instalações internas, padrão CMX.
- **Cabo de Fibra Óptica Drop 1FO (ANATEL)**: Para FTTH/FTTA, com revestimento LSZH, ideal para vãos de até 80m.
---
### Linha Solar e Outros
- **Cabo de Potência Fotovoltaico 1,8kV (NBR 16612)**: Para painéis solares, com condutor de cobre estanhado e cobertura resistente a UV.
- **Cabo Multiplexado 0,6/1kV (NBR 8182)**: Para redes aéreas de distribuição de baixa tensão.`
  },
  {
    name: "CG3 Telecom - Soluções para Redes de Telecom",
    keywords: ["cg3", "ferragens", "pré-formados", "injetados plásticos", "cto", "ceo", "drop flat", "cordoalha"],
    details: `- **Perfil**: A CG3 Telecom é uma empresa binacional com mais de 10 anos de experiência na fabricação e comercialização de produtos para Redes de Telecomunicações e Elétricas. Possui certificação **ISO 9001**. A Greatek é distribuidora de seus produtos.
- **Linha de Produtos**:
    - **Ferragens**: Soluções para ancoragem e sustentação de cabos ópticos, incluindo Abraçadeiras BAP, Suportes, Olhais, Parafusos, Armações (Presbow), Cruzetas, Fitas e Fechos de Aço.
    - **Pré-Formados**: Utilizados para ancoragem e passagem de cabos ópticos e cordoalhas. Inclui Alças para cabos ópticos, Drop e Fio FE, Laços, Emendas e Derivações. Fabricados em aço galvanizado ou alumínio.
    - **Injetados Plásticos**: Componentes com proteção UV para fixação em postes, como Suportes (SUPA), Esticadores (Cunha, Figura 8), Alças Plásticas, Roldanas, Suportes Dielétricos e Reservas Técnicas (Optiloop).
    - **Produtos Ópticos**:
        - **Cabo Drop Flat (Fabricação Própria)**: Cabo para acesso final de assinantes (**Certificado ANATEL**).
        - **Caixa de Terminação Óptica (CTO)**: Capacidade para 16FO (**Certificada ANATEL**).
        - **Caixa de Emenda Óptica (CEO e Mini CEO)**: Capacidades de 144FO e 72FO (**Certificadas ANATEL**).
        - **Conectores Fast SC/PC/APC**.
        - **Splitters Ópticos**: 1x8 e 1x16 SC/APC (**Certificados ANATEL**).
    - **Miscelâneas**: Itens complementares como Fio de Espinar, Cordoalhas de Aço e Dielétrica, Fixa Cabo RG6 e Spiral Tube.
- **Diferenciais**:
    - Fabricação **nacional** com matéria-prima selecionada.
    - Produtos homologados em operadoras e certificados (**ANATEL, ISO 9001**).
    - Rigorosos testes de qualidade (dimensional, tração).`
  },
  {
    name: "Volt - Soluções de Energia para Telecom",
    keywords: ["volt", "fonte nobreak", "ups dc", "inversor senoidal", "carregador de bateria", "controlador de carga solar", "mppt", "monitoramento", "pop protect", "rack outdoor", "valemec", "UPS DC PRO 1375W", "UPS DC Smart", "ISP 1000", "MPower", "HPower"],
    details: `- **Perfil**: A Volt é uma empresa **100% brasileira**, especialista em soluções de energia ininterrupta para telecom, com certificação **ISO 9001:2015**. A Greatek é distribuidora de seus produtos.
- **Nova Sede (2013)**: expansão devido ao sucesso nas vendas de Fontes Nobreak nacionais e ampliação da linha de produtos.
- **Assistência Técnica**: Própria e 100% nacional.
---
### Alimentação Ininterrupta (UPS DC e Full Power)
- **UPS DC Smart 2000W**: Web Browser + API, SNMP, sensor de porta, relé, Watchdog IP. Modelos 48VDC e -48VDC. Saída até 40A.
- **UPS DC Smart 1000W**: Acesso remoto, SNMP, teste de autonomia, Watchdog. Saída até 15A.
- **UPS DC Smart 620W**: Saídas 12/24/48/-48VDC, SNMP, relé multifuncional, Watchdog IP.
- **UPS DC Plus 620W**: Saídas 12/24/48/-48VDC estabilizadas, proteções, relé de falha, alarmes.
---
### Inversores de Onda Senoidal Pura
- **Inversor Senoidal 3000W Gerenciável (48VDC e 125VDC)**: Saída 127/220VAC, 1700–3000W, isolação galvânica, SNMP.
- **Outros Modelos**: Inversores DC/AC 600W, 12VDC (15W/27W).
---
### Carregadores de Baterias
- **Carregador Multifuncional Inteligente 56V até 60A**: Entrada auto 127/220VAC, display frontal, para baterias > 100Ah.
---
### Controladores de Carga Solar (MPPT)
- **Linha MPower (20A, 30A, 40A)**: 12/24/36/48VDC auto, painel até 120VDC, acesso remoto (Web, SNMP, API).
- **Linha HPower (60A)**: 12/24/36/48VDC, painel até 120VDC.
- **Linha LPower (20A)**: 12/24VDC, painel até 50VDC, gerenciável (Web, SNMP, API).
---
### Sensores e Monitoramento (App Volt IoT)
- **Pop Protect Plus SNMP**: Sensores de contato seco, saída para sirene, monitoramento de rede/baterias/temp.
- **Central de Monitoramento Gerenciável**: Até 6 sensores, monitoramento de rede/baterias/temp/umidade.
---
### Divisores de Energia e Conversores
- **Filtro de Linha Smart Web**: Controle individual por tomada, Watchdog, timer, Web, App, SNMP, API.
- **Conversores de Tensão (Step Up/Step Down)**: Saída ajustável 5–48VDC, até 30A.
---
### Racks Outdoor (Padrão 19", IP-55)
- **Capacidade**: 10U, 12U, 20U, 24U (refrigerado).
- **Controle**: Eletrônico de temperatura, comunicação RS485, compartimento para baterias.`
  },
  {
    name: "Volt - Filtros de Linha Smart Web",
    keywords: ["volt", "filtro de linha", "smart web", "pdu", "régua de tomadas", "watchdog", "snmp", "gerenciável"],
    details: `- **Visão Geral:** A linha Filtro de Linha Smart Web da Volt são réguas de tomadas totalmente gerenciáveis, fabricadas no Brasil, que permitem controle remoto individual de cada tomada, monitoramento e automação.
- **Principais Recursos (Comuns a todos os modelos):**
  - **Gerenciamento Remoto:** Acesso via Web Browser, App Volt IoT (iOS/Android), protocolo SNMP (compatível com Zabbix, PRTG, etc.) e API REST para integração.
  - **Controle Individual de Tomadas:** Ligue, desligue ou reinicie cada tomada remotamente.
  - **WatchDog IP:** Monitore um IP por tomada. Se o dispositivo não responder ao ping, a tomada é reiniciada automaticamente.
  - **Agendamento (Timer):** Programe dias e horários para ligar ou desligar tomadas individualmente.
  - **Proteção:** Contra sobrecorrente e sobretensão.
  - **Facilidades:** DHCP para fácil instalação, software Discovery para localização na rede.
---
### Modelo 8 Tomadas 20A (13.14.015)
- **Tomadas:** 8 tomadas NBR 14136 - 20A.
- **Corrente Máxima de Entrada:** 20A.
- **Montagem:** Padrão Rack 19" (1U).
- **Potência Máxima:** 2540W (127Vac) / 4400W (220Vac).
---
### Modelo 10 Tomadas 20A (13.14.013)
- **Tomadas:** 10 tomadas NBR 14136 - 10A.
- **Corrente Máxima de Entrada:** 20A.
- **Montagem:** Padrão Rack 19" (1U).
- **Potência Máxima:** 2540W (127Vac) / 4400W (220Vac).
---
### Modelo 10 Tomadas 10A
- **Tomadas:** 10 tomadas NBR 14136 - 10A.
- **Corrente Máxima de Entrada:** 10A.
- **Montagem:** Padrão Rack 19" (1U).
---
### Modelo 5 Tomadas 10A
- **Tomadas:** 5 tomadas NBR 14136 - 10A.
- **Corrente Máxima de Entrada:** 10A.
- **Montagem:** Padrão bancada (abas para rack vendidas separadamente).
---
### Modelo 3 Tomadas 10A
- **Tomadas:** 3 tomadas NBR 14136 - 10A.
- **Corrente Máxima de Entrada:** 10A.
- **Montagem:** Padrão bancada (abas para rack vendidas separadamente).`
  },
  {
    name: "TP-Link - Soluções para Provedores (ISP)",
    keywords: ["tp-link", "aginet", "isp", "provedor", "olt", "ont", "xgpon", "gpon", "tauc", "5g", "roteador isp", "mesh isp", "DS-P8000-X2"],
    details: `- **Visão Geral**: A TP-Link, através de sua linha de soluções Aginet, oferece um portfólio completo de produtos para acesso via fibra, 5G e Wi-Fi, todos gerenciados centralmente pela plataforma TAUC (TP-Link Unified Cloud). A Greatek é distribuidora master da TP-Link.
---
### XX535
**ONT Terminal XPON Wi-Fi 6 Dual Band AX3000**
*Nota Importante: O modelo XX535 substitui o antigo modelo XX530v V2. A TP-Link agora comercializa exclusivamente o modelo XX535 para esse segmento, mas o modelo anterior segue listado abaixo como descontinuado e mantido exclusivamente para fins de comparação.*
- **Tecnologia**: Modos duplos XPON (Compatível com os modos GPON e EPON para acesso flexível).
- **Padrão Wi-Fi**: Wi-Fi 6 Dual Band AX3000 ou superior (velocidades de Wi-Fi de até 3 Gbps em duas bandas).
- **Cobertura ampliada**: Antenas de alto desempenho e tecnologia de beamforming combinam-se para estender uma rede Wi-Fi forte e confiável por toda a sua casa.
- **Portas**: Conectividade cabeada Gigabit (1 porta WAN/LAN GbE e 2 portas LAN GbE oferecem acesso rápido e flexível).
- **Recursos Chave**: Compatível com EasyMesh (crie uma rede mesh inteligente), OFDMA, MU-MIMO, criptografia WPA3, Multi-SSID e controles parentais. Configuração e uso fáceis via poderoso aplicativo Aginet.
- **Gerenciamento Remoto**: Compatível com os protocolos OMCI, TR-069, TR-098, TR-181, TR-111 e TR-143.

### XX530v V2 [DESCONTINUADO - PARA COMPARAÇÃO]
**ONT Terminal XPON VoIP Wi-Fi 6 Dual Band AX3000**
*Nota: Modelo descontinuado e substituído pelo XX535. Mantido na base de conhecimento apenas para fins de comparação técnica.*
- **Tecnologia**: XPON (suporta GPON e EPON).
- **Padrão Wi-Fi**: Wi-Fi 6 (802.11ax) Dual-Band AX3000.
- **Velocidades**: 2402 Mbps (5 GHz) + 574 Mbps (2.4 GHz).
- **Portas**: 4x Portas LAN Gigabit, 1x Porta FXS (VoIP).
- **Recursos Chave**: EasyMesh, OFDMA, MU-MIMO, Beamforming, WPA3.
- **Gerenciamento Remoto**: OMCI, TR-069, TR-181, TR-369 (USP) e Aginet ACS.
- **Diferenciais vs XX535**: O XX530v V2 vinha equipado com 1 porta telefônica FXS (VoIP) e possuía 4 portas LAN físicas, enquanto o XX535 atual foca puramente em Wi-Fi de alto desempenho e redes Mesh sem telefonia, contando com 3 portas RJ45 físicas totais.

### OLT Chassi X2 (DS-P8000-X2)
Solução de alta performance para redes GPON e XGS-PON, oferecendo 32 portas PON em um chassi compacto e flexível. Suporta até 200Gbit/s por slot, com fontes e controladoras redundantes. Gerenciamento via DPMS, SNMP, CLI e Web UI. Link do Produto: https://www.greatek.com.br/produto/olt-chassi-x2-xgs-pon-e-gpon-de-32-portas/

### DeltaStream Pizza Box
- **XGS-PON & GPON Combo**: Modelos como **DS-P7500-16** (16 portas) e **DS-P7500-08** (8 portas) que suportam tanto GPON quanto XGS-PON no mesmo dispositivo.
- **GPON**: Modelos como **DS-P7001-16** (16 portas) e **DS-P7001-08** (8 portas) para redes GPON robustas.

### Outros Terminais
- **Wi-Fi 7 XGS-PON**: **TP-Link XGB830v** (BE19000 Tri-Band).
- **Terminais (SFU)**: **TP-Link XGZ030** (1 porta 10GE XGS-PON) e **TP-Link XZ000-G7** (1 porta Gigabit XPON).
---
### Roteadores 5G/4G+
- **Foco**: Oferecer acesso à internet de banda larga via rede móvel (Fixed Wireless Access - FWA).
- **Destaques**:
  - **Roteador 5G Wi-Fi 7**: **TP-Link NB410v** (BE7200) com porta 2.5GE e VoLTE, para a máxima performance da rede 5G.
  - **Roteador 5G Wi-Fi 6**: **TP-Link NX511v** (AX3000) com velocidades de download de até 3.4 Gbps e compatibilidade com EasyMesh.
  - **Gateway Externo 5G**: **TP-Link NE211-Outdoor** com proteção **IP67**, ideal para instalação externa para melhor captação de sinal.
---
### Roteadores e Sistemas Mesh Wi-Fi para ISPs
- **Foco**: Entregar uma experiência Wi-Fi superior na casa do cliente, com fácil gerenciamento para o provedor.
- **Destaques Roteadores**:
  - **Wi-Fi 7**: **TP-Link EB810v** (BE19000 Tri-Band) com portas 10G Duplas e VoIP.
  - **Wi-Fi 6**: **TP-Link EX510 Pro** (AX3000) com porta 2.5G e compatibilidade com EasyMesh.
- **Destaques Sistemas Mesh**:
  - **Wi-Fi 7**: **TP-Link HB810** (BE19000) com conectividade Multi-Gig 10G e backhaul robusto.
  - **Wi-Fi 6**: **TP-Link HX220** (AX1800) como uma solução de ótimo custo-benefício para cobertura total.
- **Gerenciamento Remoto**: Todos os produtos da linha Aginet são gerenciáveis remotamente via **TAUC**, suportando protocolos como **TR-069, TR-369, TR-181**, etc, o que reduz custos operacionais (OPEX) para o provedor.`
  },
  {
    name: "SkyWatch da Greatek - Monitoramento de Redes",
    keywords: ["skywatch", "monitoramento", "layer 7", "camada de aplicação", "dns", "latência", "disponibilidade", "probes", "noc"],
    details: `- **O que é o SkyWatch?** É a solução de monitoramento inteligente da Greatek, projetada para que provedores e empresas possam enxergar a qualidade da sua rede com os olhos do cliente final. Em vez de apenas monitorar IPs e servidores, o SkyWatch acompanha a experiência real de navegação, identificando lentidão e falhas antes que seus clientes reclamem.


- **Como funciona?** Através de sondas (probes) plug-and-play instaladas em pontos estratégicos, a ferramenta simula o acesso de um usuário, medindo a performance real de sites e serviços críticos para o seu negócio.


- **Requisito de Instalação:** A sonda SkyWatch deve ser conectada, sem exceção, a um Roteador ou ONT dentro do POP ou na localidade do cliente B2B dedicado.


- **Principais Benefícios:**
  - **Visão Real do Usuário:** Saiba exatamente como está a qualidade da navegação do seu cliente.
  - **Ação Proativa:** Identifique problemas de latência, DNS ou disponibilidade e atue antes de impactar seus clientes.
  - **Diagnóstico Simplificado:** A plataforma centralizada oferece dashboards intuitivos e relatórios com IA para facilitar a identificação da causa raiz dos problemas.
  - **Fácil de Usar:** Não é preciso ser um especialista em redes. A solução foi desenhada para ser simples e segura, com sondas que funcionam de forma automática.


- **Interessado em saber mais?** O SkyWatch é uma ferramenta poderosa para garantir a satisfação dos seus clientes e a estabilidade da sua operação. Para uma demonstração ou para entender como a solução pode se aplicar ao seu negócio, entre em contato com nosso Time Comercial.


- **Contato Comercial Greatek:**
  - **Telefone/WhatsApp:** (12) 99221-8852`
  },
  {
    name: "Think Technology - Catálogo de Produtos",
    keywords: ["think", "think technology", "ont", "olt", "gpon", "epon", "xpon", "wi-fi 6", "ax3000", "ac1200", "cto", "ceo", "dio", "rack"],
    details: `- **Perfil:** Parceiro estratégico distribuído pela Greatek. A Think Technology é uma indústria brasileira de telecomunicações desde 2015, localizada em Santa Rita do Sapucaí, MG.
---
### ELETRÔNICOS
- **ONT Wi-FI 6 AX3000/AX3000V (VoIP):** Padrão GPON, compatível com EasyMesh, IPv4/IPv6, MU-MIMO, OFDMA. Design exclusivo com tampa de proteção do conector.
- **ONT WI-FI AC1200:** XPON (GPON/EPON), EasyMesh, 4 antenas 5dBi, 2 portas GbE, 1 porta FXS (VoIP). Design com acomodação para cabo drop.
- **ONU xPON:** 1 porta Gigabit Ethernet, compatível com as principais OLTs do mercado.
- **OLTs GPON V3 (TK-1G, TK-2G, TK-4G, TK-8G):** Para até 128/256/512/1024 ONTs. Uplink 1GE e 10G SFP+. Gerenciamento CLI, Web, Telnet, SSH, MQTT. Display frontal e alimentação dupla redundante.
- **OLTs EPON:**
  - **Chassi 3U:** Modular, até 8 módulos, suporta 2 fontes, até 128 ONUs por porta.
  - **Mini Chassi e Chassi 1U:** Compactas, 2 portas SFP PON, até 128 ONUs por porta.
- **Switch VLAN Gigabit:** 8 portas, VLAN Fixa (1-7 para 8), alimentação 15-60VDC, saída auxiliar 12VDC, opções PoE In/Out.
- **Bateria de Lítio 48V 100Ah:** Padrão 3U, vida útil longa, monitoramento remoto.
- **Fontes:** PoE Gigabit 48W, Bivolt 12V (1A a 3A), fontes dedicadas para OLTs.
---
### INJETADOS PLÁSTICOS
- **CTOs (3 FTTH, 4 PRIME, CTO-P):** Modelos 1x8 e 1x16, homologadas ANATEL, material resistente a UV. Suportam redes pré-conectorizadas (PRECON).
- **Caixas de Emenda (CEO):**
  - **Fechamento Termocontrátil:** Vedação definitiva, até 216 FO, proteção IP68.
  - **Fechamento Mecânico:** Fácil reentrada, até 216 FO, sistema de grommets.
- **Acessórios:** Cruzeta Plástica, Suportes para CTO, Mini CDOE, Ponto de Terminação Óptica (PTO), Ancoragem (SUPA, Roldana), Esticadores.
---
### METÁLICOS
- **Linha DIO (Distribuidores Internos Ópticos):**
  - **Modelos:** Easy, Slide, Simple, Standard, Plus, Prime, Splitter, Mini DIO (FTTA/FTTA Plus/SLIM).
  - **Capacidades:** De 12 FO até 144 FO, para racks 19"/21"/23".
- **Linha Racks:**
  - **Outdoor:** Standard e Simple (IP-54), Mini Shelter 24U (IP-54).
  - **Data Center:** 44U e 52U, alta capacidade e organização.
  - **Gabinetes Especiais:** Amazônia (IP-56 com AC) e América.
  - **Open Racks:** Standard e Prime (32U a 44U).
  - **Parede e Piso:** Diversos tamanhos para diferentes necessidades.
  - **CFTV:** Racks específicos para DVRs e organização.
- **Acessórios para Racks:** Bandejas, Organizadores, Painel Cego, Réguas de Tomada.
---
### CONECTIVIDADE
- **Conectores de Campo:** Montagem rápida, SC/UPC e SC/APC.
- **Splitters Ópticos:** Balanceados e desbalanceados, conectorizados ou não.
- **Pigtails e Cordões Ópticos:** Monomodo e multimodo, diversos conectores.
- **Adaptadores Ópticos:** Acopladores para alinhamento de precisão.`
  },
  {
    name: "TP-Link Omada - Solução de Rede Empresarial",
    keywords: ["omada", "sdn", "rede empresarial", "b2b", "gartner", "controladora", "oc200", "oc300", "access point", "ap", "switch", "roteador", "gateway", "eap", "wi-fi 7", "wi-fi 6e", "l3", "empilhável", "poe"],
    details: `- **Visão Geral:** TP-Link Omada é uma solução de rede definida por software (SDN) para SMBs e Enterprise, integrando Access Points, Switches e Gateways em uma única plataforma de gerenciamento.
- **Reconhecimento:** Reconhecida por 6 anos consecutivos no Quadrante Mágico do Gartner para Infraestrutura LAN Corporativa.
- **Diferenciais:** Fabricação própria (Integração Vertical), garantia vitalícia limitada para a maioria dos produtos (controladoras, roteadores, switches, APs indoor), suporte 8x5 em português.
---
### Gerenciamento (Controladoras Omada)
- **Hardware:** **OC200** (até 100 APs), **OC300** (até 500 APs). Acesso gratuito à nuvem.
- **Software:** Gratuito, ilimitado (cluster), para Windows/Linux.
- **Cloud:** **Cloud Essential** (gratuito) e **Cloud Standard** (licenciado).
- **Ferramentas:** Simulador de mapa de calor Wi-Fi, Captive Portal customizável, App Omada.
---
### Access Points (APs) Omada
- **Tecnologias:** Wi-Fi 7, 6E, 6 e 5 para diversos cenários (teto, parede, outdoor, alta densidade).
- **Teto (Ceiling Mount):**
  - **Wi-Fi 6:** **EAP610 (AX1800)**, **EAP650 (AX3000)**, **EAP670 (AX5400)**. Modelos HD para alta densidade.
- **Parede (Wall Plate):** **EAP615-Wall (AX1800)**, **EAP655-Wall (AX3000)**. Com portas downlink e PoE Passthrough.
- **Externos (Outdoor):** **EAP610-Outdoor (AX1800)**, **EAP650-Outdoor (AX3000)**. Proteção IP67.
- **GPON:** **EAP610GP-Desktop (AX1800)** e **EAP625GP-Wall (AX1800)**. ONUs com Wi-Fi 6 integradas à Omada.
---
### Switches Omada
- **Linhas Completas:** Desde acesso até core/agregação, com portas de 1G, 2.5G, 10G, 25G e 100G.
- **Campus L3 Empilhável (Core/Agregação):**
  - **Série S7500:** Uplinks de 25G e 100G, fontes redundantes hot-swap, BGP, OSPF, Stacking.
  - **Série S6500:** Uplinks de 10G e 25G, modelos com PoE++ (até 60W/porta), fontes redundantes.
- **L2+ com Uplink 10G:**
  - **Full 10G:** **SX3016F** (16x SFP+), **SX3206HPP** (4x 10G PoE++).
  - **2.5G + 10G:** **SG3210XHP-M2** (8x 2.5G PoE+), **SG3428XPP-M2** (24x 2.5G PoE++/PoE+).
  - **GE + 10G:** **SG3428XMP** (24x GE PoE+), **SG3452XP** (48x GE PoE+).
- **Switches de Acesso:** Linhas L2+ e Easy Managed com e sem PoE.
---
### Roteadores Omada (Gateways)
- **Segurança Avançada:**
  - **IDS/IPS:** Detecção e prevenção de intrusões com mais de 1000 regras.
  - **DPI (Deep Packet Inspection):** Reconhecimento e controle de tráfego por aplicação.
- **Modelos:**
  - **ER8411:** Quad-Core, 2x SFP+, 8x GE, PSU redundante.
  - **ER7212PC:** 3-em-1 (Roteador + Controlador + Switch PoE), 8x PoE+, 110W.
  - **ER706W:** AX3000 Wi-Fi 6 integrado.
  - **ER605:** Gateway VPN de alta performance.`
  },
  {
    name: "TP-Link VIGI - Câmeras de Vigilância",
    keywords: ["vigi", "câmera", "cftv", "segurança", "turret", "dome", "bullet", "ptz", "fisheye", "colorpro", "ia", "poe", "wi-fi", "insight"],
    details: `- **Visão Geral**: A VIGI, submarca da TP-Link, oferece um portfólio completo de câmeras de segurança profissionais para diversos cenários, com recursos avançados de IA e integração total ao ecossistema Omada.
---
### Câmeras Internas (Turret/Dome)
- **Série IR (Visão Noturna Infravermelha)**:
  - **VIGI C420I / C220I**: 2MP, IA (Humanos/Veículos), Detecção Inteligente, PoE.
  - **VIGI C430I**: 3MP, Lentes 2.8mm, 12V DC/PoE.
  - **VIGI C440I**: 4MP, Lentes 2.8mm, 12V DC/PoE.
- **Série Full-Color (Coloridas 24h)**:
  - **VIGI C430**: 3MP, Microfone Embutido.
  - **VIGI C440**: 4MP, Defesa Ativa (som/luz), Áudio Bidirecional.
- **Série Wi-Fi**:
  - **VIGI C440-W**: 4MP, Full-Color, Wi-Fi, Defesa Ativa.
---
### Câmeras Externas (Bullet)
- **Série IR (Visão Noturna Infravermelha)**:
  - **VIGI C320I**: 2MP, IP67, PoE.
  - **VIGI C330I**: 3MP, IP67, 12V DC/PoE.
  - **VIGI C340I**: 4MP, IP67, 12V DC/PoE.
- **Série Full-Color (Coloridas 24h)**:
  - **VIGI C330**: 3MP, Microfone Embutido, IP67.
  - **VIGI C340**: 4MP, Defesa Ativa, Áudio Bidirecional, IP67.
- **Série Wi-Fi**:
  - **VIGI C340-W**: 4MP, Full-Color, Wi-Fi, Defesa Ativa, IP66.
---
### Câmeras PTZ (Pan/Tilt/Zoom) e Especiais
- **PTZ (Pan/Tilt)**:
  - **VIGI C540**: 4MP, Externa, Full-Color, Rastreamento Automático, Defesa Ativa, IP66.
  - **VIGI C540-W**: Versão Wi-Fi da C540.
- **Varifocal (Zoom Óptico)**:
  - **VIGI C540V**: 4MP, Externa, PTZ, Full-Color, Zoom 3x Instantâneo, IP66.
  - **InSight S445ZI / S345ZI / S245ZI**: 4MP, Zoom Óptico 5x, IR 60m, IP67/IK10.
- **ColorPro (Visão Noturna com Luz Ultra Baixa)**:
  - **VIGI C340S**: 4MP, Bullet, True WDR, Defesa Ativa, IP67.
  - **VIGI C540S**: 4MP, PTZ 360°, True WDR, Defesa Ativa, IP66.
- **Panorâmicas & Fisheye**:
  - **InSight S385PI / S485PI**: 8MP (4K), Panorâmica 180°, IR 20m, Defesa Ativa (luz azul/vermelha), IP67/IK10.
  - **InSight S655I**: 5MP, Fisheye 360°, Múltiplos modos de exibição, Áudio Bidirecional, IP67/IK10.
- **4G**:
  - **InSight S345-4G**: 4MP, Full-Color, Rede 4G, 3 portas LAN, LightPro Night Vision, IP66.`
  },
  {
    name: "TP-Link VIGI - Gravadores de Vídeo (NVRs)",
    keywords: ["vigi", "nvr", "gravador", "nvr1008h-8p", "nvr4064h", "nvr2016h", "nvr1008h-8mp", "nvr4032h", "nvr1004h-4p", "nvr1016h", "nvr1008h", "nvr1004h", "h.265+", "poe"],
    details: `- **Visão Geral:** Os NVRs da VIGI são o cérebro do sistema de vigilância, permitindo gravação, visualização e gerenciamento centralizado de múltiplas câmeras.
---
### VIGI NVR1004H (4 Canais)
- **Visualização:** 4 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** 2 canais @ 8MP / 4 canais @ 4MP.
- **Reprodução:** Síncrona de 4 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 1 Interface SATA (até 10 TB).
- **Compressão:** H.265+.
---
### VIGI NVR1004H-4P (4 Canais PoE+)
- **Visualização:** 4 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **PoE+:** 4 Portas PoE+ dedicadas com Orçamento PoE total de 53 W.
- **Decodificação:** Capacidade de 16MP (ex: 4 canais @ 4MP ou 2 canais @ 8MP).
- **Reprodução:** Síncrona de 4 Canais.
- **Largura de Banda:** 80 Mbps (Entrada).
- **Armazenamento:** 1 Interface SATA (até 10 TB).
- **Compressão:** H.265+.
- **Recursos Adicionais:** Áudio Bidirecional, Plug & Play.
---
### VIGI NVR1008H (8 Canais)
- **Visualização:** 8 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** Até 8 canais @ 2MP (25fps) / 4 canais @ 4MP (25fps).
- **Reprodução:** Síncrona de 8 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 1 Interface SATA (até 16 TB).
- **Compressão:** H.265.
---
### VIGI NVR1008H-8P (8 Canais PoE+)
- **Visualização:** 8 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **PoE+:** 8 Portas 10/100 Mbps com Orçamento PoE total de 53 W.
- **Decodificação:** Até 8 canais @ 2MP (25fps) / 4 canais @ 4MP (25fps).
- **Reprodução:** Síncrona de 8 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 1 Interface SATA (até 16 TB).
- **Compressão:** H.265+.
---
### VIGI NVR1008H-8MP (8 Canais PoE+)
- **Visualização:** 8 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **PoE+:** 8 Portas 10/100 Mbps com Orçamento PoE total de 113 W.
- **Decodificação:** Até 8 canais @ 2MP (25fps) / 4 canais @ 4MP (25fps).
- **Reprodução:** Síncrona de 8 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 1 Interface SATA (até 16 TB).
- **Compressão:** H.265.
---
### VIGI NVR1016H (16 Canais)
- **Visualização:** 16 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** Até 8 canais @ 2MP (25fps) / 4 canais @ 4MP (25fps).
- **Reprodução:** Síncrona de 16 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 1 Interface SATA (até 16 TB).
- **Compressão:** H.265.
---
### VIGI NVR2016H V1.2 (16 Canais)
- **Visualização:** 16 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** Até 2 canais @ 8MP (25fps) / 4 canais @ 4MP (25fps) / 8 canais @ 2MP (25fps).
- **Reprodução:** Síncrona de 16 Canais.
- **Largura de Banda:** 80 Mbps (Entrada) / 60 Mbps (Saída).
- **Armazenamento:** 2 Interfaces SATA (até 16 TB cada).
- **Compressão:** H.265.
---
### VIGI NVR4032H (32 Canais)
- **Visualização:** 32 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** 16 canais @ 2MP / 8 canais @ 4MP.
- **Reprodução:** Síncrona de 16 Canais.
- **Largura de Banda:** 320 Mbps (Entrada e Saída).
- **Armazenamento:** 4 Interfaces SATA (até 16 TB cada).
- **Rede:** 2 Portas Ethernet com modos Multi-Endereço, Tolerância a Falhas e Balanceamento de Carga.
- **Compressão:** H.265+.
---
### VIGI NVR4064H (64 Canais)
- **Visualização:** 64 Canais ao vivo e Saída de Vídeo HDMI 4K.
- **Decodificação:** Até 16 canais @ 2MP (25fps) / 8 canais @ 4MP (30fps).
- **Reprodução:** Síncrona de 16 Canais.
- **Largura de Banda:** 320 Mbps (Entrada) / 320 Mbps (Saída).
- **Armazenamento:** 4 Interfaces SATA (até 16 TB cada).
- **Rede:** 2 Portas Ethernet Duplas com modos Multi-Endereço, Tolerância a Falhas e Agregação de Portas.
- **Saídas de Vídeo:** 2x HDMI, 1x VGA.
- **Compressão:** H.265+.`
  },
    {
    name: "TP-Link VIGI - Softwares de Gerenciamento",
    keywords: ["vigi", "vms", "cloud", "security manager", "config tool", "gerenciamento", "software"],
    details: `- **Visão Geral**: A VIGI oferece uma suíte completa de softwares para gerenciar seu sistema de vigilância de qualquer lugar, seja na nuvem, localmente ou através de ferramentas de configuração.
---
### VIGI Cloud VMS
- **Tipo**: Sistema de gerenciamento de vídeo hospedado na nuvem (baseado em AWS).
- **Ideal para**: Monitoramento de múltiplos locais (redes de lojas, escritórios).
- **Principais Recursos**:
  - **Gratuito (Versão Essential)**: Escalabilidade ilimitada de sites e dispositivos.
  - **Acesso Remoto**: Gerencie via App VIGI, Portal Web ou Cliente PC sem necessidade de VPN.
  - **Ferramenta de Design**: Simule a implantação de câmeras e crie propostas de projeto.
  - **Manutenção Simplificada**: Configuração remota, atualizações de firmware online e alertas de saúde do dispositivo.
---
### VIGI VMS (Local)
- **Tipo**: Software de gerenciamento de vídeo para instalação local (Windows).
- **Ideal para**: Gerenciamento centralizado de projetos de médio porte em uma única interface.
- **Principais Recursos**:
  - **Centro de Monitoramento**: Visualize até 64 canais de vídeo simultaneamente.
  - **Painel do Sistema**: Tenha uma visão completa do status dos dispositivos e alarmes.
  - **Mapa Virtual**: Implante dispositivos em uma planta baixa para visualização intuitiva.
  - **Monitoramento por IA**: Acompanhe alvos (humanos/veículos) em tempo real.
  - **Arquivo de Evidências**: Salve e gerencie gravações importantes de forma centralizada.
---
### VIGI Security Manager
- **Tipo**: Software cliente para gerenciamento local.
- **Funções**:
  - Gerenciamento de câmeras e NVRs.
  - Exibição de vídeo ao vivo em tempo real.
  - Programação e reprodução de gravações.
  - Suporte a acesso local e remoto.
---
### VIGI Config Tool
- **Tipo**: Ferramenta de configuração para dispositivos em rede local (Windows).
- **Funções**:
  - **Descoberta**: Encontra todos os dispositivos VIGI na rede.
  - **Operações em Lote**: Permite inicializar, configurar rede, atualizar firmware e alterar senhas de múltiplos dispositivos de uma só vez.
  - **Configuração Individual**: Acesso a configurações detalhadas de cada dispositivo.`
  },
  {
    name: "Sistema Retificador Compacto XPS SRF 10 A / -48 V / 540 W",
    keywords: ["xps", "retificador", "srf 10a", "540w", "-48v"],
    details: `- **Modelo:** SRF 10 A/-48 V
- **Altura:** 1U (para rack 19")
- **Certificação:** Anatel (Nº 1617-06-1268)
- **Entrada CA:** 95 a 264 VCA (Full Range)
- **Saída CC:** Tensão de flutuação -54 VCC (ajustável 45 a 56 VCC)
- **Potência Máxima:** 540 W
- **Corrente Máxima:** 10 A (ajustável de 5 a 10 A com limitação automática)
- **Eficiência Máxima:** >89% em 220 VCA e 100% carga.
- **Alarmes:** CA anormal, Fusível aberto, UR anormal e Falha ventilador.
- **Temperatura de Operação:** 0º a 50º C
- **Dimensões:** 482(L) x 43(A) x 228(P) [mm]
- **Peso:** 4 Kg`
  },
  {
      name: "Sistema Retificador XPS SRF 15 A / +24 V / 405 W",
      keywords: ["xps", "retificador", "srf 15a", "405w", "+24v"],
      details: `- **Modelo:** SRF 15 A/+24 V
- **Altura:** 1U (para rack 19")
- **Certificação:** Anatel
- **Entrada CA:** 95 a 300 VCA (Full Range)
- **Saída CC:** Tensão de flutuação +27 VCC (ajustável 23 a 28 VCC)
- **Potência Máxima:** 405 W
- **Corrente Máxima:** 15 A (ajustável de 6 a 15 A)
- **Eficiência Máxima:** >87% em 220 VCA e 100% carga.
- **Alarmes:** CA anormal, Fusível aberto, UR anormal, Falha ventilador, Desconexão CC (LED).
- **Temperatura de Operação:** 0º a 50º C
- **Dimensões:** 482(L) x 43(A) x 228(P) [mm]
- **Peso:** 4 Kg`
  },
  {
      name: "Sistema Retificador XPS SRXE 825 A / -48 V / 45000 W",
      keywords: ["xps", "retificador", "srxe 825a", "45000w", "-48v", "alta capacidade"],
      details: `- **Características:** Sistema de alta capacidade com até 15 Unidades Retificadoras (URs) de 3000 W.
- **Altura:** 13U
- **Gerenciamento:** Remoto via Ethernet (web browser, SNMP v2), com aviso de alarmes via e-mails e traps.
- **Baterias:** Comunicação com BMS de Bateria Lítio (LiFePO), compensação de tensão por temperatura.
- **Configurações:** Disponível com 12 URs (660 A, 36000 W) ou 15 URs (825 A, 45000 W)
- **Entrada CA:** Trifásico, 380 VCA + neutro
- **Saída CC:** -48 VCC
- **Potência Máxima:** 45000 W (com 15 URs)
- **Eficiência Máxima:** > 96%
- **Alarmes:** Desconexão bateria, CA anormal, Fusível interrompido, UR anormal, Falha USCC.
- **Temperatura de Operação:** -40 °C a +75°C (com redução de potência acima de 55°C)
- **Dimensões:** 483(L) x 577(A) x 566(P) [mm]
- **Peso:** 60 Kg`
  },
  {
      name: "Sistema Retificador XPS SRXE 330 A / -48 V / 18000 W",
      keywords: ["xps", "retificador", "srxe 330a", "18000w", "-48v"],
      details: `- **Características:** Sistema com até 6 URs de 3000 W.
- **Altura:** 8U
- **Entrada CA:** Ampla e configurável - 220 VCA trifásico, 380 VCA + neutro, 220 VCA mono ou bifásico.
- **Gerenciamento:** Remoto via Ethernet (web browser, SNMP v2).
- **Baterias:** Comunicação com BMS de Bateria Lítio (LiFePO).
- **Saída CC:** -48 VCC (-54 VCC nominal)
- **Potência Máxima:** 18000 W
- **Corrente Máxima:** 330 A
- **Eficiência Máxima:** > 96%
- **Alarmes:** Desconexão bateria, CA anormal, Fusível interrompido, UR anormal, Falha USCC.
- **Temperatura de Operação:** -40 °C a 60 °C
- **Dimensões:** 482(L) x 354,8(A) x 423(P) [mm]
- **Peso:** 30 Kg`
  },
  {
      name: "Sistema Retificador XPS SRXE 275 A / -48 V / 15000 W",
      keywords: ["xps", "retificador", "srxe 275a", "15000w", "-48v", "conexões frontais", "conexões traseiras"],
      details: `- **Características:** Sistema com até 5 URs de 3000 W cada, gerenciamento remoto e comunicação com BMS de Lítio. Certificação Anatel.
- **Configurações:** Disponível com conexões frontais (altura 4U) ou traseiras (altura 2U).
- **Dados Gerais:**
  - **Saída CC:** 275 A @ -54 VCC
  - **Potência Máxima:** 15000 W
  - **Eficiência Máxima:** 96%
  - **Entrada CA:** Trifásico 220 VCA ou 380 VCA
  - **Temperatura de Operação:** -40º a 70 °C`
  },
  {
      name: "Sistema Retificador XPS SRXE 220 A / -48 V / 12000 W",
      keywords: ["xps", "retificador", "srxe 220a", "12000w", "-48v", "conexões frontais"],
      details: `- **Características:** Sistema com até 4 URs de 3000W, completo com apenas 2U de altura.
- **Modelo:** Conexões Frontais
- **Gerenciamento:** Remoto via Ethernet, comunicação com BMS Lítio.
- **Certificação:** Anatel.
- **Saída CC:** 220 A @ -48 VCC
- **Potência Máxima:** 12000 W
- **Eficiência Máxima:** 96%
- **Entrada CA:** 220 VCA Individual por UR.
- **Temperatura de Operação:** -40 °C a 70 °C
- **Dimensões:** 449(L) x 89(A) x 402(P) [mm]
- **Peso:** 17,2 kg`
  },
  {
      name: "Sistemas Retificadores Compactos XPS SRX 120 A e SRX 80 A",
      keywords: ["xps", "retificador", "srx 120a", "srx 80a", "6480w", "4320w", "-48v"],
      details: `- **Características:** Sistema compacto de 2U com até 4 URs de 30 A. Gerenciamento remoto e comunicação BMS.
- **Modelo SRX 120 A / -48 V / 6480 W:**
  - **Corrente Nominal:** 120 A (com 4 URs e entrada 170 a 300 VCA)
  - **Entrada:** 220V/127V
- **Modelo SRX 80 A / -48 V / 4320 W:**
  - **Corrente Nominal:** 80 A (com 4 URs e entrada 90 a 170 VCA)
  - **Entrada:** 220V/127V (com redução de potência)
- **Dados Gerais:**
  - **Eficiência:** 94,3%
  - **Temperatura de Operação:** -40° a 60 °C
  - **Dimensões:** 482(L) x 88,1(A) x 300(P) [mm]
  - **Peso Total:** 12,75 kg`
  },
  {
      name: "Sistema Retificador XPS SRXE 110 A / -48 V / 6000 W",
      keywords: ["xps", "retificador", "srxe 110a", "6000w", "-48v"],
      details: `- **Características:** Sistema completo e compacto com apenas 1U de altura, com até 2 URs de 3000W.
- **Gerenciamento:** Remoto via Ethernet, comunicação com BMS Lítio.
- **Certificação:** Anatel.
- **Saída CC:** 110 A @ -54 VCC
- **Potência Máxima:** 6000 W
- **Eficiência Máxima:** 96,3%
- **Entrada CA:** 220 VCA individual por UR.
- **Temperatura de Operação:** -40° a 60 °C
- **Dimensões:** 482(L) x 43,5(A) x 399(P) [mm]
- **Peso:** 8,9 kg`
  },
  {
      name: "Sistemas Retificadores Compactos XPS SRX 60 A / -48 V / 3200 W",
      keywords: ["xps", "retificador", "srx 60a", "3200w", "-48v"],
      details: `- **Características:** Sistema completo com 1U de altura, com até 2 URs de 30 A.
- **Gerenciamento:** Remoto via Ethernet, comunicação com BMS Lítio.
- **Saída CC:** 60 A (com 2 URs e entrada 170 a 300 VCA) ou 40 A (com 2 URs e entrada 110 a 170 VCA).
- **Potência Máxima:** 3200 W
- **Eficiência:** 94,3%
- **Entrada CA:** 220V/127V individual por UR.
- **Temperatura de Operação:** -40°C a 60 °C
- **Dimensões:** 482 (L) x 43,5 (A) x 306,8 (P) [mm]
- **Peso Total:** 6,6 kg`
  },
  {
    name: "Inversor XPS CC/CA 48 VCC / 127 VCA - 600W",
    keywords: ["xps", "inversor", "600w", "48vcc", "127vca", "senoidal"],
    details: `- **Potência:** 600 W (750 VA)
- **Entrada:** 48 VCC (faixa: 42 VCC a 60 VCC)
- **Saída:** 127 VCA, onda senoidal pura
- **Tomadas:** 3 tomadas padrão 10 A
- **Características:** Montagem em rack 19" (1U), ventilação forçada, alarme por contato seco, sinalização por LED, Fator de Potência 0,8.
- **Proteções:** Curto-circuito, sobrecarga, sobretemperatura, subtensão e sobretensão de entrada, inversão de polaridade.`
  },
  {
    name: "Inversor XPS CC/CA 48 VCC / 220 VCA - 1000W",
    keywords: ["xps", "inversor", "1000w", "1250va", "48vcc", "220vca", "senoidal"],
    details: `- **Potência:** 1000 W (1250 VA)
- **Entrada:** 48 VCC (faixa: 42 VCC a 60 VCC)
- **Saída:** 220 VCA, onda senoidal pura
- **Eficiência:** > 90 % @ 54 VCC
- **Características:** Montagem em rack 19" (1U), Fator de Potência 0,8, sinalização por barra de LED.
- **Proteções:** Sobrecarga, curto-circuito, sobretensão e subtensão na entrada, sobretemperatura, inversão de polaridade.
- **Alarme:** Contato seco de relé para falha.`
  },
  {
    name: "Inversores XPS CC/CA 48 VCC / 220 VCA - 2000W e 3000W",
    keywords: ["xps", "inversor", "2000w", "3000w", "2500va", "3750va", "48vcc", "220vca", "senoidal"],
    details: `- **Potências:** 2000 W (2500 VA) e 3000 W (3750 VA)
- **Entrada:** 48 VCC (faixa: 42 VCC a 60 VCC)
- **Saída:** 220 VCA, onda senoidal pura
- **Tomadas:** 2 tomadas padrão 10 A
- **Eficiência:** >90% @ 54 Vcc
- **Características:** Montagem em rack 19" (1U), sinalização de consumo por BAR GRAPH, Fator de Potência 0,8.
- **Proteções:** Curto-circuito na saída, sobretemperatura, sobrecarga, subtensão e sobretensão na entrada.
- **Alarme:** Contato seco em caso de falha.`
  },
  {
    name: "Inversores XPS CC/CA 125 VCC / 220 VCA - 1000W, 2000W e 3000W",
    keywords: ["xps", "inversor", "1000w", "2000w", "3000w", "125vcc", "220vca", "senoidal"],
    details: `- **Potências:** 1000 W (1250 VA), 2000 W (2500 VA), 3000 W (3750 VA)
- **Entrada:** 125 Vcc (faixa: 105 Vcc a 145 Vcc)
- **Saída:** 220 Vca, onda senoidal pura
- **Tomadas:** Padrão 10 A (3 nos modelos 1000W, 2 nos modelos 2000/3000W) e uma saída por borne.
- **Eficiência:** ≥91 % @ 125 Vcc
- **Características:** Montagem em rack 19” (1U), ventilação forçada, Fator de Potência 0,8, sinalização de consumo por barra de LED.
- **Proteções:** Curto-circuito, sobrecarga, sobretemperatura (com rearme automático), subtensão e sobretensão de entrada (com rearme automático), inversão de polaridade.
- **Alarme:** Contato seco em caso de falha.`
  },
  {
    name: "Conversores XPS SCX 48 VCC / 24 VCC",
    keywords: ["xps", "conversor", "dc-dc", "scx", "48v", "24v"],
    details: `- **Modelos:** Corrente de saída de 10 A, 20 A, ou 30 A.
- **Entrada:** 41 a 60 VCC
- **Saída:** 24 VCC
- **Proteções:** Sobretensão (entrada/saída), subtensão (entrada/saída), sobretemperatura, inversão de polaridade, sobrecorrente de saída.
- **Resfriamento:** Forçado (Cooler)
- **Dimensões:** 483 x 89 x 270mm`
  },
  {
    name: "Conversor XPS SCX 125 VCC / 24 VCC - 15A",
    keywords: ["xps", "conversor", "dc-dc", "scx", "125v", "24v", "15a"],
    details: `- **Entrada:** 125 VCC (faixa: 100 a 300 VCC)
- **Saída:** 27 VCC (flutuação, ajustável 23 a 28 VCC)
- **Corrente de Saída:** 15 A
- **Alarmes:** Contato seco (Falha Ventilação, Falha CC, Falha UR, Fusível) e Visuais.
- **Características:** Compensação de temperatura para carga de bateria, desconexão de bateria por subtensão.
- **Resfriamento:** Forçado (Cooler)
- **Altura:** 1U
- **Dimensões:** 482 x 45 x 220 mm`
  },
  {
    name: "Conversor XPS SCX 125 VCC / 48 VCC - 20A a 80A",
    keywords: ["xps", "conversor", "dc-dc", "scx", "125v", "48v", "gerenciável"],
    details: `- **Capacidade:** Configurável de 20 A (1 UC) a 80 A (4 UCs)
- **Altura:** 2U
- **Entrada:** 125 VCC (faixa: 100 a 400 VCC) por Unidade Conversora (UC).
- **Saída:** 54 VCC (flutuação, ajustável 44 a 58 VCC)
- **Gerenciamento:** Remoto via web browser e SNMP, com histórico de eventos, alarmes via e-mail/traps.
- **Características:** Teste de simetria e autonomia de baterias, 7 saídas de relé e 5 entradas digitais para infraestrutura.
- **Rendimento:** 92,97 %
- **Temperatura de Operação:** -40º a 60°C`
  },
  {
    name: "XPS - Chave Estática de Transferência",
    keywords: ["xps", "chave estática", "chave de transferência", "alimentação contínua"],
    details: `- **Função:** Garante alimentação contínua para os equipamentos, conectando duas fontes de energia (principal e auxiliar) e comutando automaticamente entre elas em caso de falha.
- **Tempo de Comutação:** Típico de 16 milissegundos.
- **Operação:** A transferência para a fonte reserva é automática, com reversão automática quando a fonte principal retorna.
- **Modelos e Capacidades:**
  - **Entrada/Saída 220 VCA:** Potência de 3000 W (Disjuntor de 16 A).
  - **Entrada/Saída 127 VCA:** Potência de 1500 W (Disjuntor de 16 A).
- **Saídas:** Três tomadas frontais padrão 10 A e um borne frontal para 20 A.
- **Alarme:** Contato seco de relé (NA) em caso de falha.`
  },
  {
    name: "XPS - Quadros de Distribuição",
    keywords: ["xps", "quadro de distribuição", "qdca", "qdcc", "pdu", "disjuntor"],
    details: `### QDCA (Quadro de Distribuição de Corrente Alternada)
- **Altura:** 1U, padrão Rack 19".
- **Características:** Comporta até 3 disjuntores bipolares (1 geral + 2 saídas), possui Protetor contra Surto (DPS) nas fases de entrada com monitoramento de status.
- **Configurações:**
  - Geral 32A, Saídas 2x 16A.
  - Geral 40A, Saídas 2x 20A.


### QDCC (Quadro de Distribuição de Corrente Contínua)
- **Função:** Distribuição de energia contínua para diversas cargas.
- **Sinalização:** Envia sinalização de "Disjuntor Aberto" para sistemas retificadores XPS.
- **Modelos 1U:**
  - **Capacidade:** Até 8 disjuntores.
  - **Conexões:** Entrada por Borne Sak (16 mm²), Saídas por Bornes (10 mm²).
  - **Capacidades de Disjuntores:** 6A, 10A, 16A, 20A, 25A por saída.
- **Modelos 3U:**
  - **Capacidade:** Até 22 disjuntores.
  - **Conexões:** Entrada por barramento.
  - **Configurações:** Múltiplas combinações de disjuntores (ex: 10x16A + 6x16A bifásico; 22x32A; 5x10A + 10x16A + 5x25A, etc.).
  - **Versão A+B:** Barramentos duplos para redundância.`
  },
  {
    name: "Lacerda Sistemas de Energia - Nobreaks e Soluções",
    keywords: ["lacerda", "nobreak", "ups", "bateria vrla", "filtro de linha", "fonte ups-30", "new orion", "proteus", "senoidal", "new ms", "tbb", "semafórico", "sai", "modular"],
    details: `- **Visão Geral:** Com 25 anos de atuação, a Lacerda é especialista em nobreaks corporativos (600 VA a 600 kVA), com assistência técnica própria e presença nacional. Possui sede em São Bernardo do Campo/SP e fábrica em Cambuí/MG.
---
### Tecnologia de Nobreak – Interativo
- **Descrição:** Similar aos nobreaks offline, porém com um estabilizador de tensão na saída. Em caso de falta de energia, o inversor é ativado com tempo de transferência menor que 4 milissegundos.
---
### Tecnologia de Nobreak – Online Dupla Conversão
- **Descrição:** A energia é convertida duas vezes (CA -> CC -> CA), garantindo uma saída de energia limpa e estável, independente da entrada.
- **Componentes:** Retificador, Carregador de bateria, Inversor, Chave estática, By-Pass manual.
---
### LINHA DE PRODUTOS
#### Bateria VRLA
- **Descrição:** Bateria selada, regulada por válvula, que não necessita de reposição de água e pode operar em várias posições. Apresenta reduzida auto descarga e não exala gases tóxicos.
#### Filtro de linha
- **Descrição:** Protege equipamentos contra surtos elétricos e atenua ruídos RFI/EMI. Possui estrutura metálica, chave microdisjuntor, tomadas espaçadas padrão NBR 14136 e fusível de proteção.
#### Fonte UPS-30
- **Descrição:** Fonte 12 Vdc com bateria de íons de lítio integrada que garante o funcionamento em caso de queda de energia. Bivolt automática, com partida sem rede (Cold start) e autonomia de até 180 min para câmeras IP.
#### Nobreak – New Orion Gate II
- **Aplicação:** Equipamentos eletrônicos e automatizadores (portões basculante, pivotante, deslizante e cancelas).
- **Características:** 1500 VA – 24 Vdc (para 2 baterias externas de até 90 Ah). Partida sem rede, rearme automático, forma de onda senoidal por aproximação.
#### Nobreak – New Orion Premium
- **Aplicação:** Home office.
- **Características:** Entrada monovolt ou bivolt, fusível regenerativo, 3, 6 ou 9 tomadas, partida sem rede, rearme automático, forma de onda senoidal por aproximação, baterias VRLA internas.
#### Nobreak – New Orion Premium - CEB (com expansão de bateria)
- **Aplicação:** Home office que necessita de maior autonomia.
- **Características:** Entrada bivolt, conector para expansão de autonomia (suporta baterias externas de até 45 Ah), 6 ou 9 tomadas.
#### Nobreak – Proteus Senoidal
- **Aplicação:** Equipamentos sensíveis e de alta precisão.
- **Características:** Forma de onda Senoidal pura, conector para expansão de autonomia, comunicação USB (opcional SNMP), painel LCD.
#### Nobreak – NEW MS
- **Tecnologia:** Online dupla conversão.
- **Características:** Microprocessado DSP, entrada bivolt, tecnologia IGBT, By-Pass automático, 6 tomadas NBR 14136.
#### Nobreak – TBB
- **Tecnologia:** Online dupla conversão.
- **Características:** Microprocessado DSP, modo ECO, tecnologia IGBT, chave estática, By-Pass automático, painel LCD, opção de paralelismo, conexão por bornes ou tomadas.
#### Nobreak – Semafórico
- **Aplicação:** Ambientes externos de alta criticidade (ex: semáforos).
- **Características:** Potência 1 a 2 kVA, Senoidal pura, gabinete com grau de proteção IP-54, travas antivandalismo, interface inteligente RS-232/USB (opcional SNMP).
#### Nobreak – Proteus R/T
- **Formato:** Conversível Rack 19” (2U) ou Torre.
- **Tecnologia:** Online dupla conversão.
- **Características:** Fator de potência 0,9, painel LCD, tecnologia IGBT, chave estática, By-Pass automático.
#### Nobreak – SAI
- **Tecnologia:** Online dupla conversão.
- **Características:** Alto fator de potência (0,99), baixo THDi, tecnologia IGBT, chave estática, By-Pass automático, opção de paralelismo. Potência de até 100 kVA.
#### Nobreak – SAI MODULAR
- **Tecnologia:** Online dupla conversão, modular.
- **Características:** Módulos de 20 kVA, 30 kVA e 60 kVA. Alta escalabilidade, fator de potência unitário, design modular com baixo MTTR, paralelo redundante N+1 ou N+X, LCD de 5,7”.`
  },
  {
    name: "Seccon - Soluções de Cabeamento Estruturado e Óptico",
    keywords: ["seccon", "patch cord", "cabo de manobra", "cat6", "patch panel", "conector rj45", "pigtail"],
    details: `- **Visão Geral:** A Seccon é uma parceira Greatek que fornece soluções de alta qualidade para cabeamento estruturado e óptico, com produtos certificados pela Anatel e que atendem a diretivas internacionais como a RoHS.
---
### Cabo de Manobra CAT6 (Patch Cord)
- **Aplicação:** Transmissão de dados em cabeamento estruturado.
- **Características:**
  - Montado com plugs RJ45 (Cat.6) e cabo U/UTP 4 pares de Cobre flexível (24awg).
  - Capa com tratamento antichama LSZH.
  - Boot injetada com proteção para o clipe do plug.
  - Padrão de ligação 568A e 568B.
  - Certificado Anatel e atende à Diretiva RoHS.
- **Modelos/Tamanhos (0.5m a 30m):**
  - **Série 1:** CY-5128-CAT6-*
  - **Série 2:** WT-2038B-CAT6-*
---
### Patch Panel CAT6
- **Características Comuns:** Chassis metálico com pintura epóxi preta, acompanha kit Porca Gaiola e etiquetas. Recomendado para uso interno.
- **Modelo 48 Portas (2U):**
  - Painel Reto, 48 portas.
  - Ocupa 2U em Rack de 19".
  - Acompanha duas peças de Guia Traseira Organizadora.
- **Modelo 24 Portas (1U):**
  - Painel Reto, 24 portas.
  - Ocupa 1U em Rack de 19".
  - Acompanha Guia Organizadora Traseira.
---
### Modular Plug – RJ45 – CAT6
- **Tipo:** Conector Macho, 8 vias, 8 contatos.
- **Aplicação:** Montagem de cabo de rede / patch cord.
- **Diferencial:** Possui guias internas fixas que dispensam o uso de guias externas.
- **Compatibilidade:** Cabo UTP de até 23awg.
---
### Pigtail Óptico (LSZH)
- **Tipo:** Extensão Óptica Simplex (Monomodo SM ou Multimodo MM).
- **Construção:** Fibra com revestimento primário em Acrilato e secundário Tight Buffer.
- **Capa:** Tratamento LSZH (Low Smoke Zero Halogen).
- **Especificações:** Bitola 0,9mm, tamanho padrão de 1,5m. Conectorizado em apenas uma das pontas.
- **Aplicação:** Montagem de DIO (Distribuidor Interno Óptico) ou PTO (Ponto de Terminação Óptica).
- **Variedades Disponíveis:**
  - **LC (UPC) MM OM2:** 3D-16120501 / MC-07.05.014915 / NKLT-NIPT1351W111.5M
  - **LC (UPC) MM OM1:** 3D-16120502 / WT-P-3-C-LC-LC-1.5-OR / NKLT-NIPT1341W111.5M
  - **LC (UPC) SM:** 3D-16120503 / MC-07.01.014915 / NKLT-NIPT1311W111.5M
  - **SC (UPC) MM OM2:** 3D-16120504 / MC-07.05.012915 / NKLT-NIPT1151W111.5M
  - **SC (UPC) MM OM1:** 3D-16120505 / NKLT-NIPT1141W111.5M
  - **SC (UPC) SM:** 3D-16120506 / MC-07.01.012915 / NKLT-NIPT1111W111.5M
  - **SC (APC) SM:** NKLT-NIPT1111G111.5M-N
  - **LC (UPC) MM OM3:** NKLT-NIPT1362A1311.5M
  - **LC (UPC) MM OM4:** NKLT-NIPT1372A1311.5M
  - **LC (APC) SM:** NKLT-NIPT1311W211.5M`
  },
  {
    name: "Cabo Óptico DROP 1FO 1KM (2Flex)",
    keywords: ["2flex", "cabo óptico", "drop", "1fo", "low friction"],
    details: `- **Marca Parceira:** 2Flex
- **Revestimento:** Externo de baixo atrito (Low Friction).
- **Aplicação:** Instalação aérea de acesso ao assinante (Tipo Drop) em rede FTTH.
- **Indicação:** Utilizado da caixa de emenda até o assinante.
- **Vãos:** Suporta vãos de até 80 metros.`
  },
  {
    name: "Cabo Óptico ASU 80 12FO (2Flex)",
    keywords: ["2flex", "cabo óptico", "asu", "asu 80", "12fo", "auto-sustentado"],
    details: `- **Marca Parceira:** 2Flex
- **Tipo:** Auto-sustentado de 12 fibras ópticas.
- **Vãos:** Indicado para vãos de até 80 metros.
- **Proteção da Fibra:** Fibras posicionadas em um tubo loose cheio de gel para proteção contra umidade.
- **Resistência Mecânica:** Camada de proteção com fios de aramida.
- **Revestimento Externo:** Capa de polietileno (PE) com proteção UV para uso outdoor.
- **Estrutura Detalhada:**
    - **Elemento Central de Força (FRP):** Diâmetro 2.0mm ±0.2mm.
    - **Tubo Loose:** Diâmetro Ф2.2mm ±0.2mm (Material PBT).
    - **Capa Externa:** Espessura 1.8mm ±0.2mm (Material PE).`
  },
  {
    name: "Cabo Óptico ASU 80 6FO (2Flex)",
    keywords: ["2flex", "cabo óptico", "asu", "asu 80", "6fo", "auto-sustentado"],
    details: `- **Marca Parceira:** 2Flex
- **Tipo:** Auto-sustentado de 6 fibras ópticas.
- **Vãos:** Indicado para vãos de até 80 metros.
- **Proteção da Fibra:** Fibras agrupadas e protegidas em uma unidade básica (tubo loose) com gel.
- **Resistência Mecânica:** Excelente resistência à tração devido a fios de aramida e dois elementos de sustentação FRP acordoados à unidade óptica.
- **Revestimento Externo:** Capa de polietileno (PE).`
  },
  {
    name: "OLT GPON Pizza-box de 1 Porta DeltaStream (DS-P7001-01)",
    keywords: ["olt", "gpon", "pizza-box", "1 porta", "ds-p7001-01", "deltastream", "tp-link"],
    details: `- **Marca:** TP-Link
- **Porta GPON:** Suporta razão de divisão 1:128 para até 128 ONTs.
- **Portas de Uplink:** 1x porta SFP+ 10G, 1x porta 2.5 GbE.
- **Alimentação:** DC e 802.3at PoE.
- **Funções:** L2/L2+ (Roteamento Estático, IGMP Snooping).
- **Gerenciamento:** DeltaStream PON Management System (DPMS), SNMP, CLI, Web UI.`
  },
  {
    name: "OLT GPON Pizza-box de 8 Portas DeltaStream (DS-P7001-08)",
    keywords: ["olt", "gpon", "pizza-box", "8 portas", "ds-p7001-08", "deltastream", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas GPON:** 8 portas, suporta até 1024 ONTs (1:128 por porta).
- **Portas de Uplink:** 2x portas 10GE SFP+, 1x porta gigabit.
- **Alimentação:** Fontes duplas redundantes AC+DC hot-swap.
- **Funções:** L2 completas e L3 avançadas (Roteamento estático, IGMP Snooping).
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "OLT GPON Pizza-box de 16 Portas DeltaStream (DS-P7001-16)",
    keywords: ["olt", "gpon", "pizza-box", "16 portas", "ds-p7001-16", "deltastream", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas GPON:** 16 portas, suporta até 2048 ONTs (1:128 por porta).
- **Portas de Uplink:** 4x portas 10GE SFP+, 2x portas gigabit.
- **Alimentação:** Fontes duplas redundantes hot-swap (AC, DC ou mista).
- **Funções:** L2 completas e L3 avançadas (Static Routing, IGMP Snooping).
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "OLT Chassi X2 XGS-PON e GPON de 32 Portas (DS-P8000-X2)",
    keywords: ["olt", "chassi", "xgs-pon", "gpon", "32 portas", "ds-p8000-x2", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas PON:** 32 portas (2x placas de serviço), suporta GPON ou combo XGS-PON & GPON.
- **Escalabilidade:** Razão de divisão 1:128 (GPON) e 1:256 (XGS-PON).
- **Confiabilidade:** Unidades de controle principais duplas com troca automática.
- **Portas de Uplink:** 6x portas 10G SFP+ por unidade de controle.
- **Alimentação:** Fontes duplas AC+DC.
- **Funções:** L2 e L3 avançadas.
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.
- **Compatibilidade:** DS-LGPA-08 e DS-LGPA-16.`
  },
  {
    name: "Placa de Serviço XGS-PON e GPON Combo de 16 Portas (DS-LSGA-16)",
    keywords: ["placa de serviço", "olt", "chassi", "xgs-pon", "gpon", "16 portas", "ds-lsga-16", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas PON:** 16 portas combinadas XGS-PON e GPON.
- **Escalabilidade:** Razão de divisão até 1:128 (GPON) e 1:256 (XGS-PON) por porta.
- **Implantação:** Compatível com OLTs de chassi da TP-Link, suporta hot swapping.
- **Funções:** L2 e L3 avançadas.
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "Placa de Serviço OLT Chassi com 8 Portas GPON (DS-LGPA-08)",
    keywords: ["placa de serviço", "olt", "chassi", "gpon", "8 portas", "ds-lgpa-08", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas GPON:** 8 portas (Downstream 2.488 Gbps, Upstream 1.244 Gbps por porta).
- **Escalabilidade:** Relação de divisão 1:128 por porta.
- **Implantação:** Compatível com OLTs de chassi da TP-Link, suporta hot swapping.
- **Funções:** L2 e L3 avançadas.
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "Placa de Serviço OLT Chassi com 16 Portas GPON (DS-LGPA-16)",
    keywords: ["placa de serviço", "olt", "chassi", "gpon", "16 portas", "ds-lgpa-16", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas GPON:** 16 portas (Downstream 2.488 Gbps, Upstream 1.244 Gbps por porta).
- **Escalabilidade:** Relação de divisão 1:128 por porta.
- **Implantação:** Compatível com OLTs de chassi da TP-Link, suporta hot swapping.
- **Funções:** L2 e L3 avançadas.
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "OLT GPON Pizza-box de 4 Portas DeltaStream (DS-P7001-04)",
    keywords: ["olt", "gpon", "pizza-box", "4 portas", "ds-p7001-04", "deltastream", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas GPON:** 4 portas, suporta até 512 ONTs (1:128 por porta).
- **Portas de Uplink:** 1x porta 10GE SFP+, 1x porta gigabit.
- **Alimentação:** Fontes duplas redundantes AC+DC.
- **Funções:** L2 e L3 avançadas (Roteamento estático, IGMP Snooping).
- **Gerenciamento:** DPMS, SNMP, CLI, Web UI.`
  },
  {
    name: "ONT Terminal XPON VoIP Wi-Fi 5 Dual Band AC1200 (XC220-G3v)",
    keywords: ["ont", "xpon", "voip", "wi-fi 5", "ac1200", "xc220-g3v", "tp-link"],
    details: `- **Marca:** TP-Link
- **Wi-Fi:** AC1200 Dual Band (867 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** 4x Gigabit LAN, 1x FXS (VoIP).
- **Tecnologia PON:** XPON (GPON/EPON).
- **Padrão GPON:** ITU-T G.984/G.988 (Down 2.488Gbps, Up 1.244Gbps).
- **Gerenciamento Remoto:** OMCI, TR-069.
- **Recursos:** Suporta VLAN, 802.1q, IPTV, Compatível com EasyMesh.`
  },
  {
    name: "ONT Terminal XPON Wi-Fi 5 Dual Band AC1200 (XC220-G3)",
    keywords: ["ont", "xpon", "wi-fi 5", "ac1200", "xc220-g3", "tp-link"],
    details: `- **Marca:** TP-Link
- **Wi-Fi:** AC1200 Dual Band (867 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** 4x Gigabit LAN.
- **Tecnologia PON:** XPON (GPON/EPON).
- **Segurança:** WPA3.
- **Recursos:** Compatível com EasyMesh, IGMP Proxy/Snooping para IPTV, design compacto de bandeja de fibra.
- **Gerenciamento:** OMCI, TR-069, App Aginet.`
  },
  {
    name: "ONT Terminal XPON Wi-Fi 6 Dual Band AX3000 (XX535)",
    keywords: ["ont", "xpon", "wi-fi 6", "dual-band", "ax3000", "xx535", "tp-link", "easy-mesh", "easymesh"],
    details: `- **Marca:** TP-Link
- **Nota Importante:** Este modelo substitui o antigo modelo XX530v V2, que foi descontinuado. A TP-Link agora trabalha exclusivamente com o modelo XX535 para esse segmento, mas o modelo XX530v V2 segue na base marcado como descontinuado apenas para fins de comparação técnica.
- **Wi-Fi:** Wi-Fi 6 Dual Band AX3000 (velocidades de Wi-Fi de até 3 Gbps em duas bandas).
- **Cobertura ampliada:** Antenas de alto desempenho e tecnologia de beamforming combinam-se para estender uma rede Wi-Fi forte e confiável.
- **Portas:** Conectividade cabeada Gigabit (1 porta WAN/LAN GbE e 2 portas LAN GbE oferecem acesso rápido e flexível).
- **Tecnologia PON:** Modos duplos XPON (compatível com os modos GPON e EPON).
- **Recursos Chave:** Compatível com EasyMesh (crie uma rede mesh inteligente com cobertura contínua), tecnologias OFDMA e MU-MIMO (aumentam a capacidade para mais dispositivos conectados de forma simultânea), criptografia WPA3, Multi-SSID e controles parentais.
- **Fácil Configuração:** Configuração e gerenciamento simplificados via poderoso aplicativo Aginet.
- **Gerenciamento Remoto:** Compatível com os protocolos OMCI, TR-069, TR-098, TR-181, TR-111 e TR-143.`
  },
  {
    name: "ONT Terminal XPON VoIP Wi-Fi 6 Dual Band AX3000 (XX530v V2) [DESCONTINUADO]",
    keywords: ["ont", "xpon", "voip", "wi-fi 6", "ax3000", "xx530v v2", "xx530v", "xx530", "tp-link", "descontinuado"],
    details: `- **Marca:** TP-Link (Modelo Anterior/Descontinuado para Comparação)
- **Nota Importante:** Modelo de portfólio anterior, descontinuado e mantido na base apenas para fins comparativos com a nova ONT XX535.
- **Wi-Fi:** Wi-Fi 6 (802.11ax) Dual-Band AX3000 (2402 Mbps em 5 GHz + 574 Mbps em 2.4 GHz).
- **Portas:** 4x Portas LAN Gigabit, 1x Porta FXS (VoIP).
- **Tecnologia PON:** XPON (GPON/EPON).
- **Recursos Chave:** EasyMesh, OFDMA, MU-MIMO, Beamforming, WPA3.
- **Gerenciamento Remoto:** OMCI, TR-069, TR-181, TR-369 (USP) e Aginet ACS.
- **Diferenciais vs XX535:** O XX530v V2 contava com 1 porta FXS (VoIP) de telefonia analógica e um total de 4 portas LAN físicas RJ45, enquanto a nova ONT XX535 não possui porta FXS (não tem telefonia analógica) e possui 3 portas RJ45 físicas.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX5400 (Archer AX72)",
    keywords: ["roteador", "wi-fi 6", "ax5400", "archer ax72", "tp-link", "homesheld", "onemesh"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** AX5400 (4804 Mbps em 5 GHz com HE160, 574 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 4x Gigabit LAN, 1x USB 3.0.
- **Antenas:** 6 antenas externas de alto desempenho.
- **Recursos:** 4T4R, OFDMA, MU-MIMO, Beamforming, HomeShield, OneMesh.
- **CPU:** Qualcomm 64-bit.
- **Gerenciamento:** App Tether.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX3000 (Archer AX53)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "archer ax53", "tp-link", "homesheld", "onemesh"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** AX3000 (2402 Mbps em 5 GHz com 160MHz, 574 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 4x Gigabit LAN.
- **Antenas:** 4 antenas externas de alto desempenho.
- **Recursos:** OFDMA, Beamforming, HomeShield, OneMesh, WPA3, Target Wake Time.
- **CPU:** Dual-Core.
- **Gerenciamento:** App Tether.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX1500 (Archer AX12)",
    keywords: ["roteador", "wi-fi 6", "ax1500", "archer ax12", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** AX1500 (1201 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 3x Gigabit LAN.
- **Antenas:** 4 antenas externas.
- **Recursos:** OFDMA, MU-MIMO, Beamforming, WPA3, Target Wake Time.
- **Gerenciamento:** App Tether.`
  },
  {
    name: "Roteador Wi-Fi 6 Multi-Gigabit Dual Band AX3000 com Porta 2.5G (Archer AX55 Pro)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "multi-gigabit", "2.5g", "archer ax55 pro", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** AX3000 (2402 Mbps em 5 GHz com 160MHz, 574 Mbps em 2.4 GHz).
- **Portas:** 1x 2.5 Gbps WAN/LAN, 1x 1 Gbps WAN/LAN, 3x Gigabit LAN, 1x USB 3.0.
- **Antenas:** 4 antenas de alto ganho com 4x FEM de alta potência.
- **Recursos:** OFDMA, Beamforming, HomeShield, EasyMesh, Cliente VPN, Smart Connect, compatível com Alexa.
- **CPU:** Qualcomm com 512 MB de RAM.`
  },
  {
    name: "Roteador Gamer Wi-Fi 7 Dual-Band BE3600 (Archer GE230)",
    keywords: ["roteador", "gamer", "wi-fi 7", "be3600", "archer ge230", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** BE3600 (2882 Mbps em 5 GHz, 688 Mbps em 2.4 GHz).
- **Portas:** 2x 2.5 Gbps (1 WAN/LAN, 1 LAN dedicada para jogos).
- **Recursos Wi-Fi 7:** Multi-Link Operation (MLO), 4K-QAM.
- **Recursos Gamer:** Aceleração Turbo Game, Painel Gamer Dedicado, iluminação RGB.
- **Recursos Gerais:** EasyMesh, HomeShield.
- **CPU:** Quad-Core.`
  },
  {
    name: "Roteador Gigabit Wi-Fi Dual Band 7 BE3600 (Archer BE220)",
    keywords: ["roteador", "wi-fi 7", "be3600", "archer be220", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** BE3600 (2882 Mbps em 5 GHz, 688 Mbps em 2.4 GHz).
- **Portas:** 1x 1 Gbps WAN, 4x 1 Gbps LAN.
- **Recursos Wi-Fi 7:** Multi-Link Operation (MLO), Multi-RUs, 4K-QAM.
- **Recursos Gerais:** EasyMesh, HomeShield, Cliente e Servidor VPN.
- **Antenas:** 4 antenas externas com Beamforming.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX3000 (EX511)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "ex511", "easymesh", "tr-069", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AX3000 (2402 Mbps em 5 GHz, 574 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 4x Gigabit LAN.
- **Recursos:** OFDMA, MU-MIMO, EasyMesh, WPA3, Multi-SSID, Controle de Pais.
- **Gerenciamento Remoto:** TAUC (TP-Link Aginet Unified Cloud), TR-069, TR-098, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX1500 (EX141)",
    keywords: ["roteador", "wi-fi 6", "ax1500", "ex141", "easymesh", "tr-069", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AX1500 (1201 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** Gigabit.
- **Recursos:** WiFi 6, OFDMA, MU-MIMO, Beamforming, EasyMesh, WPA3, Target Wake Time.
- **Gerenciamento Remoto:** TR-069, TR-098, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi Dual Band AC750 (Archer C21)",
    keywords: ["roteador", "wi-fi 5", "ac750", "archer c21", "agile config", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** AC750 (433 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** 1x 10/100 Mbps WAN, 4x 10/100 Mbps LAN.
- **Antenas:** 4 antenas externas.
- **Modos:** Roteador, Access Point, Repetidor.
- **Recursos:** Controle dos Pais, Rede de Visitantes, IGMP Proxy/Snooping para IPTV, Agile Config (para provedores).
- **Ideal para:** Planos de internet de até 100 Mega.`
  },
  {
    name: "Roteador Wi-Fi Multimodo 300 Mbps (TL-WR829N)",
    keywords: ["roteador", "n300", "300mbps", "tl-wr829n", "agile config", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** 300 Mbps em 2.4 GHz.
- **Portas:** 1x 10/100 Mbps WAN, 2x 10/100 Mbps LAN.
- **Antenas:** 2 antenas de 5 dBi.
- **Modos:** Roteador, Access Point (AP), Extensor de Alcance (Repetidor), WISP.
- **Recursos:** IPTV (IGMP Proxy/Snooping), Controle dos Pais, Rede para Convidados, Agile Config (para provedores).
- **Ideal para:** Planos de internet de até 100 Mega.`
  },
  {
    name: "Roteador Wi-Fi 7 BE3600 Dual Band (Archer BE230)",
    keywords: ["roteador", "wi-fi 7", "be3600", "archer be230", "2.5g", "tp-link"],
    details: `- **Marca:** TP-Link
- **Velocidade Wi-Fi:** BE3600 (2882 Mbps em 5 GHz, 688 Mbps em 2.4 GHz).
- **Portas:** 1x 2.5 Gbps WAN, 1x 2.5 Gbps LAN, 3x 1 Gbps LAN, 1x USB 3.0.
- **Recursos Wi-Fi 7:** Multi-Link Operation (MLO), Multi-RUs, 4K-QAM.
- **Recursos Gerais:** EasyMesh, HomeShield, Clientes e Servidores VPN.
- **Antenas:** 4 antenas externas com Beamforming.`
  },
  {
    name: "Roteador Wi-Fi 5 Gigabit Dual Band AC1300 (EC225-G5)",
    keywords: ["roteador", "wi-fi 5", "ac1300", "ec225-g5", "easymesh", "tr-069", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AC1300 (867 Mbps em 5 GHz, 400 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 3x Gigabit LAN.
- **Recursos:** MU-MIMO, Beamforming, EasyMesh, WPA3, Controle de Pais.
- **Gerenciamento Remoto:** Aginet ACS, TR-069, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 7 Dual Band BE3600 com Porta 2.5G (EB210 Pro)",
    keywords: ["roteador", "wi-fi 7", "be3600", "eb210 pro", "2.5g", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** BE3600 (2880 Mbps em 5 GHz EHT160, 688 Mbps em 2.4 GHz EHT40).
- **Portas:** 1x 2.5GE WAN, 1x 2.5GE LAN, 3x GE LAN, 1x USB 3.0.
- **Recursos Wi-Fi 7:** Multi-Link Operation (MLO), 4K-QAM, Multi-RUs.
- **Recursos Gerais:** EasyMesh, WPA3, Multi-SSID.
- **Gerenciamento Remoto:** TAUC, TR-069, TR-369.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 7 Dual Band BE3600 (EB210)",
    keywords: ["roteador", "wi-fi 7", "be3600", "eb210", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** BE3600 (2880 Mbps em 5 GHz EHT160, 688 Mbps em 2.4 GHz EHT40).
- **Portas:** 1x Gigabit WAN, 4x Gigabit LAN.
- **Recursos Wi-Fi 7:** Multi-Link Operation (MLO), 4K-QAM, Multi-RUs.
- **Recursos Gerais:** EasyMesh, WPA3, Multi-SSID.
- **Gerenciamento Remoto:** TAUC, TR-069, TR-369.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 6 Dual Band AX3000 (EX521)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "ex521", "easymesh", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AX3000 (2402 Mbps em 5 GHz, 574 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 3x Gigabit LAN.
- **Recursos:** OFDMA, MU-MIMO, EasyMesh, WPA3, Multi-SSID, Controle Parental.
- **Gerenciamento Remoto:** TAUC, TR-069, TR-098, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 6 Dual Band AX1800 (EX220 V2)",
    keywords: ["roteador", "wi-fi 6", "ax1800", "ex220 v2", "easymesh", "aginet", "tp-link"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AX1800 (1201 Mbps em 5 GHz, 574 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 3x Gigabit LAN.
- **Recursos:** OFDMA, MU-MIMO, EasyMesh, WPA3, Multi-SSID, Controles Parentais.
- **Gerenciamento Remoto:** TAUC, TR-069, TR-098, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet.`
  },
  {
    name: "Roteador Wi-Fi 5 Gigabit Dual Band AC1200 (EC220-G5 V3.8)",
    keywords: ["roteador", "wi-fi 5", "ac1200", "ec220-g5", "easymesh", "aginet", "tp-link", "agile config"],
    details: `- **Marca:** TP-Link (linha Aginet para ISPs)
- **Velocidade Wi-Fi:** AC1200 (867 Mbps em 5 GHz, 300 Mbps em 2.4 GHz).
- **Portas:** 1x Gigabit WAN, 4x Gigabit LAN.
- **Recursos:** Beamforming, EasyMesh, WPA3, Controle dos Pais, Multi-SSID.
- **Gerenciamento Remoto:** Aginet ACS, TR-069, TR-181, TR-111, TR-143.
- **Gerenciamento Local:** App Aginet/Tether.
- **Recurso para Provedor:** Aginet Config para customização de configurações padrão.`
  },
  {
    name: "Switch PoE++ Gerenciável L3 Empilhável Omada Pro 48 portas 2.5G (S6500-48MPP6Y)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "poe++", "2.5g", "s6500-48mpp6y", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 48x RJ45 PoE++ de 2.5 Gbps (até 60W/porta), 6x slots SFP28 de 25 Gbps.
- **PoE Budget:** Até 1484 W.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch de Agregação/Núcleo L3 Empilhável Omada Pro 24 Portas 25G (S7500-24Y4C)",
    keywords: ["switch", "l3", "omada pro", "agregação", "25g", "100g", "s7500-24y4c", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 24x slots SFP28 de 25 Gbps, 4x slots QSFP28 de 100 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** Secure Boot, RADSEC, IMPB, Dynamic ARP Inspection.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch de Agregação L3 Empilhável Omada Pro 48 Portas 10G (S7500-48XF4C)",
    keywords: ["switch", "l3", "omada pro", "agregação", "10g", "100g", "s7500-48xf4c", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 48x slots SFP+ de 10 Gbps, 4x slots QSFP28 de 100 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** Secure Boot, RADSEC, IMPB, Dynamic ARP Inspection.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch de Agregação L3 Empilhável Omada Pro 26 Portas 10G (S7500-26XF6Y)",
    keywords: ["switch", "l3", "omada pro", "agregação", "10g", "25g", "s7500-26xf6y", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 26x slots SFP+ de 10 Gbps, 6x slots SFP28 de 25 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** Secure Boot, RADSEC, IMPB, Dynamic ARP Inspection.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch L3 Empilhável Omada Pro 48 Portas 2.5G (S6500-48M6Y)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "2.5g", "25g", "s6500-48m6y", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 48x portas RJ45 de 2.5 Gbps, 6x slots SFP28 de 25 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRF, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação internas fixas, VRRP, ERPS, BFD, M-LAG.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch PoE++ L3 Empilhável Omada Pro 24 portas 2.5G (S6500-24MPP4Y)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "poe++", "2.5g", "25g", "s6500-24mpp4y", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 24x portas PoE++ RJ45 de 2.5 Gbps (até 60W/porta), 4x slots SFP28 de 25 Gbps.
- **PoE Budget:** Até 1440W.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch L3 Empilhável Omada Pro 24 portas 2.5G (S6500-24M4Y)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "2.5g", "25g", "s6500-24m4y", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 24x portas RJ45 de 2.5 Gbps, 4x slots SFP28 de 25 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação fixas internas, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch PoE+ L3 Empilhável Omada Pro 48 Portas Gigabit (S6500-48GP6XF)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "poe+", "gigabit", "10g", "s6500-48gp6xf", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 48x portas Gigabit PoE+ RJ45, 6x slots SFP+ de 10 Gbps.
- **PoE Budget:** Até 1440 W.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch L3 Empilhável Omada Pro 48 Portas Gigabit (S6500-48G6XF)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "gigabit", "10g", "s6500-48g6xf", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 48x portas Gigabit RJ45, 6x slots SFP+ de 10 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação fixas internas, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch PoE+ L3 Empilhável Omada Pro 24 Portas Gigabit (S6500-24GP4XF)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "poe+", "gigabit", "10g", "s6500-24gp4xf", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 24x portas Gigabit PoE+ RJ45, 4x slots SFP+ de 10 Gbps.
- **PoE Budget:** Até 720 W.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação substituíveis, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch L3 Empilhável Omada Pro 24 Portas Gigabit (S6500-24G4XF)",
    keywords: ["switch", "l3", "omada pro", "empilhável", "gigabit", "10g", "s6500-24g4xf", "tp-link"],
    details: `- **Marca:** TP-Link Omada Pro
- **Portas:** 24x portas Gigabit RJ45, 4x slots SFP+ de 10 Gbps.
- **Empilhamento:** Físico.
- **Recursos L3:** OSPF, BGP, IS-IS, VRRP, PIM, ECMP, PBR.
- **Segurança:** MACsec, Secure Boot, RADSEC, IMPB.
- **Alta Disponibilidade:** Duas fontes de alimentação fixas internas, VRRP, ERPS, BFD.
- **Gerenciamento:** Omada SDN (nuvem), Web, CLI, NETCONF.`
  },
  {
    name: "Switch Gigabit de Mesa com 8 portas (LS108G V2)",
    keywords: ["switch", "gigabit", "8 portas", "ls108g", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 8x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, QoS 802.1p/DSCP, Green Technology.
- **Carcaça:** Metal, para mesa ou parede.`
  },
  {
    name: "Switch Gigabit de Mesa com 5 portas (LS105G)",
    keywords: ["switch", "gigabit", "5 portas", "ls105g", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 5x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, QoS 802.1p/DSCP, Green Technology.
- **Carcaça:** Metal, para mesa ou parede.`
  },
  {
    name: "Switch Gigabit de Mesa com 8 Portas (LS1008G V3)",
    keywords: ["switch", "gigabit", "8 portas", "ls1008g", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 8x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, Green Technology, sem ventoinha (silencioso).
- **Carcaça:** Plástico, para mesa ou parede.`
  },
  {
    name: "Switch Gigabit de Mesa com 5 portas (LS1005G V3)",
    keywords: ["switch", "gigabit", "5 portas", "ls1005g", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 5x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, Green Technology, sem ventoinha (silencioso).
- **Carcaça:** Plástico, para mesa ou parede.`
  },
  {
    name: "Switch Fast de Mesa com 8 portas (LS1008)",
    keywords: ["switch", "fast ethernet", "8 portas", "ls1008", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 8x 10/100Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, Green Technology, sem ventoinha (silencioso).
- **Carcaça:** Plástico, para mesa ou parede.`
  },
  {
    name: "Switch Fast Ethernet de Mesa de 5 Portas (LS1005 V2)",
    keywords: ["switch", "fast ethernet", "5 portas", "ls1005", "litewave", "tp-link"],
    details: `- **Marca:** TP-Link LiteWave
- **Portas:** 5x 10/100Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, Green Technology, sem ventoinha (silencioso).
- **Carcaça:** Plástico, para mesa ou parede.`
  },
  {
    name: "Switch Gigabit de Mesa de 8 Portas (TL-SG108 V6)",
    keywords: ["switch", "gigabit", "8 portas", "tl-sg108", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas:** 8x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX, Green Technology, QoS 802.1p/DSCP, IGMP Snooping.
- **Carcaça:** Metal, para mesa ou parede.`
  },
  {
    name: "Switch Gigabit de Mesa de 5 Portas (TL-SG105)",
    keywords: ["switch", "gigabit", "5 portas", "tl-sg105", "tp-link"],
    details: `- **Marca:** TP-Link
- **Portas:** 5x 10/100/1000Mbps RJ45 com Autonegociação.
- **Recursos:** Plug and Play, Auto MDI/MDIX`
  },
  {
    name: "Família de Access Points Omada (EAP)",
    keywords: ["eap", "omada", "tp-link", "access point", "wi-fi 6", "wi-fi 7", "outdoor", "wall", "ceiling", "gpon"],
    details: `
### EAP625GP-Wall
**Access Point Omada AX1800 Wi-Fi 6 GPON de parede**
- Wi-Fi-6 - velocidades contínuas de até 1,8 Gbps: 1201 Mbps em 5 GHz e 574 Mbps em 2,4 GHz.
- Várias Portas: 1 porta GPON para acesso de alta velocidade e alcance máximo além de 2 portas Gigabit RJ45 (uma com suporte para saída PoE 802.3af) para instalação flexível.
- Uma fibra para vários serviços: Cabeado, sem fio, voz, VoIP, dados e vídeo HD.
- VoIP: Suporta várias contas VoIP e diversos recursos de chamada.
- Funções Avançadas: Omada Mesh, Roaming Contínuo, Gerenciamento Centralizado em Nuvem.
- Gerenciamento unificado para OLT e dispositivos Omada.

### EAP610GP-Desktop
**Access Point Wi-Fi 6 GPON Dual Band AX1800 de Parede e Mesa**
- Velocidades Wi-Fi 6 de 1,8 Gbps sem interrupções: 1201 Mbps na faixa de 5 GHz e 574 Mbps na faixa de 2,4 GHz.
- 1x Porta GPON para Acesso de Alta Velocidade e Ultra-Alcance.
- Wi-Fi 6 de Ultra-Banda Larga: MU-MIMO, Roaming Sem Interrupções.
- Uma Fibra para Múltiplos Serviços: Serviços com Fio, Sem Fio, Voz, VoIP, Dados e Vídeo em HD.
- Chamadas VoIP: Suporte a múltiplas contas VoIP.

### EAP615-Wall
**Access Point Wi-Fi 6 Dual Band AX1800 de Parede**
- Velocidade Wi-Fi 6: 574 Mbps simultâneos em 2,4 GHz e 1.201 Mbps em 5 GHz totalizam velocidades de Wi-Fi de 1.775 Mbps.
- Quatro portas Gigabit: 4 portas Gigabit Ethernet (1× uplink + 3× downlink), com uma porta de downlink suportando passagem PoE.
- Gerenciamento Centralizado: Integra-se ao Omada SDN para acesso à nuvem e gerenciamento remoto.
- Rede de Convidado Segura: SMS/Facebook Wi-Fi/Voucher, etc.

### EAP655-Wall
**Access Point Wi-Fi 6 Dual Band AX3000 de Parede**
- Wi-Fi 6 com Velocidade AX3000: 574 Mbps em 2,4 GHz mais 2402 Mbps em 5 GHz totalizam velocidades de Wi-Fi de 2976 Mbps.
- Várias portas Gigabit: conecte vários dispositivos com três portas downlink gigabit, sendo uma com passagem PoE.
- Canal de 160 MHz: Dobre os dados nos horários de pico de transmissão em um único fluxo com HE160.

### EAP650-Outdoor
**Access Point Wi-Fi 6 Dual Band AX3000 Outdoor**
- Velocidade Wi-Fi 6: Entrega velocidades dual band de até 3 Gbps (2402 Mbps em 5 GHz + 574 Mbps em 2,4 GHz).
- Proteção IP67: Gabinete à prova d'água e poeira, proteção contra raios de 6KV e ESD de 15KV.
- Cobertura de Longo Alcance: Amplificador de alta potência dedicado e antenas profissionais (Smart Antena).
- Tecnologia Omada Mesh: Permite conectividade sem fio entre os pontos de acesso.

### EAP225-Outdoor V3
**Access Point Wi-Fi 5 Dual Band AC1200 Outdoor**
- Ideal para ambientes externos: Gabinete IP65 resistente a intempéries.
- Wi-Fi Dual Band: 300 Mbps em 2,4 GHz e 867 Mbps em 5 GHz (AC1200).
- Tecnologia Omada Mesh e Roaming Contínuo (802.11k/v).
- Suporte PoE: Suporta ao 802.3af/at padrão e ao PoE Passivo.

### EAP610-Outdoor
**Access Point Wi-Fi 6 Dual Band AX1800 Outdoor**
- Velocidade WiFi 6: Oferece velocidades Dual-Band de até 1,8 Gbps.
- Gabinete à Prova de Intempéries IP67.
- Tecnologia Omada Mesh e Roaming Rápido.
- Várias Opções de PoE para Fácil Instalação.

### EAP673
**Access Point Wi-Fi 6 AX5400 de Teto**
- Wi-Fi 6 extremamente rápido (574 Mbps em 2,4 GHz + 4804 Mbps em 5 GHz).
- Canal de 160 MHz e Uplink 2.5GE.
- Tecnologia Omada Mesh e Roaming contínuo.
- Alimentado por PoE+.

### EAP660 HD V2
**Access Point Wi-Fi 6 Dual Band AX3600 de Teto**
- Wi-Fi 6 Ultrarrápido: 1148 Mbps em 2.4 GHz e 2402 Mbps em 5 GHz.
- Conectividade de Alta Densidade: 4× mais capacidade para conectar mais dispositivos simultaneamente.
- Porta 2.5G: Uma porta Ethernet de 2.5 Gbps aumenta a taxa de transferência total.
- Roaming Perfeito e Suporte PoE+.

### EAP670 V2
**Access Point Wi-Fi 6 Dual Band AX5400 de Teto**
- Velocidades Blazing-Fast WiFi 6 (574 Mbps em 2.4 GHz + 4804 Mbps em 5 GHz).
- Porta Ethernet de 2.5 Gbps e Canal de 160 MHz (HE160).
- Tecnologia Mesh Omada e Roaming sem Interrupções.
- Suporta tanto 802.3at PoE+ quanto alimentação por CC.

### EAP650
**Access Point Wi-Fi 6 de montagem de teto AX3000**
- Wi-Fi 6 Ultrarrápido: 574 Mbps em 2,4 GHz e 2.402 Mbps em 5 GHz.
- Design ultrafino: Φ160 mm × 33,6 mm de espessura.
- Canal de 160 MHz, Omada Mesh e Roaming Contínuo.
- Alimentado por PoE+ ou DC.

### EAP620 HD V3.20
**Access Point Wi-Fi 6 Dual Band AX1800 de Teto**
- Wi-Fi 6 Ultrarrápido: 574 Mbps em 2,4 GHz e 1.201 Mbps em 5 GHz.
- Conectividade de Alta Densidade (4x maior capacidade).
- Roaming contínuo e Suporte PoE+.

### EAP653 UR
**Access Point Wi-Fi 6 AX3000 de Teto**
- Velocidades ultrarrápidas do WiFi 6: 2402 Mbps na banda de 5 GHz + 574 Mbps na banda de 2,4 GHz.
- Design ultracompacto: Φ6,3 pol × 1,3 pol.
- Omada Mesh e Roaming Contínuo.
`
  },
  {
    name: "Módulos e Acessórios de Rede",
    keywords: ["módulo", "sfp", "sfp+", "gpon", "xgs-pon", "fonte", "psm150-dc"],
    details: `
### Módulo SFP+ 10G (SM5110-SR)
Transceptor SFP+ 10GBASE-SR de 850 nm Multimodo. Conector LC Duplex. Distância de até 300m.

### Módulo SFP GPON Classe C+ (DS-PMA-C+)
Módulo de Fibra Monomodo SFP GPON Classe C+. Suporta DDM. Compatível com OLTs TP-Link.

### Módulo de fonte PSM150-DC
Fonte de Alimentação DC de 150W. Saída de até 150 W (12V). Hot-swap. Compatível com DS-P7001-08/16.

### SFP XGS-PON & GPON Combo
Módulo Class C+ (DS-PMA-Combo C+). Conexões simétricas de até 10 Gbps. Suporta XGS-PON e GPON.
`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX3000 (EX520)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "ex520", "tp-link", "aginet"],
    details: `- **Wi-Fi 6 Dual-Band:** Velocidade de até 3000 Mbps (2402 Mbps em 5 GHz e 574 Mbps em 2,4 GHz).
- **Mais Conexões:** Tecnologias OFDMA e MU-MIMO para múltiplas conexões simultâneas com menor latência.
- **Cobertura Ampliada:** Quatro antenas de alta performance e tecnologia Beamforming.
- **Canal de 160 MHz:** Dobre os dados nos horários de pico em um único fluxo.
- **EasyMesh:** Compatível para criação de redes inteligentes com cobertura contínua.
- **Segurança:** WPA3, Multi-SSID e Controles Parentais.
- **Portas:** 1 porta Gigabit WAN e 4 portas Gigabit LAN.
- **Gerenciamento:** App Aginet, TAUC (TP-Link Aginet Unified Cloud) e protocolos TR-069, TR-181 e TR-143.`
  },
  {
    name: "Terminal XPON 1 porta Gigabit (XZ000-G6)",
    keywords: ["ont", "onu", "xpon", "gpon", "epon", "xz000-g6", "tp-link", "aginet"],
    details: `- **XPON:** Suporta modos EPON + GPON com detecção e comutação automáticas.
- **Acesso Gigabit:** Uma porta PON e uma porta LAN gigabit para altas velocidades.
- **Velocidade GPON:** 2,488 Gbps Downstream / 1,244 Gbps Upstream.
- **Velocidade EPON:** 1,25 Gbps Downstream / 1,25 Gbps Upstream.
- **Gerenciamento:** Compatível com protocolo OMCI (ONU Management Control Interface).
- **FTTH:** Solução completa integrada sob a marca Aginet.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX1800 (MR70X)",
    keywords: ["roteador", "wi-fi 6", "ax1800", "mr70x", "mercusys"],
    details: `- **Wi-Fi 6:** Velocidade de até 1.8 Gbps (1201 Mbps em 5 GHz e 574 Mbps em 2.4 GHz).
- **Capacidade:** 4x mais capacidade com OFDMA e MU-MIMO.
- **Cobertura:** 4 antenas multidirecionais de alto ganho com Beamforming.
- **EasyMesh:** Compatível com outros roteadores EasyMesh para rede unificada.
- **Segurança:** WPA3 para proteção abrangente.
- **Portas:** Conexões Full Gigabit para máximo desempenho.
- **Recursos:** BSS Color, Smart Connect e Gerenciamento TR-069.`
  },
  {
    name: "Roteador Wi-Fi 6 Gigabit Dual Band AX3000 (MR80X V4)",
    keywords: ["roteador", "wi-fi 6", "ax3000", "mr80x", "mercusys", "easymesh"],
    details: `- **Velocidade AX3000:** Até 3 Gbps com canais de 160 MHz.
- **Tecnologia:** MU-MIMO e OFDMA para redução de congestionamento.
- **Cobertura:** 4 antenas de alto ganho com Beamforming.
- **EasyMesh:** Compatível para cobertura mesh em toda a casa.
- **Segurança:** Padrão WPA3.
- **Performance:** Chipset Dual-Core para conexões estáveis de até 256 dispositivos.
- **Ecológico:** Target Wake Time (TWT) reduz o consumo de energia dos dispositivos.`
  },
  {
    name: "Roteador Wi-Fi N 300Mbps (TL-WR840N)",
    keywords: ["roteador", "wi-fi", "300mbps", "tl-wr840n", "tp-link"],
    details: `- **Velocidade:** 300 Mbps ideal para tarefas sensíveis à largura de banda.
- **Modos:** Roteador, Access Point e Extensor de Alcance.
- **Controle:** Controles dos pais e rede para convidados protegida.
- **IPTV:** Suporte a IGMP Proxy/Snooping, Bridge e Tag VLAN.
- **Gerenciamento:** Interface Web intuitiva e aplicativo Tether.`
  },
  {
    name: "Kit de Ferramentas para Fibra",
    keywords: ["kit", "ferramentas", "fibra óptica", "greatek", "manutenção", "instalação", "drop", "clivador"],
    details: `- **Descrição:** Solução prática e completa com 9 itens essenciais para instalação e manutenção de redes ópticas.
- **Itens Inclusos:** Clivador, Medidor de Potência (OPM), Localizador Visual de Falhas (VFL 5km), Alicate Decapador, Alicate de Corte Drop, Recipiente para Álcool, Gabarito Universal, Chave Allen e Bolsa de Transporte.
- **Praticidade:** Tudo organizado em uma bolsa de transporte resistente e funcional.
- **Garantia:** 1 ano com suporte técnico especializado.`
  },
  {
    name: "Tecnologia TP-Link WiFi 8 (802.11bn) - Confiabilidade Ultra-Alta",
    keywords: ["wifi 8", "wi-fi 8", "802.11bn", "tp-link wifi 8", "confiabilidade ultra-alta", "uhr", "dru", "elr", "ueqm", "dso", "npca", "multi-ap"],
    details: `- **Link de Referência:** https://www.tp-link.com/br/wifi8/
- **Definição:** O WiFi 8 (802.11bn) é o novo padrão de Wi-Fi de próxima geração focado em Confiabilidade Ultra-Alta (UHR - Ultra-High Reliability). Em vez de buscar apenas velocidades teóricas de pico extremas, o WiFi 8 prioriza conexões excepcionalmente estáveis, cobertura significativamente mais forte e roaming contínuo e ininterrupto, mesmo em ambientes densamente congestionados por múltiplos dispositivos ativos.
- **Funcionamento Geral:** O padrão gerencia mais dispositivos simultaneamente e mantém a estabilidade da conexão enquanto usuários circulam pela área de cobertura. Ele reduz drasticamente a latência e previne picos de perda de pacotes, mesmo a distâncias maiores ou em áreas propensas a ruídos eletromagnéticos.
- **Principais Benefícios para o Usuário / Provedores:**
    - **Chamadas de vídeo e VoIP estáveis:** Sem cortes bruscos ou o efeito indesejado de "voz de robô" gerado por variação de atraso (jitter).
    - **Streaming de vídeo em altíssima resolução (4K/8K):** Estabilidade de buffer incomparável e tempo mínimo de carregamento inicial.
    - **Latência ultra-baixa para jogos online e XR:** Ideal para aplicações em tempo real, óculos VR/AR e ambientes altamente sensíveis à latência.
    - **Cobertura total de sinal sem zonas mortas:** Melhora sensivelmente o alcance em áreas tradicionalmente de difícil acesso nas residências.
    - **Roaming contínuo e sem interrupções:** Transferência automática entre nós de rede ou pontos de acesso sem quedas perceptíveis em sessões ativas.
- **Nova Métrica WiFi 8 vs WiFi 7 e Anteriores:**
    - **Largura de Canal Máxima:** WiFi 8 (320 MHz) | WiFi 7 (320 MHz) | WiFi 6 (160 MHz) | WiFi 5 (160 MHz) | WiFi 4 (40 MHz)
    - **Bandas de Frequência:** WiFi 8 (2,4, 5 e 6 GHz) | WiFi 7 (2,4, 5 e 6 GHz) | WiFi 6 (2,4, 5 e 6 GHz) | WiFi 5 (5 GHz) | WiFi 4 (2,4 e 5 GHz)
    - **Taxa PHY Máxima:** WiFi 8 (46 Gbps - 2880 Mbps x16) | WiFi 7 (46 Gbps) | WiFi 6 (9,6 Gbps) | WiFi 5 (3,4 Gbps) | WiFi 4 (600 Mbps)
    - **Esquema de Modulação:** WiFi 8 (4096 QAM) | WiFi 7 (4096 QAM) | WiFi 6 (1024 QAM) | WiFi 5 (256 QAM) | WiFi 4 (64 QAM)
    - **Fluxos Espaciais Máximos:** WiFi 8 (16) | WiFi 7 (16) | WiFi 6 (8) | WiFi 5 (4)
    - **Diferencial Único WiFi 8:** Introdução oficial de Coordenação Multi-AP (Multi-AP Coordination), DSO/NPCA e DRU, ausentes em todas as tecnologias anteriores.
- **Recursos e Tecnologia do WiFi 8 Explicados de Forma Simples:**
    - **DRU (Distributed tone Resource Units):** Distribui tons de uplink de forma inteligente por canais mais amplos, incrementando a potência efetiva de transmissão. Ajuda os dispositivos clientes de baixa potência (câmeras, IoT) ou situados na borda da cobertura a se fazerem ouvir nitidamente pelo roteador principal.
    - **ELR (Enhanced Long Range):** Incorpora estruturas e codificação de pacotes avançados que estendem fisicamente a área de alcance da rede Wi-Fi, eliminando áreas sem sinal.
    - **UEQM (Unequal Modulation):** Permite que cada fluxo do sinal de Wi-Fi module individualmente na melhor taxa que conseguir sustentar. Desta forma, conexões de sinal fraco não reduzem a vazão das conexões de alto desempenho da rede.
    - **Novos MCS (Modulation and Coding Schemes):** Criam escalas de modulação mais subdivididas para que no momento do afastamento do roteador o tráfego de dados reduza gradualmente, suavizando os saltos bruscos de velocidade, travamentos e buffering.
    - **DSO (Dynamic Sub-band Operation):** Distribui dinamicamente sub-bandas de canais conforme a necessidade exata de dados de cada cliente, liberando espaço aéreo inativo e sanando o congestionamento de casas com múltiplas Smart TVs, celulares e PCs.
    - **NPCA (Non-Primary Channel Access):** Permite que os dispositivos utilizem canais e subcanais sintonizados alternativos que estejam livres caso o canal principal esteja temporariamente saturado, fugindo de "engarrafamentos" no tráfego wireless.
    - **Coordenação Multi-AP (Roteadores, Extensores e nós Mesh cooperando em conjunto):**
        - **Co-BF (Beamforming Coordenado):** Foca os feixes de transmissão em direção ao dispositivo alvo reduzindo ativamente a interferência nas bordas de múltiplas coberturas.
        - **Co-SR (Reuso Espacial Coordenado):** Comunicação entre os APs para ajustar dinamicamente a potência de emissão de RF para reduzir pontos de interferência mútua.
        - **Co-TDMA (Acesso Múltiplo por Divisão de Tempo Coordenado):** Organiza turnos e compartilhamento temporal de transmissão entre os nós Mesh, minimizando perdas de sinal por colisões ou sobreposição sob condições de tráfego intenso.
- **Retrocompatibilidade / Nota Técnica:** Celulares, Smart TVs, computadores e notebooks que utilizam padrões antigos continuam plenamente operantes e compatíveis com roteadores WiFi 8 da TP-Link, recebendo melhorias indiretas de velocidade e estabilidade gerenciais proporcionadas no ambiente sem fio da residência.`
  }
];

// FIX: Added KNOWLEDGE_BASE_SKYWATCH constant and exported it.
export const KNOWLEDGE_BASE_SKYWATCH: string = `
# Base de Conhecimento SkyWatch

## O que é o SkyWatch?
O SkyWatch é a solução de monitoramento inteligente da Greatek, projetada para que provedores e empresas possam enxergar a qualidade da sua rede com os olhos do cliente final. Em vez de apenas monitorar IPs e servidores, o SkyWatch acompanha a experiência real de navegação, identificando lentidão e falhas antes que seus clientes reclamem.


## Como funciona?
Através de sondas (probes) plug-and-play instaladas em pontos estratégicos, a ferramenta simula o acesso de um usuário, medindo a performance real de sites e serviços críticos para o seu negócio.


## Requisito de Instalação:
A sonda SkyWatch deve ser conectada, sem exceção, a um Roteador ou ONT dentro do POP ou na localidade do cliente B2B dedicado.


## Principais Benefícios:
1.  **Visão Real do Usuário:** Saiba exatamente como está a qualidade da navegação do seu cliente.
2.  **Ação Proativa:** Identifique problemas de latência, DNS ou disponibilidade e atue antes de impactar seus clientes.
3.  **Diagnóstico Simplificado:** A plataforma centralizada oferece dashboards intuitivos e relatórios com IA para facilitar a identificação da causa raiz dos problemas.
4.  **Fácil de Usar:** Não é preciso ser um especialista em redes. A solução foi desenhada para ser simples e segura, com sondas que funcionam de forma automática.


## Interessado em saber mais?
O SkyWatch é uma ferramenta poderosa para garantir a satisfação dos seus clientes e a estabilidade da sua operação. Para uma demonstração ou para entender como a solução pode se aplicar ao seu negócio, entre em contato com nosso Time Comercial.


## Contato Comercial Greatek:
- **Telefone/WhatsApp:** (12) 99221-8852
`;

// FIX: Created a function to format all knowledge into a single string and exported the result.
const formatKnowledgeBase = (products: KnowledgeBaseProduct[], partners: PartnerCompany[]): string => {
    let text = '--- INÍCIO DA BASE DE CONHECIMENTO INTERNA ---\n\n';
    
    text += '## PARCEIROS E MARCAS DISTRIBUÍDAS PELA GREATEK\n\n';
    partners.forEach(p => {
        text += `### ${p.name}\n`;
        text += `- **Tipo:** ${p.type}\n`;
        text += `- **Descrição:** ${p.description}\n`;
        text += `- **Site:** ${p.url}\n\n`;
    });

    text += '## PRODUTOS DO PORTFÓLIO GREATEK\n\n';
    products.forEach(p => {
        text += `### ${p.name}\n`;
        text += `- **Palavras-chave:** ${p.keywords.join(', ')}\n`;
        text += p.details.split('\n').map(line => `  ${line}`).join('\n') + '\n\n';
    });

    text += '--- FIM DA BASE DE CONHECIMENTO INTERNA ---';
    return text;
};

export const FULL_KNOWLEDGE_BASE_TEXT = formatKnowledgeBase(KNOWLEDGE_BASE_PRODUCTS, PARTNER_COMPANIES);