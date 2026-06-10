
export enum AppMode {
  INTEGRATOR = 'INTEGRATOR',
  ARQUITETO = 'ARQUITETO',
  INSTRUCTOR = 'INSTRUCTOR',
  SKYWATCH = 'SKYWATCH',
  MARKET_INTEL = 'MARKET_INTEL',
  SALES_ASSISTANT = 'SALES_ASSISTANT',
  PAGE = 'PAGE',
  AUDIT = 'AUDIT',
  CAMPAIGN = 'CAMPAIGN',
  COMPLIANCE = 'COMPLIANCE',
  IMAGE_ADS = 'IMAGE_ADS',
  BLOG_POST = 'BLOG_POST',
  GOAL_CALCULATOR = 'GOAL_CALCULATOR',
  PRESENTATION_BUILDER = 'PRESENTATION_BUILDER',
  PORTFOLIO_SEARCH = 'PORTFOLIO_SEARCH',
  CONTENT_PLANNER = 'CONTENT_PLANNER',
  CONTENT = 'CONTENT',
  BUSINESS_ANALYZER = 'BUSINESS_ANALYZER',
  TRAINING_COACH = 'TRAINING_COACH',
  CUSTOMER_DOSSIER = 'CUSTOMER_DOSSIER',
  LEAD_HUNTER = 'LEAD_HUNTER',
  STRATEGIC_PLANNER = 'STRATEGIC_PLANNER',
  REVERSE_DIAGNOSIS = 'REVERSE_DIAGNOSIS',
}

export type SlideType = 'title_slide' | 'agenda' | 'section_header' | 'content_bullet_points' | 'key_metrics' | 'three_column_cards' | 'table_slide' | 'numbered_list' | 'bento_grid' | 'two_column_text' | 'closing_slide';

export interface Attachment {
  name: string;
  type: string;
  size: number;
  content: string | ArrayBuffer; 
}

export interface Feedback {
    type: 'good' | 'bad';
    reason?: string;
}

export interface Message {
  role: 'user' | 'agent';
  content: string | any;
  attachments?: Attachment[];
  feedback?: Feedback;
}

export interface PresentationSlide {
    id: string;
    slide_type: SlideType;
    title: string;
    content: any;
    summary?: string;
    speaker_notes?: string;
    left_column?: string[];
    right_column?: string[];
    userImageBase64?: string | null;
}

export type PresentationTheme = 'light' | 'dark' | 'classic';

export interface PresentationPackage {
    presentation_title: string;
    target_audience: string;
    theme: PresentationTheme;
    slides: PresentationSlide[];
}

export interface GoalCalculatorState {
    salesGoal: string;
    salesSoFar: string;
    totalProposals: string;
    wonProposals: string;
    workingDays: string;
}

export interface SalesTeamMember {
    id: string;
    name: string;
    region: string;
    individualGoal: string; // Meta Individual R$
    realizedSales: string;  // Vendas Realizadas R$
    proposalsSent: string;  // Propostas Enviadas (Qtd)
    proposalsWon: string;   // Propostas Ganhas (Qtd)
}

export interface GoalComparisonState {
    previousMonth: GoalCalculatorState;
    currentMonth: GoalCalculatorState;
}

export interface PortfolioSearchResultItem {
    name: string;
    code?: string;
    details: string;
    justification: string;
    use_cases?: string[];
    recommendations?: string;
    demand_profile?: string;
}

export interface ContentPlan {
    month: string;
    strategy_summary: string;
    items: PlannedContentItem[];
}

export interface PlannedContentItem {
    id: string;
    day: number;
    platform: 'Blog' | 'LinkedIn';
    title: string;
    format: string;
    funnel_stage: string;
    keyword_focus: string;
    product_focus: string;
    briefing: string;
    isCompleted?: boolean;
}

export interface OutboundContact {
    name: string;
    company: string;
    reason: string;
    suggested_action: string;
}

export interface OutboundDailyPlan {
    day: string;
    calls_goal: number;
    key_actions: string[];
}

export interface OutboundReport {
    salesperson_name: string;
    action_report: {
        weekly_planning: OutboundDailyPlan[];
        performance_analysis: string;
    };
    abc_curve: {
        weekly_contacts: OutboundContact[];
        biweekly_contacts: OutboundContact[];
        monthly_contacts: OutboundContact[];
    };
    management_report: {
        approach_strategy: string;
        coaching_tips: string[];
        contingency_plan: string;
    };
}

export interface OutboundGoalInputs {
    goal: number;
    days: number;
    avgTicket: number;
    conversionRate: number;
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
  skywatchDeclined?: boolean;
  presentationPackage?: PresentationPackage | null;
  goalCalculatorState?: GoalCalculatorState;
  individualGoalCalculatorState?: GoalCalculatorState;
  goalComparisonState?: GoalComparisonState;
  
  // Team Planner State
  teamMembers?: SalesTeamMember[];
  teamGlobalGoal?: string;
  teamStrategyAnalysis?: string | null;

  comparisonAnalysis?: string | null;
  portfolioSearchQuery?: string;
  portfolioSearchResults?: PortfolioSearchResultItem[] | null;
  contentPlan?: ContentPlan | null;
  outboundReport?: OutboundReport[];
  outboundGoals?: Record<string, OutboundGoalInputs>;
  selectedModule?: any;

  // Form drafts for restoration
  contentPlannerDraft?: {
    month: string;
    focus: string;
  };
  blogPostDraft?: {
    topic: string;
    selectedCategory: string;
  };
  presentationDraft?: {
    prompt: string;
    slideCount: number;
  };
}

export interface Notification {
    id: number;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

export type Service = 'ga4' | 'gsc' | 'lighthouse';

export interface KnowledgeBaseProduct {
    name: string;
    keywords: string[];
    details: string;
}

export interface ComparisonPoint {
    feature: string;
    greatek: string;
    competitor: string;
}

export interface MarketIntelReport {
    greatek_product_name: string;
    competitor_product_name: string;
    sales_pitch_summary: string;
    comparison_points: ComparisonPoint[];
    competitive_advantages: string[];
    commercial_arguments: string[];
    competitor_data_sources?: { uri: string; title?: string }[];
}

export interface AdCopy {
    headline: string;
    description: string;
    highlights: string[];
    cta: string;
}

export interface ImageAdPackage {
    imageUrl: string;
    generatedPrompt: string;
    originalPrompt: string;
    adCopy?: AdCopy;
    aspectRatio?: string;
    partnerLogoUrl?: string;
    isUpscaling?: boolean;
    isRegenerating?: boolean;
    isUpscaled?: boolean;
}

export interface CustomerDossier {
    company_name: string;
    markdown_content: string;
    sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface TrainingAnalysisReport {
    score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    suggested_arguments: { title: string; explanation: string }[];
    objection_handling: { objection: string; suggestion: string }[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

export interface TrainingKitReport {
    product_name: string;
    key_selling_points: string[];
    technical_faq: { q: string; a: string }[];
    knowledge_quiz: QuizQuestion[];
}

export interface PageOptimizationPackage {
    url: string;
    seo_score: number;
    title_tag: string;
    meta_description: string;
    h1: string;
    content_suggestions: string[];
}

export interface ContentPackage {
    content_type: string;
    title_suggestions: string[];
    body: string;
    hashtags: string[];
    cta_suggestion: string;
    image_prompt_suggestion: string;
}

export interface BlogPostSection {
    heading: string;
    content: string;
}

export interface BlogPostPackage {
    title: string;
    category?: string;
    introduction: string;
    sections: BlogPostSection[];
    related_products?: { name: string; code?: string }[];
    conclusion: string;
    seo_title: string;
    seo_meta_description: string;
    seo_tags: string[];
    cta_html: string;
}

export interface SocialMediaSummary {
    platform: 'Facebook' | 'Instagram' | 'LinkedIn';
    content: string;
    hashtags: string[];
}

export interface SocialMediaSummaries {
    facebook: SocialMediaSummary;
    instagram: SocialMediaSummary;
    linkedin: SocialMediaSummary;
    suggested_image_url?: string;
    suggested_image_prompt?: string;
}

export interface LeadData {
    name?: string;
    legal_name?: string;
    trade_name?: string;
    cnpj?: string;
    responsible_name?: string;
    website?: string;
    contact_info?: string;
    whatsapp?: string;
    city?: string;
    uf?: string;
    company_status?: string;
    main_cnae?: string;
    main_cnae_description?: string;
    secondary_cnaes?: string[];
    qsa?: string[];
    cnpj_validated?: boolean;
    cnpj_source?: 'brasilapi' | 'manual' | 'not_found' | 'not_provided' | 'mock';
    cnpj_error?: string;
    relevance_score: 'Alta' | 'Média' | 'Baixa' | 'Pendente';
    reason?: string;
    potential_products?: string[];
    anatel_verified?: boolean;
    official_size?: string;
    official_tech?: string;
}

export interface ChartData {
    label: string;
    value: number;
    percentage: number;
}

export interface KPIData {
    title: string;
    value: string;
    icon: string;
    description?: string;
}

export interface BusinessAnalysisResult {
    kpis: KPIData[];
    winReasons: ChartData[];
    lossReasons: ChartData[];
    aiInsights: string;
}

export interface VigiaReport {
    monitoring_topic: string;
    executive_summary: string[];
    opportunities: string[];
    threats: string[];
    actionable_insight: string;
    sources?: GroundingSource[];
}

// Type Guards
export function isAdCopy(obj: any): obj is AdCopy {
    return obj && typeof obj.headline === 'string';
}

export function isImageAdPackage(obj: any): obj is ImageAdPackage {
    return obj && typeof obj.imageUrl === 'string' && typeof obj.generatedPrompt === 'string';
}

export function isPresentationPackage(obj: any): obj is PresentationPackage {
    return obj && Array.isArray(obj.slides) && typeof obj.presentation_title === 'string';
}

export function isMarketIntelReport(obj: any): obj is MarketIntelReport {
    return obj && Array.isArray(obj.comparison_points);
}

export function isTrainingKitReport(obj: any): obj is TrainingKitReport {
    return obj && Array.isArray(obj.knowledge_quiz);
}

export function isPageOptimizationPackage(obj: any): obj is PageOptimizationPackage {
    return obj && typeof obj.url === 'string' && typeof obj.seo_score === 'number';
}

export function isContentPackage(obj: any): obj is ContentPackage {
    return obj && typeof obj.content_type === 'string' && typeof obj.body === 'string';
}

export function isBlogPostPackage(obj: any): obj is BlogPostPackage {
    return obj && typeof obj.cta_html === 'string' && Array.isArray(obj.sections);
}

export function isCustomerDossier(obj: any): obj is CustomerDossier {
    return obj && typeof obj.company_name === 'string' && typeof obj.markdown_content === 'string';
}

export function isPortfolioSearchResult(obj: any): obj is PortfolioSearchResultItem[] {
    return Array.isArray(obj) && obj.length > 0 && typeof obj[0].justification === 'string';
}

export function isContentPlan(obj: any): obj is ContentPlan {
    return obj && Array.isArray(obj.items) && typeof obj.month === 'string';
}

export function isLeadDataArray(obj: any): obj is LeadData[] {
    return Array.isArray(obj) && (obj.length === 0 || typeof obj[0].relevance_score === 'string');
}

export interface ProductIdentification {
  name: string;
  role: string;
  pain_solved: string;
  expected_impact: string;
  risk_of_misuse: string;
  recommended_complement: string;
}

export interface ProductPainMap {
  product: string;
  pain: string;
  value_to_customer: string;
  observation: string;
}

export interface ProposalGap {
  risk_type: string;
  explanation: string;
}

export interface ProbableObjection {
  objection: string;
  commercial_response: string;
}

export interface ReverseDiagnosisResult {
  summary: string;
  probable_problem: string;
  decision_hypothesis: string;
  products_identified: ProductIdentification[];
  product_pain_map: ProductPainMap[];
  strengths: string[];
  gaps_or_risks: ProposalGap[];
  probable_objections: ProbableObjection[];
  missing_questions: string[];
  how_to_explain_to_customer: string;
  improvements: string[];
  confidence_level: 'Alta' | 'Média' | 'Baixa';
  confidence_reason: string;
  recommended_next_step: string;
}

