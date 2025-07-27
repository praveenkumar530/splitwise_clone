// hooks/useFirestore.js
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { message } from "antd";
import { db } from "../firebase";
// Hook for managing groups
export const useGroups = (userId) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    console.log("userId ", userId);
    const groupsRef = collection(db, "groups");
    const q = query(
      groupsRef,
      where("members", "array-contains", {
        user_id: userId,
        is_google_email: true,
        is_account_verified: true,
      })
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const createGroup = async (groupData) => {
    console.log("groupData", groupData);
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        ...groupData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      message.success("Group created successfully");
      return docRef.id;
    } catch (error) {
      message.error("Failed to create group");
      throw error;
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: new Date(),
      });
      message.success("Group updated successfully");
    } catch (error) {
      message.error("Failed to update group");
      throw error;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      message.success("Group deleted successfully");
    } catch (error) {
      message.error("Failed to delete group");
      throw error;
    }
  };

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};

// Hook for managing expenses
export const useExpenses = (groupId) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const expensesRef = collection(db, "expenses");
    const q = query(
      expensesRef,
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [groupId]);

  const addExpense = async (expenseData) => {
    try {
      await addDoc(collection(db, "expenses"), {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      message.success("Expense added successfully");
    } catch (error) {
      message.error("Failed to add expense");
      throw error;
    }
  };

  const updateExpense = async (expenseId, updates) => {
    try {
      const expenseRef = doc(db, "expenses", expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: new Date(),
      });
      message.success("Expense updated successfully");
    } catch (error) {
      message.error("Failed to update expense");
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, "expenses", expenseId));
      message.success("Expense deleted successfully");
    } catch (error) {
      message.error("Failed to delete expense");
      throw error;
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
