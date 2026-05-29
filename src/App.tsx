import { useState, useEffect } from 'react'
import {
    Users,
    Activity,
    Search,
    RefreshCw,
    Ban,
    PlusCircle,
    Package,
    LogOut,
    Lock,
    User,
    Globe,
    Phone,
    UserCheck,
    XCircle,
    CreditCard,
    LayoutDashboard,
    TrendingUp,
    DollarSign,
    PieChart,
    Trash2,
    MessageSquare,
    Bell
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchMerchants,
    fetchGlobalActivity,
    adminLogin,
    toggleMerchantBlock,
    extendMerchantTrial,
    updateMerchantPlan,
    fetchPlans,
    updatePlan,
    cancelSubscription,
    fetchStats,
    deleteStore,
    fetchBroadcasts,
    sendBroadcast,
    deleteBroadcast,
    fetchTickets,
    resolveTicket,
    changeAdminPassword
} from './lib/api'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    // New State for Broadcast
    const [broadcastTitle, setBroadcastTitle] = useState('')
    const [broadcastMessage, setBroadcastMessage] = useState('')
    const [broadcastType, setBroadcastType] = useState('info')

    // New State for Plans
    const [currentView, setCurrentView] = useState('overview')
    const [editingPlan, setEditingPlan] = useState<any>(null)

    const queryClient = useQueryClient()

    // Support Ticket Tab state
    const [ticketTab, setTicketTab] = useState<'open' | 'closed'>('open')
    
    // Change Password state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    // Switch Plan Custom Modal State
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
    const [switchMerchant, setSwitchMerchant] = useState<any>(null)
    const [selectedNewPlan, setSelectedNewPlan] = useState('free')

    // Support Tickets query
    const { data: tickets, refetch: refetchTickets } = useQuery({
        queryKey: ['tickets'],
        queryFn: fetchTickets,
        enabled: isLoggedIn && currentView === 'support',
        refetchInterval: 15000 // Poll every 15s for new tickets
    })

    // Resolve Ticket mutation
    const resolveTicketMutation = useMutation({
        mutationFn: (id: string) => resolveTicket(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'Failed to resolve ticket')
        }
    })

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match')
            setPasswordSuccess('')
            return;
        }
        setIsChangingPassword(true)
        setPasswordError('')
        setPasswordSuccess('')
        try {
            await changeAdminPassword({ currentPassword, newPassword })
            setPasswordSuccess('Password changed successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setPasswordError(err.response?.data?.error || 'Failed to change password')
        } finally {
            setIsChangingPassword(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (token) setIsLoggedIn(true)
    }, [])

    const { data: merchants, isLoading: loadingMerchants, refetch: refetchMerchants } = useQuery({
        queryKey: ['merchants'],
        queryFn: fetchMerchants,
        enabled: isLoggedIn && currentView === 'overview',
        refetchInterval: 30000
    })

    const { data: activityLogs } = useQuery({
        queryKey: ['activity'],
        queryFn: fetchGlobalActivity,
        enabled: isLoggedIn && currentView === 'overview', // Only fetch activity on dashboard
        refetchInterval: 10000
    })

    const { data: plans, isLoading: loadingPlans } = useQuery({
        queryKey: ['plans'],
        queryFn: fetchPlans,
        enabled: isLoggedIn && currentView === 'plans'
    })

    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        enabled: isLoggedIn && currentView === 'analytics'
    })

    const { data: broadcasts, refetch: refetchBroadcasts } = useQuery({
        queryKey: ['broadcasts'],
        queryFn: fetchBroadcasts,
        enabled: isLoggedIn && currentView === 'broadcast'
    })

    // Mutations
    const sendBroadcastMutation = useMutation({
        mutationFn: (payload: any) => sendBroadcast(payload),
        onSuccess: () => {
            refetchBroadcasts()
            setBroadcastTitle('')
            setBroadcastMessage('')
            alert('Broadcast sent successfully!')
        }
    })

    const deleteBroadcastMutation = useMutation({
        mutationFn: (id: string) => deleteBroadcast(id),
        onSuccess: () => refetchBroadcasts()
    })
    const blockMutation = useMutation({
        mutationFn: ({ domain, active }: { domain: string, active: boolean }) => toggleMerchantBlock(domain, active),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
    })

    const extendMutation = useMutation({
        mutationFn: ({ domain, amount }: { domain: string, amount: number }) => extendMerchantTrial(domain, amount),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
    })

    const planMutation = useMutation({
        mutationFn: ({ domain, plan }: { domain: string, plan: string }) => updateMerchantPlan(domain, plan),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
    })

    const updatePlanMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => updatePlan(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] })
            setEditingPlan(null)
        }
    })

    const cancelSubscriptionMutation = useMutation({
        mutationFn: ({ domain }: { domain: string }) => cancelSubscription(domain),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
    })

    const deleteStoreMutation = useMutation({
        mutationFn: ({ domain }: { domain: string }) => deleteStore(domain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] })
            alert('Store and all associated data have been deleted successfully.')
        },
        onError: () => {
            alert('Failed to delete store. Please try again.')
        }
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await adminLogin({ username, password })
            localStorage.setItem('admin_token', res.token)
            setIsLoggedIn(true)
            setLoginError('')
        } catch (err) {
            setLoginError('Invalid username or password')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        setIsLoggedIn(false)
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-green-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                            <Lock className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-400 text-sm mt-1">Please sign in to manage Whatomatic</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 relative">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {loginError && <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg">{loginError}</p>}

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25 active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    const filteredMerchants = merchants?.filter((m: any) =>
        m.shopDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-green-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-slate-800/50 p-6 hidden lg:flex flex-col">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Activity size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Whatomatic
                    </span>
                </div>

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setCurrentView('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-left ${currentView === 'overview' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <LayoutDashboard size={18} className="shrink-0" />
                        Store Overview
                    </button>
                    <button
                        onClick={() => setCurrentView('analytics')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-left ${currentView === 'analytics' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <TrendingUp size={18} className="shrink-0" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setCurrentView('plans')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-left ${currentView === 'plans' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <Package size={18} className="shrink-0" />
                        Plans & Pricing
                    </button>
                    <button
                        onClick={() => setCurrentView('broadcast')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-left ${currentView === 'broadcast' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <Bell size={18} className="shrink-0" />
                        Broadcast Control
                    </button>
                    <button
                        onClick={() => setCurrentView('support')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-left ${currentView === 'support' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <MessageSquare size={18} className="shrink-0" />
                        Help & Support
                    </button>
                </nav>

                <nav className="mt-auto pt-4 border-t border-slate-800/50">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-left" onClick={handleLogout}>
                        <LogOut size={18} className="shrink-0" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 p-8">
                {currentView === 'overview' && (
                    <>
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Merchant Central</h1>
                                <p className="text-slate-400 text-sm italic">Manage global store properties, blocks, and trials.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Shop, Contact, or Domain..."
                                        className="bg-[#0f172a] border border-slate-800 rounded-xl px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="p-2 bg-[#0f172a] border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white" onClick={() => refetchMerchants()}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </header>

                        {/* Merchants List */}
                        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-500 border-b border-slate-800 bg-[#1e293b]/30">
                                        <tr>
                                            <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Store Profile</th>
                                            <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Contact Details</th>
                                            <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Package / Usage</th>
                                            <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Status</th>
                                            <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {loadingMerchants ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Wait, fetching merchant data...</td></tr>
                                        ) : filteredMerchants?.map((merchant: any) => (
                                            <tr key={merchant._id} className={`hover:bg-slate-800/40 transition-all transition-colors duration-200 ${!merchant.isActive ? 'bg-red-500/5 opacity-80' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-100 font-bold text-base">{merchant.storeName || 'Unnamed Hub'}</span>
                                                            {!merchant.isActive && <Ban size={14} className="text-red-500" />}
                                                        </div>
                                                        <a href={`https://${merchant.shopDomain}`} target="_blank" className="text-green-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                                                            <Globe size={10} /> {merchant.shopDomain}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-slate-300">
                                                            <User size={14} className="text-slate-500 shrink-0" />
                                                            <span className="font-medium">{merchant.contactName || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                            <Phone size={14} className="text-slate-500 shrink-0" />
                                                            <span>{merchant.phone || 'No phone'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 font-mono text-[10px]">
                                                            <Package size={14} className="text-amber-500" />
                                                            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold tracking-widest">{merchant.plan?.toUpperCase() || 'FREE'}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                                <span>Messages Left</span>
                                                                <span>{(merchant.limit || 10) - (merchant.usage || 0)} / {merchant.limit || 10}</span>
                                                            </div>
                                                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                                <div className="bg-green-500 h-full transition-all" style={{ width: `${Math.max(0, Math.min((((merchant.limit || 10) - (merchant.usage || 0)) / (merchant.limit || 10)) * 100, 100))}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {merchant.isConnected ? (
                                                            <div className="inline-flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-[10px] font-bold uppercase whitespace-nowrap">
                                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                                                WhatsApp Linked
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] font-bold uppercase whitespace-nowrap">
                                                                Offline
                                                            </div>
                                                        )}

                                                        {merchant.billingStatus === 'active' ? (
                                                            <div className="inline-flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-[10px] font-bold uppercase whitespace-nowrap">
                                                                <CreditCard size={10} />
                                                                Paid / Active
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 text-[10px] font-bold uppercase whitespace-nowrap">
                                                                <XCircle size={10} />
                                                                Unpaid / Inactive
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const action = merchant.isActive ? 'block' : 'unblock';
                                                                if (window.confirm(`Are you sure you want to ${action} the store ${merchant.storeName || merchant.shopDomain}?`)) {
                                                                    blockMutation.mutate({ domain: merchant.shopDomain, active: !merchant.isActive });
                                                                }
                                                            }}
                                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold ${merchant.isActive
                                                                ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                                : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white'
                                                                }`}
                                                            title={merchant.isActive ? 'Block Store' : 'Unblock Store'}
                                                        >
                                                            {merchant.isActive ? <><Ban size={14} /> <span>BLOCK</span></> : <><UserCheck size={14} /> <span>UNBLOCK</span></>}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const amountStr = window.prompt(`How many messages do you want to extend for ${merchant.storeName || merchant.shopDomain}?`, "50");
                                                                if (amountStr !== null) {
                                                                    const amount = parseInt(amountStr, 10);
                                                                    if (!isNaN(amount) && amount > 0) {
                                                                        extendMutation.mutate({ domain: merchant.shopDomain, amount });
                                                                    } else {
                                                                        alert("Please enter a valid positive number.");
                                                                    }
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all text-[10px] font-bold"
                                                            title="Extend Trial"
                                                        >
                                                            <PlusCircle size={14} />
                                                            <span>EXTEND</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSwitchMerchant(merchant);
                                                                setSelectedNewPlan(merchant.plan || 'free');
                                                                setIsSwitchModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] border border-slate-700 text-slate-400 rounded-xl hover:text-white hover:border-slate-500 transition-all font-bold text-[10px]"
                                                            title="Switch Plan"
                                                        >
                                                            <RefreshCw size={14} />
                                                            <span>SWITCH</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to cancel the subscription for ${merchant.storeName || merchant.shopDomain}?`)) {
                                                                    cancelSubscriptionMutation.mutate({ domain: merchant.shopDomain });
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all text-[10px] font-bold"
                                                            title="Cancel Subscription"
                                                        >
                                                            <CreditCard size={14} />
                                                            <span>CANCEL</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete the store ${merchant.storeName || merchant.shopDomain} permanently? This cannot be undone.`)) {
                                                                    deleteStoreMutation.mutate({ domain: merchant.shopDomain });
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold"
                                                            title="Delete Store Permanently"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>DELETE</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Global Monitor Area */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-all">
                                    <Activity size={48} />
                                </div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-green-400" />
                                    Live Network Pulse
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                                    {activityLogs?.map((log: any, i: number) => (
                                        <div key={i} className="flex gap-3 text-xs border-l-2 border-slate-800 pl-4 py-1">
                                            <span className="text-slate-500 font-mono shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-green-400 font-bold shrink-0">{log.customerName || 'Cust'}</span>
                                            <span className="text-slate-400 truncate italic">"{log.message}"</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-green-500/20 rounded-3xl p-8 flex flex-col justify-center">
                                <h4 className="text-green-300 font-bold text-lg mb-2 tracking-tight">System Status: Shield Active</h4>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    All traffic is currently monitored. You can manually override merchant settings, block access, or rotate service packages from this panel.
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-green-500/20 rounded-xl border border-green-500/30 text-green-300 text-xs font-bold">
                                        AUTH SECURED
                                    </div>
                                    <div className="px-4 py-2 bg-green-500/20 rounded-xl border border-green-500/30 text-green-300 text-xs font-bold">
                                        ALL SERVICES UP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {currentView === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Business Intelligence</h1>
                            <p className="text-slate-400 text-sm italic">Subscription metrics, revenue tracking, and growth analytics.</p>
                        </div>

                        {loadingStats ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <RefreshCw className="animate-spin mb-4" size={32} />
                                <p>Calculating metrics...</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all">
                                            <UserCheck size={64} className="text-green-500" />
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Subscribed Users</p>
                                        <h2 className="text-5xl font-bold text-white tracking-tighter">{stats?.totalSubscribers || 0}</h2>
                                        <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold">
                                            <TrendingUp size={14} />
                                            <span>Active Paying Hubs</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all">
                                            <DollarSign size={64} className="text-emerald-500" />
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Monthly Recurring Revenue</p>
                                        <h2 className="text-5xl font-bold text-emerald-400 tracking-tighter">${stats?.totalMonthlyEarnings || 0}</h2>
                                        <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold">
                                            <CreditCard size={14} />
                                            <span>Projected USD / Month</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all">
                                            <PieChart size={64} className="text-amber-500" />
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Plan Diversity</p>
                                        <h2 className="text-5xl font-bold text-white tracking-tighter">{Object.keys(stats?.planBreakdown || {}).length}</h2>
                                        <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-bold">
                                            <Package size={14} />
                                            <span>Active Plan Types</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Breakdown Table */}
                                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                                        <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                                            <Users size={20} className="text-green-500" />
                                            Subscriber Breakdown
                                        </h3>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {Object.entries(stats?.planBreakdown || {}).map(([plan, count]: any) => (
                                                <div key={plan} className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col items-center">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{plan}</span>
                                                    <span className="text-3xl font-bold text-white">{count}</span>
                                                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Active Hubs</span>
                                                </div>
                                            ))}
                                            {Object.keys(stats?.planBreakdown || {}).length === 0 && (
                                                <div className="col-span-4 text-center py-10 text-slate-500 italic">No active subscriptions detected.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {currentView === 'plans' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Pricing Plans</h1>
                            <p className="text-slate-400 text-sm italic">Dynamic pricing control. Updates reflect immediately in the app.</p>
                        </div>

                        {loadingPlans ? (
                            <div>Loading Plans...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {plans?.map((plan: any) => (
                                    <div key={plan.id} className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 relative group hover:border-green-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                                <Package size={24} />
                                            </div>
                                            <button
                                                onClick={() => setEditingPlan(plan)}
                                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold text-slate-300 transition-all"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-2xl font-bold text-green-400">${plan.price}</span>
                                            <span className="text-slate-500 text-sm">/mo</span>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Msg Limit</span>
                                                <span className="text-slate-300 font-mono font-bold">{plan.messageLimit}</span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {plan.features?.length} features configured
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Edit Plan Modal Overlay */}
                        {editingPlan && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
                                    <button onClick={() => setEditingPlan(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XCircle /></button>

                                    <h2 className="text-2xl font-bold text-white mb-6">Edit {editingPlan.name} Plan</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Plan Name</label>
                                            <input
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1"
                                                value={editingPlan.name}
                                                onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1"
                                                    value={editingPlan.price}
                                                    onChange={e => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Msg Limit</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1"
                                                    value={editingPlan.messageLimit}
                                                    onChange={e => setEditingPlan({ ...editingPlan, messageLimit: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Features (Comma separated)</label>
                                            <textarea
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 h-32 text-sm"
                                                value={editingPlan.features?.join('\n')}
                                                onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n') })}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Put each feature on a new line</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8">
                                        <button onClick={() => setEditingPlan(null)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800">Cancel</button>
                                        <button
                                            onClick={() => updatePlanMutation.mutate({ id: editingPlan.id, updates: editingPlan })}
                                            className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20"
                                        >
                                            {updatePlanMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'broadcast' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Broadcast Control</h1>
                            <p className="text-slate-400 text-sm italic">Send global notifications to all connected merchants.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Create Broadcast Form */}
                            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-green-500" />
                                    New Global Announcement
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headline</label>
                                        <input
                                            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="System Update, Major Feature, etc."
                                            value={broadcastTitle}
                                            onChange={e => setBroadcastTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message Body</label>
                                        <textarea
                                            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 h-32 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                            placeholder="Enter your announcement here..."
                                            value={broadcastMessage}
                                            onChange={e => setBroadcastMessage(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority Type</label>
                                            <select
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none"
                                                value={broadcastType}
                                                onChange={e => setBroadcastType(e.target.value)}
                                            >
                                                <option value="info">Information (Blue)</option>
                                                <option value="warning">Warning (Amber)</option>
                                                <option value="success">Success (Green)</option>
                                                <option value="error">Critical (Red)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => sendBroadcastMutation.mutate({
                                                    title: broadcastTitle,
                                                    message: broadcastMessage,
                                                    type: broadcastType
                                                })}
                                                disabled={!broadcastTitle || !broadcastMessage || sendBroadcastMutation.isPending}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {sendBroadcastMutation.isPending ? 'Sending...' : 'Broadcast Now'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Broadcasts History */}
                            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Activity size={20} className="text-green-500" />
                                    Broadcast History
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                    {broadcasts?.length === 0 && <p className="text-slate-500 italic text-center py-10">No messages sent yet.</p>}
                                    {broadcasts?.map((msg: any) => (
                                        <div key={msg._id} className="p-5 bg-[#1e293b]/40 border border-slate-800 rounded-2xl relative group">
                                            <button
                                                onClick={() => { if (window.confirm('Delete this broadcast?')) deleteBroadcastMutation.mutate(msg._id) }}
                                                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${msg.type === 'info' ? 'bg-green-500' : msg.type === 'warning' ? 'bg-amber-500' : msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{msg.type}</span>
                                                <span className="text-[10px] text-slate-600 font-mono ml-auto">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-white font-bold mb-1">{msg.title}</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'support' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Help & Support</h1>
                                <p className="text-slate-400 text-sm italic">Manage merchant queries and support tickets, or configure admin security.</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Tickets List - 2 cols width */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setTicketTab('open')}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${ticketTab === 'open' ? 'bg-green-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white'}`}
                                            >
                                                Open Tickets
                                            </button>
                                            <button
                                                onClick={() => setTicketTab('closed')}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${ticketTab === 'closed' ? 'bg-green-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white'}`}
                                            >
                                                Closed Tickets
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            {tickets?.filter((t: any) => t.status === (ticketTab === 'open' ? 'open' : 'closed')).length || 0} Tickets
                                        </span>
                                    </div>

                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                        {(tickets?.filter((t: any) => t.status === (ticketTab === 'open' ? 'open' : 'closed')).length || 0) === 0 ? (
                                            <p className="text-slate-500 italic text-center py-12">No {ticketTab} support tickets found.</p>
                                        ) : (
                                            tickets?.filter((t: any) => t.status === (ticketTab === 'open' ? 'open' : 'closed')).map((ticket: any) => (
                                                <div key={ticket._id} className="p-5 bg-[#1e293b]/20 border border-slate-800 rounded-2xl relative group hover:border-slate-700 transition-all">
                                                    <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-white">{ticket.name}</span>
                                                            <span className="text-xs text-slate-500">({ticket.email})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                                                            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-slate-300 text-xs leading-relaxed bg-[#0f172a]/50 p-3 rounded-xl mb-4 italic">
                                                        "{ticket.message}"
                                                    </p>

                                                    <div className="flex justify-between items-center">
                                                        {ticket.shopDomain ? (
                                                            <a href={`https://${ticket.shopDomain}`} target="_blank" className="text-[10px] text-green-400 hover:underline font-mono">
                                                                🌐 {ticket.shopDomain}
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-600">No store linked</span>
                                                        )}

                                                        {ticketTab === 'open' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Mark query from ${ticket.name} as Solved?`)) {
                                                                        resolveTicketMutation.mutate(ticket._id);
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all text-[10px] font-bold"
                                                            >
                                                                ✔ Mark Solved
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Security / Password Change - 1 col width */}
                            <div className="space-y-6">
                                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Lock size={18} className="text-green-500" />
                                        Update Credentials
                                    </h3>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none text-xs"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none text-xs"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white mt-1 outline-none text-xs"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                            />
                                        </div>

                                        {passwordError && (
                                            <p className="text-red-400 text-xs bg-red-500/10 py-2 px-3 rounded-lg text-center font-medium">
                                                {passwordError}
                                            </p>
                                        )}

                                        {passwordSuccess && (
                                            <p className="text-green-400 text-xs bg-green-500/10 py-2 px-3 rounded-lg text-center font-medium">
                                                {passwordSuccess}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 text-xs"
                                        >
                                            {isChangingPassword ? 'Updating...' : 'Save Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {isSwitchModalOpen && switchMerchant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Decorative background glow */}
                        <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl">
                                <RefreshCw size={24} className="animate-spin text-green-400" style={{ animationDuration: '4s' }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Switch Service Package</h3>
                                <p className="text-slate-400 text-xs italic mt-0.5">{switchMerchant.storeName || switchMerchant.shopDomain}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Target Package</label>
                                <div className="relative">
                                    <select
                                        value={selectedNewPlan}
                                        onChange={(e) => setSelectedNewPlan(e.target.value)}
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium cursor-pointer appearance-none text-sm"
                                    >
                                        <option value="free">Free Plan (50 msg/mo)</option>
                                        <option value="starter">Starter Plan (1,250 msg/mo)</option>
                                        <option value="growth">Growth Plan (2,500 msg/mo)</option>
                                        <option value="professional">Professional Plan (4,250 msg/mo)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsSwitchModalOpen(false);
                                        setSwitchMerchant(null);
                                    }}
                                    className="flex-1 py-3 bg-[#1e293b] hover:bg-[#2e3b4e] text-slate-300 font-bold rounded-xl transition-all text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        planMutation.mutate({ domain: switchMerchant.shopDomain, plan: selectedNewPlan });
                                        setIsSwitchModalOpen(false);
                                        setSwitchMerchant(null);
                                    }}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/25 text-xs"
                                >
                                    Switch Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default App
