import React, { useState } from "react";
import { UserPlus } from "lucide-react";

const UsersView = ({ users, addUser }) => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "" });

  const handleAddUser = () => {
    if (userForm.name.trim()) {
      addUser(userForm);
      setUserForm({ name: "", email: "" });
      setShowUserForm(false);
    }
  };

  const handleCancel = () => {
    setUserForm({ name: "", email: "" });
    setShowUserForm(false);
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
          title="Add User"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No users added yet</p>
            <p className="text-sm">Click the + button to add your first user</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          ))
        )}
      </div>

      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add User</h2>

            <input
              type="text"
              placeholder="Name *"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <input
              type="email"
              placeholder="Email (optional)"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex space-x-3">
              <button
                onClick={handleAddUser}
                disabled={!userForm.name.trim()}
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add User
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

export default UsersView;
