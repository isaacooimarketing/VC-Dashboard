import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Users,
  LayoutDashboard,
  Search,
  Settings,
  HelpCircle,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Zap,
  AlertCircle,
  Target,
  Lightbulb,
  Eye,
  RefreshCw,
  Key,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- UI Components ---

const KPICard = ({ title, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all duration-300 card-shine"
  >
    <div className="flex justify-between items-start">
      <div>
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>

    <div className="mt-4 flex items-center text-sm font-medium">
      {trend > 0 ? (
        <span className="flex items-center text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="w-4 h-4 mr-0.5" />
          {trend}%
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">vs last month</span>
        </span>
      ) : (
        <span className="flex items-center text-rose-600 dark:text-rose-400">
          <ArrowDownRight className="w-4 h-4 mr-0.5" />
          {Math.abs(trend)}%
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">vs last month</span>
        </span>
      )}
    </div>
  </motion.div>
);

const InsightCard = ({ title, value, label, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={cn("p-3 rounded-lg flex-shrink-0", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tighter truncate">{title}</p>
      <p className="text-base font-bold text-gray-900 dark:text-white truncate">{value}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">{label}</p>
    </div>
  </motion.div>
);

const AIInsightItem = ({ type, text, delay }) => {
  const icons = {
    alert: <AlertCircle className="w-5 h-5 text-rose-500" />,
    opportunity: <Target className="w-5 h-5 text-emerald-500" />,
    suggestion: <Lightbulb className="w-5 h-5 text-amber-500" />
  };
  const titles = {
    alert: "Alert",
    opportunity: "Opportunity",
    suggestion: "Suggestion"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 flex items-start space-x-3"
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{titles[type]}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 h-full"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
    <div className="h-[300px] w-full">
      {children}
    </div>
  </motion.div>
);

const TransactionTable = ({ data, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
        {data.length} Records
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-widest font-bold">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Channel</th>
            <th className="px-6 py-4 text-right">Visitors</th>
            <th className="px-6 py-4 text-right">Orders</th>
            <th className="px-6 py-4 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {data.slice(0, 10).map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                {format(parseISO(row.date), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{row.product}</span>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                  row.channel === 'Facebook Ads' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                    row.channel === 'Google Ads' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                )}>
                  {row.channel}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 font-mono">
                {row.visitors?.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 font-mono font-bold">
                {row.orders?.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                ${row.revenue?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.length > 10 && (
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 text-center">
        <button className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">
          View all transactions
        </button>
      </div>
    )}
  </motion.div>
);

const FilterSelect = ({ label, icon: Icon, options, value, onChange }) => (
  <div className="relative flex-1 min-w-[200px]">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <Icon className="w-4 h-4" />
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-300 dark:hover:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition appearance-none outline-none shadow-sm cursor-pointer"
    >
      <option value="All">All {label}s</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Filters State
  const [productFilter, setProductFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_KEY || '';
  });
  const [aiModel, setAiModel] = useState('gemini-2.5-flash-preview');
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('http://localhost:5001/api/sales')
      .then(res => res.json())
      .then(data => {
        const parsedData = data.map(row => ({
          ...row,
          dateObj: parseISO(row.date)
        }));
        setRawData(parsedData);

        if (parsedData.length > 0) {
          const dates = parsedData.map(r => r.date).sort();
          setStartDate(dates[0]);
          setEndDate(dates[dates.length - 1]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  // Filtered Data Calculation
  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      const matchesProduct = productFilter === 'All' || row.product === productFilter;
      const matchesChannel = channelFilter === 'All' || row.channel === channelFilter;

      const rowDate = row.dateObj;
      const start = startDate ? startOfDay(parseISO(startDate)) : null;
      const end = endDate ? endOfDay(parseISO(endDate)) : null;

      const matchesDate = !start || !end || isWithinInterval(rowDate, { start, end });

      return matchesProduct && matchesChannel && matchesDate;
    });
  }, [rawData, productFilter, channelFilter, startDate, endDate]);

  // Derived Statistics
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return {
      revenue: 0, orders: 0, profit: 0, aov: 0,
      bestProduct: '-', bestChannel: '-', peakDay: '-', bestCVRChannel: '-'
    };

    // Grouping for insights
    const groupedProduct = filteredData.reduce((acc, row) => {
      acc[row.product] = (acc[row.product] || 0) + row.revenue;
      return acc;
    }, {});
    const groupedChannel = filteredData.reduce((acc, row) => {
      acc[row.channel] = (acc[row.channel] || 0) + row.revenue;
      return acc;
    }, {});
    const groupedDay = filteredData.reduce((acc, row) => {
      acc[row.date] = (acc[row.date] || 0) + row.revenue;
      return acc;
    }, {});
    const groupedCVR = filteredData.reduce((acc, row) => {
      if (!acc[row.channel]) acc[row.channel] = { cust: 0, vis: 0 };
      acc[row.channel].cust += (row.customers || 0);
      acc[row.channel].vis += (row.visitors || 1);
      return acc;
    }, {});

    const totalRevenue = filteredData.reduce((sum, row) => sum + (row.revenue || 0), 0);
    const totalOrders = filteredData.reduce((sum, row) => sum + (row.orders || 0), 0);
    const totalCost = filteredData.reduce((sum, row) => sum + (row.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const bestProduct = Object.entries(groupedProduct).sort((a, b) => b[1] - a[1])[0][0];
    const bestChannel = Object.entries(groupedChannel).sort((a, b) => b[1] - a[1])[0][0];
    const peakDay = Object.entries(groupedDay).sort((a, b) => b[1] - a[1])[0][0];

    const bestCVRChan = Object.entries(groupedCVR).map(([name, data]) => ({
      name,
      cvr: data.cust / data.vis
    })).sort((a, b) => b.cvr - a.cvr)[0];

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      profit: totalProfit,
      aov: aov,
      bestProduct,
      bestChannel,
      peakDay,
      bestCVRChannel: bestCVRChan.name,
      bestCVRValue: (bestCVRChan.cvr * 100).toFixed(1) + '%'
    };
  }, [filteredData]);

  // Chart Data: Revenue Trend
  const trendData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      const date = row.date;
      if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 };
      acc[date].revenue += row.revenue || 0;
      acc[date].orders += row.orders || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Chart Data: Revenue by Channel
  const channelData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      const channel = row.channel;
      if (!acc[channel]) acc[channel] = { name: channel, value: 0 };
      acc[channel].value += row.revenue || 0;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Chart Data: Top Products
  const productData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      const product = row.product;
      if (!acc[product]) acc[product] = { name: product, revenue: 0 };
      acc[product].revenue += row.revenue || 0;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredData]);

  // AI Insights Function
  const generateAI = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setGeneratingAI(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: aiModel });

      const summary = `
            Sales Summary:
            - Period: ${startDate} to ${endDate}
            - Total Revenue: $${metrics.revenue.toLocaleString()}
            - Total Orders: ${metrics.orders.toLocaleString()}
            - Net Profit: $${metrics.profit.toLocaleString()}
            - AOV: $${metrics.aov.toFixed(2)}
            - Best Selling Product: ${metrics.bestProduct}
            - Highest Grossing Channel: ${metrics.bestChannel}
            - Channel with Best Conversion Rate: ${metrics.bestCVRChannel} (${metrics.bestCVRValue})
            - Peak Revenue Day: ${metrics.peakDay}
        `;

      const prompt = `
            You are a senior business data analyst. Based on the following sales metrics, provide 6 quick executive insights in JSON format.
            The JSON should have three arrays: "alerts", "opportunities", and "suggestions". Each array should have 2 items.
            Each insight should be a single short sentence (max 15 words) using clear business language.
            
            Metrics: ${summary}
        `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Extract JSON if it's wrapped in markdown backticks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      try {
        setAiInsights(JSON.parse(text));
      } catch (parseError) {
        console.error("JSON Parsing Error:", text);
        alert("The AI returned an invalid format. Please try again.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert(`AI Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyInput(false);
  };

  // Unique Options for Filters
  const productOptions = Array.from(new Set(rawData.map(r => r.product)));
  const channelOptions = Array.from(new Set(rawData.map(r => r.channel)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans tracking-tight">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Synthesizing insights...</p>
        </div>
      </div>
    );
  }

  const chartColors = {
    grid: isDarkMode ? '#1e293b' : '#f1f5f9',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? '#0f172a' : '#ffffff',
    tooltipBorder: isDarkMode ? '#1e293b' : 'none'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-primary-100 selection:text-primary-700 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen z-30">
        <div className="p-6">
          <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400">
            <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-xl flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Vortex Analytics</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold group">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition font-medium group">
            <ShoppingBag className="w-5 h-5" />
            <span>Products</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition font-medium group">
            <Users className="w-5 h-5" />
            <span>Customers</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition font-medium group">
            <TrendingUp className="w-5 h-5" />
            <span>Marketing</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition font-medium group">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition font-medium group">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports or data..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition text-sm outline-none dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* API Key Setings */}
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className={cn("p-2 transition-colors relative", apiKey ? "text-emerald-500" : "text-amber-500 animate-pulse")}
              title="Google Gemini Settings"
            >
              <Key className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all duration-300 hover:scale-110"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs ring-2 ring-indigo-50 dark:ring-indigo-950">
              JD
            </div>
          </div>
        </header>

        {/* Board */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* API Key Modal Overlay */}
          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-800 relative"
                >
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gemini Configuration</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your API key to enable AI-powered insights. Keys are stored locally in your browser.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">API Key</label>
                      <input
                        type="password"
                        defaultValue={apiKey}
                        placeholder="Enter your key here..."
                        onBlur={(e) => saveApiKey(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        💡 <strong>Setup Tip:</strong> Get your key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold">Google AI Studio</a>. For development, you can also place it in `.env` as `VITE_GEMINI_KEY`.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-lg shadow-primary-500/25"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic translate-y-[-2px]">Powered by Vortex Intelligence</p>
          </header>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 transition outline-none shadow-sm cursor-pointer"
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 transition outline-none shadow-sm cursor-pointer"
              />
            </div>
            <FilterSelect label="Product" icon={ShoppingBag} options={productOptions} value={productFilter} onChange={setProductFilter} />
            <FilterSelect label="Channel" icon={Layers} options={channelOptions} value={channelFilter} onChange={setChannelFilter} />
          </div>

          {/* Simple Data Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <InsightCard
              title="Best product"
              value={metrics.bestProduct}
              label="Highest revenue generator"
              icon={ShoppingBag} color="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              delay={0}
            />
            <InsightCard
              title="Best channel"
              value={metrics.bestChannel}
              label="Primary growth engine"
              icon={TrendingUp} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              delay={0.1}
            />
            <InsightCard
              title="Peak day"
              value={metrics.peakDay}
              label="Maximum daily volume"
              icon={Calendar} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              delay={0.2}
            />
            <InsightCard
              title="Top Efficiency"
              value={metrics.bestCVRChannel}
              label={`${metrics.bestCVRValue} conversion rate`}
              icon={Zap} color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
              delay={0.3}
            />
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <KPICard title="Total Revenue" value={`$${metrics.revenue.toLocaleString()}`} icon={DollarSign} trend={12.5} color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" delay={0.1} />
            <KPICard title="Orders" value={metrics.orders.toLocaleString()} icon={ShoppingBag} trend={8.2} color="bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20" delay={0.2} />
            <KPICard title="Total Profit" value={`$${metrics.profit.toLocaleString()}`} icon={TrendingUp} trend={-2.4} color="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20" delay={0.3} />
            <KPICard title="AOV" value={`$${metrics.aov.toFixed(2)}`} icon={BarChart3} trend={4.1} color="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" delay={0.4} />
          </div>

          {/* AI Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] shadow-xl shadow-primary-500/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-white/20 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center space-x-2 text-primary-100 mb-2">
                    <Sparkles className="w-5 h-5 fill-current" />
                    <span className="text-sm font-bold uppercase tracking-widest">AI Intelligence</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Generate Custom Insights</h2>
                  <p className="text-primary-100 text-lg font-medium leading-relaxed opacity-90">
                    Our proprietary engine analyzes current trends, identifies anomalies, and provides action-ready suggestions for your business.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex items-center space-x-2">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer p-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <option value="gemini-2.0-flash-exp" className="bg-slate-900 text-white">Gemini 2.0 Flash</option>
                      <option value="gemini-2.5-flash-preview" className="bg-slate-900 text-white">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro-preview" className="bg-slate-900 text-white">Gemini 2.5 Pro</option>
                      <option value="gemini-3.1-flash-lite-preview" className="bg-slate-900 text-white">Gemini 3.1 Flash-Lite</option>
                      <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-white">Gemini 3.1 Pro</option>
                    </select>

                    <button
                      onClick={generateAI}
                      disabled={generatingAI}
                      className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-opacity-90 active:scale-95 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50"
                    >
                      {generatingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      <span>{generatingAI ? 'Thinking...' : 'Generate Analysis'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Output Panels */}
              <AnimatePresence>
                {aiInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <AIInsightItem type="alert" text={aiInsights.alerts[0]} delay={0.1} />
                      <AIInsightItem type="alert" text={aiInsights.alerts[1]} delay={0.2} />
                    </div>
                    <div className="space-y-4">
                      <AIInsightItem type="opportunity" text={aiInsights.opportunities[0]} delay={0.3} />
                      <AIInsightItem type="opportunity" text={aiInsights.opportunities[1]} delay={0.4} />
                    </div>
                    <div className="space-y-4">
                      <AIInsightItem type="suggestion" text={aiInsights.suggestions[0]} delay={0.5} />
                      <AIInsightItem type="suggestion" text={aiInsights.suggestions[1]} delay={0.6} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <ChartCard title="Revenue Performance Trend">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} dy={10} tickFormatter={(val) => format(parseISO(val), 'MMM d')} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: chartColors.tooltipBg, color: isDarkMode ? '#fff' : '#000' }} itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#4b5563' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="lg:col-span-1">
              <ChartCard title="Revenue by Channel">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartColors.grid} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 500 }} width={100} />
                    <Tooltip cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: chartColors.tooltipBg }} itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#4b5563' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0ea5e9', '#8b5cf6', '#f59e0b'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* Bottom Table Section */}
          <div className="mb-8">
            <TransactionTable data={filteredData} isDarkMode={isDarkMode} />
          </div>
        </div>
      </main>
    </div>
  );
}
