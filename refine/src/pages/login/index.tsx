import { useCallback, useState } from "react";
import { useLogin, useRegister } from "@pankod/refine-core";
import {
    Row,
    Col,
    AntdLayout,
    Card,
    Typography,
    Form,
    Input,
    Button
} from "@pankod/refine-antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import "./styles.css";
import { ILoginForm } from "interfaces";

const { Text, Title } = Typography;

export const Login = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [form] = Form.useForm<ILoginForm>();
    const { mutate: login } = useLogin<ILoginForm>();
    const { mutate: register } = useRegister<ILoginForm>();

    const signUpFlow = () => {
        setIsLogin(false);
    };

    const loginFlow = () => {
        setIsLogin(true);
    };

    const onSumbitForm = useCallback((values: any) => {
        if (isLogin) {
            login(values);
        } else {
            register(values);
        }
    }, [isLogin]);

    const CardTitle = (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 4fr 1fr",
            alignItems: "center"
        }}>
            {!isLogin ? <ArrowLeftOutlined className="arrow" onClick={loginFlow} /> : <div></div>}
            <Title level={3} className="title">
                Sign {isLogin ? "in" : "up"} your account
            </Title>
        </div>
    );

    return (
        <AntdLayout className="layout">
            <Row
                justify="center"
                align="middle"
                style={{
                    height: "100vh",
                }}
            >
                <Col xs={22}>
                    <div className="container">
                        <div className="imageContainer">
                            <img src="./refine.svg" alt="Refine Logo" />
                        </div>
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            <Form<ILoginForm>
                                layout="vertical"
                                form={form}
                                onFinish={onSumbitForm}
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="username"
                                    label="Username"
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Username"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true }]}
                                    style={{ marginBottom: "12px" }}
                                >
                                    <Input
                                        type="password"
                                        placeholder="●●●●●●●●"
                                        size="large"
                                    />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    block
                                >
                                    {isLogin ? "Sign in" : "Sign up"}
                                </Button>
                            </Form>
                            {
                                isLogin && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: 12 }}>
                                            Don’t have an account?{" "}
                                            <Button
                                                type="default"
                                                size="small"
                                                onClick={signUpFlow}
                                            >
                                                Sign up
                                            </Button>
                                        </Text>
                                    </div>
                                )
                            }
                        </Card>
                    </div>
                </Col>
            </Row>
        </AntdLayout>
    );
};