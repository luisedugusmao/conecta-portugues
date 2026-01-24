import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Download, PieChart, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

export const ViewFinancial = ({ students }) => {
    const [period, setPeriod] = useState('6M'); // 1M, 3M, 6M, 1Y

    // Process Data
    const { kpis, chartData } = useMemo(() => {
        const now = new Date();
        const months = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : 12;
        const pastDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
        const prevDate = new Date(now.getFullYear(), now.getMonth() - (months * 2), 1);

        // Parse logic: ID format "st1737679800000" -> extract timestamp
        const parsedStudents = students.map(s => {
            let createdAt = new Date(); // Default to now if fail 
            try {
                if (s.id.startsWith('st')) {
                    const ts = parseInt(s.id.substring(2));
                    if (!isNaN(ts)) createdAt = new Date(ts);
                }
            } catch (e) { }
            return { ...s, createdAt };
        });

        // Current Period Metrics
        const activeStudents = parsedStudents.filter(s => s.role === 'student');
        const newStudents = activeStudents.filter(s => s.createdAt >= pastDate);
        const prevNewStudents = activeStudents.filter(s => s.createdAt >= prevDate && s.createdAt < pastDate);

        // KPI Calculations
        const ticket = 150;
        const mrr = activeStudents.length * ticket;
        const arr = mrr * 12;

        // Growth Calculation
        const currentCount = newStudents.length;
        const prevCount = prevNewStudents.length || 1; // Avoid divide by zero
        const growthRate = ((currentCount - prevCount) / prevCount) * 100;

        // LTV Estimation (Simplified: Ticket * Avg Retention of 18 months)
        const ltv = ticket * 18;

        // Chart Data (Last 12 months fixed for visualization context)
        const chart = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            const label = d.toLocaleDateString('pt-BR', { month: 'short' });
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const count = activeStudents.filter(s => s.createdAt >= monthStart && s.createdAt <= monthEnd).length;
            // Revenue for that month (approximate based on cumulative active users up to then)
            const cumulativeRaw = activeStudents.filter(s => s.createdAt <= monthEnd).length;

            return { label, count, revenue: cumulativeRaw * ticket };
        });

        // NPS Simulation based on Growth
        const nps = growthRate > 15 ? 92 : growthRate > 5 ? 78 : 60;

        return {
            kpis: {
                totalStudents: activeStudents.length,
                newStudents: newStudents.length,
                mrr,
                arr,
                ticket,
                ltv,
                growthRate,
                nps
            },
            chartData: chart
        };
    }, [students, period]);

    const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6 animate-fadeIn pb-20 md:pb-0">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Relatório Financeiro</h2>
                    <p className="text-slate-500 dark:text-slate-400">Análise detalhada de performance e receita</p>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {['1M', '3M', '6M', '1Y'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${period === p ? 'bg-[#a51a8f] text-white shadow' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={60} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Receita Mensal (MRR)</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatMoney(kpis.mrr)}</h3>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-500"><ArrowUpRight size={14} /> +{kpis.newStudents} novos assinantes</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard size={60} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">ARR (Projeção Anual)</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatMoney(kpis.arr)}</h3>
                    <p className="text-xs text-slate-400 mt-2">Baseado no MRR atual</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={60} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Novos Alunos ({period})</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{kpis.newStudents}</h3>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${kpis.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {kpis.growthRate >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {isFinite(kpis.growthRate) ? Math.abs(kpis.growthRate).toFixed(1) : 0}% vs período anterior
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><PieChart size={60} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">LTV Estimado</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatMoney(kpis.ltv)}</h3>
                    <p className="text-xs text-slate-400 mt-2">Ticket Médio: {formatMoney(kpis.ticket)}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={60} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">NPS (Satisfação)</p>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{kpis.nps}</h3>
                    <div className={`mt-2 text-xs font-bold px-2 py-1 rounded w-fit ${kpis.nps >= 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {kpis.nps >= 75 ? 'Zona de Excelência' : 'Zona de Qualidade'}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">Crescimento de Receita (Últimos 12 meses)</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-2">
                        {chartData.map((d, i) => {
                            const maxRevenue = Math.max(...chartData.map(c => c.revenue), 100);
                            const height = (d.revenue / maxRevenue) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[30px] bg-[#a51a8f] rounded-t-lg transition-all duration-500 group-hover:bg-[#d36ac1]"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        ></div>
                                        <div className="absolute -top-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {formatMoney(d.revenue)}
                                        </div>
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{d.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-[#2d1b36] p-6 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp size={120} /></div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Resumo Executivo</h3>
                        <p className="text-white/60 text-sm">Saúde financeira do negócio</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <p className="text-xs uppercase font-bold text-[#eec00a] mb-1">Margem de Lucro Estimada</p>
                            <p className="text-3xl font-bold">~85%</p>
                            <div className="w-full bg-white/20 h-1.5 rounded-full mt-2"><div className="bg-[#eec00a] w-[85%] h-full rounded-full"></div></div>
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-[#eec00a] mb-1">Custo por Aquisição (CAC)</p>
                            <p className="text-3xl font-bold">R$ 0,00</p>
                            <p className="text-[10px] text-white/50">Crescimento Orgânico</p>
                        </div>
                        <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-white/10">
                            <Download size={18} /> Exportar Relatório
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
