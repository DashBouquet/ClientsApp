import { Identity, Session } from "@ory/client";
import {Button, Space, Typography} from "@pankod/refine-antd";
import { Nullable } from "helpers/types";
import Spinner from "react-spinners/ScaleLoader"

const {Text} = Typography;

type HeaderProps = {
    session: Session | undefined
    logoutUrl?: string,
}

const override: React.CSSProperties = {
    margin: "0 auto",
    borderColor: "red",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
};


const HeaderComponent: React.FC<HeaderProps> = ({session, logoutUrl}) => {
    const getUsername = (identity: Nullable<Identity>) => 
        identity?.traits.email || identity?.traits.username;
    
    return (
        <>
            <Spinner color="#2A132E" cssOverride={override} loading={!session}/>
            <div style={{
                    margin: "15px 24px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                <Space>
                    <Text>{getUsername(session?.identity)}</Text>
                    <Button>
                        <a href={logoutUrl}>Logout</a>
                    </Button>
                </Space>
            </div>
        </>
    );
};

export default HeaderComponent;