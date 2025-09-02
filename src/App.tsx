import { useState } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import type { User } from './types/index';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (username: string) => {
    setUser({ username, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <Navbar username={user.username} onLogout={handleLogout} />
      <Dashboard />
    </div>
  );
}

export default App;
