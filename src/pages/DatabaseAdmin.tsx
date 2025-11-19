import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, CreditCard, Target, ShoppingBag, Brain, Plane, 
  Plus, Edit, Trash, Database, CheckCircle, AlertCircle 
} from 'lucide-react';

interface DatabaseOverview {
  users: number;
  finance_accounts: number;
  fitness_goals: number;
  marketplace_products: number;
  ai_insights: number;
  travel_plans: number;
}

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  status: string;
  created_at: string;
}

interface FinanceAccount {
  id: number;
  user_id: number;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
  is_active: boolean;
}

interface MarketplaceProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
}

export default function DatabaseAdmin() {
  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    full_name: '',
    hashed_password: 'test123',
    status: 'active'
  });

  const [newAccount, setNewAccount] = useState({
    user_id: 1,
    name: '',
    account_type: 'checking',
    balance: 0,
    currency: 'USD'
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'electronics',
    stock_quantity: 0
  });

  const API_BASE = 'http://localhost:5000/admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch overview
      const overviewRes = await fetch(`${API_BASE}/overview`);
      const overviewData = await overviewRes.json();
      setOverview(overviewData.overview);

      // Fetch all data
      const [usersRes, accountsRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/finance-accounts`),
        fetch(`${API_BASE}/marketplace-products`)
      ]);

      const usersData = await usersRes.json();
      const accountsData = await accountsRes.json();
      const productsData = await productsRes.json();

      setUsers(usersData.users || []);
      setAccounts(accountsData.accounts || []);
      setProducts(productsData.products || []);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data. Make sure the backend server is running on port 5000.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (type: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchData(); // Refresh data
        // Reset form
        if (type === 'users') setNewUser({ email: '', username: '', full_name: '', hashed_password: 'test123', status: 'active' });
        if (type === 'finance-accounts') setNewAccount({ user_id: 1, name: '', account_type: 'checking', balance: 0, currency: 'USD' });
        if (type === 'marketplace-products') setNewProduct({ name: '', description: '', price: 0, category: 'electronics', stock_quantity: 0 });
      } else {
        setMessage({ type: 'error', text: result.detail || 'Failed to create' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create. Check if backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchData(); // Refresh data
      } else {
        setMessage({ type: 'error', text: result.detail || 'Failed to delete' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete. Check if backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (formType: string, field: string, value: string | number) => {
    if (formType === 'user') {
      setNewUser({ ...newUser, [field]: value });
    } else if (formType === 'account') {
      setNewAccount({ ...newAccount, [field]: value });
    } else if (formType === 'product') {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Database Admin Panel
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Manage your OmniLife AI Platform database directly from the web interface
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Database Overview */}
        {overview && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{overview.users}</div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{overview.finance_accounts}</div>
                  <div className="text-sm text-gray-600">Accounts</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{overview.fitness_goals}</div>
                  <div className="text-sm text-gray-600">Goals</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{overview.marketplace_products}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Brain className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-600">{overview.ai_insights}</div>
                  <div className="text-sm text-gray-600">Insights</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <Plane className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-600">{overview.travel_plans}</div>
                  <div className="text-sm text-gray-600">Travel Plans</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'accounts' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accounts
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'products' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New User</span>
                  <Button onClick={() => handleCreate('users', newUser)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => handleInputChange('user', 'username', e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.full_name}
                      onChange={(e) => handleInputChange('user', 'full_name', e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => handleInputChange('user', 'status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === 'premium' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('users', user.id)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Account</span>
                  <Button onClick={() => handleCreate('finance-accounts', newAccount)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => handleInputChange('account', 'name', e.target.value)}
                      placeholder="Account Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                      value={newAccount.account_type}
                      onChange={(e) => handleInputChange('account', 'account_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="investment">Investment</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                    <input
                      type="number"
                      value={newAccount.balance}
                      onChange={(e) => handleInputChange('account', 'balance', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Accounts ({accounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm text-gray-600">Type: {account.account_type}</div>
                        <div className="text-sm text-gray-500">Balance: ${account.balance.toFixed(2)} {account.currency}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('finance-accounts', account.id)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Product</span>
                  <Button onClick={() => handleCreate('marketplace-products', newProduct)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => handleInputChange('product', 'name', e.target.value)}
                      placeholder="Product Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => handleInputChange('product', 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="fitness">Fitness</option>
                      <option value="travel">Travel</option>
                      <option value="clothing">Clothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => handleInputChange('product', 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) => handleInputChange('product', 'stock_quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => handleInputChange('product', 'description', e.target.value)}
                      placeholder="Product description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.description}</div>
                        <div className="text-sm text-gray-500">${product.price.toFixed(2)} | Stock: {product.stock_quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('marketplace-products', product.id)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">🌐 Web Interface</h3>
                <p className="text-gray-600">
                  Use the tabs above to manage different types of data. Each tab allows you to create new items and view existing ones.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">🔧 API Commands</h3>
                <p className="text-gray-600">
                  You can also use direct API calls to manage the database programmatically.
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <code className="text-sm">
                                         curl http://localhost:5000/admin/overview<br/>
                     curl -X POST http://localhost:5000/admin/users -H &quot;Content-Type: application/json&quot; -d &apos;{`{"email":"test@example.com","username":"test","full_name":"Test User","hashed_password":"123","status":"active"}`}&apos;
                  </code>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">📊 Database Browser</h3>
                <p className="text-gray-600">
                  Run <code className="bg-gray-100 px-1 rounded">python db_browser.py</code> in the backend directory to view all data in the terminal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
