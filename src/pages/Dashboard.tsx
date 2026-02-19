import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertCircle, CheckCircle, Clock, ChevronRight, UploadCloud, FileUp, Loader2, X } from 'lucide-react';
import { MOCK_CASES, CaseStatus, PatientCase, Finding } from '../lib/types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCases = MOCK_CASES.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.patientName.toLowerCase().includes(search.toLowerCase()) || 
                          c.patientId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'review': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'normal': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getStatusIcon = (status: CaseStatus) => {
    switch (status) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'review': return <Clock className="w-4 h-4" />;
      case 'normal': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Basic validation
    if (!file.type.startsWith('image/') && !file.name.endsWith('.dcm')) {
      alert('Please upload a valid image file (JPG, PNG, DICOM).');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate Analysis Pipeline
    const steps = [
      'Uploading DICOM/Image data...',
      'Preprocessing & Normalization...',
      'Running DenseNet-121 Inference...',
      'Generating Grad-CAM Heatmaps...',
      'Finalizing Report...'
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setAnalysisStep(steps[stepIndex]);
      } else {
        clearInterval(interval);
        finishAnalysis(file);
      }
    }, 800);
  };

  const finishAnalysis = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    
    // Simulate more detailed findings based on random chance
    const findings: Finding[] = [
      {
        id: `f-new-${Date.now()}-1`,
        label: 'Infiltration',
        confidence: 0.89,
        severity: 'medium',
        coordinates: { x: 35, y: 45, width: 25, height: 20 },
        explanation: 'Patchy opacities identified in the mid-lung zone, suggestive of interstitial infiltration. Correlation with clinical symptoms (fever, cough) recommended.'
      },
      {
        id: `f-new-${Date.now()}-2`,
        label: 'Nodule',
        confidence: 0.65,
        severity: 'low',
        coordinates: { x: 65, y: 30, width: 10, height: 10 },
        explanation: 'Small, well-defined nodular density observed in the upper lobe. Low confidence suggests potential calcified granuloma or artifact.'
      }
    ];

    // Create a mock "New Case" object with detailed metrics
    const newCase: PatientCase = {
      id: `new-${Date.now()}`,
      patientName: 'Anonymous Patient',
      patientId: `TMP-${Math.floor(Math.random() * 10000)}`,
      age: 45, // Default age
      gender: 'O', // Other/Unknown
      modality: 'Uploaded Image',
      bodyPart: 'Chest (Auto-detected)',
      date: new Date().toISOString(),
      status: 'review', // Default to review for new uploads
      imageUrl: imageUrl,
      // No heatmap for user uploads in this demo
      heatmapUrl: undefined, 
      findings: findings,
      history: ['No previous records found.'],
      technicalMetrics: {
        exposure: 'Normal',
        sharpness: 92,
        contrast: 88,
        snr: 45.2,
        artifactsDetected: false
      }
    };

    // Add to the beginning of the list so it persists in memory for this session
    MOCK_CASES.unshift(newCase);

    // Navigate to viewer
    navigate(`/viewer/${newCase.id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MedVision Dashboard</h1>
        <p className="text-zinc-400">Upload medical imaging for instant AI analysis or manage existing cases.</p>
      </header>

      {/* Main Upload Area */}
      <div 
        className={cn(
          "mb-12 border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative overflow-hidden group",
          isDragging 
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]" 
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*,.dcm"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        />
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Scan</h3>
            <p className="text-indigo-400 font-mono text-sm">{analysisStep}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Upload Medical Imaging</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Drag and drop X-rays, CT scans, or MRI files here. 
              <br/>Supported formats: DICOM, JPG, PNG.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transition-all hover:shadow-indigo-900/40 flex items-center gap-2"
            >
              <FileUp className="w-5 h-5" />
              Select Files
            </button>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cases', value: MOCK_CASES.length, color: 'bg-zinc-800' },
          { label: 'Critical', value: MOCK_CASES.filter(c => c.status === 'critical').length, color: 'bg-red-900/20 border-red-900/50' },
          { label: 'To Review', value: MOCK_CASES.filter(c => c.status === 'review').length, color: 'bg-amber-900/20 border-amber-900/50' },
          { label: 'Completed', value: MOCK_CASES.filter(c => c.status === 'normal').length, color: 'bg-emerald-900/20 border-emerald-900/50' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-xl border border-zinc-800", stat.color)}>
            <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by patient name or ID..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'critical', 'review', 'normal'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-colors",
                filter === s 
                  ? "bg-zinc-100 text-zinc-900 border-zinc-100" 
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-500 font-medium uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Modality</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">AI Findings</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors group cursor-pointer" onClick={() => navigate(`/viewer/${c.id}`)}>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(c.status))}>
                    {getStatusIcon(c.status)}
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{c.patientName}</p>
                    <p className="text-zinc-500 text-xs">{c.patientId} • {c.age}{c.gender}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-300">{c.modality}</span>
                  <span className="text-zinc-500 text-xs ml-2">{c.bodyPart}</span>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {format(new Date(c.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  {c.findings.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.findings.slice(0, 2).map(f => (
                        <span key={f.id} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">
                          {f.label} {(f.confidence * 100).toFixed(0)}%
                        </span>
                      ))}
                      {c.findings.length > 2 && (
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">+{c.findings.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600 italic">No anomalies detected</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 text-zinc-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && (
          <div className="p-12 text-center text-zinc-500">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No cases found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
