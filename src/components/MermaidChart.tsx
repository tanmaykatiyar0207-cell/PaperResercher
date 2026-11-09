import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Edit3, Code2, AlertTriangle } from 'lucide-react';

interface MermaidChartProps {
  chartCode: string;
  onCodeChange?: (newCode: string) => void;
  title?: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ chartCode, onCodeChange, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(chartCode);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        primaryColor: '#2563eb',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#3b82f6',
        lineColor: '#60a5fa',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        edgeLabelBackground: '#1e293b',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
      },
    });
  }, []);

  useEffect(() => {
    setEditableCode(chartCode);
  }, [chartCode]);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      // Clean up markdown markers if present
      let codeToRender = (editableCode || chartCode || '').trim();
      codeToRender = codeToRender.replace(/^```(mermaid)?/i, '').replace(/```$/i, '').trim();

      if (!codeToRender) {
        setSvgContent('');
        return;
      }

      const uniqueId = `mermaid-render-${Math.random().toString(36).substring(2, 9)}`;

      try {
        setRenderError(null);
        const { svg } = await mermaid.render(uniqueId, codeToRender);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Syntax error in Mermaid flowchart definition.');
          // Remove leftover error element injected by mermaid in DOM
          const errorEl = document.getElementById(uniqueId);
          if (errorEl) errorEl.remove();
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [editableCode, chartCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(editableCode || chartCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'paper-architecture').toLowerCase().replace(/\s+/g, '-')}-flowchart.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyEdit = () => {
    if (onCodeChange) {
      onCodeChange(editableCode);
    }
    setIsEditing(false);
  };

  const handleResetEdit = () => {
    setEditableCode(chartCode);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Flowchart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            System Architecture Flowchart (Mermaid.js)
          </span>
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
            graph TD
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-300">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              isEditing ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Edit Mermaid Graph Code"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Previewing' : 'Edit Graph'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!svgContent}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Export as Vector SVG"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Editor Drawer if active */}
      {isEditing && (
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              Live Mermaid Definition (Modifications re-render instantly)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleResetEdit}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Reset to Original
              </button>
              <button
                onClick={handleApplyEdit}
                className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
              >
                Apply Changes
              </button>
            </div>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={8}
            className="w-full p-3 font-mono text-xs bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="graph TD..."
          />
        </div>
      )}

      {/* Diagram Canvas */}
      <div className="relative min-h-[380px] max-h-[640px] overflow-auto p-6 bg-slate-950/60 flex items-center justify-center">
        {renderError ? (
          <div className="max-w-md p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-center space-y-2">
            <div className="flex justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-rose-200">Mermaid Graph Syntax Warning</h4>
            <p className="text-xs text-slate-400 font-mono break-all">{renderError}</p>
            <div className="pt-2 text-left">
              <div className="text-[11px] text-slate-400 mb-1">Raw Flowchart Code:</div>
              <pre className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 overflow-x-auto max-h-40 font-mono">
                {editableCode}
              </pre>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded-lg transition-colors"
            >
              Open Graph Editor to Fix Syntax
            </button>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150 flex items-center justify-center min-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Compiling architectural graph...</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Click zoom controls or drag scrollbars to navigate large architectures</span>
        <span className="font-mono text-slate-400">Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};
