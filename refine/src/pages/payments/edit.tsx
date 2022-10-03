import {
    useForm,
    Form,
    Input,
    Edit,
    Select,
    useSelect
} from "@pankod/refine-antd";
import { IPayment, IProject } from "interfaces";

export const PaymentEdit: React.FC = () => {
    const { formProps, saveButtonProps, queryResult } = useForm<IPayment>({
        metaData: {
            fields: [
                "id", 
                "payment_name",
                "project_id",
                "value",
                {
                    project: ["id", "project_name"]
                }
            ]
        }
    });
    const payment = queryResult?.data?.data;
    const { selectProps: clientSelectProps } = useSelect<IProject>({
        resource: "projects",
        defaultValue: payment?.project_id,
        optionLabel: "project_name",
        metaData: {
            fields: ["id", "project_name"],
        },
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Payment Name"
                    name="payment_name"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Value"
                    name="value"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Project" name="project_id">
                    <Select {...clientSelectProps} />
                </Form.Item>
            </Form>
        </Edit>
    );
};