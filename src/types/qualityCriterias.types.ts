export interface IQualityCriteriaCategory {
    id: number;
    name: string;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface IQualityCriteria{
    id: number;
    name: string;
    description?: string;
    max_score?: number;
    is_global?: boolean;
    is_active?: boolean;
    category_id?: number | null;
    category?: IQualityCriteriaCategory | null;
    teams?: Array<{
        id: number;
        name: string;
        pivot?: {
            criteria_id: number;
            team_id: number;
        };
    }>;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface IQualityCriteriaForm{
    name: string;
    description?: string;
    max_score?: number;
    team_ids?: number[];
    is_global?: boolean;
    category_id?: number | null;
}

// Form values for quality criteria
export interface CriterionFormValues {
  name: string;
  description: string;
  max_score: number;
  team_ids: number[];
  is_global: boolean;
  category_id?: number | null;
}

// Team with pivot relation
export interface TeamWithPivot {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    criteria_id: number;
    team_id: number;
  };
}