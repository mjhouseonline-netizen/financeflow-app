import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, FileText, Plus, LogOut, Edit2, Trash2, DollarSign, Calendar, Tag, User, Download, Filter, Search } from 'lucide-react';

const FinanceFlowApp = () => {
  // Initialize state from localStorage or defaults
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('financeflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('financeflow_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, email: 'demo@financeflow.com', password: 'demo123', name: 'Demo User', plan: 'professional' }
    ];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('financeflow_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 1, userId: 1, amount: 850, category: 'Software', description: 'Adobe Creative Cloud', date: '2025-10-15', clientId: 1, deductible: true },
      { id: 2, userId: 1, amount: 1200, category: 'Equipment', description: 'MacBook Pro Repair', date: '2025-10-20', clientId: null, deductible: true },
      { id: 3, userId: 1, amount: 450, category: 'Travel', description: 'Client Meeting - Flight', date: '2025-10-25', clientId: 2, deductible: true },
      { id: 4, userId: 1, amount: 125, category: 'Meals', description: 'Business Lunch', date: '2025-10-28', clientId: 2, deductible: true },
      { id: 5, userId: 1, amount: 300, category: 'Office Supplies', description: 'Desk Setup', date: '2025-10-10', clientId: null, deductible: true },
    ];
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('financeflow_clients');
    return saved ? JSON.parse(saved) : [
      { id: 1, userId: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0100' },
      { id: 2, userId: 1, name: 'TechStart Inc', email: 'hello@techstart.com', phone: '555-0200' },
      { id: 3, userId: 1, name: 'Global Ventures', email: 'info@globalventures.com', phone: '555-0300' },
    ];
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Auth form state
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', plan: 'starter' });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Software',
    description: '',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    deductible: true
  });

  // Client form state
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '' });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('financeflow_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('financeflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('financeflow_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('financeflow_clients', JSON.stringify(clients));
  }, [clients]);

  // Categories
  const categories = ['Software', 'Equipment', 'Travel', 'Meals', 'Office Supplies', 'Marketing', 'Insurance', 'Professional Services', 'Utilities', 'Other'];

  // Authentication handlers
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (user) {
        setCurrentUser(user);
        setShowAuthModal(false);
        setAuthForm({ email: '', password: '', name: '', plan: 'starter' });
      } else {
        alert('Invalid credentials');
      }
    } else {
      if (users.find(u => u.email === authForm.email)) {
        alert('Email already exists');
        return;
      }
      const newUser = {
        id: users.length + 1,
        email: authForm.email,
        password: authForm.password,
        name: authForm.name,
        plan: authForm.plan
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '', plan: 'starter' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Expense handlers
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    if (editingExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id 
          ? { ...exp, ...expenseForm, amount: parseFloat(expenseForm.amount), clientId: expenseForm.clientId || null }
          : exp
      ));
      setEditingExpense(null);
    } else {
      const newExpense = {
        id: expenses.length + 1,
        userId: currentUser.id,
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        clientId: expenseForm.clientId || null
      };
      setExpenses([...expenses, newExpense]);
    }
    
    setShowExpenseModal(false);
    setExpenseForm({
      amount: '',
      category: 'Software',
      description: '',
      date: new Date().toISOString().split('T')[0],
      clientId: '',
      deductible: true
    });
  };

  const handleDeleteExpense = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      clientId: expense.clientId || '',
      deductible: expense.deductible
    });
    setShowExpenseModal(true);
  };

  // Client handlers
  const handleClientSubmit = (e) => {
    e.preventDefault();
    
    if (currentUser.plan === 'starter' && clients.filter(c => c.userId === currentUser.id).length >= 3 && !editingClient) {
      alert('Starter plan is limited to 3 clients. Upgrade to Professional for unlimited clients!');
      return;
    }

    if (editingClient) {
      setClients(clients.map(cli => 
        cli.id === editingClient.id 
          ? { ...cli, ...clientForm }
          : cli
      ));
      setEditingClient(null);
    } else {
      const newClient = {
        id: clients.length + 1,
        userId: currentUser.id,
        ...clientForm
      };
      setClients([...clients, newClient]);
    }
    
    setShowClientModal(false);
    setClientForm({ name: '', email: '', phone: '' });
  };

  const handleDeleteClient = (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(cli => cli.id !== id));
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone
    });
    setShowClientModal(true);
  };

  // Calculate stats
  const userExpenses = expenses.filter(exp => exp.userId === currentUser?.id);
  const userClients = clients.filter(cli => cli.userId === currentUser?.id);
  
  const totalExpenses = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const deductibleExpenses = userExpenses.filter(exp => exp.deductible).reduce((sum, exp) => sum + exp.amount, 0);
  const estimatedTaxSavings = deductibleExpenses * 0.25; // Assuming 25% tax rate

  // Filter expenses
  const filteredExpenses = userExpenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group expenses by category for reports
  const expensesByCategory = userExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Login/Signup Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">FinanceFlow</h1>
            <p className="text-gray-600 mt-2">Track expenses. Maximize deductions.</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                authMode === 'login' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                authMode === 'signup' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={authForm.plan}
                  onChange={(e) => setAuthForm({ ...authForm, plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="starter">Starter (Free - 3 Clients)</option>
                  <option value="professional">Professional ($29/mo - Unlimited)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          {authMode === 'login' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Demo Account:</p>
              <p className="text-sm text-blue-600">Email: demo@financeflow.com</p>
              <p className="text-sm text-blue-600">Password: demo123</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FinanceFlow</h1>
                <p className="text-xs text-gray-500">{currentUser.name} - {currentUser.plan === 'professional' ? 'Professional' : 'Starter'} Plan</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeView === item.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Expenses</span>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{userExpenses.length} transactions</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Tax Deductible</span>
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${deductibleExpenses.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">~${estimatedTaxSavings.toFixed(2)} tax savings</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Active Clients</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{userClients.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {currentUser.plan === 'starter' ? `${3 - userClients.length} slots left` : 'Unlimited'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">This Month</span>
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${userExpenses
                    .filter(exp => exp.date.startsWith('2025-10'))
                    .reduce((sum, exp) => sum + exp.amount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">October 2025</p>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {userExpenses.slice(-5).reverse().map(expense => {
                  const client = clients.find(c => c.id === expense.clientId);
                  return (
                    <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{expense.description}</span>
                            {expense.deductible && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Deductible
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {expense.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {expense.date}
                            </span>
                            {client && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {client.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Expenses View */}
        {activeView === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm({
                    amount: '',
                    category: 'Software',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    clientId: '',
                    deductible: true
                  });
                  setShowExpenseModal(true);
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.map(expense => {
                      const client = clients.find(c => c.id === expense.clientId);
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client?.name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${expense.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expense.deductible ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Deductible</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">Non-deductible</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="text-purple-600 hover:text-purple-900 mr-3"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredExpenses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No expenses found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients View */}
        {activeView === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
              <button
                onClick={() => {
                  if (currentUser.plan === 'starter' && userClients.length >= 3) {
                    alert('Starter plan is limited to 3 clients. Upgrade to Professional for unlimited clients!');
                    return;
                  }
                  setEditingClient(null);
                  setClientForm({ name: '', email: '', phone: '' });
                  setShowClientModal(true);
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            </div>

            {currentUser.plan === 'starter' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Starter Plan:</strong> You have {userClients.length} of 3 clients. 
                  Upgrade to Professional for unlimited clients!
                </p>
              </div>
            )}

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userClients.map(client => {
                const clientExpenses = userExpenses.filter(exp => exp.clientId === client.id);
                const totalSpent = clientExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                
                return (
                  <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-500">{clientExpenses.length} expenses</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Email:</span> {client.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">Phone:</span> {client.phone}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Expenses</span>
                        <span className="text-lg font-bold text-gray-900">${totalSpent.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {userClients.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first client</p>
                <button
                  onClick={() => {
                    setEditingClient(null);
                    setClientForm({ name: '', email: '', phone: '' });
                    setShowClientModal(true);
                  }}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reports View */}
        {activeView === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <button
                onClick={() => {
                  const reportData = `FinanceFlow Tax Report\nGenerated: ${new Date().toLocaleDateString()}\n\nTotal Expenses: $${totalExpenses.toFixed(2)}\nDeductible Expenses: $${deductibleExpenses.toFixed(2)}\nEstimated Tax Savings: $${estimatedTaxSavings.toFixed(2)}\n\nExpenses by Category:\n${Object.entries(expensesByCategory).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join('\n')}`;
                  const blob = new Blob([reportData], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'financeflow-report.txt';
                  a.click();
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Tax Deductible</h3>
                <p className="text-3xl font-bold text-green-600">${deductibleExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Estimated Savings (25%)</h3>
                <p className="text-3xl font-bold text-purple-600">${estimatedTaxSavings.toFixed(2)}</p>
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses by Category</h3>
              <div className="space-y-4">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percentage = (amount / totalExpenses) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm font-bold text-gray-900">${amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductible</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {['2025-10', '2025-09', '2025-08'].map(month => {
                      const monthExpenses = userExpenses.filter(exp => exp.date.startsWith(month));
                      const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                      const monthDeductible = monthExpenses.filter(exp => exp.deductible).reduce((sum, exp) => sum + exp.amount, 0);
                      const monthSavings = monthDeductible * 0.25;
                      
                      return (
                        <tr key={month}>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">${monthTotal.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-green-600">${monthDeductible.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-purple-600">${monthSavings.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (Optional)</label>
                <select
                  value={expenseForm.clientId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">No client</option>
                  {userClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="deductible"
                  checked={expenseForm.deductible}
                  onChange={(e) => setExpenseForm({ ...expenseForm, deductible: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <label htmlFor="deductible" className="ml-2 text-sm text-gray-700">
                  Tax deductible expense
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h3>
            </div>
            
            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="555-0100"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    setEditingClient(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingClient ? 'Update' : 'Add'} Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceFlowApp;