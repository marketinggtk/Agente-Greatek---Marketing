


export enum AppMode {
  INTEGRATOR = "Integrador",
  INSTRUCTOR = "Instrutor",
  PAGE = "Página",
  SALES_ASSISTANT = "Assistente Comercial",
  AUDIT = "Auditoria",
  CONTENT = "Conteúdo",
  CAMPAIGN = "Campanhas",
  COMPLIANCE = "Endomarketing",
  MARKET_INTEL = "Mercado",
  ARQUITETO = "Arquiteto",
  IMAGE_ADS = "Gerador de Imagens",
  SKYWATCH = "SkyWatch",
  GOAL_CALCULATOR = "Calculadora de Metas",
  PRESENTATION_BUILDER = "Criador de Apresentações",
  PGR_CALCULATOR = "Calculadora de PGR Individual",
  BUSINESS_ANALYZER = "Analisador de Negócios",
  TRAINING_COACH = "Coach de Treinamento",
  CUSTOMER_DOSSIER = "Gerador de Dossiê",
  BLOG_POST = "Criador de Blog Post",
}

export type Role = 'user' | 'agent';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface TrainingKitReport {
  product_name: string;
  key_selling_points: string[];
  technical_faq: { q: string; a: string; }[];
  knowledge_quiz: QuizQuestion[];
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded string
}

export interface Feedback {
  type: 'good' | 'bad';
  reason?: string;
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
  partnerLogoUrl?: string;
  isUpscaling?: boolean;
  isUpscaled?: boolean;
  isRegenerating?: boolean;
  referenceImage?: Attachment;
  aspectRatio?: string;
}

export interface ContentPackage {
  content_type: string;
  title_suggestions: string[];
  body: string;
  hashtags: string[];
  image_prompt_suggestion: string;
  cta_suggestion: string;
}

export interface BlogPostPackage {
    title: string;
    introduction: string;
    sections: { heading: string; content: string; }[];
    related_products: { name: string; code?: string; }[];
    conclusion: string;
    seo_title: string;
    seo_meta_description: string;
    image_prompt_suggestion: string;
    cta_html: string;
}

export type SlideType = 
  | 'title_slide' 
  | 'agenda' 
  | 'section_header' 
  | 'content_bullet_points' 
  | 'closing_slide'
  // New visual layouts
  | 'key_metrics'
  | 'three_column_cards'
  | 'numbered_list'
  | 'bento_grid'
  | 'table_slide';

export interface PresentationSlide {
  id: string;
  slide_type: SlideType;
  title: string;
  content: any; // Can be string[] for bullets, or a structured object for visual layouts
  summary?: string; // Optional summary text below the main content
  speaker_notes: string;
  image_prompt_suggestion?: string;
  imageUrl?: string;
  userImage?: string; // Base64 data URL for user-uploaded image
  warning?: string;
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
}

export interface GoalComparisonState {
  previousMonth: GoalCalculatorState;
  currentMonth: GoalCalculatorState;
}

export type PgrMetricValues = {
  meta: string;
  realizado: string;
};

export interface PgrCalculatorState {
  selectedSellerId: string;
  sellerName: string;
  metrics: Record<string, PgrMetricValues>;
}

export interface PgrSeller {
  id: string;
  name: string;
  password?: string;
  metas: Record<string, string>;
}

// FIX: Added missing KnowledgeBaseProduct interface.
export interface KnowledgeBaseProduct {
  name: string;
  keywords: string[];
  details: string;
  code?: string;
}

export interface CustomerDossier {
    company_name: string;
    markdown_content: string;
    sources?: GroundingSource[];
}


export interface Message {
  role: Role;
  content: string | PageOptimizationPackage | MarketIntelReport | TrainingKitReport | ImageAdPackage | ContentPackage | BlogPostPackage | PresentationPackage | VigiaReport | CustomerDossier;
  attachments?: Attachment[];
  feedback?: Feedback | null;
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  createdAt: Date;
  skywatchDeclined?: boolean;
  presentationPackage?: PresentationPackage | null;
  goalCalculatorState?: GoalCalculatorState;
  goalComparisonState?: GoalComparisonState;
  comparisonAnalysis?: string | null;
  pgrCalculatorState?: PgrCalculatorState;
  pgrAuthenticatedSellerId?: string | null;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface InternalLink {
  anchor: string;
  target: string;
}

export interface MetaVariant {
  variant: string;
  title: string;
  description: string;
}

export interface PageOptimizationPackage {
  url: string;
  title: string;
  meta_description: string;
  h1: string;
  h2: string[];
  faqs: FaqItem[];
  internal_links: InternalLink[];
  schema_jsonld: string; 
  ab_test_meta: MetaVariant[];
  tech_checklist: string[];
}

export interface TrainingAnalysisReport {
    score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    suggested_arguments: { title: string; explanation: string; }[];
    objection_handling: { objection: string; suggestion: string; }[];
}


export function isPageOptimizationPackage(response: any): response is PageOptimizationPackage {
  return response && typeof response === 'object' && 'url' in response && 'tech_checklist' in response && 'schema_jsonld' in response;
}

export function isAdCopy(response: any): response is AdCopy {
    return response && typeof response === 'object' && 'headline' in response && 'cta' in response;
}

export function isImageAdPackage(response: any): response is ImageAdPackage {
  return response && typeof response === 'object' && 'imageUrl' in response && 'generatedPrompt' in response;
}

export function isContentPackage(response: any): response is ContentPackage {
    return response && typeof response === 'object' && 'content_type' in response && 'image_prompt_suggestion' in response;
}

export function isBlogPostPackage(response: any): response is BlogPostPackage {
    return response && typeof response === 'object' && 'seo_title' in response && Array.isArray(response.sections) && 'cta_html' in response;
}

export function isPresentationPackage(response: any): response is PresentationPackage {
    return response && typeof response === 'object' && 'presentation_title' in response && Array.isArray(response.slides);
}

export function isCustomerDossier(response: any): response is CustomerDossier {
    return response && typeof response === 'object' && 'company_name' in response && 'markdown_content' in response;
}

export interface ComparisonPoint {
  feature: string;
  greatek: string;
  competitor: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface MarketIntelReport {
  sales_pitch_summary: string;
  greatek_product_name: string;
  competitor_product_name: string;
  comparison_points: ComparisonPoint[];
  competitive_advantages: string[];
  commercial_arguments: string[];
  competitor_data_sources?: GroundingSource[];
}

// FIX: Added missing VigiaReport interface based on its usage.
export interface VigiaReport {
  monitoring_topic: string;
  executive_summary: string[];
  opportunities: string[];
  threats: string[];
  actionable_insight: string;
  sources?: GroundingSource[];
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export type Service = 'ga4' | 'gsc' | 'lighthouse';

export interface KPIData {
  title: string;
  value: string;
  icon: string;
  description?: string;
}

export interface ChartData {
  label: string;
  value: number | string;
  percentage: number;
}

export interface BusinessAnalysisResult {
  kpis: KPIData[];
  winReasons: ChartData[];
  lossReasons: ChartData[];
  aiInsights: string;
}