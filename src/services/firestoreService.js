import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Users Operations
export const addUser = async (userId, userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      userId: userId,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const getUsersByUserId = async (userId) => {
  try {
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// Groups Operations
export const addGroup = async (userId, groupData) => {
  try {
    const docRef = await addDoc(collection(db, "groups"), {
      ...groupData,
      userId: userId,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...groupData };
  } catch (error) {
    console.error("Error adding group:", error);
    throw error;
  }
};

export const getGroupsByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, "groups"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    return groups;
  } catch (error) {
    console.error("Error getting groups:", error);
    throw error;
  }
};

export const updateGroup = async (groupId, updates) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

// Expenses Operations
export const addExpense = async (userId, groupId, expenseData) => {
  try {
    const docRef = await addDoc(collection(db, "expenses"), {
      ...expenseData,
      userId: userId,
      groupId: groupId,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...expenseData };
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const getExpensesByGroupId = async (groupId) => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("groupId", "==", groupId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    return expenses;
  } catch (error) {
    console.error("Error getting expenses:", error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToUsers = (userId, callback) => {
  const q = query(collection(db, "users"), where("userId", "==", userId));
  return onSnapshot(q, (querySnapshot) => {
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    callback(users);
  });
};

export const subscribeToGroups = (userId, callback) => {
  const q = query(
    collection(db, "groups"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    callback(groups);
  });
};

export const subscribeToExpenses = (groupId, callback) => {
  const q = query(
    collection(db, "expenses"),
    where("groupId", "==", groupId),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    callback(expenses);
  });
};
