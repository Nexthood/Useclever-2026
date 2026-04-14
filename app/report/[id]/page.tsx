// app/report/[id]/page.tsx
// Public report page with interactive AI assistant

import { getReport } from '@/lib/report-generator';
import { answerReportQuestion, generateReportSuggestions } from '@/lib/report-ai-chat';
import { notFound } from 'next/navigation';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

// Force dynamic rendering for each request
export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);
  
  if (!report) {
    notFound();
  }
  
  // Generate suggested questions
  const suggestions = generateReportSuggestions(report);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">UseClevr Report</h1>
              <p className="text-muted-foreground">{report.datasetName}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Created: {new Date(report.createdAt).toLocaleDateString()}</p>
              <p>{report.rowCount.toLocaleString()} rows • {report.columnCount} columns</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{report.summary}</p>
            </div>
          </section>
          
          {/* KPIs */}
          {report.kpis.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Charts */}
          {report.charts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Visualizations</h2>
              <div className="space-y-6">
                {report.charts.map((chart, idx) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">{chart.title}</h3>
                    <div className="h-48 flex items-end gap-2">
                      {chart.data.slice(0, 10).map((item, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/80 rounded-t"
                          style={{ height: `${(item.value / Math.max(...chart.data.map(d => d.value))) * 100}%` }}
                          title={`${item.name}: ${item.value}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Findings */}
          {report.findings.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Key Findings</h2>
              <ul className="space-y-2">
                {report.findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {/* AI Insights */}
          {report.aiInsights.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                {report.aiInsights.map((insight, idx) => (
                  <p key={idx} className="mb-2">{insight}</p>
                ))}
              </div>
            </section>
          )}
          
          {/* Predictions */}
          {report.predictions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Predictive Insights</h2>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                {report.predictions.map((prediction, idx) => (
                  <p key={idx} className="mb-2">{prediction}</p>
                ))}
              </div>
            </section>
          )}
          
          {/* Alerts */}
          {report.alerts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Alerts</h2>
              <div className="space-y-2">
                {report.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      alert.severity === 'high' 
                        ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <span className="font-medium">{alert.type}:</span> {alert.message}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        
        {/* AI Chat Sidebar */}
        <aside className="w-96 border-l bg-white dark:bg-gray-900 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Ask about this report</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI assistant with access to this report only
            </p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                Hi! I'm the AI assistant for this report. I can answer questions about the analysis based only on this report snapshot. 
                What would you like to know?
              </p>
            </div>
            
            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="text-left text-sm text-primary hover:underline"
                  onClick={() => {
                    const input = document.getElementById('chat-input') as HTMLInputElement;
                    if (input) {
                      input.value = suggestion;
                      input.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat Input */}
          <form
            action={async (formData) => {
              'use server';
              const question = formData.get('question') as string;
              if (!question) return;
              
              // This would normally be handled by a client component
              // For now, we'll show a placeholder
            }}
            className="p-4 border-t"
          >
            <div className="flex gap-2">
              <input
                id="chat-input"
                name="question"
                type="text"
                placeholder="Ask about this report..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      </div>
      
      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground shrink-0">
        <p>Generated by UseClevr AI • {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}
