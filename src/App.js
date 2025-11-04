import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, Moon, Sun, Download, Search, X, Bell, Target, AlertCircle, Filter } from 'lucide-react';

export default function FinanceDashboard() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'income', category: 'Gaji', amount: 8000000, date: '2024-11-01', description: 'Gaji Bulanan' },
      { id: 2, type: 'expense', category: 'Makanan', amount: 1500000, date: '2024-11-02', description: 'Groceries & Makan' },
      { id: 3, type: 'expense', category: 'Transport', amount: 800000, date: '2024-11-03', description: 'Bensin & Parkir' },
      { id: 4, type: 'expense', category: 'Hiburan', amount: 600000, date: '2024-11-04', description: 'Nonton & Hangout' },
      { id: 5, type: 'income', category: 'Freelance', amount: 2000000, date: '2024-11-05', description: 'Proyek Website' },
    ];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : {
      'Makanan': 2000000,
      'Transport': 1000000,
      'Hiburan': 800000,
      'Belanja': 1500000,
      'Lainnya': 1000000
    };
  });

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: ''
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check budget alerts
  useEffect(() => {
    const alerts = [];
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    Object.keys(budgets).forEach(category => {
      const spent = expenseByCategory[category] || 0;
      const budget = budgets[category];
      const percentage = (spent / budget) * 100;

      if (percentage >= 100) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: 'danger',
          message: `Budget ${category} sudah terlampaui! (${percentage.toFixed(0)}%)`
        });
      } else if (percentage >= 80) {
        alerts.push({
          id: Date.now() + Math.random(),
          type: 'warning',
          message: `Budget ${category} hampir habis (${percentage.toFixed(0)}%)`
        });
      }
    });

    setNotifications(alerts);
  }, [transactions, budgets]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Get monthly data from transactions
  const getMonthlyData = () => {
    const monthlyMap = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('id-ID', { month: 'short' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyMap[month].income += t.amount;
      } else {
        monthlyMap[month].expense += t.amount;
      }
    });
    return Object.values(monthlyMap).slice(-6);
  };

  const monthlyData = getMonthlyData();

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAddTransaction = () => {
    if (newTransaction.category && newTransaction.amount && newTransaction.date) {
      const transaction = {
        id: Date.now(),
        type: newTransaction.type,
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        description: newTransaction.description
      };
      setTransactions([...transactions, transaction]);
      setNewTransaction({ 
        type: 'expense', 
        category: '', 
        amount: '', 
        date: new Date().toISOString().split('T')[0], 
        description: '' 
      });
      setShowAddTransaction(false);
    }
  };

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.amount) {
      setBudgets({
        ...budgets,
        [newBudget.category]: parseFloat(newBudget.amount)
      });
      setNewBudget({ category: '', amount: '' });
    }
  };

  const handleDeleteBudget = (category) => {
    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);
  };

  // Export to CSV (Excel compatible)
  const exportToExcel = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Deskripsi'];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.amount,
      t.description
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transaksi_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const allCategories = [...new Set(transactions.map(t => t.category))];

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300 p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>
              Dashboard Keuangan Pro
            </h1>
            <p className={textSecondary}>Kelola keuangan pribadi dengan fitur lengkap</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-3 rounded-full ${cardBg} shadow-lg hover:shadow-xl transition-all`}
            >
              <Bell className={notifications.length > 0 ? 'text-red-500' : 'text-gray-700'} size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full ${cardBg} shadow-lg hover:shadow-xl transition-all`}
            >
              {darkMode ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-gray-700" size={24} />}
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && notifications.length > 0 && (
          <div className={`${cardBg} rounded-2xl p-6 shadow-lg mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                <AlertCircle className="text-yellow-500" />
                Notifikasi Budget
              </h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className={textSecondary} size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-lg ${notif.type === 'danger' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {notif.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <p className={`text-sm ${textSecondary} mb-1`}>Total Pemasukan</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(totalIncome)}</p>
          </div>

          <div className={`${cardBg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <span className="text-sm text-red-600 font-medium">-8.3%</span>
            </div>
            <p className={`text-sm ${textSecondary} mb-1`}>Total Pengeluaran</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(totalExpense)}</p>
          </div>

          <div className={`${cardBg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Wallet className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-purple-600 font-medium">Saldo</span>
            </div>
            <p className={`text-sm ${textSecondary} mb-1`}>Sisa Saldo</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Budget Planner */}
        <div className={`${cardBg} rounded-2xl p-6 shadow-lg mb-8`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
              <Target size={24} />
              Budget Planner
            </h3>
            <button
              onClick={() => setShowBudgetModal(!showBudgetModal)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Tambah Budget
            </button>
          </div>

          {showBudgetModal && (
            <div className={`border ${borderColor} rounded-lg p-4 mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nama Kategori"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                <input
                  type="number"
                  placeholder="Jumlah Budget"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                <button
                  onClick={handleAddBudget}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Simpan Budget
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(budgets).map(([category, budget]) => {
              const spent = expenseByCategory[category] || 0;
              const percentage = Math.min((spent / budget) * 100, 100);
              const isOverBudget = spent > budget;

              return (
                <div key={category} className={`border ${borderColor} rounded-lg p-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold ${textPrimary}`}>{category}</span>
                    <button
                      onClick={() => handleDeleteBudget(category)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={textSecondary}>
                      {formatCurrency(spent)} / {formatCurrency(budget)}
                    </span>
                    <span className={isOverBudget ? 'text-red-500 font-bold' : textSecondary}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 100 ? 'bg-red-500' :
                        percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-6`}>Pengeluaran per Kategori</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-6`}>Tren Bulanan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Pemasukan" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="Pengeluaran" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions */}
        <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${textPrimary}`}>Transaksi</h3>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                Export Excel
              </button>
              <button
                onClick={() => setShowAddTransaction(!showAddTransaction)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} />
                Tambah
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className={`absolute left-3 top-3 ${textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 p-2 w-full rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="all">Semua Kategori</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {showAddTransaction && (
            <div className={`border ${borderColor} rounded-lg p-4 mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
                <input
                  type="text"
                  placeholder="Kategori"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                <input
                  type="number"
                  placeholder="Jumlah"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
                <input
                  type="text"
                  placeholder="Deskripsi"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className={`p-2 rounded border ${borderColor} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} md:col-span-2`}
                />
              </div>
              <button
                onClick={handleAddTransaction}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan Transaksi
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <p className={`text-center py-8 ${textSecondary}`}>Tidak ada transaksi yang ditemukan</p>
            ) : (
              filteredTransactions.slice().reverse().map((transaction) => (
                <div key={transaction.id} className={`flex items-center justify-between p-4 border ${borderColor} rounded-lg hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <DollarSign className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} size={20} />
                    </div>
                    <div>
                      <p className={`font-semibold ${textPrimary}`}>{transaction.category}</p>
                      <p className={`text-sm ${textSecondary}`}>{transaction.description}</p>
                      <p className={`text-xs ${textSecondary}`}>{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}