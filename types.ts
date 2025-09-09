export enum AppMode {
  PAGE = "Página",
  SALES_ASSISTANT = "Divisor de Águas",
  AUDIT = "Auditoria",
  CONTENT = "Conteúdo",
  CAMPAIGN = "Campanhas",
  COMPLIANCE = "Endomarketing",
  MARKET_INTEL = "Mercado",
}

// FIX: Added Notification interface for use in Notifications component.
export interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

// FIX: Added Service type for use in AdminPanel and ConnectionPrompt components.
export type Service = 'ga4' | 'gsc' | 'lighthouse';

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
  schema_jsonld: string; // This will be a stringified JSON
  ab_test_meta: MetaVariant[];
  tech_checklist: string[];
}