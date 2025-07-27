import React from "react";
import { Layout, Spin } from "antd";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import GroupsList from "./components/GroupsList";
import CreateGroup from "./components/CreateGroup";
import GroupDetail from "./components/GroupDetail";
import AddExpense from "./components/AddExpense";

const { Sider, Content } = Layout;

// Main Content Router Component
const MainContent = () => {
  const { currentPage } = useAppContext();

  switch (currentPage) {
    case "groups":
      return <GroupsList />;
    case "groupDetail":
      return <GroupDetail />;
    case "addExpense":
      return <AddExpense />;
    case "createGroup":
      return <CreateGroup />;
    default:
      return <GroupsList />;
  }
};

// App Layout Component
const AppLayout = () => {
  const { currentUser, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Sider
        width={280}
        className="bg-white shadow-lg"
        breakpoint="md"
        collapsedWidth="0"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Sidebar />
      </Sider>

      <Layout style={{ marginLeft: 280 }}>
        <Content className="p-4 md:p-6 min-h-screen">
          <MainContent />
        </Content>
      </Layout>
    </Layout>
  );
};

// Main App Component
const App = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default App;
