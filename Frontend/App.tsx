


import React from 'react';
import { RoleBasedRouter } from './components/RoleBasedRouter';
import { AuthProvider } from './context/AuthContext';

import { InstallPrompt } from './components/InstallPrompt';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <InstallPrompt />
      <RoleBasedRouter />
    </AuthProvider>
  );
};

export default App;



