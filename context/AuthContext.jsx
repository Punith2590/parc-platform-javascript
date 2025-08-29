import React, { createContext, useState, useContext } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { users } = useData();
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const switchUser = (userId) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUserId(selectedUser.id);
    }
  };

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
          setCurrentUserId(foundUser.id);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  return (
    <AuthContext.Provider value={{ currentUserId, switchUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { users } = useData();
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const user = users.find(u => u.id === context.currentUserId) || null;

  return { 
    user, 
    users, 
    switchUser: context.switchUser,
    login: context.login,
    logout: context.logout
  };
};