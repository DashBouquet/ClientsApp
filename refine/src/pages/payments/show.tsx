import { useShow } from "@pankod/refine-core";
import { Show, Typography } from "@pankod/refine-antd";

import { IPayment } from "interfaces";

const { Title, Text } = Typography;

export const PaymentShow = () => {
    const metaData = {
        fields: [
            "id",
            "payment_name",
            {
                project: ["id", "project_name"]
            }
        ]
    };
    const { queryResult } = useShow<IPayment>({
        metaData
    });
    const { data, isLoading } = queryResult;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>ID</Title>
            <Text>{record?.id}</Text>

            <Title level={5}>Name</Title>
            <Text>{record?.payment_name}</Text>

            <Title level={5}>Client</Title>
            <Text>{record?.project.project_name}</Text>
        </Show>
    );
};