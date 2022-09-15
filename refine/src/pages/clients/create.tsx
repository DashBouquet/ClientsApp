import {
    Create,
    Form,
    Input,
    useForm
} from "@pankod/refine-antd";

import { IClient } from "interfaces";

export const ClientCreate = () => {
    const { formProps, saveButtonProps } = useForm<IClient>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Contact"
                    name="contact"
                >
                    <Input />
                </Form.Item>
            </Form>
        </Create>
    );
};