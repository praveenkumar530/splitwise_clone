import React from "react";
import { Users, Group, LogOut } from "lucide-react";

const Sidebar = ({ currentView, setCurrentView, currentUser, onLogout }) => {
  return (
    <div className="w-16 bg-blue-600 text-white flex flex-col justify-between py-4">
      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => setCurrentView("users")}
          className={`p-3 rounded-lg transition-colors ${
            currentView === "users" ? "bg-blue-800" : "hover:bg-blue-700"
          }`}
          title="Users"
        >
          <Users size={24} />
        </button>

        <button
          onClick={() => setCurrentView("groups")}
          className={`p-3 rounded-lg transition-colors ${
            currentView === "groups" ? "bg-blue-800" : "hover:bg-blue-700"
          }`}
          title="Groups"
        >
          <Group size={24} />
        </button>
      </div>

      {/* User Info & Logout */}
      <div className="flex flex-col items-center space-y-3">
        {/* User Avatar */}
        <div className="relative group">
          <img
            src={
              currentUser?.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.displayName || "User"
              )}&background=3b82f6&color=ffffff`
            }
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-blue-400 cursor-pointer hover:border-white transition-colors"
            title={currentUser?.displayName || currentUser?.email}
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-3 rounded-lg hover:bg-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
