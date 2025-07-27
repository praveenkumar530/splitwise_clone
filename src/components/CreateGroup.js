// components/CreateGroup.js
import React, { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Form,
  Input,
  Select,
  Space,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppContext } from "../contexts/AppContext";
import { useGroups } from "../hooks/useFirestore";

const { Title } = Typography;
const { Option } = Select;

const CreateGroup = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { currentUser, setCurrentPage } = useAppContext();
  const { createGroup } = useGroups(currentUser?.uid);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const members = values.members || [];

      // Validate all emails
      const invalidEmails = members.filter((email) => !validateEmail(email));
      if (invalidEmails.length > 0) {
        message.error(`Invalid email addresses: ${invalidEmails.join(", ")}`);
        setLoading(false);
        return;
      }

      // Process members
      const processedMembers = members.map((email) => ({
        user_id: email,
        is_google_email: email.includes("@gmail.com"),
        is_account_verified: false,
      }));

      // Add creator as a member
      processedMembers.unshift({
        user_id: currentUser.uid,
        is_google_email: true,
        is_account_verified: true,
      });

      const groupData = {
        name: values.name,
        creator: currentUser.uid,
        members: processedMembers,
      };

      await createGroup(groupData);
      setCurrentPage("groups");
    } catch (error) {
      console.error("Error creating group:", error);
      message.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => setCurrentPage("groups")}
          className="p-0 mb-2"
        >
          Back to Groups
        </Button>
        <Title level={2}>Create New Group</Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Group Name"
            rules={[
              { required: true, message: "Please enter group name" },
              { min: 2, message: "Group name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="Enter group name (e.g., Trip to Goa, Apartment Expenses)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="members"
            label="Add Members"
            help="Enter email addresses of people you want to add to this group. You can add Gmail addresses for users who can login, or any email for expense splitting only."
          >
            <Select
              mode="tags"
              placeholder="Type email addresses and press Enter"
              tokenSeparators={[",", " "]}
              style={{ width: "100%" }}
              size="large"
              notFoundContent="Type an email address and press Enter to add"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                Create Group
              </Button>
              <Button
                onClick={() => setCurrentPage("groups")}
                size="large"
                disabled={loading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateGroup;
