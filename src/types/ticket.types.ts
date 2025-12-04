import type { ITeam } from "./teams.type";
import type { IUser } from "./user.types";

export interface ITicketType {
  id: number;
  name: string;
  description: string;
  fields: ITicketField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITicketField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'date';
  label: string;
  required: boolean;
  options?: string[];
}

export interface ITicketStatus {
  id: number;
  name: string;
  color: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITicket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  type_id: number;
  status_id: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creator_id: number;
  team_id: number | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  type?: ITicketType;
  status?: ITicketStatus;
  creator?: IUser;
  team?: ITeam;
  comments?: ITicketComment[];
  attachments?: ITicketAttachment[];
  activities?: ITicketActivity[];
}

export interface ITicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: IUser;
}

export interface ITicketAttachment {
  id: number;
  ticket_id: number;
  user_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  path: string;
  size: number;
  created_at: string;
  updated_at: string;
  user?: IUser;
}

export interface ITicketActivity {
  id: number;
  ticket_id: number;
  user_id: number;
  type: string;
  description: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: IUser;
}

export interface ITicketFilters {
  search?: string;
  status_id?: number;
  type_id?: number;
  priority?: string;
  team_id?: number;
  creator_id?: number;
}

export interface ITicketFormValues {
  title: string;
  description: string;
  type_id: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  custom_fields?: Record<string, unknown>;
}

export interface ITicketEditFormValues {
  title: string;
  description: string;
  status_id: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface IPriorityInfo {
  icon: string;
  text: string;
  color: string;
  gradient: string;
}