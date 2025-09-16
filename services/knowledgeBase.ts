// Este arquivo atua como o "banco de dados" de conhecimento da aplicação.
// Para atualizar, forneça o texto extraído dos seus PDFs.

export interface KnowledgeBaseProduct {
  name: string;
  keywords: string[];
  details: string;
}

export interface PartnerCompany {
  name: string;
  url: string;
  description: string;
  type: 'Master' | 'Partner';
}

export const PARTNER_COMPANIES: PartnerCompany[] = [
    { name: "TP-Link", url: "https://www.tp-link.com/br/", description: "Líder global em conectividade, oferecendo roteadores, switches, soluções Wi-Fi e produtos de casa inteligente.", type: "Master" },
    { name: "Omada", url: "https://www.omadanetworks.com/br/", description: "Marca independente da TP-Link focada em soluções de rede definidas por software (SDN) para ambientes de negócios (B2B), reconhecida no Quadrante Mágico do Gartner.", type: "Partner" },
    { name: "Tapo", url: "https://www.tapo.com/br/", description: "Submarca da TP-Link para dispositivos de casa inteligente, como câmeras, plugues e iluminação.", type: "Partner" },
    { name: "Vigi", url: "https://www.vigi.com/br/", description: "Submarca da TP-Link especializada em vigilância por vídeo profissional (câmeras e NVRs), totalmente integrada à plataforma Omada Central.", type: "Partner" },
    { name: "Mercusys", url: "https://www.mercusys.com.br/", description: "Submarca da TP-Link que oferece dispositivos de rede confiáveis e acessíveis.", type: "Partner" },
    { name: "Cabel Condutores Elétricos", url: "https://cabel.com.br/", description: "Especialista em fios e cabos elétricos de alta qualidade para energia, telecomunicações e solar.", type: "Partner" },
    { name: "CG3 Telecom", url: "https://cg3telecom.com.br/", description: "Fabricante e fornecedor de uma linha completa de ferragens, pré-formados, produtos ópticos (Cabos Drop, CTOs, CEOs) e injetados plásticos para redes de telecomunicações e elétricas.", type: "Partner" },
    { name: "Lacerda Sistemas de Energia", url: "https://lacerdasistemas.com.br/", description: "Especializada em soluções de energia, incluindo nobreaks e estabilizadores.", type: "Partner" },
    { name: "Volt", url: "https://volt.ind.br/", description: "Empresa 100% brasileira, especialista em soluções de energia ininterrupta para telecom, incluindo fontes nobreak, inversores, controladores de carga solar, sistemas de monitoramento e racks.", type: "Partner" },
    { name: "XPS", url: "https://xps.com.br/", description: "Provedor de soluções em fibra óptica e equipamentos de telecomunicações.", type: "Partner" },
    { name: "Think Technology", url: "https://www.thinktechnology.com.br/", description: "Indústria brasileira no setor de telecomunicações, oferecendo soluções inovadoras para redes de fibra óptica, infraestrutura e equipamentos de alto desempenho.", type: "Partner" },
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
- **Peso:** 328g
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
    name: "TP-Link VIGI - Solução de Vigilância Integrada",
    keywords: ["vigi", "omada central", "vigilância", "cftv", "nvr", "câmera ip", "ia", "vca", "vms", "colorpro", "poe"],
    details: `- **Visão Geral:** Solução de segurança e videomonitoramento profissional da TP-Link, totalmente integrada à plataforma Omada Central para gerenciamento unificado de rede e vigilância.
- **Desafios Resolvidos:** Complexidade de gerenciar equipes distintas (rede e segurança), instabilidade de rede afetando vídeo, diagnóstico lento de problemas.
---
### Plataformas de Gerenciamento
- **Omada Central:** Gerenciamento 100% em nuvem de dispositivos Omada (rede) e VIGI (vigilância).
  - **Benefícios:** Configuração unificada, atribuição de VLANs simplificada, QoS para priorizar tráfego de vídeo.
- **VIGI Cloud VMS:** Gerenciamento gratuito e ilimitado em nuvem (versão Essential). Acesso a sites e dispositivos sem VPN.
- **VIGI VMS (Local):** Software para instalação local para gerenciamento centralizado em projetos de médio porte.
---
### Recursos de Vigilância Inteligente (IA)
- **Detecções Inteligentes:** Intrusão, cruzamento de linha, remoção/abandono de objetos, movimentos suspeitos, etc.
- **Distinção de Alvos:** IA para distinguir humanos e veículos, reduzindo alarmes falsos.
- **Busca VCA:** Busca de gravações baseada em características de pessoas/veículos.
- **Monitoramento com IA:** Destaque de alvos em tempo real, desfoque automático de rostos, centro de monitoramento com até 64 canais.
---
### Linha de Produtos VIGI
- **Câmeras:**
  - **Tipos:** Turret, Dome, Fisheye, Bullet, Panorâmicas, PTZ.
  - **Tecnologias:** **ColorPro** para imagens coloridas em baixa luminosidade, alta resolução (até 8MP), zoom varifocal, defesa ativa (luz e som).
- **Gravadores (NVRs):**
  - **NVR2016H:** Gravador de 16 canais.
- **Switches:**
  - **SG2005P-PD:** 5 portas, 1x PoE++ in, 4x PoE+ out, ideal para cascateamento de câmeras.
- **Access Points:**
  - **EAP650-Outdoor:** Wi-Fi 6 AX3000 para conectar câmeras sem fio em ambientes externos.`
  }
];