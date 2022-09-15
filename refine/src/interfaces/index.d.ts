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
