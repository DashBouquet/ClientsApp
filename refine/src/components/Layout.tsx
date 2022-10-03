import {
    AntdLayout,
    Sider
} from "@pankod/refine-antd";
import { LayoutProps } from "@pankod/refine-core";
import { Session } from "@ory/client";
import { Merge } from "helpers/types";
import HeaderComponent from "./Header";

type CustomLayoutProps = Merge<
    LayoutProps,
    {
    }
>;

const Layout: React.FC<CustomLayoutProps> = ({
    children, 
    Footer, 
    OffLayoutArea
}) => (
    <AntdLayout style={{ minHeight: "100vh", flexDirection: "row" }}>
        <Sider />
        <AntdLayout>
            {/* <HeaderComponent session={{
                
            }} logoutUrl={logoutUrl} /> */}
            <AntdLayout.Content>
                <div style={{ padding: 24, minHeight: 360 }}>
                    {children}
                </div>
                {OffLayoutArea && <OffLayoutArea />}
            </AntdLayout.Content>
            {Footer && <Footer />}           
        </AntdLayout>
    </AntdLayout>
);

export default Layout;