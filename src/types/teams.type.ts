import type { IRole } from "./role.types";

export interface ITeam{
    id: number;
    name: string;
    roles:IRole[]
}

export interface ITeamForm{
    name: string;
    role_id: number[]|null;
}