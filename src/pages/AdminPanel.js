import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { 
  Users, 
  History, 
  KeyRound, 
  ShieldCheck, 
  Trash2, 
  UserMinus, 
  CheckCircle,
  Activity,
  UserCheck,
  UserX,
  ArrowUpCircle,
  ArrowDownCircle,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminPanel = () => {
  // ⬇️ YOUR ORIGINAL STATE & LOGIC
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchOnlineUsers();
    fetchActivityLog();
    fetchPasswordRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data);
    } catch (error) { toast.error('Failed to fetch users'); }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await adminAPI.getOnlineUsers();
      setOnlineUsers(response.data.data);
    } catch (error) { toast.error('Failed to fetch online users'); }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await adminAPI.getActivity24h();
      setActivityLog(response.data.data);
    } catch (error) { toast.error('Failed to fetch activity log'); }
  };

  const fetchPasswordRequests = async () => {
    try {
      const response = await adminAPI.getPendingPasswordRequests();
      setPasswordRequests(response.data.data);
    } catch (error) { toast.error('Failed to fetch password requests'); }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) { toast.error('Failed to delete user'); }
  };

  const handleBanUser = async (id, username, currentlyBanned) => {
    if (!window.confirm(`${currentlyBanned ? 'Unban' : 'Ban'} user ${username}?`)) return;
    try {
      await adminAPI.banUser(id, !currentlyBanned);
      toast.success(`User ${currentlyBanned ? 'unbanned' : 'banned'}`);
      fetchUsers();
    } catch (error) { toast.error('Failed to ban/unban user'); }
  };

  const handleRestrictUser = async (id, username, currentlyRestricted) => {
    if (!window.confirm(`${currentlyRestricted ? 'Unrestrict' : 'Restrict'} user ${username}?`)) return;
    try {
      await adminAPI.restrictUser(id, !currentlyRestricted);
      toast.success(`User ${currentlyRestricted ? 'unrestricted' : 'restricted'}`);
      fetchUsers();
    } catch (error) { toast.error('Failed to restrict/unrestrict user'); }
  };

  const handlePromoteUser = async (id, username) => {
    if (!window.confirm(`Promote ${username} to admin?`)) return;
    try {
      await adminAPI.promoteUser(id);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (error) { toast.error('Failed to promote user'); }
  };

  const handleDemoteUser = async (id, username) => {
    if (!window.confirm(`Demote ${username} to regular user?`)) return;
    try {
      await adminAPI.demoteUser(id);
      toast.success('User demoted');
      fetchUsers();
    } catch (error) { toast.error('Failed to demote user'); }
  };

  const approvePasswordRequest = async (requestId) => {
    if (!newPassword) { toast.error('Enter new password'); return; }
    try {
      await adminAPI.approvePasswordRequest(requestId, newPassword);
      toast.success('Password reset approved');
      setNewPassword('');
      setSelectedRequest(null);
      fetchPasswordRequests();
    } catch (error) { toast.error('Failed to approve request'); }
  };

  const rejectPasswordRequest = async (requestId) => {
    if (!window.confirm('Reject this password reset request?')) return;
    try {
      await adminAPI.rejectPasswordRequest(requestId);
      toast.success('Request rejected');
      fetchPasswordRequests();
    } catch (error) { toast.error('Failed to reject request'); }
  };
  // ⬆️ ORIGINAL LOGIC ENDS

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 text-sm">Monitor system activity and manage personnel.</p>
        </div>
        <Activity className="text-nature-500" size={32} />
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-full max-w-3xl overflow-x-auto">
        {[
          { id: 'users', label: 'All Users', icon: Users },
          { id: 'online', label: 'Online Now', icon: Globe, action: fetchOnlineUsers },
          { id: 'activity', label: 'Activity Log', icon: History },
          { id: 'password-requests', label: 'Reset Requests', icon: KeyRound },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if(tab.action) tab.action(); }}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white text-nature-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <Table headers={['Username', 'Role', 'Status', 'Actions']}>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${
                    user.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" className="p-2" onClick={() => handleBanUser(user.id, user.username, user.status === 'banned')}>
                      {user.status === 'banned' ? <UserCheck size={16} /> : <UserX size={16} />}
                    </Button>
                    {user.role === 'user' ? (
                      <Button variant="secondary" className="p-2 text-nature-600" onClick={() => handlePromoteUser(user.id, user.username)}>
                        <ArrowUpCircle size={16} />
                      </Button>
                    ) : (
                      <Button variant="secondary" className="p-2 text-amber-600" onClick={() => handleDemoteUser(user.id, user.username)}>
                        <ArrowDownCircle size={16} />
                      </Button>
                    )}
                    <Button variant="danger" className="p-2" onClick={() => handleDeleteUser(user.id, user.username)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* ONLINE USERS TAB */}
        {activeTab === 'online' && (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Active Sessions ({onlineUsers.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onlineUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-4 p-4 border border-emerald-100 bg-emerald-50 rounded-xl">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                   <div>
                      <p className="font-bold text-emerald-900">{user.username}</p>
                      <p className="text-xs text-emerald-700">Logged in: {new Date(user.lastLogin).toLocaleString()}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === 'activity' && (
          <Table headers={['Timestamp', 'User', 'Action', 'Details']}>
            {activityLog.map((log) => (
              <tr key={log._id} className="text-sm">
                <td className="px-6 py-4 text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-gray-700">{log.username}</td>
                <td className="px-6 py-4 font-semibold text-nature-600 uppercase">{log.action}</td>
                <td className="px-6 py-4 text-gray-500 italic">{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </Table>
        )}

        {/* PASSWORD REQUESTS TAB */}
        {activeTab === 'password-requests' && (
          <div className="p-6 space-y-6">
            {passwordRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No pending reset requests.</div>
            ) : (
              passwordRequests.map((req) => (
                <div key={req._id} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900">{req.username}</h3>
                    <p className="text-sm text-gray-500">{req.email} • {new Date(req.createdAt).toLocaleString()}</p>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-sm italic">"{req.message}"</div>
                  </div>
                  
                  <div className="flex flex-col justify-center gap-3">
                    {selectedRequest === req._id ? (
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          placeholder="New password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button onClick={() => approvePasswordRequest(req._id)}>Confirm</Button>
                        <Button variant="secondary" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => setSelectedRequest(req._id)} icon={<CheckCircle size={16}/>}>Approve</Button>
                        <Button variant="danger" onClick={() => rejectPasswordRequest(req._id)}>Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
