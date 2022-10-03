import { ClientCreate, ClientEdit, ClientList, ClientShow } from "./clients";
import { CostEdit, CostList, CostShow, CostCreate } from "./costs";
import { PaymentCreate, PaymentEdit, PaymentShow, PaymentsList } from "./payments";
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
    },
    {
        name: "payments",
        list: PaymentsList,
        show: PaymentShow,
        edit: PaymentEdit,
        create: PaymentCreate        
    },
    {
        name: "costs",
        list: CostList,
        show: CostShow,
        edit: CostEdit,
        create: CostCreate        
    }
];