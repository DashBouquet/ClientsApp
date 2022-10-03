import { useShow } from "@pankod/refine-core";
import { Show, Typography } from "@pankod/refine-antd";

import { ICost } from "interfaces";

const { Title, Text } = Typography;

export const CostShow = () => {
    const metaData = {
        fields: [
            "id",
            "cost_name",
            {
                project: ["id", "project_name"]
            }
        ]
    };
    const { queryResult } = useShow<ICost>({
        metaData
    });
    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Name</Title>
            <Text>{record?.cost_name}</Text>

            <Title level={5}>Client</Title>
            <Text>{record?.project.project_name}</Text>
        </Show>
    );
};