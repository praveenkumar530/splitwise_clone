import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Group,
  Plus,
  ArrowLeft,
  Calculator,
  FileText,
  Download,
  Trash2,
  Edit3,
} from "lucide-react";

const SplitwiseClone = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentView, setCurrentView] = useState("users"); // users, groups, group-detail
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [groupForm, setGroupForm] = useState({ name: "", selectedUsers: [] });
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    sharedBy: [],
    date: new Date().toISOString().split("T")[0],
  });

  // Add user
  const addUser = () => {
    if (userForm.name.trim()) {
      const newUser = {
        id: Date.now(),
        name: userForm.name.trim(),
        email: userForm.email.trim(),
      };
      setUsers([...users, newUser]);
      setUserForm({ name: "", email: "" });
      setShowUserForm(false);
    }
  };

  // Add group
  const addGroup = () => {
    if (groupForm.name.trim() && groupForm.selectedUsers.length > 0) {
      const newGroup = {
        id: Date.now(),
        name: groupForm.name.trim(),
        members: groupForm.selectedUsers,
        expenses: [],
        balances: {},
        total: 0,
      };

      // Initialize balances
      groupForm.selectedUsers.forEach((userId) => {
        newGroup.balances[userId] = 0;
      });

      setGroups([...groups, newGroup]);
      setGroupForm({ name: "", selectedUsers: [] });
      setShowGroupForm(false);
    }
  };

  // Add expense
  const addExpense = () => {
    if (
      expenseForm.description.trim() &&
      expenseForm.amount &&
      expenseForm.paidBy &&
      expenseForm.sharedBy.length > 0
    ) {
      const amount = parseFloat(expenseForm.amount);
      const shareAmount = amount / expenseForm.sharedBy.length;

      const newExpense = {
        id: Date.now(),
        description: expenseForm.description.trim(),
        amount: amount,
        paidBy: expenseForm.paidBy,
        sharedBy: expenseForm.sharedBy,
        date: expenseForm.date,
        shareAmount: shareAmount,
      };

      const updatedGroups = groups.map((group) => {
        if (group.id === selectedGroup.id) {
          const updatedGroup = { ...group };
          updatedGroup.expenses = [...group.expenses, newExpense];
          updatedGroup.total += amount;

          // Update balances
          // Person who paid gets credited
          updatedGroup.balances[expenseForm.paidBy] += amount;

          // People who shared get debited
          expenseForm.sharedBy.forEach((userId) => {
            updatedGroup.balances[userId] -= shareAmount;
          });

          return updatedGroup;
        }
        return group;
      });

      setGroups(updatedGroups);
      setSelectedGroup(updatedGroups.find((g) => g.id === selectedGroup.id));
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

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === parseInt(userId));
    return user ? user.name : "Unknown";
  };

  // Group expenses by date
  const getExpensesByDate = () => {
    if (!selectedGroup) return {};

    return selectedGroup.expenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(expense);
      return acc;
    }, {});
  };

  // Calculate individual spending
  const getIndividualSpending = () => {
    if (!selectedGroup) return [];

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

  const Sidebar = () => (
    <div className="w-16 bg-blue-600 text-white flex flex-col items-center py-4 space-y-4">
      <button
        onClick={() => setCurrentView("users")}
        className={`p-3 rounded-lg ${
          currentView === "users" ? "bg-blue-800" : "hover:bg-blue-700"
        }`}
      >
        <Users size={24} />
      </button>
      <button
        onClick={() => setCurrentView("groups")}
        className={`p-3 rounded-lg ${
          currentView === "groups" ? "bg-blue-800" : "hover:bg-blue-700"
        }`}
      >
        <Group size={24} />
      </button>
    </div>
  );

  const UsersView = () => (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        ))}
      </div>

      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={addUser}
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowUserForm(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const GroupsView = () => (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowGroupForm(true)}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => {
              setSelectedGroup(group);
              setCurrentView("group-detail");
              setActiveTab("transactions");
            }}
            className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-semibold">{group.name}</h3>
            <p className="text-gray-600 text-sm">
              {group.members.length} members
            </p>
            <p className="text-green-600 font-semibold">
              Total: ₹{group.total.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <h3 className="font-semibold mb-2">Select Members:</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={groupForm.selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGroupForm({
                          ...groupForm,
                          selectedUsers: [...groupForm.selectedUsers, user.id],
                        });
                      } else {
                        setGroupForm({
                          ...groupForm,
                          selectedUsers: groupForm.selectedUsers.filter(
                            (id) => id !== user.id
                          ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addGroup}
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowGroupForm(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const GroupDetailView = () => {
    const expensesByDate = getExpensesByDate();
    const individualSpending = getIndividualSpending();

    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView("groups")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{selectedGroup?.name}</h1>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {["transactions", "total", "balances", "export"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "export" ? <Download size={16} /> : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "transactions" && (
            <div className="space-y-4">
              {Object.entries(expensesByDate)
                .reverse()
                .map(([date, expenses]) => (
                  <div key={date} className="bg-white rounded-lg shadow border">
                    <div className="p-3 bg-gray-50 border-b">
                      <h3 className="font-semibold">
                        {new Date(date).toLocaleDateString()}
                      </h3>
                    </div>
                    <div className="divide-y">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {expense.description}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Paid by {getUserName(expense.paidBy)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Shared by{" "}
                                {expense.sharedBy
                                  .map((id) => getUserName(id))
                                  .join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
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
                ))}
            </div>
          )}

          {activeTab === "total" && (
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Total Group Spending
                </h2>
                <p className="text-4xl font-bold text-green-600">
                  ₹{selectedGroup?.total.toFixed(2)}
                </p>
                <p className="text-gray-600 mt-2">
                  {selectedGroup?.expenses.length} transactions
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{person.name}</h3>
                    <div
                      className={`text-lg font-bold ${
                        person.balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {person.balance >= 0 ? "+" : ""}₹
                      {person.balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Paid: ₹{person.paid.toFixed(2)}</p>
                    <p>Owes: ₹{person.owes.toFixed(2)}</p>
                    <p className="mt-1">
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
                  Export feature would be implemented here
                </p>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                  Download XLSX
                </button>
              </div>
            </div>
          )}
        </div>

        {showExpenseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Expense</h2>

              <input
                type="text"
                placeholder="Description"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Amount"
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
                <option value="">Select who paid</option>
                {selectedGroup?.members.map((userId) => (
                  <option key={userId} value={userId}>
                    {getUserName(userId)}
                  </option>
                ))}
              </select>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Shared by:</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedGroup?.members.map((userId) => (
                    <label key={userId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={expenseForm.sharedBy.includes(userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExpenseForm({
                              ...expenseForm,
                              sharedBy: [...expenseForm.sharedBy, userId],
                            });
                          } else {
                            setExpenseForm({
                              ...expenseForm,
                              sharedBy: expenseForm.sharedBy.filter(
                                (id) => id !== userId
                              ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{getUserName(userId)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={addExpense}
                  className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
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

  return (
    <div className="h-screen bg-gray-100 flex">
      <Sidebar />
      {currentView === "users" && <UsersView />}
      {currentView === "groups" && <GroupsView />}
      {currentView === "group-detail" && selectedGroup && <GroupDetailView />}
    </div>
  );
};

export default SplitwiseClone;
