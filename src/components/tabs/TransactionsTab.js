// components/tabs/TransactionsTab.js
import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Empty,
  Card,
  Typography,
  Divider,
} from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useAppContext } from "../../contexts/AppContext";
import { useExpenses } from "../../hooks/useFirestore";

const { Option } = Select;
const { Text, Title } = Typography;

const TransactionsTab = () => {
  const { selectedGroup } = useAppContext();
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses(
    selectedGroup?.id
  );
  const [editingExpense, setEditingExpense] = useState(null);
  const [form] = Form.useForm();

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      sharedBy: expense.sharedBy,
    });
  };

  const handleSaveEdit = async (values) => {
    try {
      await updateExpense(editingExpense.id, values);
      setEditingExpense(null);
      form.resetFields();
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleDelete = (expenseId) => {
    Modal.confirm({
      title: "Delete Expense",
      content:
        "Are you sure you want to delete this expense? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteExpense(expenseId);
        } catch (error) {
          console.error("Error deleting expense:", error);
        }
      },
    });
  };

  // Group expenses by date
  const groupExpensesByDate = (expenses) => {
    const grouped = {};
    expenses.forEach((expense) => {
      const date = expense.createdAt?.toDate
        ? expense.createdAt.toDate()
        : new Date(expense.createdAt);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    return grouped;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Get expense category icon (you can expand this)
  const getExpenseIcon = (description) => {
    const desc = description.toLowerCase();
    if (
      desc.includes("food") ||
      desc.includes("dinner") ||
      desc.includes("lunch") ||
      desc.includes("restaurant")
    ) {
      return "🍽️";
    } else if (
      desc.includes("fuel") ||
      desc.includes("gas") ||
      desc.includes("petrol")
    ) {
      return "⛽";
    } else if (
      desc.includes("cab") ||
      desc.includes("uber") ||
      desc.includes("taxi") ||
      desc.includes("transport")
    ) {
      return "🚗";
    } else if (desc.includes("movie") || desc.includes("entertainment")) {
      return "🎬";
    } else if (desc.includes("grocery") || desc.includes("shopping")) {
      return "🛒";
    } else {
      return "💰";
    }
  };

  // Get member name from email
  const getMemberName = (email) => {
    const member = selectedGroup?.members?.find((m) => m.user_id === email);
    return member?.name || email.split("@")[0];
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  if (expenses.length === 0) {
    return (
      <Empty
        description="No transactions yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => {}}>
          Add your first expense
        </Button>
      </Empty>
    );
  }

  const groupedExpenses = groupExpensesByDate(expenses);
  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="flex flex-col items-center mb-4">
            <Title level={5} className="text-gray-600 m-0 mr-4">
              {formatDate(dateKey)}
            </Title>
            <Divider className="flex-1 m-0" />
          </div>

          {/* Expenses for this date */}
          <div className="space-y-3">
            {groupedExpenses[dateKey].map((expense) => (
              <Card
                key={expense.id}
                className="hover:shadow-md transition-shadow"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Icon and description */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {getExpenseIcon(expense.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="block text-base">
                        {expense.description}
                      </Text>
                      <Text type="secondary" className="text-sm">
                        {getMemberName(expense.paidBy)} paid ₹
                        {expense.amount?.toFixed(2)}
                      </Text>
                    </div>
                  </div>

                  {/* Right side - Amount and actions */}
                  <div className="flex items-center space-x-4">
                    {/* Shared by tags */}
                    <div className="hidden sm:flex flex-wrap gap-1 max-w-32">
                      {expense.sharedBy?.slice(0, 2).map((person) => (
                        <Tag key={person} color="green" className="text-xs m-0">
                          {getMemberName(person)}
                        </Tag>
                      ))}
                      {expense.sharedBy?.length > 2 && (
                        <Tag color="default" className="text-xs m-0">
                          +{expense.sharedBy.length - 2} more
                        </Tag>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <Text className="text-gray-500 text-sm block">
                        you lent
                      </Text>
                      <Text strong className="text-green-600 text-lg">
                        ₹
                        {(
                          expense.amount / expense.sharedBy?.length || 1
                        ).toFixed(2)}
                      </Text>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-1">
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        type="text"
                        onClick={() => handleEdit(expense)}
                        className="w-8 h-8 flex items-center justify-center"
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        type="text"
                        danger
                        onClick={() => handleDelete(expense.id)}
                        className="w-8 h-8 flex items-center justify-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile view - Show shared by below */}
                <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
                  <Text type="secondary" className="text-xs block mb-1">
                    Shared by:
                  </Text>
                  <div className="flex flex-wrap gap-1">
                    {expense.sharedBy?.map((person) => (
                      <Tag key={person} color="green" className="text-xs">
                        {getMemberName(person)}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Expense Modal */}
      <Modal
        title="Edit Expense"
        open={!!editingExpense}
        onOk={() => form.submit()}
        onCancel={() => {
          setEditingExpense(null);
          form.resetFields();
        }}
        width={600}
        okText="Save Changes"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input placeholder="What was this expense for?" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="0.00"
              addonBefore="₹"
            />
          </Form.Item>

          <Form.Item
            name="paidBy"
            label="Paid By"
            rules={[{ required: true, message: "Please select who paid" }]}
          >
            <Select placeholder="Who paid for this?">
              {selectedGroup?.members?.map((member) => (
                <Option key={member.user_id} value={member.user_id}>
                  {member.name}
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
                message: "Please select who shares this expense",
              },
            ]}
          >
            <Select mode="multiple" placeholder="Who should split this?">
              {selectedGroup?.members?.map((member) => (
                <Option key={member.user_id} value={member.user_id}>
                  {member.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransactionsTab;
