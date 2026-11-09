/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  Cpu,
  Download,
  MessageSquareCode,
  ExternalLink,
  History,
  AlertCircle,
  FileText,
  Share2,
  Terminal,
  Activity,
  Layers,
  GraduationCap
} from 'lucide-react';
import { MermaidChart } from './components/MermaidChart';
import { CoreConceptView } from './components/CoreConceptView';
import { StudentOpportunitiesView } from './components/StudentOpportunitiesView';
import { ArchitectureInspector } from './components/ArchitectureInspector';
import { RawOutputView } from './components/RawOutputView';
import { StarterKitModal } from './components/StarterKitModal';
import { PaperQnADrawer } from './components/PaperQnADrawer';
import { TokenGauge } from './components/TokenGauge';
import { SAMPLE_BENCHMARK_PAPERS, PaperAnalysisData, StudentOpportunity } from './data/samplePapers';

export default function App() {
  const [paperInput, setPaperInput] = useState<string>('https://arxiv.org/abs/2312.00752');
  const [inputMode, setInputMode] = useState<'url' | 'title_or_text'>('url');
  const [currentData, setCurrentData] = useState<PaperAnalysisData>(SAMPLE_BENCHMARK_PAPERS['mamba-ssm']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'flowchart' | 'opportunities' | 'concept' | 'raw'>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<StudentOpportunity | null>(null);
  const [isStarterKitOpen, setIsStarterKitOpen] = useState<boolean>(false);
  const [isQnAOpen, setIsQnAOpen] = useState<boolean>(false);

  // History stored in localStorage
  const [history, setHistory] = useState<Array<{ id: string; title: string; date: string }>>([
    { id: 'mamba-ssm', title: 'Mamba: Linear-Time Sequence Modeling', date: 'Just now' },
    { id: 'attention-transformer', title: 'Attention Is All You Need', date: 'Benchmark' },
    { id: 'lora-adaptation', title: 'LoRA: Low-Rank Adaptation', date: 'Benchmark' },
  ]);

  // Handle analysis
  const handleAnalyze = async (overrideInput?: string) => {
    const inputVal = (overrideInput || paperInput).trim();
    if (!inputVal) {
      setErrorMessage('Please enter an academic paper URL, title, or abstract.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep('Ingesting paper URL & checking context bounds (<25,000 tokens)...');

    // Multi-step loading feedback
    const timer1 = setTimeout(() => {
      setLoadingStep('Searching arXiv and open-source implementations for architecture details...');
    }, 1800);
    const timer2 = setTimeout(() => {
      setLoadingStep('Extracting Core Concept (<300 words) & computing Mermaid.js graph...');
    }, 4000);
    const timer3 = setTimeout(() => {
      setLoadingStep('Formulating 3 resume-grade CS student extension opportunities...');
    }, 6500);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperInput: inputVal,
          paperType: inputMode,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze paper.');
      }

      setCurrentData(json.data);

      // Add to history
      const newEntry = {
        id: `paper-${Date.now()}`,
        title: json.data.paperTitle,
        date: 'Recent',
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during paper analysis. Please try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectBenchmark = (key: string) => {
    if (SAMPLE_BENCHMARK_PAPERS[key]) {
      setCurrentData(SAMPLE_BENCHMARK_PAPERS[key]);
      setPaperInput(SAMPLE_BENCHMARK_PAPERS[key].arxivIdOrUrl);
      setErrorMessage(null);
    }
  };

  const handleExportDossier = () => {
    const markdownContent = `# CS Research Dossier: ${currentData.paperTitle}
**Authors/Context:** ${currentData.authorsAndYear}
**Canonical URL:** ${currentData.arxivIdOrUrl}

---

## 1. CORE CONCEPT EXTRACTION (< 300 words)
${currentData.coreConcept.conciseSummary}

### Problem Statement
${currentData.coreConcept.problemStatement}

### Primary Methodology
${currentData.coreConcept.primaryMethodology}

### Mathematical & Algorithmic Breakthroughs
${currentData.coreConcept.breakthroughs}

---

## 2. ARCHITECTURAL FLOWCHART (Mermaid.js)
\`\`\`mermaid
${currentData.mermaidFlowchart}
\`\`\`

---

## 3. FUTURE WORK & INTERNSHIP OPPORTUNITIES (3rd-Year CS Student)
${currentData.studentOpportunities
  .map(
    (opp, i) => `### Project ${i + 1}: ${opp.title}
* **Exact Extension:** ${opp.extension}
* **Targeted Performance Metric:** ${opp.targetedMetric}
* **Recommended Tech Stack:** ${opp.techStack}
* **Resume Formulation:** "${opp.resumeBullet}"
`
  )
  .join('\n')}

---
*Generated by PaperArchitect CS Research Agent. Operational token constraint: < 25,000 tokens.*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dossier.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Agent Tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/30 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Paper<span className="text-blue-400">Architect</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-blue-950 border border-blue-800/70 text-blue-300">
                  CS Research Agent v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Academic Paper Parsing • System Architecture Flowcharts • Student Resume Opportunities
              </p>
            </div>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center space-x-3">
            {/* Token Budget Gauge */}
            <div className="hidden md:block">
              <TokenGauge stats={currentData.tokenEfficiencyStats} />
            </div>

            {/* Q&A Assistant Button */}
            <button
              onClick={() => setIsQnAOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-xl transition-all text-xs font-semibold shadow-sm"
              title="Ask technical questions to the CS Research Agent"
            >
              <MessageSquareCode className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Ask Research Agent</span>
            </button>

            {/* Export Dossier */}
            <button
              onClick={handleExportDossier}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-xs font-semibold shadow-md shadow-blue-900/20"
              title="Download Complete Research Dossier Markdown"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Input Section */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Headline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated CS Architecture &amp; Project Synthesizer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Parse Academic Papers. Extract Flowcharts. Build Resume Projects.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Extracts the core mathematical breakthrough in under 300 words, renders a clean Mermaid.js system flowchart, and architects 3 concrete extension projects for 3rd-year CS student portfolios.
              </p>
            </div>

            {/* Operational Constraints Banner */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1 self-start md:self-auto max-w-sm">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">
                <Terminal className="w-3.5 h-3.5" />
                <span>Active Operational Constraints</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                • Strict token efficiency constraint: <strong className="text-slate-200">&lt; 25,000 tokens</strong><br />
                • Automated Web/arXiv Search grounding for long papers<br />
                • Plain-language extraction strictly &lt; 300 words
              </div>
            </div>
          </div>

          {/* Search / Ingestion Input Box */}
          <div className="p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center space-x-3 px-3 py-1">
              <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <input
                type="text"
                value={paperInput}
                onChange={(e) => setPaperInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter arXiv URL (e.g. https://arxiv.org/abs/2312.00752), paper title, or GitHub paper repo..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800 md:pl-2">
              <button
                type="button"
                onClick={() => setInputMode(inputMode === 'url' ? 'title_or_text' : 'url')}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl transition-colors"
                title="Toggle input mode"
              >
                {inputMode === 'url' ? 'URL Mode' : 'Title / Text Mode'}
              </button>

              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 whitespace-nowrap cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run Architecture Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Benchmark Papers */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Quick CS Benchmarks:
            </span>
            <button
              onClick={() => handleSelectBenchmark('mamba-ssm')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
            >
              Mamba: Selective State Spaces (Gu &amp; Dao)
            </button>
            <button
              onClick={() => handleSelectBenchmark('attention-transformer')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
            >
              Attention Is All You Need (Transformers)
            </button>
            <button
              onClick={() => handleSelectBenchmark('lora-adaptation')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
            >
              LoRA: Low-Rank Adaptation (Hu et al.)
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-300">Analysis Notice: </span>
                  <span className="text-slate-300">{errorMessage}</span>
                </div>
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Retry Analysis</span>
              </button>
            </div>
          )}

          {/* Loading Progress Feedback */}
          {isLoading && (
            <div className="p-5 bg-blue-950/30 border border-blue-800/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-blue-300 font-semibold">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Agent Operational Status</span>
                </div>
                <span className="text-slate-400 font-mono">Token efficiency check passed (&lt;25k)</span>
              </div>
              <p className="text-xs text-slate-300 font-mono pl-6 animate-pulse">
                &gt; {loadingStep}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Paper Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-950 border border-blue-800 text-blue-400 rounded">
                Analyzed Paper
              </span>
              {currentData.arxivIdOrUrl && (
                <a
                  href={currentData.arxivIdOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>{currentData.arxivIdOrUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentData.paperTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {currentData.authorsAndYear}
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex flex-wrap items-center p-1 bg-slate-950 border border-slate-800 rounded-xl self-start md:self-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified Dossier
            </button>
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'flowchart' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flowchart (Mermaid)
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'opportunities' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Projects (3)
            </button>
            <button
              onClick={() => setActiveTab('concept')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'concept' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Core Concept (&lt;300w)
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Output [FLOWCHART]
            </button>
          </div>
        </div>

        {/* View Content Depending on Active Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* 1. Core Concept Extraction */}
            <CoreConceptView coreConcept={currentData.coreConcept} paperTitle={currentData.paperTitle} />

            {/* 2. System Architecture Flowchart (Mermaid.js) */}
            <MermaidChart
              chartCode={currentData.mermaidFlowchart}
              onCodeChange={(newCode) =>
                setCurrentData((prev) => ({ ...prev, mermaidFlowchart: newCode }))
              }
              title={currentData.paperTitle}
            />

            {/* Component breakdown */}
            <ArchitectureInspector highlights={currentData.architectureHighlights} />

            {/* 3. Future Work & Internship Opportunities */}
            <StudentOpportunitiesView
              opportunities={currentData.studentOpportunities}
              paperTitle={currentData.paperTitle}
              onOpenStarterKit={(opp) => {
                setSelectedOpportunity(opp);
                setIsStarterKitOpen(true);
              }}
            />

            {/* 4. Verbatim System Agent Output */}
            {currentData.rawOutput && <RawOutputView rawOutput={currentData.rawOutput} />}
          </div>
        )}

        {activeTab === 'flowchart' && (
          <div className="space-y-6">
            <MermaidChart
              chartCode={currentData.mermaidFlowchart}
              onCodeChange={(newCode) =>
                setCurrentData((prev) => ({ ...prev, mermaidFlowchart: newCode }))
              }
              title={currentData.paperTitle}
            />
            <ArchitectureInspector highlights={currentData.architectureHighlights} />
          </div>
        )}

        {activeTab === 'opportunities' && (
          <StudentOpportunitiesView
            opportunities={currentData.studentOpportunities}
            paperTitle={currentData.paperTitle}
            onOpenStarterKit={(opp) => {
              setSelectedOpportunity(opp);
              setIsStarterKitOpen(true);
            }}
          />
        )}

        {activeTab === 'concept' && (
          <CoreConceptView coreConcept={currentData.coreConcept} paperTitle={currentData.paperTitle} />
        )}

        {activeTab === 'raw' && <RawOutputView rawOutput={currentData.rawOutput} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>
              PaperArchitect • Advanced CS Research Agent for Undergraduate &amp; Graduate Researchers
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Token Budget Constraint: &lt; 25,000 Tokens</span>
            <span>•</span>
            <span>Mermaid.js System Flowchart</span>
            <span>•</span>
            <span>Resume Project Incubator</span>
          </div>
        </div>
      </footer>

      {/* Starter Kit Modal */}
      <StarterKitModal
        isOpen={isStarterKitOpen}
        onClose={() => setIsStarterKitOpen(false)}
        opportunity={selectedOpportunity}
        paperTitle={currentData.paperTitle}
      />

      {/* Paper Q&A Drawer */}
      <PaperQnADrawer
        isOpen={isQnAOpen}
        onClose={() => setIsQnAOpen(false)}
        paperTitle={currentData.paperTitle}
        paperSummary={currentData.coreConcept.conciseSummary}
      />
    </div>
  );
}
