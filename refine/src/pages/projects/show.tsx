import { useShow } from "@pankod/refine-core";
import { Show, Typography } from "@pankod/refine-antd";

import { IProject } from "interfaces";

const { Title, Text } = Typography;

export const ProjectShow = () => {
    const metaData = {
        fields: [
            "id",
            "project_name",
            {
                client: ["id", "name"]
            }
        ]
    };
    const { queryResult } = useShow<IProject>({
        metaData
    });
    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Name</Title>
            <Text>{record?.project_name}</Text>

            <Title level={5}>Client</Title>
            <Text>{record?.client.name}</Text>
        </Show>
    );
};