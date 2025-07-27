// components/Sidebar.js
import React from "react";
import { Button, Card, Typography, Avatar, Space } from "antd";
import { PlusOutlined, TeamOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAppContext } from "../contexts/AppContext";
import { useGroups } from "../hooks/useFirestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const { Text, Title } = Typography;

const Sidebar = () => {
  const { currentUser, setSelectedGroup, setCurrentPage } = useAppContext();
  const { groups } = useGroups(currentUser?.uid);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setCurrentPage("groupDetail");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Title level={4} className="text-center text-blue-600 mb-4">
          💰 SplitWise
        </Title>

        {/* User Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar src={currentUser?.photoURL} icon={<TeamOutlined />} />
          <div className="flex-1 min-w-0">
            <Text strong className="block truncate">
              {currentUser?.displayName || currentUser?.email}
            </Text>
            <Text type="secondary" className="text-xs block truncate">
              {currentUser?.email}
            </Text>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="w-full"
          onClick={() => setCurrentPage("createGroup")}
        >
          Create Group
        </Button>
      </div>

      {/* Groups List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Text strong className="text-gray-600 block mb-3">
          Your Groups
        </Text>
        <div className="space-y-2">
          {groups.map((group) => (
            <Card
              key={group.id}
              hoverable
              size="small"
              className="cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleGroupSelect(group)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate">
                    {group.name}
                  </Text>
                  <div className="text-xs text-gray-500">
                    {group.members?.length || 0} members
                  </div>
                </div>
                <TeamOutlined className="text-blue-500 ml-2" />
              </div>
            </Card>
          ))}

          {groups.length === 0 && (
            <div className="text-center py-8">
              <TeamOutlined className="text-4xl text-gray-300 mb-2" />
              <Text type="secondary">No groups yet</Text>
              <div className="text-xs text-gray-400 mt-1">
                Create your first group to get started
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full text-left"
          danger
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
