
import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { InfographicData, LayoutType, StyleOptions } from '../types';
import { NOVA_VIA_BRAND, CORNER_STYLES } from '../constants';
import IconRenderer from './IconRenderer';

interface Props { 
  data: InfographicData;
  layout: LayoutType;
  styles: StyleOptions;
}

const InfographicRenderer: React.FC<Props> = ({ data, layout, styles }) => {
  const { title, subtitle, steps } = data;
  const accent = styles.accentColor;
  const bg = styles.backgroundColor;
  const DARK_BACKGROUNDS = ['#1a2633', '#818181'];
  const isDarkBackground = DARK_BACKGROUNDS.includes(bg.toLowerCase());

  // Helper function to check if a color is dark
  const isColorDark = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const isAccentDark = isColorDark(accent);

  // Dynamic color system for dark/light backgrounds
  const titleColor = isDarkBackground ? '#ffffff' : NOVA_VIA_BRAND.text;
  const subtitleColor = isDarkBackground ? '#e4dfd9' : '#818181';

  // Card text colors based on accent color (cards will use accent as background)
  const cardTitleColor = isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.text;
  const cardDescriptionColor = isAccentDark ? '#e4dfd9' : '#2E3B4A';
  const cardLabelColor = isAccentDark ? '#8f9185' : '#818181';

  const borderColor = isDarkBackground ? 'rgba(255, 255, 255, 0.1)' : '#2E3B4A20';


  const getRadius = () => {
    return CORNER_STYLES.find(s => s.id === styles.cornerStyle)?.radius || '0px';
  };

  const getBorderStyle = (colorOverride?: string) => {
    const type = styles.borderVariant === 'dashed' ? 'dashed' : 'solid';
    const color = colorOverride || borderColor;
    if (styles.borderVariant === 'none') return 'none';
    return `1px ${type} ${color}`;
  };

  // Card background uses accent color for visual impact
  const getCardBackground = () => {
    return accent; // Use accent color directly for cards
  };

  const commonCardStyles = (idx: number) => ({
    borderRadius: getRadius(),
    border: getBorderStyle(),
    background: getCardBackground(),
    boxShadow: isDarkBackground
      ? '0 20px 40px -12px rgba(0, 0, 0, 0.4)'
      : '0 20px 40px -12px rgba(26, 38, 51, 0.12)',
  });

  const renderVertical = () => {
    return (
      <div className="flex flex-col gap-10 w-full max-w-4xl mx-auto p-10 md:p-20 shadow-2xl relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg }}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
             style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 50%, ${NOVA_VIA_BRAND.primary} 100%)` }} />

        <header className="mb-12 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-normal font-elegant mb-2"
            style={{ color: titleColor }}
          >
            {title}
          </motion.h2>
          {subtitle && <p className="mt-4 text-base md:text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
          <div className="h-1 w-24 mx-auto mt-8 rounded-full shadow-lg" style={{ background: `linear-gradient(90deg, ${NOVA_VIA_BRAND.primary}, ${accent})` }} />
        </header>
        <div className="space-y-10 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-start sm:items-stretch gap-8 p-10 border-l-4 sm:border-l-[12px] hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              style={{
                ...commonCardStyles(idx),
                borderLeftColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent,
              }}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none"
                   style={{ background: `linear-gradient(135deg, ${idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent}, transparent)` }} />

              <div
                className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white font-bold text-xl md:text-2xl font-heading shadow-xl relative overflow-hidden z-10 group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: NOVA_VIA_BRAND.primary,
                  borderRadius: getRadius()
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {step.number < 10 ? `0${step.number}` : step.number}
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 rounded-full transition-all duration-300 shadow-sm"
                       style={{ backgroundColor: isAccentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <IconRenderer name={step.iconName} size={24} style={{ color: isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.primary }} />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold font-heading uppercase tracking-tight" style={{ color: cardTitleColor }}>{step.title}</h3>
                </div>
                <p className="leading-relaxed text-base md:text-lg font-body opacity-80" style={{ color: cardDescriptionColor }}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderHorizontal = () => {
    return (
      <div className="p-10 md:p-24 shadow-2xl inline-block min-w-full lg:min-w-0 relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg }}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
             style={{ background: `radial-gradient(circle at top right, ${accent} 0%, transparent 60%)` }} />

        <header className="mb-20 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-normal font-elegant"
            style={{ color: titleColor }}
          >
            {title}
          </motion.h2>
          {subtitle && <p className="mt-6 text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
        </header>
        <div className="flex flex-col md:flex-row gap-10 items-stretch relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="w-full md:w-[320px] lg:w-[360px] flex flex-col p-10 relative group hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              style={commonCardStyles(idx)}
            >
              {/* Gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-60"
                   style={{ background: `linear-gradient(90deg, ${idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent}, transparent)` }} />

              <div className="absolute -top-6 left-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white font-bold text-lg md:text-xl font-heading shadow-2xl group-hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                   style={{ backgroundColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent, borderRadius: getRadius() }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {step.number}
              </div>
              <div className="mt-8 mb-8 p-5 rounded-lg inline-flex self-start transition-all duration-300 shadow-sm"
                   style={{ backgroundColor: isAccentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <IconRenderer name={step.iconName} size={48} style={{ color: isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.primary }} />
              </div>
              <h3 className="text-2xl font-bold mb-6 leading-tight font-heading uppercase tracking-tight" style={{ color: cardTitleColor }}>{step.title}</h3>
              <p className="text-sm md:text-base leading-relaxed font-body opacity-80 flex-1" style={{ color: cardDescriptionColor }}>{step.description}</p>

              {/* Bottom gradient accent */}
              <div className="absolute bottom-0 left-0 right-0 h-2 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                   style={{ background: `linear-gradient(90deg, transparent, ${idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent}, transparent)` }} />

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-20 p-3 shadow-xl rounded-full transition-all duration-300 group-hover:scale-110"
                     style={{ backgroundColor: getCardBackground(), border: `2px solid ${borderColor}` }}>
                   <LucideIcons.ChevronRight style={{ color: isDarkBackground ? '#ffffff' : NOVA_VIA_BRAND.primary }} size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // const renderRadial = () => {
  //   const svgSize = Math.min(window.innerWidth - 100, 900);
  //   const centerX = svgSize / 2;
  //   const centerY = svgSize / 2;
  //   const radius = svgSize * 0.32;
  //   const stepCount = steps.length;

  //   return (
  //     <div className="flex flex-col items-center justify-center p-12 md:p-24 shadow-2xl border border-white inline-block" style={{ borderRadius: getRadius(), backgroundColor: bg }}>
  //       <header className="mb-10 text-center max-w-3xl">
  //         <h2 className="text-3xl md:text-5xl font-normal font-elegant" style={{ color: titleColor }}>{title}</h2>
  //         {subtitle && <p className="text-[#818181] mt-4 text-lg md:text-xl font-body italic">{subtitle}</p>}
  //       </header>
  //       <div className="relative" style={{ width: svgSize, height: svgSize }}>
  //          <motion.div 
  //            initial={{ scale: 0, rotate: -45 }}
  //            animate={{ scale: 1, rotate: 0 }}
  //            transition={{ duration: 1, ease: "circOut" }}
  //            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-80 md:h-80 border-4 border-[#EEEDE9] bg-white shadow-2xl flex flex-col items-center justify-center p-8 text-center z-20"
  //            style={{ borderRadius: getRadius() }}
  //          >
  //            <IconRenderer name="Sparkles" size={48} className="md:w-16 md:h-16 mb-4" style={{ color: NOVA_VIA_BRAND.primary }} />
  //            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-[#818181] font-heading mb-2">Transformation Hub</p>
  //            <p className="text-xl md:text-3xl font-bold font-heading uppercase tracking-tighter" style={{ color: NOVA_VIA_BRAND.primary }}>{title.split(' ')[0]}</p>
  //          </motion.div>

  //          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
  //            {steps.map((_, idx) => {
  //              const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
  //              const x = centerX + radius * Math.cos(angle);
  //              const y = centerY + radius * Math.sin(angle);
  //              return (
  //                <line 
  //                  key={`line-${idx}`}
  //                  x1={centerX} y1={centerY} x2={x} y2={y}
  //                  stroke={NOVA_VIA_BRAND.primary} strokeOpacity="0.08" strokeWidth="2" 
  //                  strokeDasharray={styles.borderVariant === 'dashed' ? '12,12' : 'none'}
  //                />
  //              );
  //            })}
  //          </svg>

  //          {steps.map((step, idx) => {
  //            const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
  //            const x = centerX + radius * Math.cos(angle);
  //            const y = centerY + radius * Math.sin(angle);
             
  //            return (
  //              <motion.div 
  //                key={step.id}
  //                initial={{ opacity: 0, scale: 0.5 }}
  //                animate={{ opacity: 1, scale: 1 }}
  //                transition={{ delay: idx * 0.1, duration: 0.8 }}
  //                className="absolute w-40 md:w-64 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 md:p-8 shadow-2xl text-center group"
  //                style={{ left: x, top: y, borderRadius: getRadius(), border: getBorderStyle() }}
  //              >
  //                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white text-sm md:text-lg font-bold font-heading mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform"
  //                     style={{ backgroundColor: NOVA_VIA_BRAND.primary }}>
  //                  {step.number}
  //                </div>
  //                <h4 className="text-sm md:text-xl font-bold mb-3 font-heading uppercase tracking-tight" style={{ color: NOVA_VIA_BRAND.text }}>{step.title}</h4>
  //                <p className="text-[10px] md:text-sm text-[#2E3B4A] leading-relaxed font-body opacity-70 line-clamp-3">{step.description}</p>
  //              </motion.div>
  //            );
  //          })}
  //       </div>
  //     </div>
  //   );
  // };

  const renderTimeline = () => {
    return (
      <div className="w-full max-w-5xl p-10 md:p-24 shadow-2xl mx-auto relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg, border: getBorderStyle() }}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
             style={{ background: `linear-gradient(180deg, ${accent} 0%, transparent 30%, transparent 70%, ${NOVA_VIA_BRAND.primary} 100%)` }} />

        <header className="mb-20 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-normal font-elegant"
            style={{ color: titleColor }}
          >
            {title}
          </motion.h2>
          {subtitle && <p className="mt-6 text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
        </header>
        <div className="relative max-w-4xl mx-auto">
          {/* Enhanced timeline with gradient */}
          <div className="absolute left-6 sm:left-1/2 transform sm:-translate-x-1/2 h-full w-1 md:w-3 rounded-full overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundColor: isDarkBackground ? 'rgba(255,255,255,0.1)' : '#EEEDE9' }} />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full"
              style={{ background: `linear-gradient(180deg, ${NOVA_VIA_BRAND.primary}, ${accent})`, opacity: 0.3 }}
            />
          </div>

          <div className="space-y-20 md:space-y-32 py-10 relative z-10">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex items-center w-full flex-row sm:${isEven ? 'flex-row-reverse' : 'flex-row'} group`}
                >
                  <div className="hidden sm:block sm:w-5/12"></div>
                  <div className="w-16 sm:w-2/12 flex justify-center relative z-10 shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 md:w-20 md:h-20 border-4 md:border-[12px] shadow-2xl flex items-center justify-center text-white text-lg md:text-3xl font-bold font-heading relative overflow-hidden rounded-full"
                      style={{ backgroundColor: NOVA_VIA_BRAND.primary, borderColor: isDarkBackground ? 'rgba(255,255,255,0.2)' : '#ffffff' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      {step.number}
                    </motion.div>
                  </div>
                  <div className={`flex-1 sm:w-5/12 text-left sm:${isEven ? 'text-right' : 'text-left'} p-8 md:p-12 shadow-2xl group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 relative overflow-hidden`}
                       style={{ borderRadius: getRadius(), border: getBorderStyle(), backgroundColor: getCardBackground() }}>
                    {/* Card gradient accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none"
                         style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />

                    <div className={`flex items-center gap-4 mb-6 flex-row sm:${isEven ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className="p-3.5 shadow-md rounded-lg group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: isAccentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                         <IconRenderer name={step.iconName} size={28} style={{ color: isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.primary }} />
                       </div>
                       <h3 className="text-xl md:text-3xl font-bold font-heading uppercase tracking-tight" style={{ color: cardTitleColor }}>{step.title}</h3>
                    </div>
                    <p className="text-sm md:text-lg leading-relaxed font-body opacity-80" style={{ color: cardDescriptionColor }}>{step.description}</p>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // const renderCircularProgress = () => {
  //   const svgSize = Math.min(window.innerWidth - 80, 1000);
  //   const centerX = svgSize / 2;
  //   const centerY = svgSize / 2;
  //   const radius = svgSize * 0.35;
  //   const stepCount = steps.length;

  //   return (
  //     <div className="flex flex-col items-center justify-center p-12 md:p-24 shadow-2xl border border-white inline-block" style={{ borderRadius: getRadius(), backgroundColor: bg }}>
  //       <header className="mb-16 text-center max-w-4xl">
  //         <h2 className="text-4xl md:text-6xl font-normal font-elegant tracking-tight" style={{ color: titleColor }}>{title}</h2>
  //         {subtitle && <p className="text-[#818181] mt-6 text-xl font-body italic font-medium">{subtitle}</p>}
  //       </header>
        
  //       <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
  //          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
  //            <circle 
  //              cx={centerX} cy={centerY} r={radius} 
  //              fill="none" stroke="#2E3B4A08" strokeWidth="12"
  //            />
  //            <path 
  //              d={`M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`}
  //              fill="none"
  //              stroke={NOVA_VIA_BRAND.primary}
  //              strokeWidth="4"
  //              strokeLinecap="square"
  //              strokeDasharray="20, 20" 
  //            />
  //          </svg>

  //          {steps.map((step, idx) => {
  //            const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
  //            const x = centerX + radius * Math.cos(angle);
  //            const y = centerY + radius * Math.sin(angle);
             
  //            return (
  //              <motion.div 
  //                key={step.id}
  //                initial={{ opacity: 0, scale: 0.8 }}
  //                animate={{ opacity: 1, scale: 1 }}
  //                transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
  //                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-30"
  //                style={{ left: x, top: y }}
  //              >
  //                <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-white border-[6px] md:border-[12px] border-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2"
  //                     style={{ backgroundColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent }}>
  //                   <IconRenderer name={step.iconName} size={28} className="md:w-10 md:h-10" />
  //                </div>

  //                <div className="mt-4 mb-2 px-4 py-1 border border-[#2E3B4A10] bg-white/95 backdrop-blur-md text-[9px] md:text-[11px] font-bold tracking-[0.3em] text-[#818181] uppercase shadow-sm font-heading">
  //                  Stage {step.number}
  //                </div>

  //                <div className="bg-white px-8 py-6 shadow-2xl text-center min-w-[180px] md:min-w-[280px] transition-all duration-500 group-hover:shadow-[0_40px_60px_-15px_rgba(26,38,51,0.15)] border-b-4" 
  //                     style={{ borderRadius: getRadius(), borderBottomColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent }}>
  //                   <h4 className="text-sm md:text-xl font-bold tracking-tight leading-tight font-heading uppercase" style={{ color: NOVA_VIA_BRAND.text }}>
  //                     {step.title}
  //                   </h4>
  //                </div>
  //              </motion.div>
  //            );
  //          })}
           
  //          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 pointer-events-none opacity-[0.05] flex items-center justify-center">
  //            <LucideIcons.Sparkles size={svgSize * 0.25} style={{ color: NOVA_VIA_BRAND.primary }} />
  //          </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderMultiColumn = () => {
    return (
      <div className="w-full max-w-7xl p-10 md:p-24 shadow-2xl mx-auto relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg, border: getBorderStyle() }}>
        {/* Decorative gradient mesh */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2"
               style={{ background: `radial-gradient(circle at top right, ${accent}, transparent)` }} />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2"
               style={{ background: `radial-gradient(circle at bottom left, ${NOVA_VIA_BRAND.primary}, transparent)` }} />
        </div>

        <header className="mb-20 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-normal font-elegant"
            style={{ color: titleColor }}
          >
            {title}
          </motion.h2>
          {subtitle && <p className="mt-6 text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-10 flex flex-col items-center text-center group transition-all duration-500 shadow-2xl border-t-8 relative overflow-hidden"
              style={{ borderRadius: getRadius(), borderTopColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent, backgroundColor: getCardBackground() }}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none"
                   style={{ background: `linear-gradient(135deg, ${idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent}, transparent)` }} />

              {/* Number badge in corner */}
              <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                   style={{ backgroundColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent, color: '#fff' }}>
                {step.number}
              </div>

              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center shadow-2xl mb-8 relative overflow-hidden transition-all duration-500"
                style={{
                  backgroundColor: NOVA_VIA_BRAND.primary,
                  borderRadius: getRadius(),
                  boxShadow: isDarkBackground
                    ? '0 20px 40px -15px rgba(0,0,0,0.6)'
                    : '0 20px 40px -15px rgba(3,79,128,0.4)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: `radial-gradient(circle, ${accent}40, transparent)` }} />
                <IconRenderer name={step.iconName} size={40} style={{ color: '#ffffff' }} className="md:w-12 md:h-12 relative z-10" />
              </motion.div>

              <div className="flex-1 relative z-10">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] mb-4 block font-heading px-3 py-1 rounded-full inline-block"
                      style={{
                        color: cardLabelColor,
                        backgroundColor: isAccentDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                      }}>
                  Section {step.number}
                </span>
                <h3 className="text-xl md:text-2xl font-bold mb-6 font-heading uppercase tracking-tight" style={{ color: cardTitleColor }}>{step.title}</h3>
                <p className="text-sm md:text-base leading-relaxed font-body opacity-70" style={{ color: cardDescriptionColor }}>
                  {step.description}
                </p>
              </div>

              {/* Bottom gradient accent */}
              <div className="absolute bottom-0 left-0 right-0 h-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                   style={{ background: `linear-gradient(90deg, transparent, ${idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent}, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadial = () => {
    const svgSize = 800;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const radius = 280;
    const stepCount = steps.length;

    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-20 shadow-2xl relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg, border: getBorderStyle() }}>
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }} />
        </div>

        <header className="mb-16 text-center max-w-3xl relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-normal font-elegant" style={{ color: titleColor }}>{title}</motion.h2>
          {subtitle && <p className="mt-4 text-lg md:text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
        </header>

        <div className="relative" style={{ width: svgSize, height: svgSize, maxWidth: '90vw', maxHeight: '90vw' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1 }} className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-4 shadow-2xl flex flex-col items-center justify-center p-6 text-center z-20" style={{ borderRadius: getRadius(), backgroundColor: getCardBackground(), borderColor: isDarkBackground ? 'rgba(255,255,255,0.2)' : borderColor }}>
            <div className="p-4 rounded-full mb-3" style={{ backgroundColor: isAccentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <IconRenderer name="Sparkles" size={40} style={{ color: isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.primary }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 font-heading" style={{ color: cardLabelColor }}>HUB</p>
            <p className="text-2xl font-bold font-heading uppercase" style={{ color: cardTitleColor }}>{title.split(' ')[0]}</p>
          </motion.div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {steps.map((_, idx) => {
              const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              return <line key={idx} x1={centerX} y1={centerY} x2={x} y2={y} stroke={isDarkBackground ? 'rgba(255,255,255,0.15)' : NOVA_VIA_BRAND.primary} strokeOpacity="0.2" strokeWidth="2" />;
            })}
          </svg>

          {steps.map((step, idx) => {
            const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <motion.div key={step.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.15, duration: 0.6 }} whileHover={{ scale: 1.05 }} className="absolute w-44 transform -translate-x-1/2 -translate-y-1/2 p-5 shadow-xl text-center group" style={{ left: x, top: y, borderRadius: getRadius(), backgroundColor: getCardBackground(), border: getBorderStyle() }}>
                <div className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold font-heading mx-auto mb-3 shadow-lg" style={{ backgroundColor: NOVA_VIA_BRAND.primary, borderRadius: getRadius() }}>{step.number}</div>
                <div className="mb-2 inline-flex p-1.5 rounded" style={{ backgroundColor: isAccentDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <IconRenderer name={step.iconName} size={18} style={{ color: isAccentDark ? '#ffffff' : NOVA_VIA_BRAND.primary }} />
                </div>
                <h4 className="text-sm font-bold mb-2 font-heading uppercase" style={{ color: cardTitleColor }}>{step.title}</h4>
                <p className="text-xs leading-snug font-body opacity-70 line-clamp-2" style={{ color: cardDescriptionColor }}>{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCircularProgress = () => {
    const svgSize = 700;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const radius = 240;
    const stepCount = steps.length;

    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-20 shadow-2xl relative overflow-hidden" style={{ borderRadius: getRadius(), backgroundColor: bg, border: getBorderStyle() }}>
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ background: `radial-gradient(circle, ${NOVA_VIA_BRAND.primary}, transparent 60%)` }} />

        <header className="mb-16 text-center max-w-4xl relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-normal font-elegant" style={{ color: titleColor }}>{title}</motion.h2>
          {subtitle && <p className="mt-6 text-xl font-body italic" style={{ color: subtitleColor }}>{subtitle}</p>}
        </header>

        <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize, maxWidth: '85vw', maxHeight: '85vw' }}>
          <svg className="absolute inset-0 w-full h-full">
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke={isDarkBackground ? 'rgba(255,255,255,0.1)' : '#2E3B4A08'} strokeWidth="12" />
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke={NOVA_VIA_BRAND.primary} strokeWidth="4" strokeDasharray="20, 20" strokeLinecap="square" opacity="0.3" />
          </svg>

          {steps.map((step, idx) => {
            const angle = (idx / stepCount) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <motion.div key={step.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1, duration: 0.8 }} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-30" style={{ left: x, top: y }}>
                <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 flex items-center justify-center text-white border-8 border-white shadow-2xl mb-3" style={{ backgroundColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent, borderRadius: '50%' }}>
                  <IconRenderer name={step.iconName} size={24} style={{ color: '#ffffff' }} />
                </motion.div>
                <div className="px-3 py-1 bg-white/95 text-[10px] font-bold uppercase tracking-widest shadow-sm font-heading mb-2" style={{ color: cardLabelColor, borderRadius: getRadius() }}>Step {step.number}</div>
                <div className="px-6 py-4 shadow-2xl text-center min-w-[200px] border-b-4" style={{ borderRadius: getRadius(), borderBottomColor: idx % 2 === 0 ? NOVA_VIA_BRAND.primary : accent, backgroundColor: getCardBackground() }}>
                  <h4 className="text-base font-bold font-heading uppercase" style={{ color: cardTitleColor }}>{step.title}</h4>
                </div>
              </motion.div>
            );
          })}

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
            <LucideIcons.Sparkles size={120} style={{ color: NOVA_VIA_BRAND.primary }} />
          </div>
        </div>
      </div>
    );
  };

  switch (layout) {
    case 'horizontal-steps': return renderHorizontal();
    case 'radial-process': return renderRadial();
    case 'timeline-flow': return renderTimeline();
    case 'circular-progress': return renderCircularProgress();
    case 'multi-column': return renderMultiColumn();
    case 'vertical-cards':
    default: return renderVertical();
  }
};

export default InfographicRenderer;
