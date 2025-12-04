// types/quality.ts
export interface User {
  id: number;
  name: string;
  surname?: string;
  email: string;
  team_id: number;
}

export interface Team {
  id: number;
  name: string;
}

export interface QualityCriterionCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QualityCriterion {
  id: number;
  name: string;
  description: string | null;
  max_score: number;
  is_active: boolean;
  is_global?: boolean;
  category_id?: number | null;
  category?: QualityCriterionCategory | null;
  teams?: Team[];
  created_at: string;
  updated_at: string;
}

export interface QualityDeduction {
  id: number;
  quality_map_id: number;
  criteria_id: number;
  chat_id: string;
  deduction: number;
  comment: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  criterion?: QualityCriterion;
  createdBy?: User;
}

export interface QualityCallDeduction {
  id: number;
  quality_map_id: number;
  criteria_id: number;
  call_id: string;
  deduction: number;
  comment: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  criterion?: QualityCriterion;
  createdBy?: User;
}

export interface QualityMap {
  id: number;
  user_id: number;
  checker_id: number;
  start_date: string;
  end_date: string;
  team_id: number;
  chat_ids: string[];
  call_ids?: string[];
  calls_count?: number;
  total_score?: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  team?: Team;
  checker?: User;
  deductions?: QualityDeduction[];
  call_deductions?: QualityCallDeduction[];
}

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
}

// Request types for quality maps
export interface CreateQualityMapRequest {
  user_id: number;
  team_id: number;
  start_date: string;
  end_date: string;
  chat_count: number;
  calls_count?: number;
}

export interface CreateDeductionRequest {
  quality_map_id: number;
  criteria_id: number;
  chat_id: string;
  deduction: number;
  comment: string;
}

export interface CreateCallDeductionRequest {
  quality_map_id: number;
  criteria_id: number;
  call_id: string;
  deduction: number;
  comment: string;
}

export interface UpdateChatIdsRequest {
  chat_ids: string[];
}

export interface UpdateCallIdsRequest {
  call_ids: string[];
}

// Response types for quality maps
export interface QualityMapListResponse {
  data: QualityMapListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface QualityMapsFilter {
  team_id?: number;
  user_id?: number;
  group_id?: number;
  checker_id?: number;
  status?: 'active' | 'completed' | 'all';
  search?: string;
  start_date?: string;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface QualityMapListItem {
  id: number;
  user_id: number;
  user_name: string;
  team_id: number;
  team_name: string;
  checker_id: number;
  checker_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed';
  total_chats: number;
  checked_chats: number;
  total_calls: number;
  checked_calls: number;
  total_score: number;
}

// Form value types
export interface QualityMapFormValues {
  user_id: number;
  team_id: number;
  dates: [any, any]; // dayjs.Dayjs type from antd
  chat_count: number;
  calls_count?: number;
}

export interface DeductionFormValues {
  deduction: number;
  comment: string;
}

export interface EditChatModalValues {
  chatName: string;
}

export interface EditCallModalValues {
  callName: string;
}

export interface SelectedCell {
  criteriaId: number;
  chatIndex: number;
  existingDeduction?: QualityDeduction;
}

export interface QualityTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal: boolean;
  [key: string]: unknown;
}