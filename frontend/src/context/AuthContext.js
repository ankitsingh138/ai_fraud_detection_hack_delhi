import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  const login = (type, credentials) => {
    setUserType(type);
    setUser({
      id: credentials.id,
      name: credentials.name || `${type} User`,
      department: credentials.department || null,
    });
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

