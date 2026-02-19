import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import {
  Users, History, KeyRound, Trash2, CheckCircle, Activity, // eslint-disable-line no-unused-vars
  UserCheck, UserX, ArrowUpCircle, ArrowDownCircle, Globe, ShieldAlert,
  Bell, BellOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const TabBtn = ({ id, label, icon: Icon, active, onClick, badge }) => (
  <button onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
      active ? 'bg-cyber-400/10 text-cyber-400 border border-cyber-400/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
    }`}>
    <Icon size={14} />
    {label}
    {badge > 0 && (
      <span className="ml-1 w-4 h-4 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center font-bold">{badge}</span>
    )}
    {active && <span className="w-1 h-1 rounded-full bg-cyber-400 animate-pulse" />}
  </button>
);

const RoleBadge = ({ role }) => {
  const map = {
    head_admin: { color: '#00f5e8', bg: 'rgba(0,245,232,0.08)', label: 'HEAD ADMIN' },
    admin:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', label: 'ADMIN' },
    user:       { color: '#475569', bg: 'rgba(71,85,105,0.15)', label: 'USER' },
  };
  const s = map[role] || map.user;
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ color: s.color, background: s.bg, borderColor: s.color + '30' }}>
      {s.label}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const map = { active: '#34d399', banned: '#fc8181', restricted: '#f6e05e' };
  const color = map[status] || '#475569';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      <span className="text-xs font-mono" style={{ color }}>{status}</span>
    </div>
  );
};

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchUsers = useCallback(async () => {
    try { const r = await adminAPI.getUsers(); setUsers(r.data.data); }
    catch { toast.error('Failed to fetch users'); }
  }, []);

  const fetchOnlineUsers = useCallback(async () => {
    try { const r = await adminAPI.getOnlineUsers(); setOnlineUsers(r.data.data); }
    catch { toast.error('Failed to fetch online users'); }
  }, []);

  const fetchActivityLog = useCallback(async () => {
    try { const r = await adminAPI.getActivity24h(); setActivityLog(r.data.data); }
    catch { toast.error('Failed to fetch activity'); }
  }, []);

  const fetchPasswordRequests = useCallback(async () => {
    try { const r = await adminAPI.getPendingPasswordRequests(); setPasswordRequests(r.data.data); }
    catch { toast.error('Failed to fetch requests'); }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try { const r = await adminAPI.getAlerts(); setAlerts(r.data.data || []); }
    catch { toast.error('Failed to fetch alerts'); }
  }, []);

  useEffect(() => {
    fetchUsers(); fetchOnlineUsers(); fetchActivityLog(); fetchPasswordRequests(); fetchAlerts();
  }, [fetchUsers, fetchOnlineUsers, fetchActivityLog, fetchPasswordRequests, fetchAlerts]);

  const handleBanUser = async (id, username, banned) => {
    if (!window.confirm(`${banned ? 'Unban' : 'Ban'} ${username}?`)) return;
    try { await adminAPI.banUser(id, !banned); toast.success(`User ${banned ? 'unbanned' : 'banned'}`); fetchUsers(); }
    catch { toast.error('Action failed'); }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Permanently delete ${username}?`)) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); fetchUsers(); }
    catch { toast.error('Delete failed'); }
  };

  const handlePromote = async (id, username) => {
    if (!window.confirm(`Promote ${username} to admin?`)) return;
    try { await adminAPI.promoteUser(id); toast.success('User promoted'); fetchUsers(); }
    catch { toast.error('Promote failed'); }
  };

  const handleDemote = async (id, username) => {
    if (!window.confirm(`Demote ${username} to user?`)) return;
    try { await adminAPI.demoteUser(id); toast.success('User demoted'); fetchUsers(); }
    catch { toast.error('Demote failed'); }
  };

  const approveReset = async (id) => {
    if (!newPassword) { toast.error('Enter new password first'); return; }
    try { await adminAPI.approvePasswordRequest(id, newPassword); toast.success('Reset approved'); setNewPassword(''); setSelectedRequest(null); fetchPasswordRequests(); }
    catch { toast.error('Approval failed'); }
  };

  const rejectReset = async (id) => {
    if (!window.confirm('Reject this request?')) return;
    try { await adminAPI.rejectPasswordRequest(id); toast.success('Request rejected'); fetchPasswordRequests(); }
    catch { toast.error('Rejection failed'); }
  };

  const acknowledgeAlert = async (id) => {
    try { await adminAPI.acknowledgeAlert(id); toast.success('Alert acknowledged'); fetchAlerts(); }
    catch { toast.error('Failed'); }
  };

  const tabs = [
    { id: 'users',    label: 'Users',    icon: Users },
    { id: 'online',   label: 'Online',   icon: Globe },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'resets',   label: 'Resets',   icon: KeyRound, badge: passwordRequests.length },
    { id: 'alerts',   label: 'Alerts',   icon: Bell, badge: alerts.filter(a => !a.acknowledged).length },
  ];

  const alertColors = { CRITICAL: '#fc8181', ERROR: '#fb923c', WARNING: '#f6e05e', INFO: '#00f5e8' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={14} className="text-cyber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyber-400/60">Control Center</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wider">
            ADMIN<span className="text-cyber-400">PANEL</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="glass px-3 py-2 rounded-lg border border-white/5">
            <span className="text-slate-600">operators: </span>
            <span className="text-cyber-400">{users.length}</span>
          </div>
          <div className="glass px-3 py-2 rounded-lg border border-white/5">
            <span className="text-slate-600">online: </span>
            <span className="text-bio-400">{onlineUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => <TabBtn key={t.id} {...t} active={activeTab === t.id} onClick={setActiveTab} />)}
      </div>

      {/* Panel */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        {/* USERS */}
        {activeTab === 'users' && (
          <Table headers={['Operator', 'Role', 'Status', 'Actions']}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyber-400/5 border border-cyber-400/10 flex items-center justify-center text-xs font-mono font-bold text-cyber-400">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-slate-200 text-sm">{u.username}</p>
                      <p className="font-mono text-xs text-slate-700">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                <td className="px-6 py-4"><StatusDot status={u.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleBanUser(u.id, u.username, u.status === 'banned')}
                      className="p-1.5 rounded-lg border border-white/5 text-slate-600 hover:text-amber-400 hover:border-amber-400/20 transition-all"
                      title={u.status === 'banned' ? 'Unban' : 'Ban'}>
                      {u.status === 'banned' ? <UserCheck size={14} /> : <UserX size={14} />}
                    </button>
                    {u.role === 'user' ? (
                      <button onClick={() => handlePromote(u.id, u.username)}
                        className="p-1.5 rounded-lg border border-white/5 text-slate-600 hover:text-cyber-400 hover:border-cyber-400/20 transition-all"
                        title="Promote to admin">
                        <ArrowUpCircle size={14} />
                      </button>
                    ) : u.role === 'admin' ? (
                      <button onClick={() => handleDemote(u.id, u.username)}
                        className="p-1.5 rounded-lg border border-white/5 text-slate-600 hover:text-amber-400 hover:border-amber-400/20 transition-all"
                        title="Demote to user">
                        <ArrowDownCircle size={14} />
                      </button>
                    ) : null}
                    <button onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-1.5 rounded-lg border border-white/5 text-slate-600 hover:text-red-400 hover:border-red-400/20 transition-all"
                      title="Delete user">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* ONLINE */}
        {activeTab === 'online' && (
          <div className="p-6 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-4">
              Active Sessions — {onlineUsers.length} online
            </p>
            {onlineUsers.length === 0 ? (
              <p className="text-slate-700 font-mono text-xs">no_active_sessions</p>
            ) : onlineUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-4 p-4 rounded-xl border border-bio-500/10 bg-bio-500/3">
                <div className="w-2 h-2 rounded-full bg-bio-400 animate-pulse" style={{ boxShadow: '0 0 6px #48bb78' }} />
                <div>
                  <p className="font-mono font-semibold text-slate-200 text-sm">{u.username}</p>
                  <p className="font-mono text-xs text-slate-700">
                    last_seen: {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'n/a'}
                  </p>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <Table headers={['Timestamp', 'Operator', 'Action', 'Details']}>
            {activityLog.map((log) => (
              <tr key={log._id} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-3 font-mono text-xs text-slate-700">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-300 font-semibold">{log.username}</td>
                <td className="px-6 py-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-400/5 text-cyber-400/70 border border-cyber-400/10">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-slate-700 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* RESETS */}
        {activeTab === 'resets' && (
          <div className="p-6 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-4">
              Pending Requests — {passwordRequests.length}
            </p>
            {passwordRequests.length === 0 ? (
              <p className="text-slate-700 font-mono text-xs">no_pending_requests</p>
            ) : passwordRequests.map((req) => (
              <div key={req._id} className="glass rounded-xl p-5 border border-yellow-400/10">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-mono font-semibold text-slate-200">{req.username}</p>
                    <p className="font-mono text-xs text-slate-600">{req.email} · {new Date(req.createdAt).toLocaleString()}</p>
                    <div className="mt-2 p-3 rounded-lg bg-void-800 border border-white/5 text-xs font-mono text-slate-500 italic">
                      "{req.message}"
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2 min-w-52">
                    {selectedRequest === req._id ? (
                      <div className="flex gap-2">
                        <Input type="password" placeholder="new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1" />
                        <Button onClick={() => approveReset(req._id)} size="sm"><CheckCircle size={14} /></Button>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)}>✕</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setSelectedRequest(req._id)} icon={<CheckCircle size={12} />}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => rejectReset(req._id)}>Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="p-6 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-600 mb-4">
              System Alerts — {alerts.filter(a => !a.acknowledged).length} unacknowledged
            </p>
            {alerts.length === 0 ? (
              <p className="text-slate-700 font-mono text-xs">no_system_alerts</p>
            ) : alerts.map((alert) => {
              const color = alertColors[alert.level] || '#475569';
              return (
                <div key={alert._id} className={`rounded-xl p-4 border flex items-start justify-between gap-4 transition-opacity ${alert.acknowledged ? 'opacity-40' : ''}`}
                  style={{ background: `${color}08`, borderColor: `${color}20` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold" style={{ color }}>{alert.level}</span>
                        <span className="text-xs font-mono text-slate-700">{new Date(alert.timestamp || alert.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-mono text-slate-300">{alert.message}</p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button onClick={() => acknowledgeAlert(alert._id)}
                      className="flex-shrink-0 p-1.5 rounded-lg border border-white/5 text-slate-600 hover:text-cyber-400 hover:border-cyber-400/20 transition-all"
                      title="Acknowledge">
                      <BellOff size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
