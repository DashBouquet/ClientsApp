export interface IClient {
    id: string;
    name: string;
    contact: string;
}

export interface IProject { 
    id: string,
    project_name: string,
    client_id: string,
    client: IClient
}

export interface IPayment {
    id: string,
    payment_name: string,
    project_id: string,
    value: string,
    project: IProject
}

export interface ICost{
    id: string,
    cost_name: string,
    project_id: string,
    value: string,
    project: IProject
}

export interface ILoginForm {
    username: string;
    password: string;
}
