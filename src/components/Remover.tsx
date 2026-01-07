"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

// --- ICONS ---
const IconBrush = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const IconEraser = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const IconUndo = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconRedo = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>;
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
  
  // Performance State
  const [isInteracting, setIsInteracting] = useState(false); // New: To disable heavy effects while dragging

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
  const rafRef = useRef<number | null>(null); // For animation frame throttling
  
  // Gesture Refs
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 }); 
  const initialPinchDist = useRef<number | null>(null);
  const initialScale = useRef(1);

  // --- 1. WORKER & INIT ---
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../app/worker.js', import.meta.url), { type: 'module' });
      worker.current.onmessage = async (e) => {
        const { status, blob, progress } = e.data;
        if (status === 'loading') setStatus(progress ? `AI Analyzing... ${Math.round(progress)}%` : "Loading Model...");
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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const subjectCanvas = subjectCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (!canvas || !ctx || !originalImage || !subjectCanvas || !maskCanvas) return;

        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- BACKGROUND ---
        if (bgColor !== 'transparent') {
            if (bgColor === 'gradient') {
                const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                grad.addColorStop(0, "#8EC5FC"); grad.addColorStop(1, "#E0C3FC");
                ctx.fillStyle = grad;
            } else { ctx.fillStyle = bgColor; }
            
            // Only apply blur if NOT interacting (Speed Hack)
            if (bgColor === 'transparent' && bgBlur > 0) {
                ctx.save(); 
                if (!isInteracting) ctx.filter = `blur(${bgBlur}px)`; 
                ctx.drawImage(originalImage, 0, 0); 
                ctx.restore();
            } else if (bgColor !== 'transparent') {
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        } else if (bgBlur > 0) {
            ctx.save(); 
            if (!isInteracting) ctx.filter = `blur(${bgBlur}px)`; 
            ctx.drawImage(originalImage, 0, 0); 
            ctx.restore();
        }

        // --- SHADOW (Disabled during interaction for FPS) ---
        if (shadowEnabled) {
            ctx.save();
            ctx.translate(shadowX, shadowY);
            ctx.globalAlpha = shadowOpacity;
            if (!isInteracting) ctx.filter = `drop-shadow(0 0 ${shadowBlur}px ${shadowColor})`;
            ctx.drawImage(maskCanvas, 0, 0); 
            ctx.restore();
        }

        // --- STROKE (Disabled during interaction for FPS) ---
        if (strokeEnabled && strokeWidth > 0) {
            ctx.save();
            const scaleFactor = Math.max(1, canvas.width / 1000);
            const actualStroke = strokeWidth * scaleFactor;
            // Only render complex double-shadow stroke when not moving
            if (!isInteracting) {
                ctx.filter = `drop-shadow(0 0 ${actualStroke}px ${strokeColor}) drop-shadow(0 0 ${actualStroke/2}px ${strokeColor})`;
            } else {
                // Simple stroke for speed when moving
                ctx.filter = `drop-shadow(0 0 ${actualStroke}px ${strokeColor})`;
            }
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.restore();
        }

        // --- SUBJECT ---
        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(subjectCanvas, 0, 0);
        ctx.restore();
    });

  }, [bgColor, bgBlur, shadowEnabled, shadowColor, shadowBlur, shadowX, shadowY, shadowOpacity, strokeEnabled, strokeWidth, strokeColor, brightness, contrast, saturation, originalImage, isInteracting]);

  useEffect(() => {
    if (!hasProcessed) return;
    renderMainCanvas();
  }, [renderMainCanvas, hasProcessed]);

  // --- 3. INPUT HANDLING ---
  const getPointerPos = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
        x: (clientX - rect.left - transform.x) / transform.scale,
        y: (clientY - rect.top - transform.y) / transform.scale,
        windowX: clientX, windowY: clientY
    };
  };

  const handlePointerDown = (e: any) => {
    if (!hasProcessed) return;
    setIsInteracting(true); // Start Performance Mode
    
    // Check for Two-Finger Touch
    if (e.touches && e.touches.length === 2) {
        isDragging.current = true;
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialPinchDist.current = dist;
        initialScale.current = transform.scale;
        lastPos.current = { 
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2, 
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2 
        };
        return;
    }

    let clientX = e.clientX; 
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) { 
        clientX = e.touches[0].clientX; 
        clientY = e.touches[0].clientY; 
    }

    isDragging.current = true;
    lastPos.current = { x: clientX, y: clientY };

    if (activeTool === 'brush' && brushMode !== 'none') {
        const pos = getPointerPos(clientX, clientY);
        lastPos.current = { x: pos.x, y: pos.y }; 
        draw(pos);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!hasProcessed) return;

    if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const dx = midX - lastPos.current.x;
        const dy = midY - lastPos.current.y;
        
        let newScale = transform.scale;
        if (initialPinchDist.current) {
            newScale = initialScale.current * (dist / initialPinchDist.current);
        }

        setTransform(p => ({ scale: newScale, x: p.x + dx, y: p.y + dy }));
        lastPos.current = { x: midX, y: midY };
        return;
    }

    let clientX = e.clientX; 
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) { 
        clientX = e.touches[0].clientX; 
        clientY = e.touches[0].clientY; 
    }

    if (cursorRef.current && activeTool === 'brush' && brushMode !== 'none') {
        cursorRef.current.style.left = `${clientX}px`; cursorRef.current.style.top = `${clientY}px`;
        const size = brushSize * transform.scale; cursorRef.current.style.width = `${size}px`; cursorRef.current.style.height = `${size}px`;
    }

    if (!isDragging.current) return;

    if (activeTool === 'hand' || e.buttons === 4) {
        const dx = clientX - lastPos.current.x;
        const dy = clientY - lastPos.current.y;
        setTransform(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
        lastPos.current = { x: clientX, y: clientY };
        return;
    }

    if (activeTool === 'brush' && brushMode !== 'none') {
        const pos = getPointerPos(clientX, clientY);
        draw(pos);
    }
  };

  const handlePointerUp = () => {
    setIsInteracting(false); // End Performance Mode (High Quality comes back)
    if (activeTool === 'brush' && isDragging.current) { saveHistory(); }
    isDragging.current = false;
    initialPinchDist.current = null;
  };

  const draw = (pos: { x: number, y: number }) => {
    if (brushMode === 'none' || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d'); if (!ctx) return;
    ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brushSize;
    if (activeTool === 'brush') {
         ctx.moveTo(lastPos.current.x, lastPos.current.y);
         ctx.lineTo(pos.x, pos.y);
    }
    ctx.globalCompositeOperation = brushMode === 'erase' ? 'destination-out' : 'source-over'; ctx.strokeStyle = brushMode === 'erase' ? 'rgba(0,0,0,1)' : 'white';
    ctx.stroke(); 
    lastPos.current = { x: pos.x, y: pos.y };
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
  
  // --- ROBUST AI RUNNER (Fixes "Delete Everything") ---
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
    
    // PRECISION FIX: 1024px gives better accuracy than 1280px for standard models
    const MAX_SIZE = 1024; 
    let w = originalImage.width; let h = originalImage.height;
    if (w > MAX_SIZE || h > MAX_SIZE) { const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h); w = Math.round(w * ratio); h = Math.round(h * ratio); }
    
    const tempCanvas = document.createElement('canvas'); 
    tempCanvas.width = w; tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d'); 
    
    // SAFETY: Ensure image is drawn
    if(ctx) {
        ctx.drawImage(originalImage, 0, 0, w, h);
        tempCanvas.toBlob(async (blob) => { 
            if(blob) worker.current?.postMessage({ imageBlob: blob }); 
        }, 'image/jpeg', 0.8); // 0.8 Quality is faster
    }
  };

  return (
    <>
    <style jsx global>{`
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      .bg-checkerboard { background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
    `}</style>

    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden select-none">
      
      {brushMode !== 'none' && activeTool === 'brush' && (
        <div ref={cursorRef} className="fixed pointer-events-none z-50 rounded-full border border-white/50 ring-1 ring-black/50 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: brushMode === 'erase' ? 'rgba(255,0,0,0.2)' : 'rgba(74, 222, 128, 0.2)', left: '-100px', top: '-100px' }} />
      )}

      <div className={`flex-1 flex flex-col relative bg-slate-50/50 order-1 md:order-2 ${!originalImage ? 'h-full' : 'h-[60vh] md:h-full'}`}>
         
         <div className="h-14 md:h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <span className="text-lg md:text-xl font-bold text-blue-700">FreeBgAI</span>
                {hasProcessed && (
                    <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
                        <button onClick={undo} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"><IconUndo/></button>
                        <button onClick={redo} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"><IconRedo/></button>
                        <div className="w-px h-4 bg-slate-200 mx-2"/>
                        <button onClick={() => setActiveTool('hand')} className={`p-2 rounded-md ${activeTool === 'hand' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}><IconHand/></button>
                    </div>
                )}
            </div>
            {hasProcessed && (
                <div className="flex items-center gap-2">
                    <button onClick={() => { setOriginalImage(null); setHasProcessed(false); }} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-red-500 px-3 py-2 hover:bg-red-50 rounded-md">New</button>
                    <button onClick={() => { const link = document.createElement('a'); link.download = 'freebgai-edit.png'; link.href = canvasRef.current?.toDataURL() || ''; link.click(); }} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-[10px] md:text-xs font-bold">
                        <IconDownload /> <span className="hidden md:inline">Download</span>
                    </button>
                </div>
            )}
         </div>

         <div ref={containerRef} className={`flex-1 relative ${!originalImage ? 'overflow-y-auto' : 'overflow-hidden'} bg-checkerboard cursor-grab active:cursor-grabbing`}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onTouchMove={handlePointerMove} onTouchStart={handlePointerDown} onTouchEnd={handlePointerUp}
            style={{ touchAction: 'none', cursor: activeTool === 'hand' ? (isDragging.current ? 'grabbing' : 'grab') : (brushMode !== 'none' ? 'none' : 'default') }}>
            
            {hasProcessed && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-slate-200 md:hidden">
                    <button onClick={undo} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"><IconUndo /></button>
                    <button onClick={() => setActiveTool(activeTool === 'brush' ? 'hand' : 'brush')} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 ${activeTool==='brush' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        {activeTool === 'brush' ? <IconBrush/> : <IconHand/>}
                    </button>
                    <button onClick={redo} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"><IconRedo /></button>
                </div>
            )}

            {!originalImage ? (
                <div className="min-h-full flex flex-col items-center p-4 md:p-8 pb-32">
                        <div {...getRootProps()} className={`w-full max-w-2xl h-[300px] md:h-[400px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-white/50 transition-all cursor-pointer group bg-white/40 backdrop-blur-sm mb-12 ${isDragActive ? "bg-blue-50/50" : ""}`}>
                            <input {...getInputProps()} />
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-blue-600"><IconUpload /></div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Upload Image</h2>
                            <p className="text-slate-500 mb-6 text-sm">Drag & drop or tap to browse</p>
                        </div>
                        <div className="max-w-4xl w-full text-slate-600 px-2">
                             <div className="text-center mb-12">
                                <h1 className="text-2xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">Unlimited Local <br/><span className="text-blue-600">Background Remover</span></h1>
                                <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto">FreeBgAI removes backgrounds in your browser. Photos never leave your device. 100% Free & Private.</p>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div>
                                    <h2 className="text-xl font-bold mb-3 text-slate-800">For Creators</h2>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Add <strong>white outline</strong> instantly.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Download transparent PNGs.</span></li>
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-3 text-slate-800">For E-Commerce</h2>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Convert to <strong>pure white</strong> background.</span></li>
                                        <li className="flex gap-2 items-center"><IconCheck/><span className="text-sm">Add realistic <strong>drop shadows</strong>.</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                </div>
            ) : (
                <>
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-blue-900 font-bold text-sm animate-pulse">{status}</p>
                        </div>
                    )}
                    {!hasProcessed && !loading && (
                        <div className="absolute z-50 inset-0 flex items-center justify-center pointer-events-none">
                            <button onClick={runAI} className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-3 rounded-full shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                <span>⚡</span> Remove BG
                            </button>
                        </div>
                    )}
                    <canvas ref={canvasRef} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }} className={`shadow-2xl transition-opacity duration-500 ${!hasProcessed ? 'opacity-50 blur-sm grayscale' : ''}`} />
                </>
            )}
         </div>
      </div>

      <div className={`flex-shrink-0 flex flex-col border-t md:border-t-0 md:border-r border-slate-200 bg-white z-20 shadow-lg order-2 md:order-1 
            ${!originalImage ? 'hidden md:flex md:w-[320px]' : 'w-full h-[40vh] md:h-full md:w-[320px] flex'}`}>
         
         <div className="flex border-b border-slate-100 bg-slate-50 flex-shrink-0">
            {['bg', 'shadow', 'adjust'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 md:py-4 text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${activeTab===t ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400'}`}>
                    {t==='bg' ? 'BG & Outline' : t}
                </button>
            ))}
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {hasProcessed ? (
                <div className="p-4 md:p-6 space-y-6 md:space-y-8 pb-20 md:pb-6">
                    {activeTab === 'bg' && (
                        <>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 uppercase">Outline</label>
                                <button onClick={() => setStrokeEnabled(!strokeEnabled)} className={`w-9 h-5 rounded-full relative transition-colors ${strokeEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${strokeEnabled ? 'left-5' : 'left-1'}`} /></button>
                            </div>
                            <div className={`${strokeEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                <input type="range" min="0" max="50" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full h-8 md:h-1.5 accent-blue-600" />
                                <div className="flex gap-2 mt-2"><input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" /></div>
                            </div>
                            <hr className="border-slate-100"/>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Background</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setBgColor('transparent')} className="w-8 h-8 rounded-full border border-slate-200 bg-checkerboard" />
                                    <button onClick={() => setBgColor('#ffffff')} className="w-8 h-8 rounded-full border border-slate-200 bg-white" />
                                    <button onClick={() => setBgColor('#000000')} className="w-8 h-8 rounded-full border border-slate-200 bg-black" />
                                    <input type="color" onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer p-0 border-0" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'shadow' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-700 uppercase">Enable Shadow</label><button onClick={() => setShadowEnabled(!shadowEnabled)} className={`w-9 h-5 rounded-full relative transition-colors ${shadowEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all ${shadowEnabled ? 'left-5' : 'left-1'}`} /></button></div>
                            <div className={`${shadowEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} space-y-4`}>
                                <div className="space-y-1"><span className="text-xs text-slate-500">Opacity</span><input type="range" min="0" max="1" step="0.1" value={shadowOpacity} onChange={(e)=>setShadowOpacity(Number(e.target.value))} className="w-full h-8 md:h-1.5 accent-slate-500" /></div>
                                <div className="space-y-1"><span className="text-xs text-slate-500">Blur</span><input type="range" min="0" max="100" value={shadowBlur} onChange={(e)=>setShadowBlur(Number(e.target.value))} className="w-full h-8 md:h-1.5 accent-slate-500" /></div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'adjust' && (
                         <div className="space-y-4">
                            {[{l:'Brightness', v:brightness, s:setBrightness}, {l:'Contrast', v:contrast, s:setContrast}].map((i,k) => (
                                <div key={k} className="space-y-1">
                                    <span className="text-xs font-bold text-slate-600 uppercase">{i.l}</span>
                                    <input type="range" min="0" max="200" value={i.v} onChange={(e)=>i.s(Number(e.target.value))} className="w-full h-8 md:h-1.5 accent-blue-600" />
                                </div>
                            ))}
                         </div>
                    )}
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
                                <input type="range" min="10" max="300" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-8 md:h-1.5 accent-slate-500" />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <IconLayers />
                    <p className="text-sm font-bold text-slate-400 mt-4">No Image</p>
                </div>
            )}
         </div>
      </div>

    </div>
    </>
  );
}