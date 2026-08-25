import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { TransfersView } from './components/transfers/TransfersView';
import { IncomeView } from './components/income/IncomeView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { SavingsView } from './components/savings/SavingsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { TransferModal } from './components/modals/TransferModal';
import { TransferDetailModal } from './components/modals/TransferDetailModal';
import { IncomeModal } from './components/modals/IncomeModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { SavingsModal } from './components/modals/SavingsModal';
import { GoalModal } from './components/modals/GoalModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';

const AppContent: React.FC = () => {
  const { activeTab, authSession } = useApp();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 space-y-6">
          <div className="max-w-7xl mx-auto pb-8">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'transfers' && <TransfersView />}
            {activeTab === 'income' && <IncomeView />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'savings' && <SavingsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* All Modal Overlays */}
      <TransferModal />
      <TransferDetailModal />
      <IncomeModal />
      <ExpenseModal />
      <SavingsModal />
      <GoalModal />
      <AuthModal />
      <OnboardingModal />

      {/* Global Toast Alerts */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
