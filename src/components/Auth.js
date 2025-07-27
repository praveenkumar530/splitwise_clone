// components/Auth.js
import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import { GoogleOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";

const { Title, Text } = Typography;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEmailAuth = async (values) => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        message.success("Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        message.success("Account created successfully!");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      message.success("Logged in with Google successfully!");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2} className="text-blue-600 mb-2">
            💰 SplitWise
          </Title>
          <Text type="secondary">
            {isLogin ? "Welcome back!" : "Create your account"}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleEmailAuth}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </Form.Item>
        </Form>

        <Divider>or</Divider>

        <Button
          type="default"
          icon={<GoogleOutlined />}
          onClick={handleGoogleAuth}
          loading={loading}
          className="w-full mb-4"
          size="large"
        >
          Continue with Google
        </Button>

        <div className="text-center">
          <Text type="secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <Button
            type="link"
            onClick={() => setIsLogin(!isLogin)}
            className="p-0"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
