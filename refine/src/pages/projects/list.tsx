import {
    getDefaultFilter,
} from "@pankod/refine-core";

import {
    List,
    Table,
    useTable,
    ShowButton,
    Space,
    EditButton,
    Select,
    useSelect,
    FilterDropdown,
} from "@pankod/refine-antd";

import { IClient, IProject } from "interfaces";

export const ProjectList: React.FC = () => {
    const { tableProps } = useTable<IProject>({
        metaData: {
            fields: [
                "id", 
                "project_name", 
                "client_id",
                {
                    client: ["name"]
                }
            ]
        }
    });

    const {selectProps} = useSelect<IClient>({
        resource: "clients",
        optionLabel: "name",
        metaData: {
            fields: ["id", "name"],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="project_name" title="Project Name" />
                <Table.Column<IProject>
                    dataIndex="client_id"
                    title="Client"
                    render={(_, record) => record.client.name}
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                style={{ minWidth: 200 }}
                                mode="multiple"
                                placeholder="Select Category"
                                {...selectProps}
                            />
                        </FilterDropdown>
                    )}
                    defaultFilteredValue={getDefaultFilter(
                        "name"
                    )}
                />
                <Table.Column<IProject>
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