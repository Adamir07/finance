import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { 
  Settings, 
  User, 
  Percent, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  Cloud,
  CloudCheck,
  CloudOff,
  Radio,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SUPABASE_SQL_SCHEMA, getSupabaseConfig } from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    showToast,
    supabaseStatus,
    supabaseLatency,
    lastSyncedAt,
    supabaseConfig,
    isSyncing,
    testSupabaseConnection,
    syncToSupabase,
    syncFromSupabase,
    saveSupabaseCredentials,
    resetToSampleData,
    clearAllData,
    importDataFromJson
  } = useApp();

  // Profile Form state
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [refRate, setRefRate] = useState(profile.defaultReferenceRate.toString());
  const [customRate, setCustomRate] = useState(profile.defaultCustomRate.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(profile.defaultPaymentMethod);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Supabase Form state
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(supabaseConfig?.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      defaultReferenceRate: parseFloat(refRate) || 600,
      defaultCustomRate: parseFloat(customRate) || 615,
      defaultPaymentMethod: paymentMethod,
    });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2500);
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('Please enter both Supabase URL and Anon Key.', 'error');
      return;
    }

    setIsTesting(true);
    const res = await saveSupabaseCredentials({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
    });
    setTestResult(res);
    setIsTesting(false);
  };

  const handleDisconnectSupabase = async () => {
    if (window.confirm('Disconnect Supabase credentials? Your local data will remain safe.')) {
      await saveSupabaseCredentials(null);
      setSupabaseUrl('');
      setSupabaseKey('');
      setTestResult(null);
    }
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
    if (res.success) {
      showToast(`Supabase connected! (${res.latencyMs}ms)`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('Supabase SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleExportJson = () => {
    const data = StorageService.exportBackupJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trekad_financial_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database JSON backup generated and downloaded.', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataFromJson(content);
      if (success) {
        showToast('Backup restored successfully.', 'success');
      } else {
        showToast('Invalid JSON backup structure.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (window.confirm('Reset all records to standard sample demonstration data?')) {
      resetToSampleData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all transactions, incomes, expenses, and savings? This cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Settings & Database Integration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Supabase cloud sync, benchmark conversion rates, and data backups
              </p>
            </div>
          </div>

          {/* Live Cloud Status Badge */}
          <div className="flex items-center gap-2">
            {supabaseStatus === 'connected' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Live ({supabaseLatency ? `${supabaseLatency}ms` : 'Active'})</span>
              </div>
            )}
            {supabaseStatus === 'syncing' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>Syncing Cloud...</span>
              </div>
            )}
            {supabaseStatus === 'error' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>Supabase Error</span>
              </div>
            )}
            {supabaseStatus === 'not_configured' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <CloudOff className="w-3 h-3 text-slate-400" />
                <span>Local Storage Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Supabase Cloud Database */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Supabase Cloud Database Connection</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your live Supabase project for real-time cloud storage, multi-device access, and SQL exports
              </p>
            </div>
          </div>

          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Find in: Project Settings &rarr; API &rarr; Project URL</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Find in: Project Settings &rarr; API &rarr; Project API keys (anon public)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTesting || !supabaseUrl || !supabaseKey}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-indigo-600" />}
                <span>Test Connection</span>
              </button>

              {supabaseConfig && (
                <button
                  type="button"
                  onClick={handleDisconnectSupabase}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isTesting || !supabaseUrl || !supabaseKey}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Connect Supabase</span>
            </button>
          </div>
        </form>

        {/* Test Result Banner */}
        {testResult && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            testResult.success 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            {testResult.success ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">{testResult.success ? 'Supabase Connection Verified!' : 'Connection Verification Issue'}</span>
              <p className="text-[11px] opacity-90 mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Cloud Sync Controls */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Cloud Synchronization</span>
              <span className="text-[11px] text-slate-500">
                {lastSyncedAt 
                  ? `Last synchronized: ${new Date(lastSyncedAt).toLocaleString()}` 
                  : 'Not synchronized yet'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncToSupabase()}
                disabled={isSyncing || supabaseStatus !== 'connected'}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Push Local Data to Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => syncFromSupabase()}
                disabled={isSyncing || supabaseStatus !== 'connected'}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pull Cloud Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* SQL Schema Script Setup Helper */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div 
            onClick={() => setIsSqlExpanded(!isSqlExpanded)}
            className="flex items-center justify-between p-3.5 bg-slate-100/60 hover:bg-slate-100 cursor-pointer transition-colors text-xs select-none"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Supabase SQL Schema & Row Level Security (RLS)</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">DDL Script</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopySql();
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 font-semibold flex items-center gap-1 text-[11px]"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              {isSqlExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </div>

          {isSqlExpanded && (
            <div className="p-4 bg-slate-900 text-slate-200 border-t border-slate-800">
              <div className="mb-3 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <p className="font-semibold text-emerald-400">Step-by-step Setup Guide:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Open your Supabase project dashboard at <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">supabase.com</code>.</li>
                  <li>Click on <strong>SQL Editor</strong> in the left sidebar &rarr; Click <strong>New query</strong>.</li>
                  <li>Paste the SQL script below and click <strong>Run</strong>.</li>
                  <li>Enter your Project URL and Anon API key in the fields above and click <strong>Save & Connect</strong>.</li>
                </ol>
              </div>

              <pre className="text-[10px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-lg overflow-x-auto text-emerald-300 border border-slate-800 max-h-64">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Personal Profile & Rate Defaults */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Personal Profile & Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Conversion & Rate Defaults */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Exchange Rate & Delivery Defaults</h3>
              <p className="text-xs text-slate-400">Pre-populates new USD transfer records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Benchmark Reference Rate (FCFA / USD)
              </label>
              <input
                type="number"
                value={refRate}
                onChange={e => setRefRate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Market benchmark (e.g. 600)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1">
                Custom Client Rate (FCFA / USD)
              </label>
              <input
                type="number"
                value={customRate}
                onChange={e => setCustomRate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
              />
              <span className="text-[10px] text-emerald-600">Rate delivered to client (e.g. 615)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Delivery Channel
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
              >
                <option value="Mobile Money">Mobile Money</option>
                <option value="Wave">Wave</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="MTN MoMo">MTN MoMo</option>
                <option value="Other">Other</option>
              </select>
              <span className="text-[10px] text-slate-400">Preferred disbursement method</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {isProfileSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isProfileSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 4: Offline JSON Backup & Demo Resets */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-slate-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Offline JSON Backup & Data Maintenance</h3>
            <p className="text-xs text-slate-400">Export local snapshots or restore previous backups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-left transition-colors flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Export JSON</span>
              <span className="text-[10px] text-slate-400">Download backup</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-left transition-colors flex items-center gap-2.5"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Restore JSON</span>
              <span className="text-[10px] text-slate-400">Import file</span>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleResetSample}
            className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-left transition-colors flex items-center gap-2.5"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Sample Data</span>
              <span className="text-[10px] text-slate-400">Load demo records</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="p-3 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 rounded-xl text-left transition-colors flex items-center gap-2.5"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <div>
              <span className="text-xs font-bold text-rose-900 block">Clear All Data</span>
              <span className="text-[10px] text-rose-600">Delete all records</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
