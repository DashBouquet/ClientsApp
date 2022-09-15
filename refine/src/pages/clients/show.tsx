import { useShow } from "@pankod/refine-core";
import { Show, Typography, useSelect } from "@pankod/refine-antd";

import { IClient } from "interfaces";

const { Title, Text } = Typography;

export const ClientShow = () => {
    const metaData = {
        fields: [
            "id",
            "name"
        ]
    };
    const { queryResult } = useShow<IClient>({
        metaData
    });
    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Name</Title>
            <Text>{record?.name}</Text>
        </Show>
    );
};