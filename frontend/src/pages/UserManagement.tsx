import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CreateUserForm from '../components/CreateUserForm';
import { UserPlus, Users } from 'lucide-react';
import { getAllUsers } from '../services/api';
import './UserManagement.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagement() {
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateUserForm(false);
    fetchUsers(); // Refresh the user list
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="user-management-header">
          <div>
            <h1>Users</h1>
            <p>Create and manage             npm run prisma:migrateusers</p>
          </div>
          <button
            className="create-user-btn"
            onClick={() => setShowCreateUserForm(true)}
          >
            <UserPlus size={20} />
            Create User
          </button>
        </div>

        {/* User Management Content */}
        <div className="user-management-content">
          {error && (
            <div className="error-box">
              <p>{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="loading-box">
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="user-info-box">
              <Users size={48} />
              <h2>No Users Found</h2>
              <p>Create a new user by clicking the "Create User" button above.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Mobile Number</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.mobileNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUserForm && (
        <CreateUserForm onClose={handleUserCreated} />
      )}
    </DashboardLayout>
  );
}
