import {
    List,
    Table,
    useTable,
    ShowButton,
    Space,
    EditButton
} from "@pankod/refine-antd";

import { IClient } from "interfaces";

export const ClientList: React.FC = () => {
    const { tableProps } = useTable<IClient>({
        metaData: {
            fields: ["id", "name", "contact"]
        }
    });
    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="contact" title="Contact" />
                <Table.Column<IClient>
                    title="Actions"
                    dataIndex="actions"
                    render={(_text, record): React.ReactNode => (
                        <Space>
                            <ShowButton
                                size="small"
                                recordItemId={record.id}
                                hideText
                            />
                            <EditButton
                                size="small"
                                recordItemId={record.id}
                                hideText
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};