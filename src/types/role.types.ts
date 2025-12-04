export interface IRole{
    id: number;
    name: string;
    permissions: string[];
    created_at: Date;
}

export interface IRoleForm{
    name: string;
    permissions: string[];
}

export type ICreateRoleForm = IRoleForm;