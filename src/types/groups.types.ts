import type { IUserWithShifts } from "./user.types";

export interface IGroupSupervisor {
    id: number;
    name: string;
    surname?: string | null;
    fullname: string;
}

export interface IGroup {
    id: number;
    name: string;
    shift_type: string;
    shift_number: string;
    team: string;
    team_id?: number;
    supervisor?: IGroupSupervisor | null;
}

export interface IGroupResource extends IGroup {
    team_id: number;
}

export interface IGroupWithUsers extends IGroup{
    users: IUserWithShifts[];
}

export interface IGroupForm {
    name: string;
    team_id: number | null;
    shift_type: string | null;
    shift_number: string | null;
    supervisor_id?: number | null;
}

// Types for GroupsPage
export type GroupStatusType = "success" | "processing" | "default" | "error" | "warning";

export interface GroupMember {
  id: number;
  name: string;
  surname: string;
  position: string;
  avatarColor: string;
  callsHandled: number;
  satisfaction: number;
  avgResponseTime: string;
  status: 'online' | 'busy' | 'offline';
}

export interface Group {
  id: number;
  name: string;
  description: string;
  supervisor: string;
  memberCount: number;
  onlineMembers: number;
  totalCalls: number;
  resolvedCalls: number;
  avgSatisfaction: number;
  avgResponseTime: string;
  createdAt: string;
  status: 'high-performance' | 'active' | 'training';
  members: GroupMember[];
  specializations: string[];
  shift: 'day' | 'night' | 'mixed';
}