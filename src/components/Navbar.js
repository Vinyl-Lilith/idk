import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav>
      <div>
        <h1>🌿 Smart Greenhouse</h1>
        <div>
          <Link to="/">Homepage</Link>
          <Link to="/logic">Logic</Link>
          <Link to="/manual">Manual</Link>
          {isAdmin && <Link to="/admin">Admin Panel</Link>}
          <Link to="/settings">Settings</Link>
        </div>
        <div>
          <span>{user?.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

