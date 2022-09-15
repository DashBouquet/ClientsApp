import { ClientCreate, ClientEdit,ClientList,ClientShow } from "./clients";
import { ProjectList, ProjectShow, ProjectEdit, ProjectCreate } from "./projects";

export const resources = [
    {
        name: "clients",
        show: ClientShow,
        edit: ClientEdit,
        list: ClientList,
        create: ClientCreate 
    },
    {
        name: "projects",
        list: ProjectList,
        show: ProjectShow,
        edit: ProjectEdit,
        create: ProjectCreate
    }
];