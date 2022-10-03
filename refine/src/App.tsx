import { Refine } from "@pankod/refine-core";
import {
    ReadyPage,
    notificationProvider,
    ErrorComponent,
    Layout
} from "@pankod/refine-antd";
import routerProvider from "@pankod/refine-react-router-v6";
import dataProvider from "@pankod/refine-hasura";

import { Login } from "pages/login";
import client from "graphql-client";
import { resources } from "pages";
import authProvider from "./auth-provider";

import "@pankod/refine-antd/dist/styles.min.css";

export const App: React.FC = () => {

    return (
        <Refine
            authProvider={authProvider}
            routerProvider={routerProvider}
            LoginPage={Login}
            dataProvider={dataProvider(client)}
            Layout={Layout}
            ReadyPage={ReadyPage}
            notificationProvider={notificationProvider}
            catchAll={<ErrorComponent />}
            resources={resources}
        />
    );
};