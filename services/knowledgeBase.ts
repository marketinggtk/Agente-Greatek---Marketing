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
    { name: "Think Technology", url: "https://www.thinktechnology.com.br/", logoUrl: "https://logo.clearbit.com/thinktechnology.com.br", description: "Indústria brasileira no setor de telecomunicações, oferecendo soluções inovadoras para redes de fibra óptica, infraestrutura e equipamentos de alto desempenho.", type: "Partner" },
    { name: "Seccon", url: "", logoUrl: "https://greatek.com.br/logos/seccon.png", description: "Fornecedor de soluções para cabeamento estruturado, incluindo patch cords, patch panels, conectores e pigtails ópticos.", type: "Partner" },
    { name: "2Flex", url: "", logoUrl: "https://greatek.com.br/logos/2flex.png", description: "Fornecedor de cabos ópticos, como Drop e ASU, para redes de telecomunicações.", type: "Partner" },
];


export const KNOWLEDGE_BASE_PRODUCTS: KnowledgeBaseProduct[] = [
  {
    name: "Máquina de Fusão Óptica X6 (MF30630X6)",
    keywords: ["máquina de fusão", "fusão óptica", "x6", "mf30630x6"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-x6/
- **Terminologia Correta:** Máquina de Fusão (NÃO fusionadora de fibra)
- **Sistema de alinhamento:** Por núcleo ou casca
- **Quantidade de motores:** 6 motores
- **Tempo de emenda (Fusão):** 8 segundos
- **Tempo de aquecimento:** Customizável
- **Tempo de inicialização:** 5 segundos
- **Tipos de Fibra (Aplicação):** Monomodo (SM), Multimodo (MM), DS, NZDS
- **Perda de fusão (típica):** 0.025dB (SM), 0.01dB (MM), 0.04dB (DS/NZDS)
- **Perda de retorno:** ≤ 60 dB
- **Bateria:** 7800mA, para aproximadamente 200 ciclos (fusão e aquecimento)
- **Eletrodos:** Vida útil de 3000 emendas
- **Visor:** LCD Colorido de 5,1 polegadas
- **Ampliação:** 300x
- **Características Especiais:**
    - **Bloqueio Inteligente:** Permite limitar o número de fusões ou o tempo de trabalho.
    - **App de Gerenciamento:** Aplicativo "MINHA MÁQUINA" para iOS e Android.
    - **Função Gestor:** Visualização remota do registro de fusões.
    - **Conectividade:** Bluetooth e Porta USB que pode carregar dispositivos.
    - **Armazenamento:** Ilimitado (nuvem).
    - **Resistência:** Proteção contra chuva, pó e quedas.
- **Peso (com maleta):** 6975g
- **Dimensões (com maleta):** 270x220x330mm`
  },
  {
    name: "Máquina de Fusão Óptica G-FUSION PRO (MFGFP3201)",
    keywords: ["máquina de fusão", "fusão óptica", "g-fusion pro", "gfusionpro", "mfgfp3201"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-gfusionpro/
- **Modelo:** MFGFP3201
- **Sistema de alinhamento:** Por núcleo, V-Groove ativo
- **Quantidade de motores:** 6 motores
- **Tempo de emenda:** 5 segundos
- **Tempo de aquecimento:** 11 segundos (pré-estabelecido)
- **Tipos de Fibra (Aplicação):** SM/MM/DS/NZDS
- **Perda de fusão:** 0.025dB (SM) / 0.01dB (MM)/ 0.04dB (DS/NZDS)
- **Perda de retorno:** ≤ 60 db
- **Bateria:** 7200mA (320 ciclos)
- **Eletrodos:** 5.000 emendas
- **Visor:** 4,3" em alta resolução com tela touch
- **Recursos Integrados:** Medidor de potência óptica e Localizador Visual de Falhas (VFL) de 15mW.
- **Armazenamento de dados:** 20.000 registros e 200 imagens
- **Peso da Máquina:** 1,750 Kg`
  },
  {
    name: "Máquina de Fusão Portátil 2 Eixos (MF2140X01)",
    keywords: ["máquina de fusão", "fusão portátil", "2 eixos", "mf2140x01"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/maquina-de-fusao-portatil-greatek/
- **Modelo:** MF2140X01
- **Sistema de alinhamento:** Pelo revestimento (V-Groove Fixo)
- **Quantidade de motores:** 2 motores
- **Tempo de emenda:** 7 segundos
- **Tempo de aquecimento:** 35 segundos (protetor 40mm)
- **Perda de fusão (típica):** 0.03dB (SM), 0.01dB (MM)
- **Bateria:** 3400mAh, para aproximadamente 60 ciclos
- **Visor:** LCD Colorido de 2,8 polegadas
- **Ampliação:** 140x
- **Peso:** 800g
- **Dimensões:** 230 x 98 x 53 mm
- **Comunicação:** Mini USB, Cartão SD (até 32GB)
- **Conteúdo da Embalagem:** Máquina, Fonte, Maleta, Clivador com Lixeira, Alicate Decapador, 3 Pares de Suporte para Fibra.`
  },
  {
    name: "Bateria de Lítio da Sunwoda 100Ah com Certificação XPS",
    keywords: ["sunwoda", "bateria", "lítio", "48v", "100ah", "energia", "LB48V100AHSW", "xps"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/bateria-de-litio-100ah-sunwoda/
- **Marca Parceira:** Sunwoda
- **Modelo:** LB48V100AHSW
- **Tipo:** Bateria de Lítio (LiFePO4)
- **Tensão Nominal:** 48V
- **Capacidade Nominal:** 100Ah @0.5C, 25°C
- **Corrente Máx. de Carga:** 100A (1C)
- **Tensão Máx. de Carga:** 55V
- **Corrente Nominal de Descarga:** 50A (0.5C)
- **Corrente Máx. de Descarga:** 100A (1C)
- **Tensão Final de Descarga:** 40.5V
- **Vida útil (Design Life):** ≥10 anos
- **Ciclos de Vida:** 5000 ciclos @0.5C 25°C 80% DOD
- **Comunicação:** RS485, RS232, SNMP
- **Dimensões:** 442mm x 413mm x 130mm (Design 3U para rack)
- **Peso:** 40kg
- **Diferenciais:** BMS integrado, sistema anti-furto com giroscópio e comunicação, Certificação XPS.`
  },
  {
    name: "Clivador GROTATEpro (FCLV48KCC-1)",
    keywords: ["clivador", "grotatepro", "grotate pro", "fclv48kcc-1"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/clivador-grotate-pro/
- **Modelo:** FCLV48KCC-1
- **Material:** Ligas de alumínio
- **Lâmina:** Rotação automática com 16 posições
- **Quantidade de clivagens:** 48.000
- **Ângulo de clivagem:** 0.5°
- **Comprimento de Corte:** 7 ~ 16 mm
- **Tipos de Fibra:** Single Core (Ø 0,25 & 0,9 mm)
- **Diferenciais:** Retorno automático do carro, sem fissuras no núcleo da fibra.`
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
- **Entrada:** AC 100-240V
- **Saída (Ajustável):** 5V/2A, 9V/1A, 12V/1A
- **Capacidade:** 4000mAh (14.8Wh)
- **Bateria:** 18650 Bateria de Lítio
- **Proteção:** Sobrecarga, Baixa tensão, Sobrecorrente
- **Interface:** DC 5.5*2.1mm
- **Aplicação:** Ideal para alimentar ONUs, roteadores e outros equipamentos de baixa tensão durante quedas de energia.`
  },
  {
    name: "OTDR Greatek (OTDRMFO001)",
    keywords: ["otdr", "otdrmfo001", "medidor óptico", "optical time domain reflectometer"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/otdr-greatek/
- **Modelo:** OTDRMFO001
- **Tela:** 7" polegadas touchscreen
- **Comprimento de onda:** 1310/1550/1625nm
- **Faixa dinâmica:** 35/33/33dB
- **Distância de teste:** 500m ~ 160km
- **Zona morta de evento:** 1m
- **Zona morta de atenuação:** 5m
- **Largura do pulso:** 3ns, 5ns, 10ns, 20ns, 50ns, 100ns, 200ns, 500ns, 1μs, 2μs, 5μs, 10μs, 20μs
- **Tempo de mensuração:** Definido pelo usuário (link inteligente); com medição em tempo real
- **Linearidade:** <0.05dB/dB
- **Perda limite:** 0,01dB
- **Resolução de perda:** 0,001dB
- **Resolução de distância:** 0,01m
- **Resolução de amostragem:** Mínimo 0,25m
- **Ponto de amostragem:** Máximo de 128,000 pontos
- **Precisão da distância:** ±(1m+distância de medição x 3x10-5 + resolução de amostragem)
- **Bateria:** 7.4v / 6.6Ah
- **Armazenamento de dados:** 80.000 medições
- **Interface:** 3x USB
- **Funcionalidades Integradas:**
    - **OPM (Optical Power Meter):** +26 ~ -50dBm, 850/1300/1310/1490/1550/1625nm
    - **VFL (Visual Fault Locator):** 10mW, CW/2Hz
    - **Fonte de Luz Estabilizada:** Igual ao comprimento de onda do OTDR
    - **Microscópio de Fibra Óptica (opcional):** Ampliação 200x
- **Formato do Arquivo:** .SOR`
  },
  {
    name: "TP-Link VIGI C540-W - Câmera de Vigilância Turret Wi-Fi",
    keywords: ["vigi", "c540-w", "câmera", "segurança", "cftv", "vigilância"],
    details: `- **Link do Produto:** https://www.tp-link.com/br/business-networking/vigi-network-camera/vigi-c540-w/
- **Tipo:** Câmera de Rede Wi-Fi Turret de 4MP para áreas externas.
- **Resolução:** 4MP (2560 × 1440).
- **Conectividade:** Wi-Fi e Ethernet.
- **Visão Noturna:** Full-Color, com alcance de 30m.
- **Inteligência Artificial:** Detecção de Pessoas e Veículos, Detecção de Movimento, Invasão de Área.
- **Áudio:** Áudio bidirecional.
- **Armazenamento:** Slot para cartão MicroSD (até 256 GB).
- **Proteção:** IP66 à prova de intempéries.
- **Aplicação:** Ideal para segurança eletrônica de fachadas, pátios e estacionamentos.`
  },
  {
    name: "TP-Link Omada ER7206 - Roteador VPN Gigabit Profissional",
    keywords: ["omada", "er7206", "roteador", "vpn", "gateway", "enterprise", "informática"],
    details: `- **Link do Produto:** https://www.tp-link.com/br/business-networking/vpn-router/er7206/
- **Tipo:** Roteador VPN SafeStream Gigabit Multi-WAN.
- **Portas:** 1 Porta SFP Gigabit, 1 Porta RJ45 WAN Gigabit, 2 Portas RJ45 WAN/LAN Gigabit, 2 Portas RJ45 LAN Gigabit.
- **VPN:** Suporte a IPsec, PPTP, L2TP e OpenVPN.
- **Gerenciamento:** Centralizado via Omada SDN Controller.
- **Recursos:** Firewall, Load Balance, Controle de Acesso.
- **Aplicação:** Perfeito para redes corporativas, automação comercial e provedores que necessitam de uma solução de gateway robusta e segura.`
  },
  {
    name: "Fonte Retificadora XPS SRX 60A (XPS-9901140)",
    keywords: ["xps", "retificador", "srx 60a", "fonte", "energia", "-48v"],
    details: `- **Link do Produto:** https://xps.com.br/produtos/sistemas-retificadores-srx/
- **Tipo:** Sistema Retificador -48Vcc.
- **Capacidade:** 60A (escalável).
- **Tensão de Entrada:** 90 a 264 Vac (Full Range).
- **Módulos:** Unidades Retificadoras de 20A hot-swap.
- **Gerenciamento:** Remoto via interface web (SNMP).
- **Homologação:** ANATEL.
- **Aplicação:** Solução de energia profissional e confiável para OLTs, switches e outros equipamentos de telecom, garantindo alimentação contínua e segura.`
  },
  {
    name: "Rack de Parede Volt 12U x 570mm",
    keywords: ["volt", "rack", "gabinete", "12u", "parede", "informática"],
    details: `- **Link do Produto:** https://volt.ind.br/produtos/racks/
- **Tipo:** Rack de parede para equipamentos de 19 polegadas.
- **Tamanho:** 12U de altura.
- **Profundidade:** 570mm.
- **Estrutura:** Aço resistente com tratamento anticorrosivo.
- **Porta:** Frontal com visor de acrílico e chave.
- **Ventilação:** Aberturas laterais e superior para ventilação.
- **Aplicação:** Organização e proteção de switches, OLTs, servidores e sistemas de energia em ambientes de TI, provedores e automação comercial.`
  },
  {
    name: "TP-Link Tapo P100 - Tomada Inteligente Wi-Fi",
    keywords: ["tapo", "p100", "tomada", "inteligente", "automação", "smart plug"],
    details: `- **Link do Produto:** https://www.tapo.com/br/product/smart-plug/tapo-p100/
- **Tipo:** Mini Tomada Inteligente Wi-Fi.
- **Funcionalidades:** Controle Remoto (via app Tapo), Agendamento, Timer, Modo Ausente.
- **Controle por Voz:** Compatível com Amazon Alexa e Google Assistant.
- **Instalação:** Simples, basta conectar e configurar pelo app.
- **Aplicação:** Ideal para automação comercial e residencial simples, permitindo ligar/desligar equipamentos remotamente, como luzes, cafeteiras e letreiros.`
  }
];

// FIX: Added KNOWLEDGE_BASE_SKYWATCH constant and exported it.
export const KNOWLEDGE_BASE_SKYWATCH: string = `
# Base de Conhecimento SkyWatch

## O que é o SkyWatch?
O SkyWatch é a solução de monitoramento de ativos de rede da Greatek. Ele permite que provedores de internet (ISPs) monitorem remotamente seus equipamentos em postes (como CTOs e Switches) e em racks (como OLTs e servidores), garantindo a integridade da rede e agindo proativamente contra falhas e furtos.

## Principais Componentes e Funcionalidades
- **Hardware (Dispositivos de Monitoramento):**
  - **SkyWatch POSTE:** Monitora a abertura de caixas (CTOs), quedas de energia, e possui GPS para localização em caso de furto.
  - **SkyWatch RACK:** Monitora temperatura, umidade, tensão da rede elétrica, estado de disjuntores e abertura de portas do rack.
- **Software (Plataforma Central):**
  - Interface web amigável para visualização de todos os ativos em um mapa.
  - Dashboard com status em tempo real dos equipamentos.
  - Sistema de alertas configurável via Telegram, SMS ou e-mail.
  - Geração de relatórios históricos de eventos.
  - Controle de acesso por nível de usuário.

## Benefícios para o ISP
1.  **Redução de OPEX:** Diminui a necessidade de deslocamento de equipes técnicas para verificar problemas, pois o diagnóstico pode ser feito remotamente.
2.  **Aumento da Disponibilidade da Rede:** Alertas proativos permitem que a equipe técnica resolva problemas (como uma bateria de nobreak falhando) antes que causem uma parada na rede.
3.  **Segurança Patrimonial:** O monitoramento de abertura de caixas e o GPS ajudam a inibir furtos e a localizar equipamentos roubados.
4.  **Melhora na Qualidade do Serviço (SLA):** Com uma rede mais estável e menos tempo de parada, a satisfação do cliente final aumenta.
5.  **Tomada de Decisão Baseada em Dados:** Relatórios históricos ajudam a identificar pontos problemáticos na rede que necessitam de manutenção ou upgrade.
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