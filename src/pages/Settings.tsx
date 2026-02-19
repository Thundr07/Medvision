import React from 'react';
import { Database, Cpu, Shield, Info, GitBranch } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-zinc-100">
      <header className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">System Information</h1>
        <p className="text-zinc-400">Technical specifications, model details, and dataset transparency.</p>
      </header>

      <div className="space-y-8">
        {/* Datasets Section */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold">Training Datasets</h2>
          </div>
          <div className="p-6">
            <p className="text-zinc-400 mb-6 text-sm">
              MedVision AI models are trained on large-scale, de-identified public medical imaging datasets to ensure robust and unbiased performance.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "NIH ChestXray14",
                  size: "112,120 images",
                  type: "Chest X-Ray",
                  desc: "One of the largest public chest X-ray datasets, labeled with 14 common pathologies."
                },
                {
                  name: "CheXpert",
                  size: "224,316 images",
                  type: "Chest X-Ray",
                  desc: "Large dataset from Stanford Hospital, featuring uncertainty labels and frontal/lateral views."
                },
                {
                  name: "BraTS 2023",
                  size: "2,000+ MRI scans",
                  type: "Brain MRI",
                  desc: "Multimodal Brain Tumor Segmentation Benchmark for glioblastoma detection."
                }
              ].map((ds, i) => (
                <div key={i} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <h3 className="font-semibold text-white mb-1">{ds.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3 font-mono">
                    <span>{ds.type}</span>
                    <span>•</span>
                    <span>{ds.size}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{ds.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">Model Architectures</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 text-xs font-mono text-zinc-500 mt-1">Classification</div>
              <div>
                <h3 className="font-medium text-white">DenseNet-121 (CheXNet)</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  A 121-layer Convolutional Neural Network optimized for X-ray pathology classification. 
                  Uses dense connections to improve gradient flow and feature propagation.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 text-xs font-mono text-zinc-500 mt-1">Segmentation</div>
              <div>
                <h3 className="font-medium text-white">3D U-Net</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Volumetric segmentation network for MRI scans. Capable of delineating tumor core, 
                  enhancing tumor, and edema with high precision (Dice score &gt; 0.85).
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-24 shrink-0 text-xs font-mono text-zinc-500 mt-1">Explainability</div>
              <div>
                <h3 className="font-medium text-white">Grad-CAM</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Gradient-weighted Class Activation Mapping generates visual heatmaps to highlight 
                  regions of interest that influenced the model's prediction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Data Privacy & Security</h3>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckIcon /> DICOM de-identification (Safe Harbor)
              </li>
              <li className="flex gap-2">
                <CheckIcon /> AES-256 Encryption at rest
              </li>
              <li className="flex gap-2">
                <CheckIcon /> Role-Based Access Control (RBAC)
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Version Control</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">System Version</span>
                <span className="text-zinc-300 font-mono">v2.4.0-beta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Model Weights</span>
                <span className="text-zinc-300 font-mono">densenet-chkpt-v12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Last Updated</span>
                <span className="text-zinc-300">Oct 26, 2023</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
