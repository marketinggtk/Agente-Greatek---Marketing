import { normalizeText } from './normalizeText';

export interface FaqItem {
    question: string;
    answer: string;
}

export const generateProductFaqs = (name: string, category: string, details: string): FaqItem[] => {
    const n = normalizeText(name);
    const d = normalizeText(details);

    // 1. ONTs / ONUs
    if (category === 'ONTs' || n.includes('ont') || n.includes('onu') || n.includes('xc220') || n.includes('xx535') || n.includes('xx530')) {
        return [
            {
                question: `A ONT ${name} é compatível com EasyMesh para cobertura Wi-Fi estendida?`,
                answer: `Sim! A Greatek garante que a ONT ${name} suporta o padrão EasyMesh da TP-Link. Isso permite que o vendedor apresente ao provedor a facilidade de criar uma rede única de alta cobertura na casa do assinante, conectando outras ONTs ou roteadores compatíveis com transição suave (roaming rápido) e sem pontos cegos de cobertura.`
            },
            {
                question: `Como este modelo reduz os custos operacionais (OPEX) do provedor de internet?`,
                answer: `Ela possui suporte integral aos protocolos de gerenciamento TR-069, TR-181 e OMCI. Isso permite ao ISP fazer todo o provisionamento 'Zero-Touch', gerenciar senhas, atualizar firmware e diagnosticar problemas à distância, reduzindo drasticamente o envio de equipes técnicas e visitas presenciais a campo.`
            },
            {
                question: `Qual o principal argumento de venda contra modelos de marcas genéricas concorrentes?`,
                answer: `Diferente de ONTs genéricas ou importadas sem homologação, a Greatek entrega este produto com Homologação Anatel, garantia e suporte técnico especializado direto no Brasil. Além disso, o chipset avançado previne travamentos e lida com alta densidade de tráfego, garantindo a entrega real da banda do plano vendido ao assinante.`
            }
        ];
    }

    // 2. Roteadores e Sistemas Mesh (Deco, Archer, Roteador Gamer, etc.)
    if (category === 'Roteadores' || n.includes('roteador') || n.includes('mesh') || n.includes('deco') || n.includes('archer') || n.includes('ex511') || n.includes('ex141')) {
        const isMesh = n.includes('mesh') || n.includes('deco') || n.includes('easymesh') || n.includes('onemesh');
        const isWifi7 = n.includes('be3600') || n.includes('be220') || n.includes('be230') || n.includes('wi-fi 7') || n.includes('wifi 7');
        
        return [
            {
                question: isMesh 
                    ? `Qual a principal dor do assinante que o sistema Mesh ${name} resolve para o ISP?`
                    : `Como o roteador ${name} ajuda o provedor a satisfazer o público gamer ou de planos ultravelozes?`,
                answer: isMesh
                    ? `Resolve as reclamações frequentes de 'sinal fraco' ou 'Wi-Fi oscilando' nos cômodos distantes. A tecnologia Mesh cria uma rede única e inteligente que direciona dinamicamente a conexão do assinante para o melhor ponto disponível, reduzindo o churn do provedor.`
                    : isWifi7
                        ? `Oferece velocidades extraordinárias e latência reduzida no Wi-Fi 7, resolvendo problemas de atraso em jogos online, streaming 8K e videoconferências, permitindo ao ISP comercializar planos de ultravelocidade (acima de 1 giga) com confiança absoluta.`
                        : `Lida com alta capacidade de processamento, suportando planos acima de 500 Mbps e mitigando interferências externas de vizinhos. É o argumento perfeito para o provedor substituir aparelhos velhos e evitar gargalos gerados pela alta taxa de downloads de múltiplos aparelhos.`
            },
            {
                question: `Como a plataforma de gerenciamento automatizado ajuda a equipe de suporte do ISP?`,
                answer: `Com integração com o software Aginet ACS ou TAUC, os roteadores permitem alterações inteligentes de canal, reinicializações remotas e diagnósticos de Wi-Fi sem que o ISP precise falar com o cliente no telefone por horas, reduzindo o tempo médio de atendimento (TMA) do provedor.`
            },
            {
                question: `Qual diferencial de distribuição este produto tem ao ser adquirido com a Greatek?`,
                answer: `A Greatek é parceira estratégica e distribuidora master autorizada da TP-Link, o que assegura ao vendedor oferecer ao cliente: procedência 100% oficial, nota fiscal robusta para auditoria, suporte local no Brasil para sanar dúvidas pós-venda e agilidade no faturamento com condições flexíveis para ISPs.`
            }
        ];
    }

    // 3. OLTs e Placas de Serviço
    if (category === 'Switches' || category === 'ONTs' || n.includes('olt') || n.includes('ds-p') || n.includes('comb') || n.includes('gpon') || n.includes('xgs-pon') || n.includes('chassi') || n.includes('pizza-box')) {
        const isChassi = n.includes('chassi') || n.includes('x2') || n.includes('ds-p8000');
        return [
            {
                question: isChassi 
                    ? `Qual a principal vantagem de investir em uma OLT Chassi ${name} contra modelos menores Pizza-Box?`
                    : `Qual a rentabilidade em adotar uma OLT de base sólida Pizza-Box como a ${name}?`,
                answer: isChassi
                    ? `A OLT Chassi X2 oferece máxima escalabilidade física (até 32 portas PON) e redundância total de placas controladoras e fontes de alimentação Hot-Swap. Isso impede que o POP sofra quedas completas, garantindo alta disponibilidade da rede para ISPs em ascensão.`
                    : `Ela é ideal para POPs de médio porte e expansão modular em anéis metropolitanos com menor custo inicial. Combina uplinks de altíssima velocidade de 10Gbps com fontes redundantes em um chassi compacto de 1U, reduzindo o investimento inicial (CAPEX) sem abrir mão de controle corporativo.`
            },
            {
                question: `Como lidar com a transição tecnológica de redes GPON para 10G (XGS-PON)?`,
                answer: `Utilizando placas e transceivers Combo GPON/XGS-PON integrados fornecidos pela Greatek, o ISP pode operar ambas as tecnologias na mesma fibra. O vendedor pode esclarecer que o provedor não precisará refazer o cabeamento de backbone nem trocar todas as ONTs ao mesmo tempo, permitindo migração suave conforme demanda por planos ultravelozes.`
            },
            {
                question: `A OLT tem suporte e compatibilidade para ONTs de outros fabricantes (Interoperabilidade)?`,
                answer: `Sim, o firmware TP-Link homologado Greatek possui alta interoperabilidade com ONTs do mercado utilizando padrões abertos do protocolo OMCI, permitindo ao ISP gerenciar ONTs de múltiplas marcas sem bloqueios artificiais de hardware.`
            }
        ];
    }

    // 4. Energia / Baterias (Sunwoda, Lítio, Lacerda Nobreaks, Volt, etc.)
    if (category === 'Energia' || n.includes('bateria') || n.includes('nobreak') || n.includes('orion') || n.includes('lithium') || n.includes('litio') || n.includes('volt') || n.includes('retificador') || n.includes('ups') || n.includes('inversor')) {
        const isLithium = n.includes('litio') || n.includes('lithium') || n.includes('sunwoda') || n.includes('lb48v');
        return [
            {
                question: isLithium
                    ? `Por que o ISP deve pagar mais pela Bateria de Lítio ${name} em relação à de chumbo-ácido?`
                    : `Por que o nobreak/retificador ${name} é indispensável para evitar queixas de clientes do ISP?`,
                answer: isLithium
                    ? `A bateria de Lítio da parceira Sunwoda comercializada pela Greatek lida com descarga profunda constante, tolerando temperaturas elevadas sem perder capacidade. Dura de 10 a 15 anos contra apenas 2 anos das baterias de chumbo comuns, reduzindo o OPEX de logística de trocas periódicas no topo da torre ou nos POPs do provedor.`
                    : `Surtos na rede e quedas de energia danificam placas lógicas e desligam os transmissores do ISP, irritando milhares de assinantes. O equipamento ${name} entrega onda senoidal pura e modulação rápida de backup, blindando a OLT e os servidores contra queimas e mantendo a operação de link intocável.`
            },
            {
                question: `Como funciona o monitoramento remoto do sistema de energia e se isso reduz custos?`,
                answer: isLithium
                    ? `Ela conta com BMS (sistema de gerenciamento da bateria) inteligente integrado, fornecendo telemetria via console sobre temperatura, corrente de carga, ciclos de vida e alarmes críticos, permitindo ao operador saber exatamente a saúde da bateria antes de ocorrer um desligamento geral.`
                    : `Com suporte à integração com aplicativos IoT ou placas monitoras Smart Web da Volt, o sistema transmite em tempo real o consumo, a carga restante e os alarmes de temperatura. Isso possibilita à equipe monitorar centralizadamente o status energético dos POPs e evitar panes catastróficas.`
            },
            {
                question: `Como esta solução ajuda a Greatek a agregar valor nas negociações de infraestrutura do ISP?`,
                answer: `A Greatek não vende apenas componentes mecânicos; ela oferece um portfólio sinérgico. Ao comprar OLTs e sistemas de energia robustos juntos na Greatek, o ISP se protege com soluções unificadas e testadas exaustivamente, usufruindo de consultoria comercial técnica no desenho dos POPs.`
            }
        ];
    }

    // 5. Conectores e Passivos de Fibra (SC/APC, SC/UPC, C03, C04, C11, CTO, CEO, DIO)
    if (category === 'Cabos e Fibras' || n.includes('conector') || n.includes('adaptador') || n.includes('cto') || n.includes('ceo') || n.includes('dio') || n.includes('pigtail') || n.includes('drop') || n.includes('asu')) {
        const isConnector = n.includes('conector') || n.includes('adaptador') || n.includes('pigtail') || n.includes('sc/');
        const isCaixa = n.includes('cto') || n.includes('ceo') || n.includes('caixa');
        
        return [
            {
                question: isConnector
                    ? `Qual o diferencial prático dos Conectores de Campo Greatek em termos de atenuamento do sinal de fibra?`
                    : isCaixa
                        ? `Qual a vantagem da robustez mecânica das caixas CTO/CEO da Greatek em campo?`
                        : `O que torna os cabos ópticos fornecidos pela Greatek superiores contra fadiga e intempéries?`,
                answer: isConnector
                    ? `Os conectores da Greatek (modelos C03, C04, C11) possuem perda de inserção típica extremamente baixa (≤ 0.3 dB). Isso impede atenuação indesejada, certificando que o sinal emitido pela OLT chegue limpo e com potência nominal ideal ao modem do assinante, reduzindo visitas recorrentes para refazer conexões.`
                    : isCaixa
                        ? `As caixas de distribuição e emenda Greatek possuem proteção UV avançada, travas mecânicas robustas contra intempéries e certificação de grau IP65/IP66 contra poeira e jatos de água. Isso blinda as emendas e conexões vitais da poeira e vento constantes dos postes, prevenindo atenuações térmicas e danos físicos.`
                        : `O cabo DROP ou ASU distribuído pela Greatek (parceiro 2Flex) possui revestimento externo altamente denso e filamentos de tração mecânica de altíssima resiliência. Isso impede rompimentos e ressecamentos acelerados pelo sol severo, garantindo sinal inabalável independente da estação do ano.`
            },
            {
                question: `Os produtos passivos têm homologação nacional e procedência garantida na Greatek?`,
                answer: `Sim, todos os soluções estratégicas de ferragens, cabos ópticos e conectores de campo distribuídos pela Greatek contam com homologação oficial da Anatel. Isso protege o provedor de internet de multas de concessionárias de energia durante fiscalizações nos postes rurais e urbanos.`
            },
            {
                question: `Como esses itens agilizam as equipes de ativação e campo do ISP?`,
                answer: isConnector
                    ? `Os conectores rápidos (Fast Connectors) da Greatek dispensam processos complexos de polimento químico ou ferramentas caras. Oferecem montagem limpa e rápida em menos de 1 minuto por fibra por meio de fixação mecânica durável com taxa de sucesso altíssima de primeira.`
                    : `Com layouts internos bem pensados para organização de bandejas de emenda, splitter plugandplay e facilidade de ancoragem de cabos, os DIOs, caixas CTO e CEOs poupam preciosas horas de trabalho dos fusionistas e técnicos de ativação, aumentando a produtividade das equipes.`
            }
        ];
    }

    // 6. Teste e Ferramental (Máquinas de fusão, clivadores, OTDRs, etc.)
    if (category === 'Teste e Ferramental' || n.includes('fusao') || n.includes('g-fusion') || n.includes('clivador') || n.includes('otdr') || n.includes('ferramenta') || n.includes('decapador')) {
        const isFusion = n.includes('fusao') || n.includes('fusion');
        const isOTDR = n.includes('otdr');
        return [
            {
                question: isFusion 
                    ? `Como justificar o investimento em uma Máquina de Fusão Greatek (como a G-Fusion Pro) para o ISP?`
                    : isOTDR
                        ? `Como o OTDR Greatek otimiza a manutenção e reduz o tempo de fibra desligada no ISP?`
                        : `Qual a importância de um Clivador de Alta Precisão Greatek (como o 48K/50K)?`,
                answer: isFusion
                    ? `Ela realiza fusões ultra-estáveis em apenas 6 a 9 segundos, com perda de sinal mínima de 0.02dB. Acelera os processos diários de rua com aquecimento rápido de tubo de emenda e bateria de alta autonomia, evitando paradas das equipes técnicas por falta de carga ou lentidão do aparelho.`
                    : isOTDR
                        ? `A atenuação clandestina ou um rompimento por acidentes paralisa milhares de clientes. O OTDR Greatek injeta pulsos potentes e detecta com precisão milimétrica a distância exata, a emenda atenuada ou o local de quebra da fibra em poucos minutos, guiando cirurgicamente a equipe de manutenção.`
                        : `O clivador preciso assegura um corte limpo em ângulo plano (90° constante) na face da fibra. Isso é vital para a máquina de fusão conseguir alinhar as fibras perfeitamente, impedindo erros de alinhamento e fusões atenuadas que geram lentidão de dados no assinante.`
            },
            {
                question: `Onde é realizada a assistência técnica, calibração e substituição de eletrodos e peças no Brasil?`,
                answer: `A Greatek conta com laboratório de suporte técnico especializado no Brasil para calibração anual exigida, reparo de componentes lógicos, sensores ou motores e reposição rápida de eletrodos das máquinas de fusão, evitando que o ISP fique com ferramenta parada por meses aguardando envio internacional.`
            },
            {
                question: `Como esses kits de ferramentas blindam e qualificam as equipes técnicas do provedor de internet?`,
                answer: `Equipamentos de medição precisos e máquinas robustas dão profissionalismo e segurança ao ISP. A Greatek apoia os parceiros com guias interativos, permitindo a correta utilização do kit de ferramentas e elevando a produtividade real de manutenção da infraestrutura de telecomunicações.`
            }
        ];
    }

    // 7. Câmeras e NVRs (VIGI, bullet, dome, etc.)
    if (category === 'Câmeras' || n.includes('vigi') || n.includes('camera') || n.includes('nvr') || n.includes('dome') || n.includes('bullet') || n.includes('grava')) {
        const isNvr = n.includes('nvr');
        return [
            {
                question: isNvr
                    ? `Como os NVRs VIGI simplificam a rotina de segurança física de ISPs e integradores?`
                    : `Por que as Câmeras VIGI são superiores no quesito monitoramento noturno (Full-Color)?`,
                answer: isNvr
                    ? `Os NVRs VIGI suportam faturamento e gravação estável multicanais (4, 8, 16, 32 ou 64 portas com suporte PoE+) com compressão rápida de imagem H.265+, economizando volume no armazenamento de HD interno e centralizando a visualização de frentes de rede.`
                    : `As câmeras VIGI contam com lentes de abertura ampla e sensores ultrasensíveis associados a iluminadores LED auxiliares. Isso garante captação noturna com qualidade Full-Color 24 horas, identificando com precisão cores de roupas e veículos mesmo sob escuridão total.`
            },
            {
                question: `Quais os recursos de Inteligência Artificial embarcados ajudam a mitigar alarmes falsos?`,
                answer: `Elas contam com classificação inteligente integrada de pessoas e veículos, delimitação inteligente de áreas de segurança e cruzamento de linhas de limite de entrada. Descartam ruídos de animais de rua ou folhas ao vento, emitindo alertas reais e reduzindo o estresse operacional.`
            },
            {
                question: `De que maneira é estruturado o software e controle remoto dessas soluções na Greatek?`,
                answer: `Are suportados softwares robustos gratuitos como o VIGI Security Manager e aplicativos de celular intuitivos para gerenciamento centralizado direto na nuvem (VIGI Cloud VMS). O vendedor pode mostrar ao ISP a economia de não depender de assinaturas ou softwares de terceiros adicionais para visualização remota.`
            }
        ];
    }

    // Default fallback - 3 universal custom questions that still fit beautifully
    return [
        {
            question: `Qual o principal diferencial competitivo de vendas deste produto ${name}?`,
            answer: `Ele traz a garantia local estruturada da Greatek Brasil, aliada a rigorosas conformidades técnicas nacionais que geram alta durabilidade e baixo índice de manutenção se comparado a produtos de fabricantes informais.`
        },
        {
            question: `Como este equipamento se insere na otimização de custo (OPEX/CAPEX) do provedor?`,
            answer: `Ao investir nesta solução de alta confiabilidade, o provedor reduz drasticamente a dor de cabeça com retornos indesejados à infraestrutura de rua ou residência física de clientes, otimizando o tempo produtivo e reduzindo o custo operacional geral de suporte.`
        },
        {
            question: `Qual a facilidade de integração oferecida pela equipe de suporte Greatek aos parceiros?`,
            answer: `O vendedor pode destacar que a Greatek conta com equipe técnica para suporte pós-venda focado nas necessidades do mercado B2B, além de documentação explicativa em português e material de inteligência comercial para capacitação das equipes.`
        }
    ];
};
