import React, { useState } from "react";
import { ArrowLeft, Plus, Download } from "lucide-react";

const GroupDetailView = ({
  selectedGroup,
  users,
  addExpense,
  getUserName,
  goBack,
}) => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    sharedBy: [],
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddExpense = () => {
    if (
      expenseForm.description.trim() &&
      expenseForm.amount &&
      expenseForm.paidBy &&
      expenseForm.sharedBy.length > 0
    ) {
      addExpense(expenseForm);
      setExpenseForm({
        description: "",
        amount: "",
        paidBy: "",
        sharedBy: [],
        date: new Date().toISOString().split("T")[0],
      });
      setShowExpenseForm(false);
    }
  };

  const handleCancel = () => {
    setExpenseForm({
      description: "",
      amount: "",
      paidBy: "",
      sharedBy: [],
      date: new Date().toISOString().split("T")[0],
    });
    setShowExpenseForm(false);
  };

  const handleUserToggle = (userId) => {
    setExpenseForm((prev) => ({
      ...prev,
      sharedBy: prev.sharedBy.includes(userId)
        ? prev.sharedBy.filter((id) => id !== userId)
        : [...prev.sharedBy, userId],
    }));
  };

  // Group expenses by date
  const getExpensesByDate = () => {
    return selectedGroup.expenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    }, {});
  };

  // Calculate individual spending
  const getIndividualSpending = () => {
    const spending = {};
    selectedGroup.members.forEach((userId) => {
      spending[userId] = {
        paid: 0,
        owes: 0,
        balance: selectedGroup.balances[userId] || 0,
      };
    });

    selectedGroup.expenses.forEach((expense) => {
      spending[expense.paidBy].paid += expense.amount;
      expense.sharedBy.forEach((userId) => {
        spending[userId].owes += expense.shareAmount;
      });
    });

    return Object.entries(spending).map(([userId, data]) => ({
      userId,
      name: getUserName(userId),
      ...data,
    }));
  };

  const expensesByDate = getExpensesByDate();
  const individualSpending = getIndividualSpending();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Groups"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">
            {selectedGroup?.name}
          </h1>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
            title="Add Expense"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {["transactions", "total", "balances", "export"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "export" ? (
                <Download size={16} className="mx-auto" />
              ) : (
                tab
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {Object.keys(expensesByDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Plus size={48} className="mx-auto mb-4 opacity-50" />
                <p>No expenses added yet</p>
                <p className="text-sm">
                  Click the + button to add your first expense
                </p>
              </div>
            ) : (
              Object.entries(expensesByDate)
                .reverse()
                .map(([date, expenses]) => (
                  <div key={date} className="bg-white rounded-lg shadow border">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-semibold">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                    </div>
                    <div className="divide-y">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">
                                {expense.description}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Paid by{" "}
                                <span className="font-medium">
                                  {getUserName(expense.paidBy)}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Shared by{" "}
                                {expense.sharedBy
                                  .map((id) => getUserName(id))
                                  .join(", ")}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-green-600 text-lg">
                                ₹{expense.amount.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">
                                ₹{expense.shareAmount.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "total" && (
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Total Group Spending</h2>
              <p className="text-4xl font-bold text-green-600 mb-2">
                ₹{selectedGroup?.total.toFixed(2)}
              </p>
              <p className="text-gray-600">
                {selectedGroup?.expenses.length} transaction
                {selectedGroup?.expenses.length !== 1 ? "s" : ""}
              </p>
              <p className="text-gray-600">
                {selectedGroup?.members.length} member
                {selectedGroup?.members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {activeTab === "balances" && (
          <div className="space-y-3">
            {individualSpending.map((person) => (
              <div
                key={person.userId}
                className="bg-white rounded-lg shadow border p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  <div
                    className={`text-xl font-bold ${
                      person.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {person.balance >= 0 ? "+" : ""}₹{person.balance.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Paid:</p>
                    <p className="font-semibold text-green-600">
                      ₹{person.paid.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Share:</p>
                    <p className="font-semibold text-orange-600">
                      ₹{person.owes.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p
                    className={`text-center font-medium ${
                      person.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {person.balance >= 0
                      ? `Should receive ₹${person.balance.toFixed(2)}`
                      : `Owes ₹${Math.abs(person.balance).toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "export" && (
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="text-center">
              <Download size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Export Data</h2>
              <p className="text-gray-600 mb-4">
                Export group data to Excel format
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Download XLSX
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>

            <input
              type="text"
              placeholder="Description *"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <input
              type="number"
              placeholder="Amount *"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, amount: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, date: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={expenseForm.paidBy}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, paidBy: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select who paid *</option>
              {selectedGroup?.members.map((userId) => (
                <option key={userId} value={userId}>
                  {getUserName(userId)}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Shared by:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                {selectedGroup?.members.map((userId) => (
                  <label
                    key={userId}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={expenseForm.sharedBy.includes(userId)}
                      onChange={() => handleUserToggle(userId)}
                      className="rounded"
                    />
                    <span className="flex-1">{getUserName(userId)}</span>
                  </label>
                ))}
              </div>
              {expenseForm.sharedBy.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  Split among {expenseForm.sharedBy.length} person
                  {expenseForm.sharedBy.length !== 1 ? "s" : ""}
                  {expenseForm.amount &&
                    ` (₹${(
                      parseFloat(expenseForm.amount) /
                      expenseForm.sharedBy.length
                    ).toFixed(2)} each)`}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddExpense}
                disabled={
                  !expenseForm.description.trim() ||
                  !expenseForm.amount ||
                  !expenseForm.paidBy ||
                  expenseForm.sharedBy.length === 0
                }
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Expense
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailView;
