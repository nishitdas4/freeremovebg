"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

// --- ICONS ---
const IconBrush = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const IconEraser = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const IconDownload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const IconUndo = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconRedo = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>;
const IconZoomIn = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const IconZoomOut = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const IconHand = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
const IconShadow = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconUpload = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const IconMagic = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

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
  // Background
  const [bgColor, setBgColor] = useState<string>("transparent"); 
  const [bgBlur, setBgBlur] = useState(0);
  
  // Shadow
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(15);
  const [shadowX, setShadowX] = useState(10);
  const [shadowY, setShadowY] = useState(10);
  const [shadowOpacity, setShadowOpacity] = useState(0.5);

  // Adjustments (Subject + Stroke)
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState("#ff0000"); // Red default
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
        if (status === 'loading') setStatus(progress ? `AI Loading: ${Math.round(progress)}%` : "Initializing...");
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
            const scale = Math.min(clientWidth / w, clientHeight / h) * 0.85; 
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

    // 1. BACKGROUND
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

    // 2. SHADOW
    if (shadowEnabled) {
        ctx.save();
        ctx.translate(shadowX, shadowY);
        ctx.globalAlpha = shadowOpacity;
        ctx.filter = `drop-shadow(0 0 ${shadowBlur}px ${shadowColor})`;
        ctx.drawImage(maskCanvas, 0, 0); 
        ctx.restore();
    }

    // 3. STROKE
    if (strokeEnabled && strokeWidth > 0) {
        ctx.save();
        const scaleFactor = Math.max(1, canvas.width / 1000);
        const actualStroke = strokeWidth * scaleFactor;
        ctx.filter = `drop-shadow(0 0 ${actualStroke}px ${strokeColor}) drop-shadow(0 0 ${actualStroke/2}px ${strokeColor})`;
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.restore();
    }

    // 4. SUBJECT
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
  const runAI = async () => { if (!originalImage || !worker.current) return; setLoading(true); const r = await fetch(originalImage.src); worker.current.postMessage({ imageBlob: await r.blob() }); };

  return (
    <>
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #d1d5db; }
    `}</style>

    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800 touch-none select-none">
      
      {/* FIXED BRUSH CURSOR */}
      {brushMode !== 'none' && activeTool === 'brush' && (
        <div ref={cursorRef} className="fixed pointer-events-none z-50 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
          style={{ borderColor: brushMode === 'erase' ? 'red' : '#4ade80', backgroundColor: brushMode === 'erase' ? 'rgba(255,0,0,0.1)' : 'rgba(74, 222, 128, 0.1)', boxShadow: '0 0 4px rgba(0,0,0,0.5)', left: '-100px', top: '-100px' }} />
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh]">
        
        {/* --- LEFT SIDEBAR (TABBED STUDIO) --- */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                
                {/* TABS HEADER (FIXED WIDTHS) */}
                <div className="flex border-b border-gray-100 w-full">
                    <button onClick={() => setActiveTab('bg')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-tight transition-colors ${activeTab==='bg' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>BG & Outline</button>
                    <button onClick={() => setActiveTab('shadow')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-tight transition-colors ${activeTab==='shadow' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>Shadow</button>
                    <button onClick={() => setActiveTab('adjust')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-tight transition-colors ${activeTab==='adjust' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>Adjust</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar relative">
                {hasProcessed ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        
                        {/* TAB: BG & OUTLINE */}
                        {activeTab === 'bg' && (
                            <>
                                {/* 1. PRO TIP (PRIORITY) */}
                                <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 flex gap-2 shadow-sm">
                                    <span className="text-violet-500 text-sm">💡</span>
                                    <p className="text-[10px] text-violet-700 font-medium leading-tight pt-0.5">Pro Tip: Apply OUTLINE with Red Color to Verify the Background is Totally Removed.</p>
                                </div>

                                {/* 2. OUTLINE (MOVED UP) */}
                                <div className="border-b border-gray-100 pb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">OUTLINE(STROKE)</label>
                                        <button onClick={() => setStrokeEnabled(!strokeEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${strokeEnabled ? 'bg-violet-600' : 'bg-gray-300'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${strokeEnabled ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className={`transition-all ${strokeEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <input type="range" min="0" max="50" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-violet-600 cursor-pointer mb-3" />
                                        
                                        {/* UNIFIED COLOR PICKER (RAINBOW + ACTIVE) */}
                                        <div className="flex gap-3 items-center">
                                            <div className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition shadow-sm border border-gray-200 flex items-center justify-center bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)]">
                                                <div className="w-4 h-4 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none z-10">
                                                    <span className="text-sm font-bold text-black">+</span>
                                                </div>
                                                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setStrokeColor(e.target.value)} />
                                            </div>
                                            <div className="w-9 h-9 rounded-full border-2 border-gray-100 shadow-inner" style={{backgroundColor: strokeColor}} title="Active Color"></div>
                                            <span className="text-xs text-gray-500">Active Color</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. BACKGROUND COLOR */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Background Color</label>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <button onClick={() => setBgColor('transparent')} className={`w-8 h-8 rounded-full border bg-checkerboard ${bgColor==='transparent'?'ring-2 ring-violet-500 scale-110':''}`} title="Transparent" />
                                        <button onClick={() => setBgColor('#ffffff')} className={`w-8 h-8 rounded-full border bg-white ${bgColor==='#ffffff'?'ring-2 ring-violet-500 scale-110':''}`} title="White" />
                                        <button onClick={() => setBgColor('#000000')} className={`w-8 h-8 rounded-full border bg-black ${bgColor==='#000000'?'ring-2 ring-violet-500 scale-110':''}`} title="Black" />
                                        <div className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition shadow-sm border border-gray-200 flex items-center justify-center"
                                            style={{ backgroundColor: (bgColor === 'transparent' || bgColor === 'gradient') ? 'transparent' : bgColor, backgroundImage: (bgColor === 'transparent' || bgColor === 'gradient') ? 'conic-gradient(at center, red, orange, yellow, green, blue, purple, red)' : 'none' }}>
                                            {(bgColor === 'transparent' || bgColor === 'gradient') && <span className="text-xs font-bold text-gray-600 z-10 bg-white/80 rounded-full px-1">+</span>}
                                            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setBgColor(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. BLUR */}
                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blur Background</label>
                                        <span className="text-xs font-mono text-violet-600">{bgBlur}px</span>
                                    </div>
                                    <input type="range" min="0" max="20" value={bgBlur} onChange={(e) => setBgBlur(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-violet-600 cursor-pointer" />
                                </div>
                            </>
                        )}

                        {/* TAB: SHADOW */}
                        {activeTab === 'shadow' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><IconShadow/> Enable Shadow</label>
                                    <button onClick={() => setShadowEnabled(!shadowEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${shadowEnabled ? 'bg-violet-600' : 'bg-gray-300'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${shadowEnabled ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className={`space-y-5 transition-all ${shadowEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Shadow Color</label>
                                        <div className="flex gap-3 items-center">
                                            {/* Unified Shadow Color Picker */}
                                            <div className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition shadow-sm border border-gray-200 flex items-center justify-center bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)]">
                                                <div className="w-4 h-4 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none z-10">
                                                    <span className="text-sm font-bold text-black">+</span>
                                                </div>
                                                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setShadowColor(e.target.value)} />
                                            </div>
                                            {/* Active Color Display */}
                                            <div className="w-9 h-9 rounded-full border-2 border-gray-100 shadow-inner" style={{backgroundColor: shadowColor}} title="Active Shadow"></div>
                                            <span className="text-xs text-gray-500">Active Color</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Opacity</span><span className="text-xs font-mono">{Math.round(shadowOpacity*100)}%</span></div>
                                        <input type="range" min="0" max="1" step="0.1" value={shadowOpacity} onChange={(e) => setShadowOpacity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-gray-600" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Blur</span><span className="text-xs font-mono">{shadowBlur}px</span></div>
                                        <input type="range" min="0" max="100" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-gray-600" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Offset X</span></div>
                                            <input type="range" min="-400" max="400" value={shadowX} onChange={(e) => setShadowX(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-gray-600" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Offset Y</span></div>
                                            <input type="range" min="-400" max="400" value={shadowY} onChange={(e) => setShadowY(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TAB: ADJUST */}
                        {activeTab === 'adjust' && (
                            <div className="space-y-6">
                                <div>
                                    {/* PRO TIP #2: BRIGHTNESS */}
                                    <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 mb-4 flex gap-2">
                                        <span className="text-violet-500 text-xs">💡</span>
                                        <p className="text-[10px] text-violet-700 font-medium leading-tight pt-0.5">Pro Tip: Adjust subject brightness to match your new background.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500 uppercase">Brightness</label><span className="text-xs font-mono">{brightness}%</span></div>
                                            <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-violet-600" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500 uppercase">Contrast</label><span className="text-xs font-mono">{contrast}%</span></div>
                                            <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-violet-600" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500 uppercase">Saturation</label><span className="text-xs font-mono">{saturation}%</span></div>
                                            <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-violet-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* GLOBAL TOOLS (BRUSH) - ALWAYS AT BOTTOM */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Refine Edge</label>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-3">
                                <button onClick={() => setBrushMode('none')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${brushMode==='none' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>View</button>
                                <button onClick={() => { setBrushMode('restore'); setActiveTool('brush'); }} className={`flex-1 py-2 text-xs font-bold rounded flex justify-center items-center gap-1 transition-all ${brushMode==='restore' ? 'bg-green-50 text-green-700 shadow' : 'text-gray-500'}`}><IconBrush /> Fix</button>
                                <button onClick={() => { setBrushMode('erase'); setActiveTool('brush'); }} className={`flex-1 py-2 text-xs font-bold rounded flex justify-center items-center gap-1 transition-all ${brushMode==='erase' ? 'bg-red-50 text-red-700 shadow' : 'text-gray-500'}`}><IconEraser /> Erase</button>
                            </div>
                            {brushMode !== 'none' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-1"><span className="text-xs text-gray-400">Size</span><span className="text-xs font-mono">{brushSize}px</span></div>
                                    <input type="range" min="10" max="300" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg accent-gray-600" />
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic py-10 text-center flex flex-col items-center justify-center h-full opacity-50 space-y-3">
                        <div className="p-6 bg-violet-50 rounded-full mb-2"><IconMagic /></div>
                        <div>
                            <p className="font-bold text-gray-700 text-lg">Let's Create!</p>
                            <p className="text-xs mt-2 text-gray-500 max-w-[200px]">Upload an image to unlock the<br/>Ultimate AI Studio tools</p>
                        </div>
                    </div>
                )}
                </div>
             </div>
        </div>

        {/* --- MAIN VIEWPORT --- */}
        <div className="lg:col-span-9 h-full flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white z-10 relative">
                    <div className="flex items-center gap-2">
                         <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 mr-4">Ultimate Studio</h1>
                         {hasProcessed && (
                            <>
                                <button onClick={undo} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30" title="Undo"><IconUndo /></button>
                                <button onClick={redo} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30" title="Redo"><IconRedo /></button>
                                <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                <button onClick={() => setActiveTool('hand')} className={`p-2 rounded transition-all ${activeTool === 'hand' ? 'bg-violet-100 text-violet-700' : 'hover:bg-gray-100 text-gray-600'}`} title="Hand Tool"><IconHand /></button>
                                <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                <button onClick={() => setTransform(t=>({...t, scale: t.scale * 1.1}))} className="p-2 hover:bg-gray-100 rounded"><IconZoomIn /></button>
                                <button onClick={() => setTransform(t=>({...t, scale: Math.max(0.1, t.scale * 0.9)}))} className="p-2 hover:bg-gray-100 rounded"><IconZoomOut /></button>
                            </>
                         )}
                    </div>
                    {hasProcessed && (
                        <div className="flex gap-2">
                             <button onClick={() => { setOriginalImage(null); setHasProcessed(false); }} className="text-xs font-bold text-gray-500 hover:text-red-500 px-3 py-2">New</button>
                             <button onClick={() => { const link = document.createElement('a'); link.download = 'studio-edit.png'; link.href = canvasRef.current?.toDataURL() || ''; link.click(); }} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-black transition-all">
                                <IconDownload /> Download
                             </button>
                        </div>
                    )}
                </div>

                <div ref={containerRef} className="flex-1 bg-gray-100 relative overflow-hidden bg-checkerboard"
                    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
                    style={{ touchAction: 'none', cursor: activeTool === 'hand' ? (isPanning.current ? 'grabbing' : 'grab') : (brushMode !== 'none' ? 'none' : 'default') }}>
                    
                    {!originalImage ? (
                         <div {...getRootProps()} className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all ${isDragActive ? "bg-violet-50" : ""}`}>
                             <input {...getInputProps()} />
                             <div className="w-full max-w-xl h-96 border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 hover:border-violet-300 transition-all group">
                                <div className="p-6 bg-violet-100 rounded-full mb-6 group-hover:scale-110 transition-transform"><IconUpload /></div>
                                <p className="font-bold text-2xl text-gray-700">Drag & Drop Image</p>
                                <p className="text-gray-400 mt-2">or click to browse files</p>
                                <div className="mt-6 flex gap-3">
                                    <span className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-600 font-bold">PNG</span>
                                    <span className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-600 font-bold">JPG</span>
                                    <span className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-600 font-bold">WEBP</span>
                                </div>
                             </div>
                         </div>
                    ) : (
                        <>
                            {loading && (
                                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-violet-900 font-bold animate-pulse">{status}</p>
                                </div>
                            )}
                            {!hasProcessed && !loading && (
                                <div className="absolute z-50 inset-0 flex items-center justify-center pointer-events-none">
                                    <button onClick={runAI} className="bg-violet-600 pointer-events-auto hover:bg-violet-700 text-white text-xl font-bold px-12 py-4 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-3">
                                        <IconMagic /> Remove Background
                                    </button>
                                </div>
                            )}
                            <canvas ref={canvasRef} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }} className={`shadow-2xl max-w-none ${!hasProcessed ? 'opacity-50 blur-sm' : ''}`} />
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}