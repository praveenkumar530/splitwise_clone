// components/AddExpense.js
import React, { useState } from "react";
import {
  Button,
  Card,
  Typography,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Checkbox,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppContext } from "../contexts/AppContext";
import { useExpenses } from "../hooks/useFirestore";

const { Title } = Typography;
const { Option } = Select;

const AddExpense = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const { selectedGroup, currentUser, setCurrentPage } = useAppContext();
  const { addExpense } = useExpenses(selectedGroup?.id);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const expenseData = {
        groupId: selectedGroup.id,
        description: values.description,
        amount: values.amount,
        paidBy: values.paidBy,
        sharedBy: values.sharedBy,
        createdBy: currentUser.uid,
        date: new Date().toISOString().split("T")[0],
      };

      await addExpense(expenseData);
      setCurrentPage("groupDetail");
    } catch (error) {
      console.error("Error adding expense:", error);
      message.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const allMembers = selectedGroup?.members?.map((m) => m.user_id) || [];

    if (checked) {
      form.setFieldsValue({
        paidBy: allMembers,
        sharedBy: allMembers,
      });
    } else {
      form.setFieldsValue({
        paidBy: [],
        sharedBy: [],
      });
    }
  };

  const handlePaidByChange = (values) => {
    // If only one person is selected for "paid by", auto-select them for "shared by" if none selected
    const currentSharedBy = form.getFieldValue("sharedBy") || [];
    if (values.length === 1 && currentSharedBy.length === 0) {
      form.setFieldsValue({ sharedBy: values });
    }
  };

  if (!selectedGroup) {
    return (
      <div className="text-center py-8">
        <Title level={3}>No group selected</Title>
        <Button type="primary" onClick={() => setCurrentPage("groups")}>
          Go to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => setCurrentPage("groupDetail")}
          className="p-0 mb-2"
        >
          Back to {selectedGroup.name}
        </Button>
        <Title level={2}>Add Expense</Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            paidBy: [],
            sharedBy: [],
          }}
        >
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              { min: 2, message: "Description must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="What was this expense for? (e.g., Dinner, Hotel, Gas)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 0.01,
                message: "Amount must be greater than 0",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0.01}
              step={0.01}
              placeholder="0.00"
              addonBefore="₹"
              size="large"
            />
          </Form.Item>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="text-blue-600"
            >
              <span className="font-medium">Select All Members</span>
              <div className="text-xs text-gray-500 mt-1">
                Quickly select all members for both payment and sharing
              </div>
            </Checkbox>
          </div>

          <Form.Item
            name="paidBy"
            label="Paid By"
            rules={[
              {
                required: true,
                message: "Please select who paid for this expense",
              },
            ]}
            help="Who actually paid for this expense?"
          >
            <Select
              mode="multiple"
              placeholder="Select who paid"
              size="large"
              onChange={handlePaidByChange}
            >
              {selectedGroup.members?.map((member) => (
                <Option key={member.user_id} value={member.user_id}>
                  {member.user_id.split("@")[0]}
                  {member.user_id === currentUser.uid && " (You)"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sharedBy"
            label="Shared By"
            rules={[
              {
                required: true,
                message: "Please select who should split this expense",
              },
            ]}
            help="Who should split this expense? (including those who paid)"
          >
            <Select
              mode="multiple"
              placeholder="Select who should split this expense"
              size="large"
            >
              {selectedGroup.members?.map((member) => (
                <Option key={member.user_id} value={member.user_id}>
                  {member.user_id.split("@")[0]}
                  {member.user_id === currentUser.uid && " (You)"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 pt-4">
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                Add Expense
              </Button>
              <Button
                onClick={() => setCurrentPage("groupDetail")}
                size="large"
                disabled={loading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Quick Tips */}
      <Card className="mt-6" size="small">
        <Title level={5} className="text-blue-600 mb-3">
          💡 Quick Tips
        </Title>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use "Select All" for expenses everyone shared equally</li>
          <li>• "Paid By" can be multiple people if they split the payment</li>
          <li>
            • "Shared By" should include everyone who benefits from the expense
          </li>
          <li>
            • You can always edit expenses later from the Transactions tab
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AddExpense;
