import { useState, useEffect } from 'react'
import {
    Users,
    MessageSquare,
    Activity,
    Settings,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Ban,
    PlusCircle,
    Package,
    LogOut,
    Lock,
    User,
    Globe,
    Phone,
    UserCheck
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchMerchants,
    fetchGlobalActivity,
    adminLogin,
    toggleMerchantBlock,
    extendMerchantTrial,
    updateMerchantPlan
} from './lib/api'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const queryClient = useQueryClient()

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (token) setIsLoggedIn(true)
    }, [])

    const { data: merchants, isLoading: loadingMerchants, refetch: refetchMerchants } = useQuery({
        queryKey: ['merchants'],
        queryFn: fetchMerchants,
        enabled: isLoggedIn,
        refetchInterval: 30000
    })

    const { data: activityLogs } = useQuery({
        queryKey: ['activity'],
        queryFn: fetchGlobalActivity,
        enabled: isLoggedIn,
        refetchInterval: 10000
    })

    // Mutations
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
                <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
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
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
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
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-slate-800/50 p-6 hidden lg:block">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Activity size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Whatomatic
                    </span>
                </div>

                <nav className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 font-medium transition-all border border-blue-500/20 text-left">
                        <Activity size={18} className="shrink-0" />
                        Overview
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-left mt-auto" onClick={handleLogout}>
                        <LogOut size={18} className="shrink-0" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 p-8">
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

                {/* List */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 border-b border-slate-800 bg-[#1e293b]/30">
                                <tr>
                                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Store Profile</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Contact Details</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Package / Usage</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px]">Status</th>
                                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Administrative Actions</th>
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
                                                <a href={`https://${merchant.shopDomain}`} target="_blank" className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
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
                                                <div className="flex items-center gap-2 font-mono text-xs">
                                                    <Package size={14} className="text-amber-500" />
                                                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">{merchant.plan?.toUpperCase()}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                        <span>Trial Messages</span>
                                                        <span>{merchant.trialUsage || 0} / {merchant.trialLimit || 10}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((merchant.trialUsage / (merchant.trialLimit || 10)) * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {merchant.isConnected ? (
                                                <div className="inline-flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-xs font-bold uppercase">
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                                    WhatsApp Linked
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700 text-xs font-bold uppercase">
                                                    Offline
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Block/Unblock */}
                                                <button
                                                    onClick={() => blockMutation.mutate({ domain: merchant.shopDomain, active: !merchant.isActive })}
                                                    className={`p-2 rounded-xl border transition-all ${merchant.isActive
                                                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                            : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white'
                                                        }`}
                                                    title={merchant.isActive ? 'Block Store' : 'Unblock Store'}
                                                >
                                                    {merchant.isActive ? <Ban size={16} /> : <UserCheck size={16} />}
                                                </button>

                                                {/* Extend Trial */}
                                                <button
                                                    onClick={() => extendMutation.mutate({ domain: merchant.shopDomain, amount: 50 })}
                                                    className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                                    title="Extend Trial +50"
                                                >
                                                    <PlusCircle size={16} />
                                                </button>

                                                {/* Change Plan */}
                                                <button
                                                    onClick={() => planMutation.mutate({ domain: merchant.shopDomain, plan: merchant.plan === 'pro' ? 'free' : 'pro' })}
                                                    className="p-2 bg-[#1e293b] border border-slate-700 text-slate-400 rounded-xl hover:text-white hover:border-slate-500 transition-all font-bold text-[10px]"
                                                    title="Switch Plan"
                                                >
                                                    ROT
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
                            <Activity size={18} className="text-blue-400" />
                            Live Network Pulse
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                            {activityLogs?.map((log: any, i: number) => (
                                <div key={i} className="flex gap-3 text-xs border-l-2 border-slate-800 pl-4 py-1">
                                    <span className="text-slate-500 font-mono shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-blue-400 font-bold shrink-0">{log.customerName || 'Cust'}</span>
                                    <span className="text-slate-400 truncate italic">"{log.message}"</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col justify-center">
                        <h4 className="text-blue-300 font-bold text-lg mb-2 tracking-tight">System Status: Shield Active</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            All traffic is currently monitored. You can manually override merchant settings, block access, or rotate service packages from this panel.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-300 text-xs font-bold">
                                AUTH SECURED
                            </div>
                            <div className="px-4 py-2 bg-green-500/20 rounded-xl border border-green-500/30 text-green-300 text-xs font-bold">
                                ALL SERVICES UP
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
