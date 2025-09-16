

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
  VIGIA = "O Vigia",
  ARQUITETO = "Arquiteto",
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

export interface BenefitSimulation {
  metric: string;
  current_scenario: string;
  proposed_scenario: string;
  improvement: string;
}

export interface NetworkArchitectureReport {
  diagnosis: string;
  proposed_solution: {
    title: string;
    description: string;
  };
  benefit_simulation: BenefitSimulation[];
  commercial_arguments: string[];
  required_products: {
    category: string;
    product: string;
    suggestion: string;
  }[];
}

export interface Message {
  role: Role;
  content: string | PageOptimizationPackage | MarketIntelReport | TrainingKitReport | VigiaReport | NetworkArchitectureReport;
  feedback?: 'good' | 'bad' | null;
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  createdAt: Date;
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

export function isPageOptimizationPackage(response: any): response is PageOptimizationPackage {
  return response && typeof response === 'object' && 'url' in response && 'tech_checklist' in response && 'schema_jsonld' in response;
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