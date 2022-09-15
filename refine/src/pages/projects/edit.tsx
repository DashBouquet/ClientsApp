import {
    useForm,
    Form,
    Input,
    Edit,
    Select,
    useSelect
} from "@pankod/refine-antd";
import { IClient, IProject } from "interfaces";

export const ProjectEdit: React.FC = () => {
    const { formProps, saveButtonProps, queryResult } = useForm<IProject>({
        metaData: {
            fields: [
                "id", 
                "project_name",
                "client_id",
                {
                    client: ["id", "name"]
                }
            ]
        }
    });
    const project = queryResult?.data?.data;
    const { selectProps: clientSelectProps } = useSelect<IClient>({
        resource: "clients",
        defaultValue: project?.client_id,
        optionLabel: "name",
        metaData: {
            fields: ["id", "name"],
        },
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Project Name"
                    name="project_name"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Client"name="client_id">
                    <Select {...clientSelectProps} />
                </Form.Item>
            </Form>
        </Edit>
    );
};