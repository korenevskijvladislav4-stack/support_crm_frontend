import type { IPaginatedResponse } from "./common.types";
import type { IShiftRequest } from "./shift.types";

export interface IShiftRequestCounters {
  unviewed: number;
  viewed: number;
}

export interface IShiftRequestListResponse extends IPaginatedResponse<IShiftRequest> {
  meta: IPaginatedResponse<IShiftRequest>['meta'] & {
    counters?: IShiftRequestCounters;
  };
}

export interface IShiftRequestFilters {
  page: number;
  per_page: number;
  full_name: string;
  team_id: number | null;
  group_id: number | null;
  date_from: string | null;
  date_to: string | null;
  status?: 'pending' | 'approved' | 'rejected';
}

