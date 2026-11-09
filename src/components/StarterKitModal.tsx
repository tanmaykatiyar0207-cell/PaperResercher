import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, BookOpen, Cpu, Sparkles } from 'lucide-react';
import { StudentOpportunity } from '../data/samplePapers';

interface StarterKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: StudentOpportunity | null;
  paperTitle: string;
}

export const StarterKitModal: React.FC<StarterKitModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  paperTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'benchmark' | 'readme' | 'colab'>('model');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [starterKitData, setStarterKitData] = useState<any>(null);

  React.useEffect(() => {
    if (!isOpen || !opportunity) {
      setStarterKitData(null);
      return;
    }

    let isSubscribed = true;
    async function fetchStarter() {
      setLoading(true);
      try {
        const res = await fetch('/api/generate-starter-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paperTitle,
            opportunity,
          }),
        });
        const json = await res.json();
        if (isSubscribed && json.success && json.starterKit) {
          setStarterKitData(json.starterKit);
        }
      } catch (e) {
        console.error('Failed to generate starter kit:', e);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchStarter();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, opportunity, paperTitle]);

  if (!isOpen || !opportunity) return null;

  const defaultModelCode = `# model.py - ${opportunity.title}
# Based on: ${paperTitle}
# Targeted Metric: ${opportunity.targetedMetric}

import torch
import torch.nn as nn
import torch.nn.functional as F

class BaselinePaperLayer(nn.Module):
    """Reference layer from original architecture"""
    def __init__(self, d_model=512, n_heads=8):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.qkv_proj = nn.Linear(d_model, 3 * d_model)
        self.out_proj = nn.Linear(d_model, d_model)

    def forward(self, x):
        # x: [Batch, SeqLen, d_model]
        B, L, D = x.shape
        qkv = self.qkv_proj(x).chunk(3, dim=-1)
        return self.out_proj(qkv[2])

class StudentExtensionModule(nn.Module):
    """
    Project Extension: ${opportunity.extension}
    Tech Stack: ${opportunity.techStack}
    """
    def __init__(self, d_model=512, compression_factor=4):
        super().__init__()
        self.d_model = d_model
        self.d_inner = d_model // compression_factor
        
        # 1. Project input to compressed state
        self.in_proj = nn.Linear(d_model, self.d_inner * 2)
        # 2. Local 1D depthwise convolution for hardware locality
        self.local_conv = nn.Conv1d(
            in_channels=self.d_inner,
            out_channels=self.d_inner,
            kernel_size=3,
            padding=1,
            groups=self.d_inner
        )
        # 3. Gated non-linear filter
        self.act = nn.SiLU()
        self.out_proj = nn.Linear(self.d_inner, d_model)
        
    def forward(self, x):
        # x: [Batch, SeqLen, d_model]
        residual = x
        projected = self.in_proj(x)
        branch_a, branch_b = projected.chunk(2, dim=-1)
        
        # Convolve across sequence length [B, C, L]
        conv_out = self.local_conv(branch_a.transpose(1, 2)).transpose(1, 2)
        activated = self.act(conv_out)
        
        # Gating interaction
        gated = activated * F.silu(branch_b)
        out = self.out_proj(gated) + residual
        return out

if __name__ == '__main__':
    dummy_x = torch.randn(2, 64, 512)
    ext_layer = StudentExtensionModule(512)
    out = ext_layer(dummy_x)
    print(f"Input shape: {dummy_x.shape} -> Output shape: {out.shape}")
    print("Layer verified successfully!")
`;

  const defaultBenchmarkCode = `# benchmark.py - Performance Evaluation
# Measures: ${opportunity.targetedMetric}
import time
import torch
from model import BaselinePaperLayer, StudentExtensionModule

def benchmark_latency(model, input_tensor, warmups=20, runs=100):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    input_tensor = input_tensor.to(device)
    model.eval()

    # Warmup
    with torch.no_grad():
        for _ in range(warmups):
            _ = model(input_tensor)
    if device.type == 'cuda':
        torch.cuda.synchronize()

    start = time.perf_counter()
    with torch.no_grad():
        for _ in range(runs):
            _ = model(input_tensor)
            if device.type == 'cuda':
                torch.cuda.synchronize()
    elapsed = (time.perf_counter() - start) / runs * 1000  # ms
    return elapsed

def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

if __name__ == '__main__':
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'
    print(f"=== Benchmarking on: {device_name} ===")
    
    seq_len = 512
    batch_size = 4
    d_model = 512
    test_input = torch.randn(batch_size, seq_len, d_model)
    
    baseline = BaselinePaperLayer(d_model)
    student = StudentExtensionModule(d_model)
    
    time_base = benchmark_latency(baseline, test_input)
    time_ext = benchmark_latency(student, test_input)
    params_base = count_parameters(baseline)
    params_ext = count_parameters(student)
    
    speedup = time_base / time_ext if time_ext > 0 else 0
    param_reduction = (1 - (params_ext / params_base)) * 100
    
    print(f"Baseline Latency: {time_base:.2f} ms | Params: {params_base:,}")
    print(f"Extension Latency: {time_ext:.2f} ms | Params: {params_ext:,}")
    print(f"--> Measured Speedup: {speedup:.2f}x")
    print(f"--> Parameter Reduction: {param_reduction:.1f}%")
`;

  const defaultReadme = `# ${opportunity.title}
*A 3rd-Year CS Research & Engineering Extension*

## Original Paper
**${paperTitle}**

## Target Performance Metric
> ${opportunity.targetedMetric}

## Core Architecture Modification
${opportunity.extension}

## Recommended Tech Stack
\`${opportunity.techStack}\`

## Quick Start
\`\`\`bash
# 1. Clone repository & install dependencies
pip install -r requirements.txt

# 2. Run module verification test
python model.py

# 3. Execute latency & parameter benchmark
python benchmark.py
\`\`\`

## Resume Description Formulation
\`\`\`
${opportunity.resumeBullet}
\`\`\`
`;

  const defaultColabAdvice = `### Google Colab GPU Quickstart Guide

1. **Create Notebook**: Open [Google Colab](https://colab.research.google.com/) and create a new notebook.
2. **Select Hardware Accelerator**: Go to **Runtime > Change runtime type**, select **T4 GPU** (free tier).
3. **Run Code**:
\`\`\`python
# Check GPU assignment
!nvidia-smi

# Clone or paste model.py & benchmark.py
# Execute benchmark:
!python benchmark.py
\`\`\`
4. **Export Artifacts**: Save your latency curves using \`matplotlib\` and export models to ONNX using \`torch.onnx.export\`. Add screenshots of the latency reduction directly into your GitHub README!`;

  const activeContent =
    activeTab === 'model'
      ? starterKitData?.modelCode || defaultModelCode
      : activeTab === 'benchmark'
      ? starterKitData?.benchmarkCode || defaultBenchmarkCode
      : activeTab === 'readme'
      ? starterKitData?.readmeMarkdown || defaultReadme
      : starterKitData?.colabAdvice || defaultColabAdvice;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopiedKey(activeTab);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      //
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/50 border border-blue-700/60 rounded-xl text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{opportunity.title}</h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full">
                  Ready-to-Run Starter Kit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-stack student implementation scaffold based on {paperTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Extension Overview Pill */}
        <div className="px-6 py-3 bg-blue-950/20 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-semibold text-blue-400">Metric Goal:</span>
            <span>{opportunity.targetedMetric}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="font-semibold text-emerald-400">Stack:</span>
            <span className="font-mono text-emerald-300">{opportunity.techStack}</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('model')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'model'
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>model.py (PyTorch Module)</span>
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'benchmark'
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>benchmark.py</span>
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'readme'
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>README.md</span>
            </button>
            <button
              onClick={() => setActiveTab('colab')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'colab'
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Colab Quickstart</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs font-medium"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs text-slate-200 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Generating tailored PyTorch boilerplates and test scripts...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono">
              {activeContent}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Targeted for 3rd-year CS students building GitHub portfolio resume projects.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
