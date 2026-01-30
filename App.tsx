import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import {
  PlusCircle,
  Layout,
  Sparkles,
  ArrowRight,
  Copy,
  RefreshCw,
  Info,
  Palette,
  Trash2,
  Download,
  AlertCircle,
  X,
  Edit3,
  Image,
  Share2,
  Moon,
  Sun
} from 'lucide-react';
import { InfographicData, LayoutType, StyleOptions } from './types';
import { LAYOUT_OPTIONS, NOVA_VIA_BRAND, ACCENT_COLORS, BACKGROUND_COLORS, CORNER_STYLES, BORDER_VARIANTS } from './constants';
import { parseInfographicText, InfographicError } from './services/geminiService';
import InfographicRenderer from './components/InfographicRenderer';

// Step Navigation Types
type StepId = 'input' | 'infographic' | 'export';

interface Step {
  id: StepId;
  label: string;
  icon: React.ReactNode;
  number: number;
}

const STEPS: Step[] = [
  { id: 'input', label: 'Input', icon: <Edit3 size={16} />, number: 1 },
  { id: 'infographic', label: 'Infographic', icon: <Image size={16} />, number: 2 },
  { id: 'export', label: 'Export', icon: <Share2 size={16} />, number: 3 },
];

// Memoized Particles component to prevent re-renders
const StableParticles = React.memo(({ options }: { options: any }) => (
  <Particles
    key="stable-particles"
    id="tsparticles"
    options={options}
    className="w-full h-full"
  />
));

const ErrorToast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1A2633] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl max-w-[90vw] md:max-w-md"
  >
    <AlertCircle className="text-[#8F9185] shrink-0" size={24} />
    <div className="flex-1">
      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 font-heading">System Error</h4>
      <p className="text-sm font-medium leading-tight font-body">{message}</p>
    </div>
    <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X size={18} />
    </button>
  </motion.div>
);

// Inline Step Navigation (inside header)
const StepNavigationInline: React.FC<{
  activeStep: StepId;
  onStepClick: (stepId: StepId) => void;
  hasData: boolean;
  isProcessing: boolean;
}> = ({ activeStep, onStepClick, hasData, isProcessing }) => {
  const getStepStatus = (step: Step): 'completed' | 'active' | 'upcoming' => {
    const stepOrder = { input: 1, infographic: 2, export: 3 };
    const activeOrder = stepOrder[activeStep];
    const currentOrder = stepOrder[step.id];
    
    if (currentOrder < activeOrder) return 'completed';
    if (currentOrder === activeOrder) return 'active';
    return 'upcoming';
  };

  const isStepClickable = (stepId: StepId): boolean => {
    if (stepId === 'input') return true;
    if (stepId === 'infographic') return isProcessing || hasData;
    if (stepId === 'export') return hasData;
    return false;
  };

  return (
    <div className="flex items-center gap-1 md:gap-3">
      {STEPS.map((step, index) => {
        const status = getStepStatus(step);
        const clickable = isStepClickable(step.id);
        
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => clickable && onStepClick(step.id)}
              disabled={!clickable}
              className={`
                flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full transition-all duration-300
                ${status === 'active' 
                  ? 'bg-[#034F80] text-white shadow-md' 
                  : status === 'completed'
                    ? 'bg-[#8F9185]/20 text-[#034F80] hover:bg-[#8F9185]/30'
                    : 'bg-[#EEEDE9] text-[#818181]'
                }
                ${clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'}
              `}
            >
              <span className={`
                w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold
                ${status === 'active' 
                  ? 'bg-white/20' 
                  : status === 'completed'
                    ? 'bg-[#034F80] text-white'
                    : 'bg-[#818181]/20'
                }
              `}>
                {status === 'completed' ? '✓' : step.number}
              </span>
              <span className="hidden md:block text-[11px] md:text-xs font-bold uppercase tracking-wide">
                {step.label}
              </span>
            </button>
            
            {index < STEPS.length - 1 && (
              <div className={`
                w-4 md:w-8 h-0.5 rounded-full transition-colors duration-300
                ${status === 'completed' || (status === 'active' && index === 0) 
                  ? 'bg-[#034F80]' 
                  : 'bg-[#EEEDE9]'
                }
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InfographicData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical-cards');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>('input');
  const [particlesInit, setParticlesInit] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Initialize from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Section refs for scrolling
  const inputSectionRef = useRef<HTMLElement>(null);
  const infographicSectionRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    accentColor: NOVA_VIA_BRAND.accent,
    backgroundColor: BACKGROUND_COLORS[1].value,
    cornerStyle: 'soft',
    borderVariant: 'solid',
  });

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  // Sync dark mode with localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Update document class for global theming
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => !prev);
  };

  // Memoize particles options to prevent reconfiguration on re-renders
  const particlesOptions = useMemo(() => ({
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    particles: {
      color: {
        value: "#FFD700",
      },
      links: {
        color: "#FFD700",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 150,
      },
      opacity: {
        value: 0.6,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  }), []); // Empty dependency array means this only creates once

  // Scroll to section helper
  const scrollToSection = useCallback((stepId: StepId) => {
    const offsets = { input: 100, infographic: 100, export: 100 };
    let targetRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
    
    switch (stepId) {
      case 'input':
        targetRef = inputSectionRef;
        break;
      case 'infographic':
      case 'export':
        targetRef = infographicSectionRef;
        break;
    }
    
    if (targetRef?.current) {
      const yOffset = -offsets[stepId];
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  // Handle step click
  const handleStepClick = useCallback((stepId: StepId) => {
    setActiveStep(stepId);
    scrollToSection(stepId);
  }, [scrollToSection]);

  // Update active step based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const inputTop = inputSectionRef.current?.offsetTop ?? 0;
      const infographicTop = infographicSectionRef.current?.offsetTop ?? 0;
      
      const offset = 200;
      
      if (scrollY < infographicTop - offset) {
        if (activeStep !== 'input' && !isProcessing) {
          setActiveStep('input');
        }
      } else if (data) {
        // If we have data and scrolled to infographic section
        if (activeStep !== 'export' && activeStep !== 'infographic') {
          setActiveStep('export');
        }
      } else if (isProcessing) {
        setActiveStep('infographic');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStep, data, isProcessing]);

  // Auto-advance to infographic step when generating
  useEffect(() => {
    if (isProcessing) {
      setActiveStep('infographic');
      setTimeout(() => scrollToSection('infographic'), 100);
    }
  }, [isProcessing, scrollToSection]);

  // Auto-advance to export step when data is ready
  useEffect(() => {
    if (data && !isProcessing) {
      setActiveStep('export');
    }
  }, [data, isProcessing]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Clarity requires input. Please provide content for your infographic.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const parsedData = await parseInfographicText(inputText);
      setData(parsedData);
    } catch (err: any) {
      const errorMessage = err instanceof InfographicError 
        ? err.message 
        : "Our transformation engine hit a temporary hurdle. Please try again.";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySvg = useCallback(() => {
    const svgElement = exportRef.current?.querySelector('svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      navigator.clipboard.writeText(svgString).then(() => {
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      });
    }
  }, []);

  const exportAsImage = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!exportRef.current) {
      setError('No infographic to export. Please generate one first.');
      return;
    }

    try {
      const node = exportRef.current;
      const fullWidth = node.scrollWidth;
      const fullHeight = node.scrollHeight;
      
      const options = {
        backgroundColor: styleOptions.backgroundColor,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          borderRadius: '0px',
          transform: 'scale(1)',
          overflow: 'visible',
        },
        width: fullWidth,
        height: fullHeight,
      };

      let dataUrl = '';
      
      if (format === 'png') {
        dataUrl = await htmlToImage.toPng(node, options);
      } else if (format === 'jpeg') {
        dataUrl = await htmlToImage.toJpeg(node, { 
          ...options, 
          quality: 0.98,
          backgroundColor: styleOptions.backgroundColor
        });
      } else if (format === 'svg') {
        dataUrl = await htmlToImage.toSvg(node, options);
      }

      if (!dataUrl) {
        throw new Error('Failed to generate image data');
      }

      const link = document.createElement('a');
      link.download = `NovaViA-Infographic-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setError(null);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Export to ${format.toUpperCase()} failed. Please try again or use a different format.`);
    }
  };

  const handleReset = () => {
    setData(null);
    setInputText('');
    setError(null);
    setActiveStep('input');
    scrollToSection('input');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#034F80] selection:text-white transition-colors duration-300 ${
      darkMode ? 'bg-[#0F1419]' : 'bg-[#EEEDE9]'
    }`}>
      <AnimatePresence>
        {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}
      </AnimatePresence>

      {/* Navbar with Step Navigation */}
      <nav className={`h-20 border-b flex items-center justify-between px-4 md:px-10 sticky top-0 z-50 backdrop-blur-sm transition-colors duration-300 ${
        darkMode
          ? 'border-white/10 bg-[#1A2633]/95'
          : 'border-[#2E3B4A]/10 bg-white/95'
      }`}>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center shadow-sm">
            <img src="/novavia-logo.png" alt="NOVA ViA Logo" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black tracking-tighter font-heading" style={{ color: NOVA_VIA_BRAND.primary }}>NOVA ViA</h1>
            <p className={`hidden md:block text-[8px] uppercase tracking-[0.3em] font-black -mt-1 font-body transition-colors duration-300 ${
              darkMode ? 'text-[#8F9185]' : 'text-[#818181]'
            }`}>Design Intelligence</p>
          </div>
        </div>
        
        {/* Centered Step Navigation */}
        <div className="flex-1 flex justify-center">
          <StepNavigationInline
            activeStep={activeStep}
            onStepClick={handleStepClick}
            hasData={!!data}
            isProcessing={isProcessing}
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="w-10 md:w-16 shrink-0 flex items-center justify-end">
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
              darkMode
                ? 'bg-[#034F80] text-white hover:bg-[#045a94]'
                : 'bg-[#EEEDE9] text-[#1A2633] hover:bg-[#034F80] hover:text-white'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* Hero Input Section - Step 1 */}
      <section
        ref={inputSectionRef}
        id="input-section"
        className="bg-[#1A2633] py-12 md:py-20 px-4 md:px-6 flex justify-center items-center relative overflow-hidden isolate"
        style={{ clipPath: 'inset(0)' }}
      >
        {/* Particles Background - Contained wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particlesInit && <StableParticles options={particlesOptions} />}
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                 <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
        
        <div className={`w-full max-w-4xl p-6 md:p-10 shadow-2xl relative z-10 border-t-8 transition-colors duration-300 ${
          darkMode ? 'bg-[#1A2633]' : 'bg-white'
        }`} style={{ borderColor: NOVA_VIA_BRAND.primary }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-bold flex items-center gap-3 text-lg uppercase tracking-tight font-heading transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-[#1A2633]'
            }`}>
              <PlusCircle size={24} style={{ color: NOVA_VIA_BRAND.primary }} />
              Transformation Source
            </h3>
            {data && (
              <button
                onClick={handleReset}
                className={`p-2 rounded-full transition-all ${
                  darkMode
                    ? 'hover:bg-[#0F1419] text-[#8F9185]'
                    : 'hover:bg-[#EEEDE9] text-[#818181]'
                }`}
                title="Reset Workspace"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setActiveStep('input')}
            placeholder="What process shall we visualize with clarity and purpose today?"
            className={`w-full h-32 md:h-44 p-6 border outline-none transition-all resize-none text-lg font-body mb-6 ${
              darkMode
                ? 'bg-[#0F1419] text-white placeholder:text-[#8F9185]/50 focus:bg-[#0F1419] focus:ring-4 focus:ring-[#034F80]/20 border-white/10 focus:border-[#034F80]/40'
                : 'bg-[#EEEDE9]/30 text-[#1A2633] placeholder:text-[#818181]/50 focus:bg-white focus:ring-4 focus:ring-[#034F80]/5 border-transparent focus:border-[#034F80]/20'
            }`}
          />
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-4 md:py-5 font-bold flex items-center justify-center gap-3 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] font-heading tracking-widest text-lg"
            style={{ backgroundColor: NOVA_VIA_BRAND.primary }}
          >
            {isProcessing ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
            {isProcessing ? "ORCHESTRATING..." : "GENERATE TRANSFORMATION"}
          </button>
        </div>
      </section>

      {/* Main Workspace - Steps 2 & 3 */}
      <div
        ref={infographicSectionRef}
        id="infographic-section"
        className={`flex-1 flex flex-col lg:flex-row w-full mx-auto p-4 md:p-12 gap-8 md:gap-16 transition-colors duration-300 ${
          darkMode ? 'bg-[#0F1419]' : 'bg-[#B6C2C0]'
        }`}
      >
        {/* Sidebar Configuration */}
        <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-10">
          {/* Structure Section */}
          <section className="flex flex-col gap-6">
            <h3 className={`font-bold flex items-center gap-3 text-base md:text-lg uppercase tracking-widest font-heading border-b pb-4 transition-colors duration-300 ${
              darkMode
                ? 'text-white border-white/10'
                : 'text-[#1A2633] border-[#2E3B4A]/10'
            }`}>
              <Layout size={20} style={{ color: NOVA_VIA_BRAND.primary }} />
              Geometry & Flow
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {LAYOUT_OPTIONS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`p-5 border transition-all text-left flex flex-col gap-1 ${
                    selectedLayout === layout.id
                      ? darkMode
                        ? 'border-[#034F80] bg-[#1A2633] shadow-xl translate-x-2'
                        : 'border-[#034F80] bg-white shadow-xl translate-x-2'
                      : darkMode
                        ? 'border-white/10 bg-[#1A2633]/50 text-[#8F9185] hover:bg-[#1A2633]'
                        : 'border-[#2E3B4A]/10 bg-white/50 text-[#818181] hover:bg-white'
                  }`}
                >
                  <div className={`text-sm font-black uppercase tracking-widest font-heading ${
                    selectedLayout === layout.id
                      ? 'text-[#034F80]'
                      : darkMode
                        ? 'text-white'
                        : 'text-[#1A2633]'
                  }`}>
                    {layout.label}
                  </div>
                  <div className="text-xs font-medium opacity-70 font-body">
                    {layout.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Aesthetic Values Section */}
          <section className="flex flex-col gap-8">
            <h3 className={`font-bold flex items-center gap-3 text-base md:text-lg uppercase tracking-widest font-heading border-b pb-4 transition-colors duration-300 ${
              darkMode
                ? 'text-white border-white/10'
                : 'text-[#1A2633] border-[#2E3B4A]/10'
            }`}>
              <Palette size={20} style={{ color: NOVA_VIA_BRAND.accent }} />
              Aesthetic Values
            </h3>

            <div className="space-y-4">
              <label className={`text-xs font-bold uppercase tracking-[0.2em] font-heading transition-colors duration-300 ${
                darkMode ? 'text-[#8F9185]' : 'text-[#818181]'
              }`}>Atmosphere</label>
              <div className="flex flex-wrap gap-3">
                {BACKGROUND_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setStyleOptions(prev => ({ ...prev, backgroundColor: color.value }))}
                    className={`w-9 h-9 border-2 transition-all ${
                      styleOptions.backgroundColor === color.value
                        ? 'border-[#034F80] scale-110 shadow-md ring-4 ring-[#034F80]/5'
                        : darkMode
                          ? 'border-white/20 hover:border-white/40'
                          : 'border-white hover:border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className={`text-xs font-bold uppercase tracking-[0.2em] font-heading transition-colors duration-300 ${
                darkMode ? 'text-[#8F9185]' : 'text-[#818181]'
              }`}>Accentuation</label>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setStyleOptions(prev => ({ ...prev, accentColor: color.value }))}
                    className={`w-9 h-9 border-4 transition-all ${
                      styleOptions.accentColor === color.value
                        ? darkMode
                          ? 'border-white scale-110 shadow-xl'
                          : 'border-[#1A2633] scale-110 shadow-xl'
                        : darkMode
                          ? 'border-white/20 opacity-60 hover:opacity-100 shadow-sm'
                          : 'border-white opacity-60 hover:opacity-100 shadow-sm'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className={`text-xs font-bold uppercase tracking-[0.2em] font-heading transition-colors duration-300 ${
                darkMode ? 'text-[#8F9185]' : 'text-[#818181]'
              }`}>Intentional Edge</label>
              <div className="flex gap-2">
                {CORNER_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setStyleOptions(prev => ({ ...prev, cornerStyle: style.id as any }))}
                    className={`flex-1 py-4 text-xs font-bold border transition-all uppercase tracking-widest font-heading ${
                      styleOptions.cornerStyle === style.id
                        ? 'border-[#034F80] bg-[#034F80] text-white shadow-lg'
                        : darkMode
                          ? 'border-white/10 bg-[#1A2633] text-[#8F9185]'
                          : 'border-[#2E3B4A]/10 bg-white text-[#818181]'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* Live Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
            <h3 className={`font-bold flex items-center gap-3 uppercase tracking-[0.4em] text-base md:text-lg font-heading transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-[#1A2633]'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#8F9185] animate-pulse" />
            </h3>
            {data && (
              <div
                id="export-section"
                className="flex flex-wrap items-center gap-3 w-full sm:w-auto"
              >
                <div className={`flex flex-col sm:flex-row shadow-sm border p-1 gap-1 sm:gap-0 w-full sm:w-auto transition-colors duration-300 ${
                  darkMode
                    ? 'bg-[#1A2633] border-white/10'
                    : 'bg-white border-[#2E3B4A]/10'
                }`}>
                  <button
                    onClick={() => exportAsImage('png')}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold transition-all uppercase tracking-widest font-heading flex items-center gap-2 justify-center ${
                      darkMode
                        ? 'text-white hover:bg-[#034F80]'
                        : 'text-[#1A2633] hover:bg-[#EEEDE9]'
                    }`}
                  >
                    <Download size={14} /> PNG
                  </button>
                  <button
                    onClick={() => exportAsImage('jpeg')}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold transition-all uppercase tracking-widest font-heading flex items-center justify-center ${
                      darkMode
                        ? 'text-white hover:bg-[#034F80]'
                        : 'text-[#1A2633] hover:bg-[#EEEDE9]'
                    }`}
                  >
                    JPG
                  </button>
                  <button
                    onClick={() => exportAsImage('svg')}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold transition-all uppercase tracking-widest font-heading flex items-center justify-center ${
                      darkMode
                        ? 'text-white hover:bg-[#034F80]'
                        : 'text-[#1A2633] hover:bg-[#EEEDE9]'
                    }`}
                  >
                    SVG
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex-1 min-h-[600px] md:min-h-[850px] border flex items-start justify-center p-6 md:p-16 overflow-x-auto overflow-y-visible shadow-sm relative transition-colors duration-700 ${
              darkMode
                ? 'bg-[#1A2633] border-white/5'
                : 'bg-white border-[#2E3B4A]/5'
            }`}
          >
            <AnimatePresence mode="wait">
              {data ? (
                <motion.div 
                  key={`${selectedLayout}-${JSON.stringify(styleOptions)}-${data.title}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 w-full"
                  ref={exportRef}
                >
                  <InfographicRenderer data={data} layout={selectedLayout} styles={styleOptions} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center max-w-lg m-auto py-24 px-4"
                >
                  <div className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shadow-inner mx-auto mb-10 border transform transition-all hover:scale-105 ${
                    darkMode
                      ? 'bg-[#0F1419] text-[#8F9185]/30 border-white/10'
                      : 'bg-[#EEEDE9] text-[#818181]/30 border-white'
                  }`}>
                    {isProcessing ? <RefreshCw className="animate-spin md:w-14 md:h-14" /> : <ArrowRight size={40} className="md:w-16 md:h-16" />}
                  </div>
                  <h4 className={`text-2xl md:text-3xl font-bold mb-4 tracking-tight uppercase font-heading transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-[#1A2633]'
                  }`}>
                    {isProcessing ? "Designing Your Blueprint" : "The Path of Visual Clarity"}
                  </h4>
                  <p className={`text-sm md:text-lg font-medium leading-relaxed font-body transition-colors duration-300 ${
                    darkMode ? 'text-[#8F9185]' : 'text-[#818181]'
                  }`}>
                    {isProcessing
                      ? "Orchestrating layout geometry and content hierarchy for a professional human-centered result."
                      : "Describe your evolution, mission, or steps above to manifest a purposeful visual roadmap."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 opacity-[0.01] pointer-events-none z-[-1] overflow-hidden">
              <Sparkles className="absolute -bottom-40 -left-40" size={800} />
            </div>
          </div>
        </div>
      </div>

      <footer className={`py-10 border-t flex flex-col items-center justify-center shrink-0 px-4 text-center gap-4 transition-colors duration-300 ${
        darkMode
          ? 'border-white/5 bg-[#1A2633] text-[#8F9185]'
          : 'border-[#2E3B4A]/5 bg-white text-[#818181]'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
            <img src="/novavia-logo.png" alt="NOVA ViA Logo" />
          </div>
          <span className={`text-[20px] font-black uppercase tracking-[0.5em] font-heading transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-[#1A2633]'
          }`}>Nova ViA</span>
        </div>
        <p className="text-[13px] uppercase tracking-[0.3em] font-bold opacity-100 font-body">
          &copy; 2026 Nova ViA Infographic Generator - All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default App;