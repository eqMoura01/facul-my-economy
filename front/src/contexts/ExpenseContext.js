import React, { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const triggerRefresh = () => {
    setShouldRefresh(prev => !prev);
  };

  return (
    <ExpenseContext.Provider value={{ shouldRefresh, triggerRefresh }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
} 