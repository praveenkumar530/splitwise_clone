import React, { useState } from "react";
import { Plus, Group } from "lucide-react";

const GroupsView = ({ groups, users, addGroup, selectGroup }) => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", selectedUsers: [] });

  const handleAddGroup = () => {
    if (groupForm.name.trim() && groupForm.selectedUsers.length > 0) {
      addGroup(groupForm);
      setGroupForm({ name: "", selectedUsers: [] });
      setShowGroupForm(false);
    }
  };

  const handleCancel = () => {
    setGroupForm({ name: "", selectedUsers: [] });
    setShowGroupForm(false);
  };

  const handleUserToggle = (userId) => {
    setGroupForm((prev) => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter((id) => id !== userId)
        : [...prev.selectedUsers, userId],
    }));
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowGroupForm(true)}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
          title="Create Group"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Group size={48} className="mx-auto mb-4 opacity-50" />
            <p>No groups created yet</p>
            <p className="text-sm">
              Click the + button to create your first group
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              onClick={() => selectGroup(group)}
              className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                {group.members.length} member
                {group.members.length !== 1 ? "s" : ""}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-green-600 font-semibold">
                  Total: ₹{group.total.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">
                  {group.expenses.length} transaction
                  {group.expenses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Group</h2>

            <input
              type="text"
              placeholder="Group Name *"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <h3 className="font-semibold mb-2">Select Members:</h3>
            {users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No users available</p>
                <p className="text-sm">Add users first to create a group</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto border rounded-lg p-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={groupForm.selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="rounded"
                    />
                    <span className="flex-1">{user.name}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </label>
                ))}
              </div>
            )}

            {groupForm.selectedUsers.length > 0 && (
              <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Selected:{" "}
                  {groupForm.selectedUsers
                    .map((id) => getUserName(id))
                    .join(", ")}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleAddGroup}
                disabled={
                  !groupForm.name.trim() || groupForm.selectedUsers.length === 0
                }
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Group
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

export default GroupsView;
