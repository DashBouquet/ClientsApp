import {
    Create,
    Form,
    Input,
    useForm,
    useSelect,
    Select
} from "@pankod/refine-antd";

import { ICost, IProject } from "interfaces";

export const CostCreate = () => {
    const { formProps, saveButtonProps } = useForm<ICost>();

    const { selectProps: clientSelectProps } = useSelect<IProject>({
        resource: "projects",
        optionLabel: "project_name",
        metaData: {
            fields: ["id", "project_name"],
        }
    });


    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Cost Name"
                    name="cost_name"
                    rules={[
                        {
                            required: true
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Value, $"
                    name="value"
                    rules={[
                        {
                            required: true
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    label="Project"
                    name="project_id"
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