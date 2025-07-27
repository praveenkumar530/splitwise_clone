// components/tabs/TransactionsTab.js
import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Empty,
  Typography,
  Divider,
  Card,
  Spin,
  Avatar,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAppContext } from "../../contexts/AppContext";
import { useExpenses } from "../../hooks/useFirestore";

const { Option } = Select;
const { Text, Title } = Typography;

const TransactionsTab = () => {
  const { selectedGroup, currentUser } = useAppContext();
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses(
    selectedGroup?.id
  );
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
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
          setSelectedExpense(null);
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

  // Get expense category icon
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

  // Get month and day from date
  const getDateParts = (expense) => {
    const date = expense.createdAt?.toDate
      ? expense.createdAt.toDate()
      : new Date(expense.createdAt);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate().toString().padStart(2, "0");
    return { month, day };
  };

  // Calculate individual amounts
  const calculateAmounts = (expense) => {
    const shareAmount = expense.amount / expense.sharedBy?.length || 1;
    const isCurrentUserPayer = expense.paidBy === currentUser?.email;
    const isCurrentUserInvolved = expense.sharedBy?.includes(
      currentUser?.email
    );

    let youLent = 0;
    let youBorrowed = 0;

    if (isCurrentUserPayer && isCurrentUserInvolved) {
      youLent = expense.amount - shareAmount; // What others owe you
    } else if (isCurrentUserPayer && !isCurrentUserInvolved) {
      youLent = expense.amount; // You paid but not involved in split
    } else if (!isCurrentUserPayer && isCurrentUserInvolved) {
      youBorrowed = shareAmount; // You owe the payer
    }

    return { youLent, youBorrowed, shareAmount };
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spin />
      </div>
    );
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

  // Show expense detail view
  if (selectedExpense) {
    const { youLent, youBorrowed, shareAmount } =
      calculateAmounts(selectedExpense);

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-2 md:mb-6 p-1 md:p-4 border-b">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setSelectedExpense(null)}
            className="mr-3"
          />
          <Title level={4} className="m-0">
            Transaction Details
          </Title>
        </div>

        {/* Main Details */}
        <div className="p-2 md:p-6">
          <div className="text-center mb-2 md:mb-8">
            <div className="text-3xl md:text-6xl mb-4">
              {getExpenseIcon(selectedExpense.description)}
            </div>
            <Title level={2} className="mb-0.5 md:mb-2 !text-xl md:text-xl">
              {selectedExpense.description}
            </Title>
            <Text className="text-md md:text-2xl text-green-600 font-semibold">
              ₹{selectedExpense.amount?.toFixed(2)}
            </Text>
          </div>

          {/* Paid By */}
          <Card className="mb-2 md:mb-4" title="Paid By">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar icon={<UserOutlined />} />
                <Text strong>{getMemberName(selectedExpense.paidBy)}</Text>
              </div>
              <Text className="text-lg">
                ₹{selectedExpense.amount?.toFixed(2)}
              </Text>
            </div>
          </Card>

          {/* Split Details */}
          <Card title="Split Between">
            <div className="space-y-3">
              {selectedExpense.sharedBy?.map((person) => (
                <div key={person} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>
                      {person === currentUser?.email
                        ? "You"
                        : getMemberName(person)}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-lg">₹{shareAmount.toFixed(2)}</Text>
                    {person === currentUser?.email && youBorrowed > 0 && (
                      <div className="text-sm text-red-500">you borrowed</div>
                    )}
                    {person === currentUser?.email && youLent > 0 && (
                      <div className="text-sm text-green-500">you lent</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Your Summary */}
          {(youLent > 0 || youBorrowed > 0) && (
            <Card className="mt-4 bg-blue-50">
              <div className="text-center">
                <Text className="text-lg">Your Balance</Text>
                <div className="text-2xl font-semibold mt-2">
                  {youLent > 0 && (
                    <Text className="text-green-600">
                      +₹{youLent.toFixed(2)} (you lent)
                    </Text>
                  )}
                  {youBorrowed > 0 && (
                    <Text className="text-red-600">
                      -₹{youBorrowed.toFixed(2)} (you borrowed)
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(selectedExpense)}
              size="large"
            >
              Edit
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(selectedExpense.id)}
              size="large"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show main list view
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
          <div className="space-y-3  md:text-xs">
            {groupedExpenses[dateKey].map((expense) => {
              const { month, day } = getDateParts(expense);
              const { youLent, youBorrowed } = calculateAmounts(expense);
              const isPaidByCurrentUser = expense.paidBy === currentUser?.email;

              return (
                <div
                  key={expense.id}
                  className="flex items-center p-1 md:p-4 bg-white rounded-lg border   cursor-pointer"
                  onClick={() => setSelectedExpense(expense)}
                >
                  {/* Date Column */}
                  <div className="text-center mr-1 md:mr-4 min-w-[26px] md:min-w-[50px]">
                    <div className="text-[10px] md:text-sm text-gray-500 uppercase">
                      {month}
                    </div>
                    <div className="text-sm md:text-xl font-semibold">
                      {day}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className=" size-6 md:size-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-4">
                    {getExpenseIcon(expense.description)}
                  </div>

                  {/* Description Column */}
                  <div className="flex-1 min-w-0">
                    <Text
                      strong
                      className="block text-base truncate text-[11px] md:text-sm"
                    >
                      {expense.description}
                    </Text>
                    <Text type="secondary" className="text-[10px] md:text-sm">
                      {isPaidByCurrentUser
                        ? `You paid ₹${expense.amount?.toFixed(2)}`
                        : `${getMemberName(
                            expense.paidBy
                          )} paid ₹${expense.amount?.toFixed(2)}`}
                    </Text>
                  </div>

                  {/* Amount Column */}
                  <div className="text-right min-w-[80px]">
                    {youLent > 0 && (
                      <>
                        <div className="text-xs text-gray-500">you lent</div>
                        <div className="text-[12px] md:text-lg  font-semibold text-green-600">
                          ₹{youLent.toFixed(2)}
                        </div>
                      </>
                    )}
                    {youBorrowed > 0 && (
                      <>
                        <div className="text-xs text-gray-500">
                          you borrowed
                        </div>
                        <div className="text-[12px] md:text-lg font-semibold text-red-600">
                          ₹{youBorrowed.toFixed(2)}
                        </div>
                      </>
                    )}
                    {youLent === 0 && youBorrowed === 0 && (
                      <>
                        <div className="text-xs text-gray-500">
                          not involved
                        </div>
                        <div className="text-lg font-semibold text-gray-400">
                          ₹0.00
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
