import {
    useForm,
    Form,
    Input,
    Edit,
} from "@pankod/refine-antd";
import { IClient } from "interfaces";

export const ClientEdit: React.FC = () => {
    const { formProps, saveButtonProps } = useForm<IClient>({
        metaData: {
            fields: [
                "id", "name", "contact"
            ]
        }
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
                <Form.Item label="Contact"name="contact">
                    <Input />
                </Form.Item>
            </Form>
        </Edit>
    );
};