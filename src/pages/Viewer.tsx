import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Layers, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Check, 
  FileText,
  Share2,
  Download,
  X,
  Save
} from 'lucide-react';
import { MOCK_CASES, Finding, PatientCase } from '../lib/types';
import { cn } from '../lib/utils';

export default function Viewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get case data from location state (uploaded file) or fallback to ID lookup
  const caseData: PatientCase | undefined = location.state?.caseData || MOCK_CASES.find(c => c.id === id);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caseData) {
      // Auto-generate report text based on findings
      const findingsText = caseData.findings.map(f => 
        `- ${f.label} (${(f.confidence * 100).toFixed(0)}% confidence): ${f.explanation}`
      ).join('\n');
      
      setReportText(
        `RADIOLOGY REPORT\n\n` +
        `PATIENT: ${caseData.patientName} (${caseData.patientId})\n` +
        `DATE: ${caseData.date}\n` +
        `MODALITY: ${caseData.modality} - ${caseData.bodyPart}\n\n` +
        `FINDINGS:\n${findingsText}\n\n` +
        `IMPRESSION:\n` +
        `${caseData.findings.length > 0 ? 'Abnormalities detected as detailed above. Clinical correlation recommended.' : 'No acute cardiopulmonary process.'}\n\n` +
        `AI ASSISTED PRELIMINARY REPORT`
      );
    }
  }, [caseData]);

  if (!caseData) {
    return <div className="p-8 text-white">Case not found</div>;
  }

  const [imageError, setImageError] = useState(false);

  // --- Canvas Rendering Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    // Only set crossOrigin for remote URLs, not blob URLs
    if (caseData.imageUrl.startsWith('http')) {
      img.crossOrigin = "anonymous";
    }
    img.src = caseData.imageUrl;
    
    const heatmapImg = new Image();
    if (caseData.heatmapUrl) {
      if (caseData.heatmapUrl.startsWith('http')) {
        heatmapImg.crossOrigin = "anonymous";
      }
      heatmapImg.src = caseData.heatmapUrl;
    }

    const render = () => {
       // Set canvas size to container size
      if (!containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      
      draw(ctx, img, heatmapImg);
    }

    img.onload = () => {
      setImageError(false);
      render();
    };
    
    img.onerror = () => {
      console.error("Failed to load image:", caseData.imageUrl);
      setImageError(true);
    };

    window.addEventListener('resize', render);

    // Redraw when state changes
    const draw = (context: CanvasRenderingContext2D, image: HTMLImageElement, heatmap: HTMLImageElement) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      context.save();
      
      // Apply transformations
      context.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      context.scale(zoom, zoom);
      
      // Draw original image centered
      const imgAspectRatio = image.width / image.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight;
      if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = canvas.width * 0.9;
        drawHeight = drawWidth / imgAspectRatio;
      } else {
        drawHeight = canvas.height * 0.9;
        drawWidth = drawHeight * imgAspectRatio;
      }
      
      const x = -drawWidth / 2;
      const y = -drawHeight / 2;

      context.drawImage(image, x, y, drawWidth, drawHeight);

      // Draw Heatmap Overlay
      if (showHeatmap && caseData.heatmapUrl && heatmap.complete && heatmap.naturalWidth > 0) {
        context.globalAlpha = 0.4;
        context.globalCompositeOperation = 'screen'; // Blend mode
        context.drawImage(heatmap, x, y, drawWidth, drawHeight);
        context.globalAlpha = 1.0;
        context.globalCompositeOperation = 'source-over';
      }

      // Draw Bounding Boxes
      if (showBoxes) {
        caseData.findings.forEach(finding => {
          if (!finding.coordinates) return;
          
          // Convert percentage coordinates to pixel coordinates
          const bx = x + (finding.coordinates.x / 100) * drawWidth;
          const by = y + (finding.coordinates.y / 100) * drawHeight;
          const bw = (finding.coordinates.width / 100) * drawWidth;
          const bh = (finding.coordinates.height / 100) * drawHeight;

          context.strokeStyle = selectedFinding === finding.id ? '#ffff00' : '#ef4444'; // Yellow if selected, Red otherwise
          context.lineWidth = 2 / zoom;
          context.strokeRect(bx, by, bw, bh);

          // Label
          context.fillStyle = selectedFinding === finding.id ? '#ffff00' : '#ef4444';
          context.font = `${12 / zoom}px sans-serif`;
          context.fillText(`${finding.label} (${(finding.confidence * 100).toFixed(0)}%)`, bx, by - 5);
        });
      }

      context.restore();
    };

    if (img.complete && img.naturalWidth > 0) render();

    return () => window.removeEventListener('resize', render);

  }, [zoom, pan, showHeatmap, showBoxes, selectedFinding, caseData]);


  // --- Event Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.5, Math.min(5, z * scale)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden relative">
      {/* Left Sidebar: Tools & Info */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-sm">{caseData.patientName}</h2>
            <p className="text-xs text-zinc-500">{caseData.patientId} • {caseData.modality}</p>
          </div>
        </div>

        {/* AI Findings List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">AI Findings</h3>
            {caseData.findings.length > 0 ? (
              <div className="space-y-3">
                {caseData.findings.map(finding => (
                  <div 
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding.id === selectedFinding ? null : finding.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedFinding === finding.id 
                        ? "bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500" 
                        : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-indigo-200">{finding.label}</span>
                      <span className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded",
                        finding.confidence > 0.9 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {(finding.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{finding.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-lg text-center">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-emerald-400">No anomalies detected</p>
                <p className="text-xs text-emerald-600 mt-1">AI Confidence: 99.2%</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Technical Analysis</h4>
            {caseData.technicalMetrics ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Exposure</span>
                  <span className="text-zinc-200">{caseData.technicalMetrics.exposure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sharpness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${caseData.technicalMetrics.sharpness}%` }} />
                    </div>
                    <span className="text-zinc-200">{caseData.technicalMetrics.sharpness}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Contrast</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${caseData.technicalMetrics.contrast}%` }} />
                    </div>
                    <span className="text-zinc-200">{caseData.technicalMetrics.contrast}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">SNR</span>
                  <span className="text-zinc-200">{caseData.technicalMetrics.snr} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Artifacts</span>
                  <span className={caseData.technicalMetrics.artifactsDetected ? "text-amber-400" : "text-emerald-400"}>
                    {caseData.technicalMetrics.artifactsDetected ? "Detected" : "None"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Metrics not available for this scan.</p>
            )}
          </div>

          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Patient History</h4>
            <ul className="space-y-2">
              {caseData.history.map((h, i) => (
                <li key={i} className="text-xs text-zinc-400 flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button 
            onClick={() => setShowReport(true)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-black cursor-move overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
            <p className="text-lg font-medium text-white">Error Loading Image</p>
            <p className="text-sm">The image file could not be rendered.</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="block" />
        )}
        
        {/* Floating Toolbar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl">
          <div className="flex items-center gap-1 pr-4 border-r border-zinc-700">
            <button onClick={() => setZoom(z => z * 0.9)} className="p-2 hover:bg-zinc-700 rounded-full text-zinc-300">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => z * 1.1)} className="p-2 hover:bg-zinc-700 rounded-full text-zinc-300">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)} 
            className={cn("p-2 rounded-full transition-colors", showHeatmap ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-zinc-700 text-zinc-400")}
            title="Toggle Heatmap"
          >
            <Layers className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowBoxes(!showBoxes)} 
            className={cn("p-2 rounded-full transition-colors", showBoxes ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-zinc-700 text-zinc-400")}
            title="Toggle Bounding Boxes"
          >
            {showBoxes ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => { setZoom(1); setPan({x:0, y:0}); }} 
            className="p-2 hover:bg-zinc-700 rounded-full text-zinc-400"
            title="Reset View"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Overlay */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">AI-Assisted Preliminary Analysis — Not a Diagnosis</span>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-xl border border-zinc-800 shadow-2xl flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg">Radiology Report</h3>
              <button onClick={() => setShowReport(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea 
                className="w-full h-[400px] bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
              <button onClick={() => setShowReport(false)} className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium">
                Cancel
              </button>
              <button 
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Finalize & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
