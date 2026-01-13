


import React from 'react';
import { RoleBasedRouter } from './components/RoleBasedRouter';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RoleBasedRouter />
    </AuthProvider>
  );
};

export default App;



