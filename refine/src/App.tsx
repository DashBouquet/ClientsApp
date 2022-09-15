import { Refine } from "@pankod/refine-core";
import {
    Layout,
    ReadyPage,
    notificationProvider,
    ErrorComponent,
} from "@pankod/refine-antd";
import routerProvider from "@pankod/refine-react-router-v6";
import dataProvider from "@pankod/refine-hasura";

import client from "graphql-client";
import { resources } from "pages";

import "@pankod/refine-antd/dist/styles.min.css";

export const App: React.FC = () => (
    <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider(client)}
        Layout={Layout}
        ReadyPage={ReadyPage}
        notificationProvider={notificationProvider}
        catchAll={<ErrorComponent />}
        resources={resources}
    />
);