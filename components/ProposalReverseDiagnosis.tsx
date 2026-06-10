import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import { ReverseDiagnosisResult, AppMode } from '../types';
import { 
  ZoomIn, 
  BookOpen, 
  Cpu, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  RotateCcw, 
  Check, 
  Info,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  Briefcase,
  X
} from 'lucide-react';

// Cenários de teste recomendados para o usuário inserir rápido
const TEST_SCENARIOS = [
  {
    title: 'Fusão e Redução de OPEX',
    tag: 'Máquina X6',
    proposal: 'Proposta com Máquina de Fusão X6, Kit de Ferramentas, Clivador e Conectores SC.',
    context: 'ISP regional expandindo rede FTTH. Estão montando novas equipes técnicas de campo e sofrem com retrabalhos e lentidão na ativação de clientes.',
    objective: 'Analisar tomada de decisão',
    profile: 'ISP médio',
    depth: 'Completo'
  },
  {
    title: 'Wi-Fi 6 Residencial EasyMesh',
    tag: 'Roteadores Wi-Fi 6',
    proposal: 'Proposta com Roteadores Wi-Fi 6 Greatek/TP-Link XX535, EX141, EX520 e EasyMesh.',
    context: 'Provedor com alto volume de reclamações de Wi-Fi e visitas técnicas desnecessárias ("truck roll" elevado) de clientes insatisfeitos com a velocidade e cobertura da internet no fundo da casa.',
    objective: 'Melhorar argumentação comercial',
    profile: 'ISP grande',
    depth: 'Comercial'
  },
  {
    title: 'Estabilidade de POP (Rede de Energia)',
    tag: 'POP e Energia',
    proposal: 'Proposta com Fonte Nobreak inteligente e Bateria estacionária de 45Ah.',
    context: 'ISP sofrendo quedas intermitentes em locais de difícil acesso (POP) devido à instabilidade e oscilação na rede elétrica comercial.',
    objective: 'Identificar riscos da proposta',
    profile: 'ISP pequeno',
    depth: 'Técnico'
  },
  {
    title: 'Sobredimensionamento de Solução',
    tag: 'Sobredimensionada',
    proposal: 'Gere uma proposta de OLT Chassi TP-Link de 16 portas e módulos SFP+ GPON C++ para um condomínio pequeno de apenas 40 apartamentos.',
    context: 'Condomínio de altíssimo padrão, mas ultra compacto. Não há planos de expansão externa fora do condomínio.',
    objective: 'Revisar proposta antes de enviar',
    profile: 'Integrador',
    depth: 'Completo'
  },
  {
    title: 'Subdimensionamento Crítico',
    tag: 'Subdimensionada',
    proposal: 'Roteador residencial básico TP-Link de 300Mbps WR840N de entrada.',
    context: 'Cliente corporativo precisa de Wi-Fi simultâneo robusto para escritório com mais de 80 notebooks, smartphones e videoconferências diárias constantes.',
    objective: 'Analisar por que o cliente pode recusar',
    profile: 'Empresa corporativa',
    depth: 'Técnico'
  },
  {
    title: 'Proposta Sem Contexto (Fraca)',
    tag: 'Sem Contexto',
    proposal: 'Apenas CTOs e 500 metros de cabo.',
    context: '',
    objective: 'Diagnóstico completo',
    profile: 'Não informado',
    depth: 'Rápido'
  }
];

const ProposalReverseDiagnosis: React.FC = () => {
  const { conversations, activeConversationId, submitQuery, createNewConversation, isLoading, error } = useAppStore();
  const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
  
  // Local state for the form inputs
  const [proposalText, setProposalText] = useState('');
  const [customerContext, setCustomerContext] = useState('');
  const [analysisObjective, setAnalysisObjective] = useState('decision');
  const [clientProfile, setClientProfile] = useState('Não informado');
  const [analysisDepth, setAnalysisDepth] = useState('Completo');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Tutorial visibility state
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'decision' | 'products' | 'risks' | 'objections'>('decision');
  
  // Quick View modals
  const [quickViewModal, setQuickViewModal] = useState<'argument' | 'questions' | 'action' | 'improvements' | null>(null);

  // Load tutorial seen state
  useEffect(() => {
    const seen = localStorage.getItem('greatek-reverse-diagnosis-onboarding-seen');
    if (seen !== 'true') {
      setShowTutorial(true);
    }
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('greatek-reverse-diagnosis-onboarding-seen', 'true');
    setShowTutorial(false);
  };

  // Extract analysis results if any exist in the conversation messages
  const reverseDiagnosisResult = useMemo<ReverseDiagnosisResult | null>(() => {
    if (!activeConversation || activeConversation.messages.length === 0) return null;
    
    // Find the last agent message that contains a JSON object
    const agentMessages = [...activeConversation.messages].reverse().filter(m => m.role === 'agent');
    for (const msg of agentMessages) {
      if (!msg.content) continue;
      
      // If content is already parsed as object
      if (typeof msg.content === 'object' && msg.content && 'summary' in msg.content) {
        return msg.content as ReverseDiagnosisResult;
      }
      
      // If it is a string JSON, try parsing
      if (typeof msg.content === 'string') {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed && 'summary' in parsed) {
            return parsed as ReverseDiagnosisResult;
          }
        } catch (e) {
          // ignore parsing failures and keep looking
        }
      }
    }
    return null;
  }, [activeConversation]);

  // If we loaded a previous conversation, populate the model details if possible
  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      const firstUserMsg = activeConversation.messages.find(m => m.role === 'user');
      if (firstUserMsg && typeof firstUserMsg.content === 'string') {
        const text = firstUserMsg.content;
        
        // Attempt to extract fields from our formatted prompt
        const matchProposal = text.match(/PROPOSTA \/ PRODUTOS:\s*([\s\S]*?)\n\nCONTEXTO DO CLIENTE/);
        const matchContext = text.match(/CONTEXTO DO CLIENTE:\s*([\s\S]*?)\n\nOBJETIVO DA ANÁLISE/);
        const matchObjective = text.match(/OBJETIVO DA ANÁLISE:\s*([\s\S]*?)\n\nPERFIL/);
        const matchProfile = text.match(/PERFIL DO CLIENTE:\s*([\s\S]*?)\n\nPROFUNDIDADE/);
        const matchDepth = text.match(/PROFUNDIDADE DA ANÁLISE:\s*(.*)/);

        if (matchProposal) setProposalText(matchProposal[1].trim());
        if (matchContext) setCustomerContext(matchContext[1].trim() === 'Não informado' ? '' : matchContext[1].trim());
        if (matchObjective) setAnalysisObjective(matchObjective[1].trim());
        if (matchProfile) setClientProfile(matchProfile[1].trim());
        if (matchDepth) setAnalysisDepth(matchDepth[1].trim());
      }
    } else {
      // Clean form for new conversation
      setProposalText('');
      setCustomerContext('');
      setAnalysisObjective('decision');
      setClientProfile('Não informado');
      setAnalysisDepth('Completo');
    }
  }, [activeConversationId, activeConversation]);

  const handleScenarioClick = (scenario: typeof TEST_SCENARIOS[0]) => {
    setProposalText(scenario.proposal);
    setCustomerContext(scenario.context);
    setAnalysisObjective(scenario.objective);
    setClientProfile(scenario.profile);
    setAnalysisDepth(scenario.depth);
  };

  const clearForm = () => {
    setProposalText('');
    setCustomerContext('');
    setAnalysisObjective('decision');
    setClientProfile('Não informado');
    setAnalysisDepth('Completo');
    
    // Start a new clean conversation session
    createNewConversation(activeConversation?.mode || AppMode.REVERSE_DIAGNOSIS);
  };

  const handleAnalyze = () => {
    if (!proposalText.trim() || isLoading) return;

    const objectiveLabel = {
      decision: 'Analisar tomada de decisão',
      argumentation: 'Melhorar argumentação comercial',
      risks: 'Identificar riscos da proposta',
      defense: 'Preparar defesa para o cliente',
      training: 'Treinar vendedor',
      review: 'Revisar proposta antes de enviar',
      rejection: 'Analisar por que o cliente pode recusar',
      complete: 'Diagnóstico completo'
    }[analysisObjective] || analysisObjective;

    const prompt = `Por favor, faça um Diagnóstico Reverso com a seguinte proposta comercial / cenário de ISP:

PROPOSTA / PRODUTOS:
${proposalText}

CONTEXTO DO CLIENTE:
${customerContext ? customerContext : 'Não informado'}

OBJETIVO DA ANÁLISE:
${objectiveLabel}

PERFIL DO CLIENTE:
${clientProfile}

PROFUNDIDADE DA ANÁLISE:
${analysisDepth}`;

    submitQuery(prompt);
  };

  const handleCopySection = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyFullAnalysis = () => {
    if (!reverseDiagnosisResult) return;
    
    let md = `# Diagnóstico Reverso: ${activeConversation?.title || 'Análise de Proposta'}\n\n`;
    md += `## 1. Resumo Executivo\n${reverseDiagnosisResult.summary}\n\n`;
    md += `## 2. Problema de ISP Provável\n${reverseDiagnosisResult.probable_problem}\n\n`;
    md += `## 3. Hipótese de Tomada de Decisão\n${reverseDiagnosisResult.decision_hypothesis}\n\n`;
    
    md += `## 4. Produtos Identificados na Solução\n`;
    reverseDiagnosisResult.products_identified.forEach(p => {
      md += `### ${p.name}\n- **Papel:** ${p.role}\n- **Dor Solucionada:** ${p.pain_solved}\n- **Impacto Espacial:** ${p.expected_impact}\n- **Risco de Mau Uso:** ${p.risk_of_misuse}\n- **Complemento Recomendado:** ${p.recommended_complement || 'Nenhum'}\n\n`;
    });

    md += `## 5. Pontos Fortes da Proposta\n`;
    reverseDiagnosisResult.strengths.forEach(s => md += `- ${s}\n`);
    md += `\n`;

    md += `## 6. Riscos & Gaps Comerciais\n`;
    reverseDiagnosisResult.gaps_or_risks.forEach(g => md += `- **${g.risk_type}:** ${g.explanation}\n`);
    md += `\n`;

    md += `## 7. Próximas Melhores Perguntas de Diagnóstico\n`;
    reverseDiagnosisResult.missing_questions.forEach(q => md += `- ${q}\n`);
    md += `\n`;

    md += `## 8. Abordagem Pronta para Enviar por WhatsApp / Email\n"${reverseDiagnosisResult.how_to_explain_to_customer}"\n\n`;
    md += `## 9. Próximo Passo Recomendado\n${reverseDiagnosisResult.recommended_next_step}\n\n`;
    md += `--- \n*Gerado automaticamente pelo Diagnóstico Reverso do Agente Greatek (Confiança: ${reverseDiagnosisResult.confidence_level} - ${reverseDiagnosisResult.confidence_reason})*`;

    handleCopySection(md, 'full');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/55 animate-fade-in text-slate-800">
      
      {/* HEADER BAR */}
      <header className="p-5 sm:px-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-greatek-blue/10 text-greatek-blue flex items-center justify-center">
              <ZoomIn className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-greatek-dark-blue">Diagnóstico Reverso de Propostas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Entenda o problema oculto, identifique riscos e prepare uma abordagem consultiva de alto valor para ISPs.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-greatek-blue/30 text-slate-600 hover:text-greatek-blue text-xs font-semibold bg-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Ver tutorial
          </button>
          {reverseDiagnosisResult && (
            <button 
              onClick={clearForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 text-xs font-semibold bg-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar análise
            </button>
          )}
        </div>
      </header>

      {/* TUTORIAL MODAL OVERLAY */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="p-6 bg-greatek-dark-blue text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ZoomIn className="w-6 h-6 text-greatek-blue" />
                <h2 className="text-lg font-black tracking-tight uppercase">Como funciona o Diagnóstico Reverso?</h2>
              </div>
              <button 
                onClick={() => setShowTutorial(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                Esta ferramenta ajuda você a entender a lógica por trás de uma proposta comercial. Basta colar o cenário do cliente, os produtos ofertados ou uma proposta já enviada, e o agente analisa qual problema provavelmente estava sendo resolvido, se a solução faz sentido e como melhorar a argumentação.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-greatek-blue/10 text-greatek-blue flex items-center justify-center font-bold text-xs mb-2">1</div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Cole a proposta ou cenário</h4>
                  <p className="text-xs text-slate-500 mt-1">Insira a lista de produtos, observações do cliente, necessidade técnica, valores ou qualquer informação que ajude a entender a negociação.</p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-greatek-blue/10 text-greatek-blue flex items-center justify-center font-bold text-xs mb-2">2</div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">O agente identifica a dor</h4>
                  <p className="text-xs text-slate-500 mt-1">A ferramenta analisa os produtos e o contexto para levantar hipóteses sobre o problema do cliente, como expansão de rede, redução de chamados, etc.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-greatek-blue/10 text-greatek-blue flex items-center justify-center font-bold text-xs mb-2">3</div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Receba análise consultiva</h4>
                  <p className="text-xs text-slate-500 mt-1">O agente mostra pontos fortes, riscos (sub/sobredimensionamento), objeções prováveis de ISP e como defender a tomada de decisão.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-greatek-blue/10 text-greatek-blue flex items-center justify-center font-bold text-xs mb-2">4</div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Use como apoio comercial</h4>
                  <p className="text-xs text-slate-500 mt-1">O resultado serve para treinar o vendedor, melhorar propostas futuras e preparar argumentos mais claros para o cliente.</p>
                </div>
              </div>

              {/* FAZ VS NÃO FAZ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <h5 className="font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                    <CheckCircle className="w-4 h-4" /> O que esta ferramenta faz:
                  </h5>
                  <ul className="space-y-1.5 text-slate-600 font-medium list-disc list-inside">
                    <li>Analisa propostas já existentes.</li>
                    <li>Identifica o problema provável do cliente.</li>
                    <li>Relaciona produtos com dores comerciais e técnicas.</li>
                    <li>Aponta riscos e lacunas de subdimensionamento.</li>
                    <li>Sugere perguntas que faltaram no diagnóstico.</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-rose-500 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                    <X className="w-4 h-4" /> O que esta ferramenta não faz:
                  </h5>
                  <ul className="space-y-1.5 text-slate-600 font-medium list-disc list-inside">
                    <li>Não substitui a análise final do vendedor.</li>
                    <li>Não garante que o cenário esteja correto se faltarem dados.</li>
                    <li>Não inventa preço, estoque, prazo ou especificações.</li>
                    <li>Não inventa CNPJ ou dados que não foram informados.</li>
                  </ul>
                </div>
              </div>

              <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2.5 font-bold border border-amber-200/40">
                Aviso Comercial: A análise é uma hipótese baseada nas informações fornecidas. Quanto mais contexto o vendedor inserir, melhor será a qualidade do diagnóstico final.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button 
                onClick={handleDontShowAgain}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2"
              >
                Não mostrar novamente
              </button>
              <button 
                onClick={() => setShowTutorial(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-greatek-blue hover:bg-greatek-dark-blue text-white text-xs font-bold transition-all shadow-xs"
              >
                Começar análise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          /* LOADING STATE */
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
              <div className="relative inline-flex mb-4">
                <span className="flex h-6 w-6 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-greatek-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-greatek-blue"></span>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800">Executando Diagnóstico Reverso...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Correlacionando produtos à base de conhecimento da Greatek para levantar as dores de ISP envolvidas, riscos de dimensionamento e scripts de objeções.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="h-8 bg-slate-200 rounded animate-pulse w-1/4"></div>
                <div className="h-32 bg-slate-200 rounded animate-pulse w-full"></div>
                <div className="h-20 bg-slate-200 rounded animate-pulse w-full"></div>
              </div>
              <div className="space-y-4">
                <div className="h-44 bg-slate-200 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        ) : reverseDiagnosisResult ? (
          /* RESULT DISPLAY PATTERN */
          <div className="space-y-6 animate-fade-in-up">
            
            {/* ACTION BANNER */}
            <div className="p-4 sm:p-5 bg-greatek-dark-blue text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-greatek-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight sm:text-base uppercase">Análise de Decisão Concluída</h3>
                  <p className="text-xs text-slate-300">Confiança do Diagnóstico: <strong className={`font-black ${reverseDiagnosisResult.confidence_level === 'Alta' ? 'text-emerald-400' : reverseDiagnosisResult.confidence_level === 'Média' ? 'text-amber-400' : 'text-rose-400'}`}>{reverseDiagnosisResult.confidence_level}</strong> • {reverseDiagnosisResult.confidence_reason}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setQuickViewModal('argument')}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all border border-white/5"
                >
                  Ver Script WhatsApp
                </button>
                <button
                  onClick={() => setQuickViewModal('questions')}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all border border-white/5"
                >
                  Perguntas Importantes
                </button>
                <button
                  onClick={handleCopyFullAnalysis}
                  className="px-3.5 py-2 bg-greatek-blue hover:bg-sky-500 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {copiedSection === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'full' ? 'Copiada!' : 'Copiar Análise Completa'}
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px scrollbar-none">
              <button
                onClick={() => setActiveTab('decision')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${activeTab === 'decision' ? 'border-greatek-blue text-greatek-blue font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Cpu className="w-4 h-4" />
                1. Problema & Decisão
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${activeTab === 'products' ? 'border-greatek-blue text-greatek-blue font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Briefcase className="w-4 h-4" />
                2. Produtos & Dor Resolvida
              </button>
              <button
                onClick={() => setActiveTab('risks')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${activeTab === 'risks' ? 'border-greatek-blue text-greatek-blue font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                3. Pontos Fortes & Riscos
              </button>
              <button
                onClick={() => setActiveTab('objections')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${activeTab === 'objections' ? 'border-greatek-blue text-greatek-blue font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <MessageSquare className="w-4 h-4" />
                4. Objeções & Respostas
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-8 space-y-6">
              
              {activeTab === 'decision' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <HelpCircle className="w-4 h-4 text-greatek-blue" /> Resumo do Diagnóstico
                    </h3>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-semibold">
                      {reverseDiagnosisResult.summary}
                    </p>
                  </div>

                  <hr className="border-slate-100" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-greatek-dark-blue">
                        <TrendingUp className="w-4 h-4 text-greatek-blue" /> Problema Oculto Provável do ISP
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {reverseDiagnosisResult.probable_problem}
                      </p>
                    </div>

                    <div className="space-y-2.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-greatek-dark-blue">
                        <Cpu className="w-4 h-4 text-greatek-blue" /> Por que esta decisão foi tomada? (Hipótese de Racional)
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {reverseDiagnosisResult.decision_hypothesis}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* PRÓXIMO PASSO RÁPIDO */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 uppercase">Próxima Ação Comercial Recomendada</h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-1 leading-relaxed">
                        {reverseDiagnosisResult.recommended_next_step}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                      Lista de Produtos Ofertados & Diagnóstico de Valor
                    </h3>
                    
                    {/* TABLE LAYOUT FOR WIDE SCREENS */}
                    <div className="hidden lg:block overflow-x-auto border border-slate-150 rounded-xl shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-155 font-bold uppercase tracking-wider">
                            <th className="p-3.5">Nome do Produto</th>
                            <th className="p-3.5">Papel Técnico</th>
                            <th className="p-3.5">Dor que Ataca</th>
                            <th className="p-3.5">Impacto Esperado</th>
                            <th className="p-3.5">Risco de MAU Uso / Risco</th>
                            <th className="p-3.5">Complemento Recomendado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                          {reverseDiagnosisResult.products_identified.map((p, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 text-slate-900 font-extrabold">{p.name}</td>
                              <td className="p-3.5">{p.role}</td>
                              <td className="p-3.5 text-slate-800">{p.pain_solved}</td>
                              <td className="p-3.5 text-emerald-600 font-semibold">{p.expected_impact}</td>
                              <td className="p-3.5 text-rose-500 font-semibold">{p.risk_of_misuse}</td>
                              <td className="p-3.5 text-greatek-blue font-bold">{p.recommended_complement || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* CARD LAYOUT FOR MOBILE SCREENS */}
                    <div className="lg:hidden space-y-4">
                      {reverseDiagnosisResult.products_identified.map((p, index) => (
                        <div key={index} className="border border-slate-200/80 rounded-xl p-4 space-y-2.5 bg-slate-50/20 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="font-extrabold text-[#111]">{p.name}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Papel Técnico:</span>
                              <p className="font-medium text-slate-650">{p.role}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Dor Solucionada:</span>
                              <p className="font-medium text-slate-650">{p.pain_solved}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 text-emerald-700">Impacto Comercial:</span>
                              <p className="font-semibold text-emerald-655">{p.expected_impact}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 text-rose-700">Risco no ISP:</span>
                              <p className="font-semibold text-rose-655">{p.risk_of_misuse}</p>
                            </div>
                          </div>
                          {p.recommended_complement && (
                            <div className="bg-white/80 p-2 rounded border border-slate-100 mt-1">
                              <span className="text-[9px] uppercase font-bold text-greatek-dark-blue display:block">Complemento Inteligente Greatek:</span>
                              <p className="font-bold text-greatek-blue text-xs mt-0.5">{p.recommended_complement}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* PORTFOLIO TO PAIN MAP */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                      Mapa Produto x Dor Resolvida (Argumentos Rápidos)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reverseDiagnosisResult.product_pain_map.map((item, index) => (
                        <div key={index} className="p-4 bg-[#f8fafc] border border-slate-205 rounded-xl text-xs space-y-2">
                          <div className="font-extrabold text-greatek-dark-blue uppercase text-[11px] truncate">{item.product}</div>
                          <div className="text-slate-500 font-bold">Dor: <span className="text-slate-800 font-semibold">{item.pain}</span></div>
                          <div className="text-emerald-700 font-semibold bg-emerald-50 rounded p-1.5">Valor: {item.value_to_customer}</div>
                          <div className="text-slate-500 italic pt-1 border-t border-slate-150">Ganchos: {item.observation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* STRENGTHS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Pontos Fortes da Proposta
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {reverseDiagnosisResult.strengths.map((str, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs bg-[#f4fbf7] border border-emerald-50 p-3 rounded-lg text-slate-700 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-555 rounded-full mt-2 shrink-0"></span>
                            <p className="leading-relaxed">{str}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GAPS & RISKS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Lacunas, Risco ou Mau Dimensionamento
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {reverseDiagnosisResult.gaps_or_risks.map((gap, index) => (
                          <div key={index} className="flex items-start gap-3 text-xs bg-amber-50 border border-amber-100/60 p-3.5 rounded-lg text-slate-700 font-medium">
                            <span className="p-1 px-1.5 bg-amber-100 text-amber-800 font-bold rounded uppercase shrink-0 text-[9px] mt-0.5">
                              {gap.risk_type}
                            </span>
                            <p className="leading-relaxed">{gap.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <hr className="border-slate-100" />
                  
                  {/* IMPROVEMENTS GRID */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                      Como Melhorar Essa Proposta? (Plano de Evolução)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {reverseDiagnosisResult.improvements.map((imp, index) => (
                        <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2 font-semibold text-slate-700">
                          <Check className="w-4 h-4 text-emerald-550 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{imp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'objections' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      Objeções Prováveis de ISP & Roteiros Prontos de Contorno
                    </h3>
                    
                    <div className="space-y-4">
                      {reverseDiagnosisResult.probable_objections.map((obj, index) => (
                        <div key={index} className="border border-slate-180 rounded-xl overflow-hidden shadow-xs">
                          <div className="bg-slate-50 p-3.5 border-b border-slate-180 flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Objeção Provável</span>
                              <h4 className="text-xs font-bold text-slate-800 italic">"{obj.objection}"</h4>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white space-y-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Roteiro de Contorno</span>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-[#f8fafc] border border-slate-100 p-3 rounded-lg relative">
                              {obj.commercial_response}
                            </p>
                            
                            <button
                              onClick={() => handleCopySection(obj.commercial_response, `obj-${index}`)}
                              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-greatek-blue hover:text-greatek-dark-blue transition-colors ml-auto mt-2"
                            >
                              {copiedSection === `obj-${index}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copiar Roteiro
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SEÇÃO INFERIOR PARA TEXTOS ADICIONAIS */}
            <div className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-xs space-y-3">
              <h4 className="font-black uppercase tracking-widest text-slate-400">Mensagem Curta para Enviar por WhatsApp / Email</h4>
              <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                "{reverseDiagnosisResult.how_to_explain_to_customer}"
              </p>
              
              <button
                onClick={() => handleCopySection(reverseDiagnosisResult.how_to_explain_to_customer, 'whatsapp-msg')}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/40 px-4 py-2 rounded-lg transition-all ml-auto"
              >
                {copiedSection === 'whatsapp-msg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSection === 'whatsapp-msg' ? 'Copiada!' : 'Copiar Abordagem Whatsapp'}
              </button>
            </div>
            
            {/* VOLTAR AO FORMULÁRIO */}
            <div className="flex justify-center pt-4">
              <button
                onClick={clearForm}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> Realizar Outro Diagnóstico
              </button>
            </div>
          </div>
        ) : (
          /* FORM ENTRY POINT */
          <div className="space-y-6">
            
            {/* EXAMPLES CONTAINER */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-greatek-blue" />
                Dica: Escolha um Cenário Real de ISP para Teste Rápido
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {TEST_SCENARIOS.map((sc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleScenarioClick(sc)}
                    className="p-3 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-greatek-blue/40 rounded-xl transition-all shadow-2xs hover:shadow-xs text-[10px] sm:text-xs flex flex-col justify-between h-20 outline-none"
                  >
                    <span className="font-extrabold text-slate-800 line-clamp-1 block">{sc.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-greatek-blue/10 text-greatek-blue font-black tracking-wide text-[9px] uppercase self-start mt-1">
                      {sc.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CORE FORM */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5 sm:p-6 lg:p-8 space-y-6">
              
              {/* CAMPO 1 */}
              <div className="space-y-1.5 text-xs">
                <label htmlFor="proposal" className="block text-slate-800 font-extrabold uppercase tracking-wide">
                  Proposta, produtos ou cenário enviado <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="proposal"
                  value={proposalText}
                  onChange={e => setProposalText(e.target.value)}
                  placeholder="Cole aqui a proposta comercial, a lista de itens, o contexto do cliente do seu pipeline ou um resumo rápido de produtos enviados (Ex: Fornecemos Máquina Greatek X6 com clivador)."
                  className="w-full h-36 p-3 rounded-xl border border-slate-200 focus:border-greatek-blue/45 focus:ring-4 focus:ring-greatek-blue/10 outline-none bg-slate-50/50 text-[#111111] font-semibold text-xs leading-relaxed transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              {/* CAMPO 2 */}
              <div className="space-y-1.5 text-xs">
                <label htmlFor="context" className="block text-slate-850 font-bold uppercase tracking-wide">
                  Contexto Adicional do Cliente ISP (Opcional)
                </label>
                <textarea
                  id="context"
                  value={customerContext}
                  onChange={e => setCustomerContext(e.target.value)}
                  placeholder="Ex: Provedor com 5 equipes de campo, alto truck roll por retrabalhos, quer reduzir chamados de Wi-Fi e monitorar de forma centralizada."
                  className="w-full h-20 p-3 rounded-xl border border-slate-200 focus:border-greatek-blue/45 focus:ring-4 focus:ring-greatek-blue/10 outline-none bg-slate-50/50 text-[#111111] font-semibold text-xs leading-relaxed transition-all placeholder:text-slate-400"
                />
              </div>

              {/* OUTROS CAMPOS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                <div className="space-y-1.5">
                  <label htmlFor="objective" className="block text-slate-800 font-bold uppercase tracking-wide">
                    Objetivo da Análise
                  </label>
                  <select
                    id="objective"
                    value={analysisObjective}
                    onChange={e => setAnalysisObjective(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-greatek-blue/45 focus:ring-4 focus:ring-greatek-blue/10 outline-none bg-[#f8fafc] text-slate-800 font-bold shadow-2xs"
                  >
                    <option value="decision">Analisar tomada de decisão</option>
                    <option value="argumentation">Melhorar argumentação comercial</option>
                    <option value="risks">Identificar riscos da proposta</option>
                    <option value="defense">Preparar defesa para o cliente</option>
                    <option value="training">Treinar vendedor</option>
                    <option value="review">Revisar proposta antes de enviar</option>
                    <option value="rejection">Analisar por que o cliente pode recusar</option>
                    <option value="complete">Diagnóstico completo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile" className="block text-slate-800 font-bold uppercase tracking-wide">
                    Perfil do Cliente ISP (Opcional)
                  </label>
                  <select
                    id="profile"
                    value={clientProfile}
                    onChange={e => setClientProfile(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-greatek-blue/45 focus:ring-4 focus:ring-greatek-blue/10 outline-none bg-[#f8fafc] text-slate-800 font-bold shadow-2xs"
                  >
                    <option value="ISP pequeno">ISP pequeno</option>
                    <option value="ISP médio">ISP médio</option>
                    <option value="ISP grande">ISP grande</option>
                    <option value="Integrador">Integrador</option>
                    <option value="Distribuidor">Distribuidor</option>
                    <option value="Operadora">Operadora</option>
                    <option value="Empresa corporativa">Empresa corporativa</option>
                    <option value="Não informado">Não informado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="depth" className="block text-slate-800 font-bold uppercase tracking-wide">
                    Nível de Profundidade
                  </label>
                  <select
                    id="depth"
                    value={analysisDepth}
                    onChange={e => setAnalysisDepth(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-greatek-blue/45 focus:ring-4 focus:ring-greatek-blue/10 outline-none bg-[#f8fafc] text-slate-800 font-bold shadow-2xs"
                  >
                    <option value="Rápido">Rápido (Pontos-chave)</option>
                    <option value="Completo">Completo (Dossiê consultivo)</option>
                    <option value="Executivo">Executivo (Foco estratégico)</option>
                    <option value="Técnico">Técnico (Análise de engenharia)</option>
                    <option value="Comercial">Comercial (Quebra de preço)</option>
                  </select>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 font-semibold italic">Todos os dados inseridos são analisados localmente de forma segura.</span>
                
                <SubmitButton
                  onClick={handleAnalyze}
                  disabled={isLoading || !proposalText.trim()}
                  className="px-6 py-2.5 rounded-lg bg-greatek-blue hover:bg-greatek-dark-blue text-white font-black uppercase text-xs tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  Analisar Proposta
                  <ArrowRight className="w-4 h-4" />
                </SubmitButton>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* QUICK VIEW POPUPS / MODALS */}
      {quickViewModal && reverseDiagnosisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            
            <div className="p-5 bg-greatek-dark-blue text-white flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-wider bg-white/10 text-greatek-blue px-2.5 py-1 rounded">Visualização Rápida</span>
              <button 
                onClick={() => setQuickViewModal(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 flex shrink-0" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {quickViewModal === 'argument' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><MessageSquare className="w-4.5 h-4.5 text-greatek-blue" /> Script Comercial WhatsApp / Email</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    "{reverseDiagnosisResult.how_to_explain_to_customer}"
                  </p>
                  <button
                    onClick={() => handleCopySection(reverseDiagnosisResult.how_to_explain_to_customer, 'modal-whatsapp')}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200/40 hover:bg-emerald-105 rounded-lg text-xs font-bold transition-all mt-3"
                  >
                    {copiedSection === 'modal-whatsapp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedSection === 'modal-whatsapp' ? 'Copiado para WhatsApp!' : 'Copiar Script'}
                  </button>
                </div>
              )}

              {quickViewModal === 'questions' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider"><HelpCircle className="w-4 h-4 text-greatek-blue" /> Perguntas que Faltaram no Diagnóstico Comercial</h3>
                  <p className="text-[11px] text-slate-500 font-bold mb-2">Use essas perguntas durante o follow-up para identificar mais dores de ISP e amparar a proposta:</p>
                  <div className="space-y-2">
                    {reverseDiagnosisResult.missing_questions.map((q, index) => (
                      <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-greatek-blue rounded-full mt-1.5 shrink-0"></span>
                        <p className="leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setQuickViewModal(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                Fechar janela
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProposalReverseDiagnosis;
