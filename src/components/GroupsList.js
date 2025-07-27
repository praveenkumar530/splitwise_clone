// components/GroupsList.js
import React from "react";
import { Button, Card, Typography, Avatar, Row, Col, Empty } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { useAppContext } from "../contexts/AppContext";
import { useGroups } from "../hooks/useFirestore";

const { Title, Text } = Typography;

const GroupsList = () => {
  const { currentUser, setSelectedGroup, setCurrentPage } = useAppContext();
  const { groups, loading } = useGroups(currentUser?.email);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setCurrentPage("groupDetail");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Your Groups</Title>
          <Button type="primary" icon={<PlusOutlined />} loading>
            Create Group
          </Button>
        </div>
        <div className="text-center py-8">
          <Text>Loading groups...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Your Groups</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCurrentPage("createGroup")}
        >
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No groups found. <br />
              Create your first group to start splitting expenses!
            </span>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCurrentPage("createGroup")}
          >
            Create Group
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {groups.map((group) => (
            <Col xs={24} sm={12} lg={8} key={group.id}>
              <Card
                hoverable
                className="h-full"
                onClick={() => handleGroupSelect(group)}
                actions={[
                  <div key="members" className="text-center">
                    <TeamOutlined className="mr-1" />
                    {group.members?.length || 0} members
                  </div>,
                ]}
              >
                <div className="text-center">
                  <Avatar
                    size={64}
                    icon={<TeamOutlined />}
                    className="bg-blue-500 mb-4"
                  />
                  <Title level={4} className="mb-2">
                    {group.name}
                  </Title>
                  <Text type="secondary" className="text-sm">
                    Created by{" "}
                    {group.creator === currentUser?.uid ? "You" : group.creator}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default GroupsList;
