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

import {IPayment, IProject } from "interfaces";

export const PaymentsList: React.FC = () => {
    const { tableProps } = useTable<IPayment>({
        metaData: {
            fields: [
                "id", 
                "payment_name", 
                "project_id",
                "value",
                {
                    project: ["project_name"]
                }
            ]
        }
    });

    const {selectProps} = useSelect<IProject>({
        resource: "projects",
        optionLabel: "project_name",
        metaData: {
            fields: ["id", "project_name"],
        },
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="payment_name" title="Payment" />
                <Table.Column dataIndex="value" title="Value" />
                <Table.Column<IPayment>
                    dataIndex="project_id"
                    title="Project"
                    render={(_, record) => record.project.project_name}
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Select
                                style={{ minWidth: 200 }}
                                mode="multiple"
                                placeholder="Select Project"
                                {...selectProps}
                            />
                        </FilterDropdown>
                    )}
                    defaultFilteredValue={getDefaultFilter(
                        "project_name"
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