import {
    Create,
    Form,
    Input,
    useForm,
    useSelect,
    Select
} from "@pankod/refine-antd";

import { IClient, IProject } from "interfaces";

export const ProjectCreate = () => {
    const { formProps, saveButtonProps } = useForm<IProject>();

    const { selectProps: clientSelectProps } = useSelect<IClient>({
        resource: "clients",
        optionLabel: "name",
        metaData: {
            fields: ["id", "name"],
        },
    });


    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Project Name"
                    name="project_name"
                    rules={[
                        {
                            required: true
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    label="Client"
                    name="client_id"
                    rules={[
                        {
                            required: true
                        }
                    ]}
                >
                    <Select {...clientSelectProps} />
                </Form.Item>
            </Form>
        </Create>
    );
};