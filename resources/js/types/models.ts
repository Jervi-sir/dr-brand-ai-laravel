export interface AiModel {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  endpoint: string | null;
  api_key: string | null;
  capability: string | null;
  type: string | null;
  is_active: boolean;
  max_tokens: number | null;
  temperature: number | null;
  custom_prompts: string | null;
  input_price: string | null;
  output_price: string | null;
  cached_input_price: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  id: number;
  name: string;
  provider: string;
  token: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  user_id: number;
  title: string;
  visibility: string;
  capability: string | null;
  threadId: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface OpenAiApiUsage {
  id: number;
  chat_id: number;
  model_id: number;
  type: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration: string;
  created_at: string;
  updated_at: string;
  chat?: Chat;
  model?: AiModel;
}

export interface PromptHistory {
  id: number;
  model_id: number;
  prompt: string;
  userEmail: string | null;
  created_at: string;
  updated_at: string;
  ai_model?: AiModel;
}

export interface Code {
  id: number;
  code: string;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usages?: CodeUsage[];
}

export interface CodeUsage {
  id: number;
  code_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  code?: Code;
}

export interface PaginatedData<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
