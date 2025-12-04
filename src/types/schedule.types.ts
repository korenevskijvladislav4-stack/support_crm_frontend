import type { IGroupWithUsers } from "./groups.types";

export interface ISchedule{
    days_in_month: number;
    groups: IGroupWithUsers[];
}
export type FormFieldValue = 
  | string 
  | Date 
  | null 
  | number 
  | number[] 
  | boolean 
  | undefined;

export interface IScheduleFilterForm{
    month: string;
    team_id?: number|null;
    shift_type: string;
}

export interface IScheduleForm{
    team_id: number|null;
    top_start: string;
    bottom_start: string;
}