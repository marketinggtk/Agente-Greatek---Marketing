// Este arquivo atua como o "banco de dados" de conhecimento da aplicação.
// Para atualizar, forneça o texto extraído dos seus PDFs.

// FIX: Added missing export for the Greatek logo URL.
export const GREATEK_LOGO_URL = "https://www.greatek.com.br/wp-content/uploads/2022/01/logo-greatek-branco.png";

export interface KnowledgeBaseProduct {
  name: string;
  keywords: string[];
  details: string;
}


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
- **Temperatura de trabalho:** -10 °C ~ +50 °C
- **Temperatura de armazenamento:** -20 °C ~ +75 °C
- **Umidade relativa:** <= 90% sem dens.
- **Recursos Integrados:**
    - **Medidor de potência óptica (OPM):** 850/1300/1310/1490/1550/1625nm; -50 ~ +26db
    - **Fonte de luz óptica (LS):** 1310/1550nm
    - **Localizador Visual de Falhas (VFL):** 10mw, CW/2Hz (Visual interno)
    - **Fonte de laser estável:** >-5dBm`
  },
  {
    name: "Caixa de Terminação Óptica (CTO) Trava Dupla 16FO",
    keywords: ["cto", "caixa de terminação", "ctodt16a12f", "16fo", "trava dupla"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/cto-de-trava-dupla/
- **Modelo:** CTODT16A12F
- **Capacidade de adaptadores:** Até 16 adaptadores SC (APC ou UPC)
- **Capacidade de fusões:** Acomoda até 12 fusões
- **Grau de proteção:** IP66
- **Interface de cabos:** 4 interfaces para cabos de até 13mm
- **Vedação:** Travas mecânicas e borracha de vedação
- **Peso:** 1.1 Kg`
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
    name: "Distribuidor Óptico Interno (DIO) para Rack 19\"",
    keywords: ["dio", "distribuidor óptico", "dio12fo", "dio24fo", "rack"],
    details: `- **Link do Produto:** https://www.greatek.com.br/produto/distribuidor-interno-optico/
- **Material:** Aço laminado a frio com pintura eletrostática preta
- **Montagem:** Padrão Rack 19" (tamanho 1U)
- **Aplicação:** Cenários FTTH, LAN/WAN
- **Polimento:** APC ou UPC
- **Acessórios Inclusos:** Bandeja para emendas, protetores de emenda, pigtails coloridos, suportes para rack, parafusos, abraçadeiras e adaptadores ópticos.
- **Modelo DIO12FO:**
  - **Capacidade:** 12 Fibras
  - **Peso:** 3,5 Kg
- **Modelo DIO24FO:**
  - **Capacidade:** 24 Fibras
  - **Peso:** 3,7 Kg`
  },
  {
    name: "Conectores de Campo SC (APC/UPC)",
    keywords: ["conector", "conector de campo", "conector reutilizável", "conector anatel", "conector de rosca", "sc/apc", "sc/upc"],
    details: `- **Link da Família:** https://www.greatek.com.br/produto/conectores-de-campo-greatek/
- **Modelos Disponíveis:** Rosca, C04 Reutilizável, C03 Homologado ANATEL.
- **Polimentos:** SC/APC e SC/UPC.
---
### Modelo de Rosca (CNSCAPC11 / CNSCUPC11):
- **Aplicação:** Uso direto na ONU, montável em campo.
- **Perda de inserção:** ≤ 0,5dB
- **Perda de retorno:** ≥55 dB (APC), ≥45 dB (UPC)
---
### Modelo C04 Reutilizável (CNSCAPC04 / CNSCUPC04):
- **Aplicação:** Cabos Drop Flat até 3mm, cordões 2mm/3mm.
- **Perda de inserção:** Média ≤ 0.3dB
- **Perda de retorno:** ≥ 55dB (APC), ≥ 45dB (UPC)
- **Durabilidade:** ≥ 30 anos, reutilizável.
---
### Modelo C03 Homologado ANATEL (CNSCAPC03 / CNSCUPC03):
- **Diferencial:** Homologado na ANATEL, estrutura com dois ferrolhos de Zircônia.
- **Perda de inserção:** Média ≤ 0.3dB
- **Perda de retorno:** ≥ 50dB (APC), ≥ 45dB (UPC)`
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
### Solução de Fibra: OLTs e ONTs/ONUs
- **Foco**: Fornecer infraestrutura de fibra óptica de alta performance e escalabilidade.
- **OLTs (Optical Line Terminals)**:
  - **OLT Chassi X2 (DS-P8000-X2)**: Solução de alta performance para redes GPON e XGS-PON, oferecendo 32 portas PON em um chassi compacto e flexível. Suporta até 200Gbit/s por slot, com fontes e controladoras redundantes. Gerenciamento via DPMS, SNMP, CLI e Web UI. Link do Produto: https://www.greatek.com.br/produto/olt-chassi-x2-xgs-pon-e-gpon-de-32-portas/
  - **DeltaStream Pizza Box (XGS-PON & GPON Combo)**: Modelos como **DS-P7500-16** (16 portas) e **DS-P7500-08** (8 portas) que suportam tanto GPON quanto XGS-PON no mesmo dispositivo, garantindo uma atualização futura suave para 10G.
  - **DeltaStream Pizza Box (GPON)**: Modelos como **DS-P7001-16** (16 portas) e **DS-P7001-08** (8 portas) para redes GPON robustas.
  - **Gerenciamento**: Centralizado via DeltaStream PON Management System (DPMS), SNMP, CLI e interface web.
- **Roteadores/Terminais PON (HGU/SFU)**:
  - **Wi-Fi 7 XGS-PON**: **TP-Link XGB830v** (BE19000 Tri-Band) com porta WAN/LAN 10GE, ideal para planos de ultravelocidade.
  - **Wi-Fi 6 XPON**: **TP-Link ONT XX530v V2** (ONT Terminal XPON VoIP Wi-Fi 6 Dual Band AX3000). Link: https://www.tp-link.com/br/service-provider/pon-ont/xx530v/
    - **Tecnologia**: XPON (suporta GPON e EPON).
    - **Padrão Wi-Fi**: Wi-Fi 6 (802.11ax) Dual-Band AX3000.
    - **Velocidades**: 2402 Mbps (5 GHz) + 574 Mbps (2.4 GHz).
    - **Portas**: 4x Portas LAN Gigabit, 1x Porta FXS (VoIP).
    - **Recursos Chave**: EasyMesh, OFDMA, MU-MIMO, Beamforming, WPA3.
    - **Gerenciamento Remoto**: OMCI, TR-069, TR-181, TR-369 (USP) e Aginet ACS para provisionamento Zero-Touch e gerenciamento centralizado.
  - **Terminais (SFU)**: **TP-Link XGZ030** (1 porta 10GE XGS-PON) e **TP-Link XZ000-G7** (1 porta Gigabit XPON) para cenários onde o roteador é fornecido separadamente.
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
    details: `- **Perfil:** Indústria brasileira de telecomunicações desde 2015, localizada em Santa Rita do Sapucaí, MG.
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
  }
];

// FIX: Added missing export for the SkyWatch knowledge base.
export const KNOWLEDGE_BASE_SKYWATCH = `- **O que é o SkyWatch?** É a solução de monitoramento inteligente da Greatek, projetada para que provedores e empresas possam enxergar a qualidade da sua rede com os olhos do cliente final. Em vez de apenas monitorar IPs e servidores, o SkyWatch acompanha a experiência real de navegação, identificando lentidão e falhas antes que seus clientes reclamem.


- **Como funciona?** Através de sondas (probes) plug-and-play instaladas em pontos estratégicos, a ferramenta simula o acesso de um usuário, medindo a performance real de sites e serviços críticos para o seu negócio.


- **Requisito de Instalação:** A sonda SkyWatch deve ser conectada, sem exceção, a um Roteador ou ONT dentro do POP ou na localidade do cliente B2B dedicado.


- **Principais Benefícios:**
  - **Visão Real do Usuário:** Saiba exatamente como está a qualidade da navegação do seu cliente.
  - **Ação Proativa:** Identifique problemas de latência, DNS ou disponibilidade e atue antes de impactar seus clientes.
  - **Diagnóstico Simplificado:** A plataforma centralizada oferece dashboards intuitivos e relatórios com IA para facilitar a identificação da causa raiz dos problemas.
  - **Fácil de Usar:** Não é preciso ser um especialista em redes. A solução foi desenhada para ser simples e segura, com sondas que funcionam de forma automática.


- **Interessado em saber mais?** O SkyWatch é uma ferramenta poderosa para garantir a satisfação dos seus clientes e a estabilidade da sua operação. Para uma demonstração ou para entender como a solução pode se aplicar ao seu negócio, entre em contato com nosso Time Comercial.


- **Contato Comercial Greatek:**
  - **Telefone/WhatsApp:** (12) 99221-8852`;
