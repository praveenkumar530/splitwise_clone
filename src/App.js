import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import UsersView from "./components/UsersView";
import GroupsView from "./components/GroupsView";
import GroupDetailView from "./components/GroupDetailView";
import {
  addUser as addUserToFirestore,
  addGroup as addGroupToFirestore,
  addExpense as addExpenseToFirestore,
  updateGroup,
  subscribeToUsers,
  subscribeToGroups,
  subscribeToExpenses,
} from "./services/firestoreService";

const MainApp = () => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentView, setCurrentView] = useState("users");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Subscribe to users
    const unsubscribeUsers = subscribeToUsers(
      currentUser.uid,
      (updatedUsers) => {
        setUsers(updatedUsers);
      }
    );

    // Subscribe to groups
    const unsubscribeGroups = subscribeToGroups(
      currentUser.uid,
      (updatedGroups) => {
        setGroups(updatedGroups);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeGroups();
    };
  }, [currentUser]);

  // Update selected group when groups change
  useEffect(() => {
    if (selectedGroup) {
      const updatedGroup = groups.find((g) => g.id === selectedGroup.id);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    }
  }, [groups, selectedGroup]);

  // Add user function
  const addUser = async (userData) => {
    try {
      await addUserToFirestore(currentUser.uid, {
        name: userData.name.trim(),
        email: userData.email.trim(),
      });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please try again.");
    }
  };

  // Add group function
  const addGroup = async (groupData) => {
    try {
      const newGroup = {
        name: groupData.name.trim(),
        members: groupData.selectedUsers,
        expenses: [],
        balances: {},
        total: 0,
      };

      // Initialize balances for all members
      groupData.selectedUsers.forEach((userId) => {
        newGroup.balances[userId] = 0;
      });

      await addGroupToFirestore(currentUser.uid, newGroup);
    } catch (error) {
      console.error("Error adding group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  // Add expense function
  const addExpense = async (expenseData) => {
    try {
      const amount = parseFloat(expenseData.amount);
      const shareAmount = amount / expenseData.sharedBy.length;

      const newExpense = {
        description: expenseData.description.trim(),
        amount: amount,
        paidBy: expenseData.paidBy,
        sharedBy: expenseData.sharedBy,
        date: expenseData.date,
        shareAmount: shareAmount,
      };

      // Add expense to Firestore
      await addExpenseToFirestore(
        currentUser.uid,
        selectedGroup.id,
        newExpense
      );

      // Update group balances and total
      const updatedGroup = { ...selectedGroup };
      updatedGroup.total += amount;

      // Update balances
      updatedGroup.balances[expenseData.paidBy] += amount;
      expenseData.sharedBy.forEach((userId) => {
        updatedGroup.balances[userId] -= shareAmount;
      });

      // Update group in Firestore
      await updateGroup(selectedGroup.id, {
        balances: updatedGroup.balances,
        total: updatedGroup.total,
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  };

  // Handle group selection
  const selectGroup = (group) => {
    setSelectedGroup(group);
    setCurrentView("group-detail");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {currentView === "users" && <UsersView users={users} addUser={addUser} />}

      {currentView === "groups" && (
        <GroupsView
          groups={groups}
          users={users}
          addGroup={addGroup}
          selectGroup={selectGroup}
        />
      )}

      {currentView === "group-detail" && selectedGroup && (
        <GroupDetailView
          selectedGroup={selectedGroup}
          users={users}
          addExpense={addExpense}
          getUserName={getUserName}
          goBack={() => setCurrentView("groups")}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
};

const AuthContent = () => {
  const { currentUser } = useAuth();

  return currentUser ? <MainApp /> : <Login />;
};

export default App;
