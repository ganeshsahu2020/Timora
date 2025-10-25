// src/services/wealthStore.js
const LS_KEY = 'wealth.store.v1';

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || seedWealthData();
  } catch {
    return seedWealthData();
  }
}

function setStore(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

function seedWealthData() {
  const store = {
    transactions: [
      { id: 1, type: 'income', amount: 5000, description: 'Monthly Salary', category: 'Salary', date: '2024-01-15' },
      { id: 2, type: 'expense', amount: 1500, description: 'Rent Payment', category: 'Housing', date: '2024-01-01' },
      { id: 3, type: 'expense', amount: 400, description: 'Groceries', category: 'Food', date: '2024-01-05' },
      { id: 4, type: 'investment', amount: 1000, description: 'Stock Purchase', category: 'Stocks', date: '2024-01-10' },
      { id: 5, type: 'debt', amount: 300, description: 'Credit Card Payment', category: 'Credit Card', date: '2024-01-12' }
    ],
    assets: 75000,
    liabilities: 25000,
    monthlyIncome: 5000,
    monthlyExpenses: 3200,
    investmentTotal: 25000,
    totalDebt: 15000,
    assetAllocation: [
      { name: 'Stocks', value: 15000 },
      { name: 'Bonds', value: 5000 },
      { name: 'Real Estate', value: 40000 },
      { name: 'Cash', value: 15000 }
    ],
    spendingByCategory: [
      { name: 'Housing', amount: 1500, percentage: 47 },
      { name: 'Food', amount: 600, percentage: 19 },
      { name: 'Transportation', amount: 400, percentage: 13 },
      { name: 'Entertainment', amount: 300, percentage: 9 },
      { name: 'Other', amount: 400, percentage: 12 }
    ],
    cashFlowHistory: [
      { month: 'Jan', income: 5000, expenses: 3200 },
      { month: 'Feb', income: 5200, expenses: 3100 },
      { month: 'Mar', income: 4800, expenses: 3300 },
      { month: 'Apr', income: 5100, expenses: 2900 },
      { month: 'May', income: 5300, expenses: 3200 },
      { month: 'Jun', income: 4900, expenses: 3400 }
    ],
    netWorthHistory: [
      { date: 'Jan', value: 45000 },
      { date: 'Feb', value: 46500 },
      { date: 'Mar', value: 47800 },
      { date: 'Apr', value: 49500 },
      { date: 'May', value: 51200 },
      { date: 'Jun', value: 52800 }
    ],
    investmentHistory: [
      { date: 'Jan', value: 22000 },
      { date: 'Feb', value: 22500 },
      { date: 'Mar', value: 23200 },
      { date: 'Apr', value: 24000 },
      { date: 'May', value: 24500 },
      { date: 'Jun', value: 25000 }
    ],
    debts: [
      { name: 'Mortgage', balance: 10000, interestRate: 3.5, minimumPayment: 500 },
      { name: 'Car Loan', balance: 8000, interestRate: 4.2, minimumPayment: 300 },
      { name: 'Credit Card', balance: 2000, interestRate: 18.9, minimumPayment: 100 }
    ],
    recentTransactions: [
      { type: 'income', amount: 5000, description: 'Salary', category: 'Salary', date: '2024-01-15' },
      { type: 'expense', amount: 1500, description: 'Rent', category: 'Housing', date: '2024-01-01' },
      { type: 'expense', amount: 400, description: 'Groceries', category: 'Food', date: '2024-01-05' },
      { type: 'investment', amount: 1000, description: 'Stocks', category: 'Stocks', date: '2024-01-10' },
      { type: 'debt', amount: 300, description: 'Credit Card', category: 'Credit Card', date: '2024-01-12' }
    ]
  };
  setStore(store);
  return store;
}

// API
export async function getWealthData() {
  return getStore();
}

export async function addIncome(income) {
  const store = getStore();
  const newTransaction = {
    id: Date.now(),
    type: 'income',
    ...income,
    date: income.date || new Date().toISOString().split('T')[0]
  };
  store.transactions.push(newTransaction);
  store.recentTransactions = [newTransaction, ...store.recentTransactions.slice(0, 4)];
  store.monthlyIncome = (store.monthlyIncome || 0) + parseFloat(income.amount);
  store.assets = (store.assets || 0) + parseFloat(income.amount);
  setStore(store);
}

export async function addExpense(expense) {
  const store = getStore();
  const newTransaction = {
    id: Date.now(),
    type: 'expense',
    ...expense,
    date: expense.date || new Date().toISOString().split('T')[0]
  };
  store.transactions.push(newTransaction);
  store.recentTransactions = [newTransaction, ...store.recentTransactions.slice(0, 4)];
  store.monthlyExpenses = (store.monthlyExpenses || 0) + parseFloat(expense.amount);
  store.assets = (store.assets || 0) - parseFloat(expense.amount);
  setStore(store);
}

export async function addInvestment(investment) {
  const store = getStore();
  const newTransaction = {
    id: Date.now(),
    type: 'investment',
    ...investment,
    date: investment.date || new Date().toISOString().split('T')[0]
  };
  store.transactions.push(newTransaction);
  store.recentTransactions = [newTransaction, ...store.recentTransactions.slice(0, 4)];
  store.investmentTotal = (store.investmentTotal || 0) + parseFloat(investment.amount);
  setStore(store);
}

export async function addDebt(debt) {
  const store = getStore();
  const newTransaction = {
    id: Date.now(),
    type: 'debt',
    ...debt,
    date: debt.date || new Date().toISOString().split('T')[0]
  };
  store.transactions.push(newTransaction);
  store.recentTransactions = [newTransaction, ...store.recentTransactions.slice(0, 4)];
  store.totalDebt = (store.totalDebt || 0) + parseFloat(debt.amount);
  store.liabilities = (store.liabilities || 0) + parseFloat(debt.amount);
  setStore(store);
}

export async function generateFinancialInsights() {
  const data = getStore();

  const savingsRate = ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100;
  const debtToIncome = (data.totalDebt / data.monthlyIncome) * 100;
  const emergencyFund = data.assets / data.monthlyExpenses;

  let healthScore = 70;
  if (savingsRate > 20) healthScore += 15;
  if (debtToIncome < 30) healthScore += 10;
  if (emergencyFund > 6) healthScore += 5;
  healthScore = Math.min(100, Math.max(0, healthScore));

  return {
    financialHealthScore: Math.round(healthScore),
    healthAssessment: getHealthAssessment(healthScore),
    optimizations: [
      { area: 'Emergency Fund', suggestion: 'Build 6-month emergency fund' },
      { area: 'Debt Reduction', suggestion: 'Focus on high-interest debt first' },
      { area: 'Investment', suggestion: 'Increase retirement contributions' }
    ],
    risks: [
      { type: 'Market Volatility', level: 'medium' },
      { type: 'Interest Rate', level: 'low' },
      { type: 'Liquidity', level: 'low' }
    ]
  };
}

export async function getAIFinancialAdvice() {
  const data = getStore();
  const insights = await generateFinancialInsights();

  const recommendations = [];
  if (insights.financialHealthScore < 60) {
    recommendations.push({ title: 'Improve Financial Health', description: 'Focus on reducing debt and increasing savings rate', priority: 'high' });
  }
  if (data.totalDebt > data.monthlyIncome * 12) {
    recommendations.push({ title: 'Debt Management', description: 'Consider debt consolidation or accelerated payoff strategy', priority: 'high' });
  }
  if ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome < 0.1) {
    recommendations.push({ title: 'Increase Savings', description: 'Look for opportunities to reduce expenses or increase income', priority: 'medium' });
  }
  return {
    recommendations: recommendations.length ? recommendations : [{
      title: 'Great Financial Health!',
      description: 'Your finances are in good shape. Consider optimizing investments.',
      priority: 'low'
    }]
  };
}

export async function calculateSavingsGoals(goal) {
  const monthlyRate = goal.returnRate / 100 / 12;
  const months = Math.log((goal.monthly / monthlyRate + goal.goal) / (goal.monthly / monthlyRate)) / Math.log(1 + monthlyRate);
  const years = months / 12;

  const totalContributions = goal.monthly * months;
  const totalInterest = (goal.monthly / monthlyRate) * (Math.pow(1 + monthlyRate, months) - 1) - totalContributions;

  return {
    result: {
      years: Math.ceil(years),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(totalInterest)
    }
  };
}

export async function exportWealthReport(format) {
  return `/api/export/wealth-report.${format}`;
}
/** 🔁 Alias to match UI import (`exportWealthData`) */
export async function exportWealthData(format) {
  return exportWealthReport(format);
}

function getHealthAssessment(score) {
  if (score >= 80) return 'Excellent financial health!';
  if (score >= 60) return 'Good financial standing';
  if (score >= 40) return 'Needs some improvement';
  return 'Requires immediate attention';
}

// Compatibility helper used elsewhere
export async function saveFinancialEntry(type, data) {
  switch (type) {
    case 'income': return addIncome(data);
    case 'expense': return addExpense(data);
    case 'investment': return addInvestment(data);
    case 'debt': return addDebt(data);
    default: throw new Error('Invalid transaction type');
  }
}
