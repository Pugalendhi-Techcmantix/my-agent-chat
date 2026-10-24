import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { isWebhookConfigured, getWebhookUrl, sendMessageToN8n } from '../services/n8nService';

export default function SetupModal({ isOpen, onClose }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const configured = isWebhookConfigured();
  const currentUrl = getWebhookUrl();

  const handleTestPing = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await sendMessageToN8n({
        message: 'Ping test from AI Assistant frontend',
        sessionId: 'ping_test_session',
      });
      setTestResult({
        success: true,
        message: `Success! Webhook responded: "${response.slice(0, 150)}${
          response.length > 150 ? '...' : ''
        }"`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to ping webhook.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {configured ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">n8n Webhook Configuration</h2>
              <p className="text-xs text-slate-500">
                {configured ? 'Webhook is configured' : 'Setup required to connect AI'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              configured
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-semibold block text-[13px]">
                {configured ? 'Active Webhook Detected' : 'No Webhook URL Configured'}
              </span>
              <p>
                {configured
                  ? `Your frontend is pointing to: ${currentUrl}`
                  : 'The frontend is currently in standby mode. Messages cannot be processed until a valid n8n webhook URL is set in your .env file.'}
              </p>
            </div>
          </div>

          {/* Setup Guide Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Setup Instructions
            </h3>

            <ol className="space-y-3 text-xs text-slate-700 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-semibold text-slate-900">Get your n8n Webhook URL:</span>
                  <p className="text-slate-500 mt-0.5">
                    In your n8n workflow, open the <strong>Webhook</strong> or <strong>Chat Trigger</strong> node and copy the Production URL (or Test URL if actively testing).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  2
                </span>
                <div className="w-full">
                  <span className="font-semibold text-slate-900">Update your .env file:</span>
                  <p className="text-slate-500 mt-0.5 mb-1.5">
                    Open the <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">.env</code> file in this project root and paste your URL:
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                    <span>VITE_N8N_WEBHOOK_URL=https://your-n8n.com/webhook/...</span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-semibold text-slate-900">Restart Vite:</span>
                  <p className="text-slate-500 mt-0.5">
                    Vite loads environment variables at startup. Restart your dev server with <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">npm run dev</code> for changes to take effect.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Expected Request & Response Format */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Terminal className="w-3.5 h-3.5" />
              <span>Payload & Response Compatibility</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              The frontend sends <code className="font-mono text-slate-700">{`{ "message": "...", "chatInput": "...", "sessionId": "..." }`}</code>.
              Your n8n workflow can respond with plain text or JSON containing keys like <code className="font-mono text-slate-700">output</code>, <code className="font-mono text-slate-700">text</code>, or <code className="font-mono text-slate-700">response</code>.
            </p>
          </div>

          {/* Ping Test (only if configured) */}
          {configured && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Connection Diagnostic</span>
                <button
                  onClick={handleTestPing}
                  disabled={testing}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing connection...' : 'Test Webhook Ping'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <div className="font-semibold mb-0.5">
                    {testResult.success ? 'Diagnostic Passed' : 'Diagnostic Failed'}
                  </div>
                  <p className="whitespace-pre-wrap">{testResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
