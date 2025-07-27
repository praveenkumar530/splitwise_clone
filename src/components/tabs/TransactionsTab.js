// components/tabs/TransactionsTab.js
import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  Empty,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppContext } from "../../contexts/AppContext";
import { useExpenses } from "../../hooks/useFirestore";

const { Option } = Select;

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

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => {
        if (!date) return "-";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString();
      },
      width: 100,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-semibold text-green-600">
          ₹{amount?.toFixed(2) || "0.00"}
        </span>
      ),
      width: 100,
    },
    {
      title: "Paid By",
      dataIndex: "paidBy",
      key: "paidBy",
      render: (paidBy) => (
        <div className="space-y-1">
          {paidBy}
          {/* {paidBy?.map((person) => (
            <Tag key={person} color="blue" className="text-xs">
              {person.split("@")[0]}
            </Tag>
          ))} */}
        </div>
      ),
      width: 120,
    },
    {
      title: "Shared By",
      dataIndex: "sharedBy",
      key: "sharedBy",
      render: (sharedBy) => (
        <div className="space-y-1">
          {sharedBy?.slice(0, 2).map((person) => (
            <Tag key={person} color="green" className="text-xs">
              {person.split("@")[0]}
            </Tag>
          ))}
          {sharedBy?.length > 2 && (
            <Tag color="default" className="text-xs">
              +{sharedBy.length - 2} more
            </Tag>
          )}
        </div>
      ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
      width: 100,
      fixed: "right",
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div>
      {expenses.length === 0 ? (
        <Empty
          description="No transactions yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => {}}>
            Add your first expense
          </Button>
        </Empty>
      ) : (
        <Table
          dataSource={expenses}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 700 }}
          size="middle"
        />
      )}

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
            <Select mode="multiple" placeholder="Who paid for this?">
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
