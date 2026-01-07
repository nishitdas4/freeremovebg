"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

// --- ICONS (Fixed & Added IconCheck) ---
const IconBrush = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const IconEraser = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const IconUndo = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconRedo = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>;
const IconZoomIn = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const IconZoomOut = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const IconHand = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
const IconLayers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const IconShadow = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconUpload = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const IconCheck = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;

export default function Remover() {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Tools & Viewport
  const [activeTab, setActiveTab] = useState<'bg' | 'shadow' | 'adjust'>('bg');
  const [activeTool, setActiveTool] = useState<'brush' | 'hand'>('brush');
  const [brushMode, setBrushMode] = useState<'none' | 'erase' | 'restore'>('none');
  const [brushSize, setBrushSize] = useState(50);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  
  // --- FEATURE STATE ---
  const [bgColor, setBgColor] = useState<string>("transparent"); 
  const [bgBlur, setBgBlur] = useState(0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(15);
  const [shadowX, setShadowX] = useState(10);
  const [shadowY, setShadowY] = useState(10);
  const [shadowOpacity, setShadowOpacity] = useState(0.5);
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [brightness, setBrightness] = useState(100); 
  const [contrast, setContrast] = useState(100); 
  const [saturation, setSaturation] = useState(100); 

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worker = useRef<Worker | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); 
  const subjectCanvasRef = useRef<HTMLCanvasElement | null>(null); 
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null); 
  const historyStack = useRef<ImageData[]>([]);
  const historyStep = useRef(-1);
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // --- 1. WORKER & INIT ---
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../app/worker.js', import.meta.url), { type: 'module' });
      worker.current.onmessage = async (e) => {
        const { status, blob, progress } = e.data;
        if (status === 'loading') setStatus(progress ? `AI Processing... ${Math.round(progress)}%` : "Initializing...");
        if (status === 'complete') {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                setMaskImage(img); setStatus("Complete"); setLoading(false); setHasProcessed(true);
            };
        }
      };
    }
  }, []);

  useEffect(() => {
    if (maskImage && originalImage) {
        const w = originalImage.width; const h = originalImage.height;
        const mCanvas = document.createElement('canvas'); mCanvas.width = w; mCanvas.height = h;
        const mCtx = mCanvas.getContext('2d');
        if (mCtx) {
            mCtx.drawImage(maskImage, 0, 0); mCtx.globalCompositeOperation = 'source-in'; mCtx.fillStyle = 'white'; mCtx.fillRect(0, 0, w, h);
            historyStack.current = [mCtx.getImageData(0, 0, w, h)]; historyStep.current = 0;
        }
        maskCanvasRef.current = mCanvas;
        const sCanvas = document.createElement('canvas'); sCanvas.width = w; sCanvas.height = h;
        subjectCanvasRef.current = sCanvas;
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const scale = Math.min(clientWidth / w, clientHeight / h) * 0.8; 
            setTransform({ scale, x: (clientWidth - w * scale) / 2, y: (clientHeight - h * scale) / 2 });
        }
        updateSubjectLayer(); renderMainCanvas(); 
    }
  }, [maskImage, originalImage]);

  // --- 2. RENDERING LOGIC ---
  const updateSubjectLayer = () => {
    if (!originalImage || !maskCanvasRef.current || !subjectCanvasRef.current) return;
    const ctx = subjectCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, subjectCanvasRef.current.width, subjectCanvasRef.current.height);
    ctx.drawImage(maskCanvasRef.current, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(originalImage, 0, 0);
  };

  const renderMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const subjectCanvas = subjectCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !ctx || !originalImage || !subjectCanvas || !maskCanvas) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgColor !== 'transparent') {
        if (bgColor === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, "#8EC5FC"); grad.addColorStop(1, "#E0C3FC");
            ctx.fillStyle = grad;
        } else { ctx.fillStyle = bgColor; }
        
        if (bgColor === 'transparent' && bgBlur > 0) {
            ctx.save(); ctx.filter = `blur(${bgBlur}px)`; ctx.drawImage(originalImage, 0, 0); ctx.restore();
        } else if (bgColor !== 'transparent') {
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else if (bgBlur > 0) {
        ctx.save(); ctx.filter = `blur(${bgBlur}px)`; ctx.drawImage(originalImage, 0, 0); ctx.restore();
    }

    if (shadowEnabled) {
        ctx.save();
        ctx.translate(shadowX, shadowY);
        ctx.globalAlpha = shadowOpacity;
        ctx.filter = `drop-shadow(0 0 ${shadowBlur}px ${shadowColor})`;
        ctx.drawImage(maskCanvas, 0, 0); 
        ctx.restore();
    }

    if (strokeEnabled && strokeWidth > 0) {
        ctx.save();
        const scaleFactor = Math.max(1, canvas.width / 1000);
        const actualStroke = strokeWidth * scaleFactor;
        ctx.filter = `drop-shadow(0 0 ${actualStroke}px ${strokeColor}) drop-shadow(0 0 ${actualStroke/2}px ${strokeColor})`;
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.restore();
    }

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(subjectCanvas, 0, 0);
    ctx.restore();

  }, [bgColor, bgBlur, shadowEnabled, shadowColor, shadowBlur, shadowX, shadowY, shadowOpacity, strokeEnabled, strokeWidth, strokeColor, brightness, contrast, saturation, originalImage]);

  useEffect(() => {
    if (!hasProcessed) return;
    const timer = setTimeout(() => renderMainCanvas(), 10);
    return () => clearTimeout(timer);
  }, [renderMainCanvas, hasProcessed]);

  // --- 3. INPUT HANDLING ---
  const getPointerPos = (e: any) => {
    let clientX = e.clientX; let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    const rect = containerRef.current!.getBoundingClientRect();
    return {
        x: (clientX - rect.left - transform.x) / transform.scale,
        y: (clientY - rect.top - transform.y) / transform.scale,
        windowX: clientX, windowY: clientY
    };
  };

  const handlePointerDown = (e: any) => {
    if (!hasProcessed) return;
    if (activeTool === 'hand' || e.button === 1 || e.buttons === 4 || e.key === " ") {
        isPanning.current = true; startPan.current = { x: e.clientX, y: e.clientY }; return;
    }
    if (activeTool === 'brush' && brushMode !== 'none') {
        isDrawing.current = true; const pos = getPointerPos(e); lastPos.current = { x: pos.x, y: pos.y }; draw(pos);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!hasProcessed) return;
    const pos = getPointerPos(e);
    if (cursorRef.current && activeTool === 'brush' && brushMode !== 'none') {
        cursorRef.current.style.left = `${pos.windowX}px`; cursorRef.current.style.top = `${pos.windowY}px`;
        const size = brushSize * transform.scale; cursorRef.current.style.width = `${size}px`; cursorRef.current.style.height = `${size}px`;
    }
    if (isPanning.current) {
        const dx = e.clientX - startPan.current.x; const dy = e.clientY - startPan.current.y;
        setTransform(p => ({ ...p, x: p.x + dx, y: p.y + dy })); startPan.current = { x: e.clientX, y: e.clientY }; return;
    }
    if (isDrawing.current) draw(pos);
  };

  const handlePointerUp = () => {
    if (isDrawing.current) { isDrawing.current = false; saveHistory(); }
    isPanning.current = false;
  };

  const draw = (pos: { x: number, y: number }) => {
    if (brushMode === 'none' || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d'); if (!ctx) return;
    ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brushSize;
    ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
    ctx.globalCompositeOperation = brushMode === 'erase' ? 'destination-out' : 'source-over'; ctx.strokeStyle = brushMode === 'erase' ? 'rgba(0,0,0,1)' : 'white';
    ctx.stroke(); lastPos.current = { x: pos.x, y: pos.y };
    updateSubjectLayer(); renderMainCanvas();
  };

  const saveHistory = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d'); if (!ctx) return;
    if (historyStep.current < historyStack.current.length - 1) historyStack.current = historyStack.current.slice(0, historyStep.current + 1);
    historyStack.current.push(ctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height));
    historyStep.current++;
    if (historyStack.current.length > 15) { historyStack.current.shift(); historyStep.current--; }
  };
  const undo = () => { if (historyStep.current > 0) { historyStep.current--; restoreHistory(); } };
  const redo = () => { if (historyStep.current < historyStack.current.length - 1) { historyStep.current++; restoreHistory(); } };
  const restoreHistory = () => {
    const ctx = maskCanvasRef.current?.getContext('2d'); if (!ctx) return;
    ctx.putImageData(historyStack.current[historyStep.current], 0, 0); updateSubjectLayer(); renderMainCanvas();
  };
  
  // --- UTILS ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; if (!file) return;
    const img = new Image(); img.src = URL.createObjectURL(file);
    img.onload = () => {
        setOriginalImage(img); setMaskImage(null); setHasProcessed(false); setBgColor("transparent"); 
        setStatus("Ready"); historyStack.current = []; historyStep.current = -1;
        setShadowEnabled(false); setBgBlur(0); setBrightness(100); setContrast(100); setSaturation(100); setStrokeEnabled(false);
    };
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });
  const runAI = async () => { 
    if (!originalImage || !worker.current) return; 
    setLoading(true); 
    const MAX_SIZE = 1280; 
    let w = originalImage.width; let h = originalImage.height;
    if (w > MAX_SIZE || h > MAX_SIZE) { const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
    const tempCanvas = document.createElement('canvas'); tempCanvas.width = w; tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d'); ctx?.drawImage(originalImage, 0, 0, w, h);
    tempCanvas.toBlob(async (blob) => { if(blob) worker.current?.postMessage({ imageBlob: blob }); }, 'image/jpeg', 0.9);
  };

  return (
    <>
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      .bg-checkerboard { background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
    `}</style>

    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* --- FIXED CURSOR --- */}
      {brushMode !== 'none' && activeTool === 'brush' && (
        <div ref={cursorRef} className="fixed pointer-events-none z-50 rounded-full border border-white/50 ring-1 ring-black/50 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: brushMode === 'erase' ? 'rgba(255,0,0,0.2)' : 'rgba(74, 222, 128, 0.2)', left: '-100px', top: '-100px' }} />
      )}

      {/* --- LEFT SIDEBAR (FIXED WIDTH - BLUE THEME) --- */}
      <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-20 shadow-lg hidden md:flex">
         <div className="flex border-b border-slate-100 bg-slate-50">
            <button onClick={() => setActiveTab('bg')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab==='bg' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>BG & Outline</button>
            <button onClick={() => setActiveTab('shadow')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab==='shadow' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>Shadow</button>
            <button onClick={() => setActiveTab('adjust')} className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab==='adjust' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>Adjust</button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {hasProcessed ? (
                <div className="p-6 space-y-8 animate-in fade-in duration-500">
                    {/* TAB CONTENT: BG */}
                    {activeTab === 'bg' && (
                        <>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 shadow-sm items-start">
                                <span className="text-blue-500 text-lg">💡</span>
                                <p className="text-[11px] text-blue-800 leading-snug font-medium pt-1">Pro Tip: Apply Red Outline to verify the cutout is perfect.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Outline (Stroke)</label>
                                    <button onClick={() => setStrokeEnabled(!strokeEnabled)} className={`w-9 h-5 rounded-full relative transition-colors ${strokeEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${strokeEnabled ? 'left-5' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className={`transition-all duration-300 space-y-3 ${strokeEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                    <input type="range" min="0" max="50" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer" />
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full shadow-sm border border-slate-200 flex items-center justify-center bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] cursor-pointer hover:scale-105 transition-transform">
                                            <div className="w-3 h-3 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none"><span className="text-[8px] font-bold">+</span></div>
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setStrokeColor(e.target.value)} />
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-200 shadow-inner" style={{backgroundColor: strokeColor}} />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-6 space-y-4">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Background</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setBgColor('transparent')} className="w-8 h-8 rounded-full border border-slate-200 bg-checkerboard hover:scale-110 transition-transform shadow-sm" title="Transparent" />
                                    <button onClick={() => setBgColor('#ffffff')} className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:scale-110 transition-transform shadow-sm" title="White" />
                                    <button onClick={() => setBgColor('#000000')} className="w-8 h-8 rounded-full border border-slate-200 bg-black hover:scale-110 transition-transform shadow-sm" title="Black" />
                                    <div className="relative w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] cursor-pointer hover:scale-110 transition-transform">
                                        <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setBgColor(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between"><span className="text-xs text-slate-500 font-medium">Blur</span><span className="text-xs font-mono text-slate-400">{bgBlur}px</span></div>
                                    <input type="range" min="0" max="20" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-400 cursor-pointer" />
                                </div>
                            </div>
                        </>
                    )}
                    {/* TAB CONTENT: SHADOW */}
                    {activeTab === 'shadow' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><IconShadow/> Drop Shadow</label>
                                <button onClick={() => setShadowEnabled(!shadowEnabled)} className={`w-9 h-5 rounded-full relative transition-colors ${shadowEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${shadowEnabled ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className={`space-y-5 transition-opacity duration-300 ${shadowEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 rounded-full shadow-sm border border-slate-200 flex items-center justify-center bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] cursor-pointer hover:scale-105 transition-transform">
                                        <div className="w-3 h-3 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none"><span className="text-[8px] font-bold">+</span></div>
                                        <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setShadowColor(e.target.value)} />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 shadow-inner" style={{backgroundColor: shadowColor}} />
                                </div>
                                <div className="space-y-4">
                                    {[{l:'Opacity', v:shadowOpacity, s:setShadowOpacity, m:1, st:0.1}, {l:'Blur', v:shadowBlur, s:setShadowBlur, m:100, st:1}].map((i,k) => (
                                        <div key={k} className="space-y-1">
                                            <div className="flex justify-between"><span className="text-xs text-slate-500">{i.l}</span><span className="text-xs font-mono text-slate-400">{Math.round(i.v*(i.l==='Opacity'?100:1))}</span></div>
                                            <input type="range" min="0" max={i.m} step={i.st} value={i.v} onChange={(e)=>i.s(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-500" />
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1"><span className="text-xs text-slate-500 block text-center">X Offset</span><input type="range" min="-400" max="400" value={shadowX} onChange={(e)=>setShadowX(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-500" /></div>
                                        <div className="space-y-1"><span className="text-xs text-slate-500 block text-center">Y Offset</span><input type="range" min="-400" max="400" value={shadowY} onChange={(e)=>setShadowY(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-500" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* TAB CONTENT: ADJUST */}
                    {activeTab === 'adjust' && (
                        <div className="space-y-6">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex gap-2"><span className="text-xs">🎨</span><p className="text-[11px] text-slate-600 leading-snug pt-0.5">Adjust subject lighting to match the new background.</p></div>
                            <div className="space-y-5">
                                {[{l:'Brightness', v:brightness, s:setBrightness}, {l:'Contrast', v:contrast, s:setContrast}, {l:'Saturation', v:saturation, s:setSaturation}].map((i,k) => (
                                    <div key={k} className="space-y-2">
                                        <div className="flex justify-between"><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{i.l}</span><span className="text-xs font-mono text-slate-400">{i.v}%</span></div>
                                        <input type="range" min="0" max="200" value={i.v} onChange={(e)=>i.s(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* BOTTOM: REFINE TOOLS */}
                    <div className="border-t border-slate-100 pt-6 mt-6 pb-6">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">Refine Edge</label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button onClick={() => setBrushMode('none')} className={`py-2 text-[10px] font-bold rounded-md transition-all border ${brushMode==='none' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>VIEW</button>
                            <button onClick={() => { setBrushMode('restore'); setActiveTool('brush'); }} className={`py-2 text-[10px] font-bold rounded-md transition-all border flex justify-center items-center gap-1 ${brushMode==='restore' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}><IconBrush /> FIX</button>
                            <button onClick={() => { setBrushMode('erase'); setActiveTool('brush'); }} className={`py-2 text-[10px] font-bold rounded-md transition-all border flex justify-center items-center gap-1 ${brushMode==='erase' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}><IconEraser /> ERASE</button>
                        </div>
                        {brushMode !== 'none' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
                                <div className="flex justify-between"><span className="text-xs text-slate-500">Brush Size</span><span className="text-xs font-mono">{brushSize}px</span></div>
                                <input type="range" min="10" max="300" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-500" />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <IconLayers />
                    <p className="text-sm font-bold text-slate-400 mt-4">No Image Selected</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">Upload an image to unlock the full Studio suite.</p>
                </div>
            )}
         </div>
      </div>

      {/* --- MAIN APP AREA (BLUE THEME + SCROLL FIX) --- */}
      <div className="flex-1 flex flex-col h-full relative bg-slate-50/50">
         {/* TOP TOOLBAR */}
         <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-blue-700 hidden md:block">FreeBgAI</span>
                {hasProcessed && (
                    <div className="flex items-center gap-1 pl-4 border-l border-slate-200">
                        <button onClick={undo} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors" title="Undo"><IconUndo/></button>
                        <button onClick={redo} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors" title="Redo"><IconRedo/></button>
                        <div className="w-px h-4 bg-slate-200 mx-2"/>
                        <button onClick={() => setActiveTool('hand')} className={`p-2 rounded-md transition-colors ${activeTool === 'hand' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Hand Tool"><IconHand/></button>
                        <div className="w-px h-4 bg-slate-200 mx-2"/>
                        <button onClick={() => setTransform(t=>({...t, scale: t.scale * 1.1}))} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"><IconZoomIn/></button>
                        <span className="text-xs font-mono text-slate-400 w-12 text-center">{Math.round(transform.scale*100)}%</span>
                        <button onClick={() => setTransform(t=>({...t, scale: Math.max(0.1, t.scale * 0.9)}))} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"><IconZoomOut/></button>
                    </div>
                )}
            </div>
            {hasProcessed && (
                <div className="flex items-center gap-3">
                    <button onClick={() => { setOriginalImage(null); setHasProcessed(false); }} className="text-xs font-bold text-slate-500 hover:text-red-500 px-4 py-2 hover:bg-red-50 rounded-md transition-colors">New Image</button>
                    <button onClick={() => { const link = document.createElement('a'); link.download = 'freebgai-edit.png'; link.href = canvasRef.current?.toDataURL() || ''; link.click(); }} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-xs font-bold">
                        <IconDownload /> Download HD
                    </button>
                </div>
            )}
         </div>

         {/* CANVAS VIEWPORT / UPLOAD AREA (FIXED SCROLLING) */}
         <div ref={containerRef} className={`flex-1 relative ${!originalImage ? 'overflow-y-auto' : 'overflow-hidden'} bg-checkerboard cursor-grab active:cursor-grabbing`}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none', cursor: activeTool === 'hand' ? (isPanning.current ? 'grabbing' : 'grab') : (brushMode !== 'none' ? 'none' : 'default') }}>
            
            {!originalImage ? (
                // --- THE SEO LANDING PAGE (SCROLLABLE & FULLY VISIBLE) ---
                <div className="min-h-full flex flex-col items-center p-8 pb-32">
                        {/* 1. UPLOAD BOX (Hero) */}
                        <div {...getRootProps()} className={`w-full max-w-2xl h-[400px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-white/50 transition-all cursor-pointer group bg-white/40 backdrop-blur-sm mb-16 ${isDragActive ? "bg-blue-50/50" : ""}`}>
                            <input {...getInputProps()} />
                            <div className="p-5 bg-white rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300 text-blue-600"><IconUpload /></div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload an Image</h2>
                            <p className="text-slate-500 mb-8">Drag & drop or click to browse</p>
                            <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="bg-white px-3 py-1 rounded shadow-sm">JPG</span>
                                <span className="bg-white px-3 py-1 rounded shadow-sm">PNG</span>
                                <span className="bg-white px-3 py-1 rounded shadow-sm">WEBP</span>
                            </div>
                        </div>

                        {/* 2. SEO CONTENT (Visible below the fold) */}
                        <div className="max-w-4xl w-full text-slate-600">
                             <div className="text-center mb-16">
                                <h1 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                                The First Unlimited Local <br/><span className="text-blue-600">Background Remover</span>
                                </h1>
                                <p className="text-lg leading-relaxed max-w-2xl mx-auto">
                                FreeBgAI is a privacy-first AI tool that removes image backgrounds directly in your browser. 
                                Unlike other tools, your photos never leave your device. 100% Free. Unlimited HD.
                                </p>
                             </div>

                             <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h2 className="text-2xl font-bold mb-4 text-slate-800">For YouTubers & Creators</h2>
                                    <p className="mb-4 text-sm leading-relaxed">
                                    Create viral thumbnails in seconds. Our "Studio Mode" allows you to:
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Add a <strong>white outline (stroke)</strong> instantly.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Adjust brightness to make faces pop.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Download transparent PNGs.</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-4 text-slate-800">For Amazon & E-Commerce</h2>
                                    <p className="mb-4 text-sm leading-relaxed">
                                    Sellers on Amazon, Shopify, and Etsy can create compliant images:
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Convert backgrounds to <strong>pure white</strong>.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Add realistic <strong>drop shadows</strong>.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Process unlimited photos for free.</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                </div>
            ) : (
                <>
                    {/* APP MODE: Loading & Canvas */}
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-blue-900 font-bold text-lg animate-pulse">{status}</p>
                        </div>
                    )}
                    {!hasProcessed && !loading && (
                        <div className="absolute z-50 inset-0 flex items-center justify-center pointer-events-none">
                            <button onClick={runAI} className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all transform flex items-center gap-3">
                                <span>⚡</span> Remove Background
                            </button>
                        </div>
                    )}
                    <canvas ref={canvasRef} 
                        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }} 
                        className={`shadow-2xl transition-opacity duration-500 ${!hasProcessed ? 'opacity-50 blur-sm grayscale' : ''}`} 
                    />
                </>
            )}
         </div>
      </div>
    </div>
    </>
  );
}