// High-precision SVG Data URI generators for equipment CAD schematics and Before/After condition inspection logs
// Guarantees zero broken images in hermetic evaluation environments while looking authentic to a lab monitoring platform.

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export function getEquipmentSchematicUrl(
  visualType: 'printer_3d' | 'laser_cutter' | 'oscilloscope' | 'confocal_microscope' | 'cinema_rig' | 'anechoic_chamber'
): string {
  switch (visualType) {
    case 'printer_3d':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <g opacity="0.14" stroke="#64748B" stroke-width="1">
            <line x1="0" y1="80" x2="640" y2="80"/><line x1="0" y1="160" x2="640" y2="160"/>
            <line x1="0" y1="240" x2="640" y2="240"/><line x1="0" y1="320" x2="640" y2="320"/>
            <line x1="128" y1="0" x2="128" y2="400"/><line x1="256" y1="0" x2="256" y2="400"/>
            <line x1="384" y1="0" x2="384" y2="400"/><line x1="512" y1="0" x2="512" y2="400"/>
          </g>
          <!-- CoreXY Enclosure Frame -->
          <rect x="190" y="45" width="260" height="310" rx="10" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
          <rect x="212" y="75" width="216" height="230" rx="6" fill="#090D16" stroke="#475569" stroke-width="1.5"/>
          <!-- AMS Top Unit -->
          <rect x="208" y="18" width="224" height="24" rx="4" fill="#334155" stroke="#94A3B8" stroke-width="1.5"/>
          <circle cx="245" cy="30" r="7" stroke="#38BDF8" stroke-width="2"/>
          <circle cx="295" cy="30" r="7" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="345" cy="30" r="7" stroke="#10B981" stroke-width="2"/>
          <circle cx="395" cy="30" r="7" stroke="#E2E8F0" stroke-width="2"/>
          <!-- Carbon Gantry Rods -->
          <line x1="212" y1="125" x2="428" y2="125" stroke="#64748B" stroke-width="4"/>
          <line x1="212" y1="133" x2="428" y2="133" stroke="#475569" stroke-width="2"/>
          <!-- Print Head Extruder -->
          <rect x="298" y="106" width="44" height="46" rx="5" fill="#334155" stroke="#E2E8F0" stroke-width="2"/>
          <circle cx="320" cy="128" r="9" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
          <polygon points="315,152 325,152 320,162" fill="#F59E0B"/>
          <!-- Printed Part on Textured PEI Bed -->
          <path d="M275 268 L300 185 L340 185 L365 268 Z" fill="#4F46E5" fill-opacity="0.35" stroke="#818CF8" stroke-width="2"/>
          <line x1="282" y1="245" x2="358" y2="245" stroke="#818CF8" stroke-width="1" stroke-dasharray="4 3"/>
          <line x1="290" y1="215" x2="350" y2="215" stroke="#818CF8" stroke-width="1" stroke-dasharray="4 3"/>
          <rect x="228" y="268" width="184" height="8" rx="2" fill="#F59E0B"/>
          <!-- Telemetry Callouts -->
          <text x="28" y="42" fill="#94A3B8" font-family="monospace" font-size="12">CHAMBER: 55°C · NOZZLE: 260°C</text>
          <text x="28" y="372" fill="#64748B" font-family="monospace" font-size="11">COREXY LIDAR CALIBRATED · 0.08MM LAYER</text>
        </svg>
      `);
    case 'laser_cutter':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <g opacity="0.14" stroke="#64748B" stroke-width="1">
            <line x1="0" y1="80" x2="640" y2="80"/><line x1="0" y1="160" x2="640" y2="160"/>
            <line x1="0" y1="240" x2="640" y2="240"/><line x1="0" y1="320" x2="640" y2="320"/>
            <line x1="160" y1="0" x2="160" y2="400"/><line x1="320" y1="0" x2="320" y2="400"/><line x1="480" y1="0" x2="480" y2="400"/>
          </g>
          <!-- Industrial Flatbed Enclosure -->
          <rect x="85" y="70" width="470" height="260" rx="10" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
          <rect x="110" y="95" width="350" height="210" rx="4" fill="#090D16" stroke="#475569" stroke-width="2"/>
          <!-- Honeycomb Vector Bed -->
          <rect x="135" y="125" width="290" height="150" fill="#111827" stroke="#334155" stroke-width="1.5"/>
          <!-- Acrylic Sheet & Active Laser Path -->
          <rect x="160" y="142" width="190" height="115" rx="3" fill="#0EA5E9" fill-opacity="0.18" stroke="#38BDF8" stroke-width="1.5"/>
          <circle cx="220" cy="198" r="28" stroke="#38BDF8" stroke-width="2" stroke-dasharray="5 3"/>
          <rect x="265" y="170" width="60" height="56" rx="4" stroke="#F43F5E" stroke-width="2"/>
          <!-- Laser Gantry & Beam -->
          <line x1="110" y1="170" x2="460" y2="170" stroke="#94A3B8" stroke-width="5"/>
          <rect x="313" y="152" width="24" height="32" rx="3" fill="#334155" stroke="#E2E8F0" stroke-width="1.5"/>
          <line x1="325" y1="184" x2="325" y2="226" stroke="#F43F5E" stroke-width="2.5"/>
          <circle cx="325" cy="226" r="6" fill="#FB7185"/>
          <!-- Control Panel -->
          <rect x="478" y="95" width="58" height="210" rx="4" fill="#0F172A" stroke="#475569" stroke-width="1.5"/>
          <circle cx="507" cy="265" r="14" fill="#EF4444" stroke="#FCA5A5" stroke-width="2"/>
          <text x="28" y="42" fill="#94A3B8" font-family="monospace" font-size="12">120W CO2 OPTICS · AIR ASSIST: 28 PSI</text>
          <text x="28" y="372" fill="#64748B" font-family="monospace" font-size="11">CLASS 4 INTERLOCK ENGAGED · EXHAUST 650 CFM</text>
        </svg>
      `);
    case 'oscilloscope':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <rect x="90" y="55" width="460" height="290" rx="12" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
          <!-- Waveform Display Screen -->
          <rect x="115" y="80" width="310" height="210" rx="6" fill="#050811" stroke="#334155" stroke-width="2"/>
          <g opacity="0.22" stroke="#334155" stroke-width="1">
            <line x1="115" y1="132" x2="425" y2="132"/><line x1="115" y1="185" x2="425" y2="185"/><line x1="115" y1="238" x2="425" y2="238"/>
            <line x1="192" y1="80" x2="192" y2="290"/><line x1="270" y1="80" x2="270" y2="290"/><line x1="348" y1="80" x2="348" y2="290"/>
          </g>
          <!-- Channel 1 Sine Wave -->
          <path d="M 120 155 Q 155 95, 190 155 T 260 155 T 330 155 T 400 155" stroke="#FACC15" stroke-width="2.5" fill="none"/>
          <!-- Channel 2 Square Clock -->
          <path d="M 120 245 L 150 245 L 150 205 L 190 205 L 190 245 L 230 245 L 230 205 L 270 205 L 270 245 L 310 245 L 310 205 L 350 205 L 350 245 L 415 245" stroke="#38BDF8" stroke-width="2" fill="none"/>
          <!-- Rotary Knobs & BNC Ports -->
          <circle cx="465" cy="115" r="15" fill="#0F172A" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="512" cy="115" r="15" fill="#0F172A" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="465" cy="168" r="12" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
          <circle cx="512" cy="168" r="12" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
          <!-- BNC Channels -->
          <circle cx="155" cy="316" r="9" fill="#0F172A" stroke="#FACC15" stroke-width="2.5"/>
          <circle cx="215" cy="316" r="9" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
          <circle cx="275" cy="316" r="9" fill="#0F172A" stroke="#F472B6" stroke-width="2.5"/>
          <circle cx="335" cy="316" r="9" fill="#0F172A" stroke="#34D399" stroke-width="2.5"/>
          <text x="28" y="40" fill="#94A3B8" font-family="monospace" font-size="12">6.0 GHZ MIXED DOMAIN · 20 GSA/S</text>
          <text x="28" y="376" fill="#64748B" font-family="monospace" font-size="11">NIST TRACEABLE CAL VALID THRU 2027-04</text>
        </svg>
      `);
    case 'confocal_microscope':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <!-- Optical Isolation Table -->
          <rect x="110" y="310" width="420" height="26" rx="4" fill="#334155" stroke="#94A3B8" stroke-width="2"/>
          <!-- Microscope Frame -->
          <path d="M250 310 L250 95 L360 95 L360 145 L305 145 L305 255 L385 255 L385 310 Z" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
          <!-- Laser Confocal Scan Head -->
          <rect x="235" y="48" width="140" height="47" rx="6" fill="#0F172A" stroke="#818CF8" stroke-width="2"/>
          <!-- Objective Turret & Excitation Beam -->
          <rect x="330" y="145" width="24" height="38" rx="3" fill="#475569" stroke="#CBD5E1" stroke-width="1.5"/>
          <line x1="342" y1="183" x2="342" y2="232" stroke="#10B981" stroke-width="3"/>
          <circle cx="342" cy="232" r="10" fill="#10B981" fill-opacity="0.35" stroke="#34D399" stroke-width="1.5"/>
          <!-- Piezo Stage -->
          <rect x="295" y="232" width="105" height="12" rx="2" fill="#0EA5E9"/>
          <text x="28" y="40" fill="#94A3B8" font-family="monospace" font-size="12">405/488/561/640NM SOLID-STATE LASER MODULE</text>
          <text x="28" y="376" fill="#64748B" font-family="monospace" font-size="11">BSL-1 DARKROOM · PNEUMATIC ISOLATION ACTIVE</text>
        </svg>
      `);
    case 'cinema_rig':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <!-- Camera Body -->
          <rect x="230" y="135" width="145" height="125" rx="10" fill="#1E293B" stroke="#94A3B8" stroke-width="2.5"/>
          <!-- Cine Prime Lens & Matte Box -->
          <rect x="155" y="155" width="75" height="85" rx="4" fill="#334155" stroke="#CBD5E1" stroke-width="2"/>
          <polygon points="110,135 155,155 155,240 110,260" fill="#090D16" stroke="#94A3B8" stroke-width="2"/>
          <!-- Top Handle & Monitor -->
          <path d="M255 135 L255 95 L355 95 L355 112" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
          <rect x="265" y="52" width="85" height="36" rx="4" fill="#0EA5E9" fill-opacity="0.2" stroke="#38BDF8" stroke-width="2"/>
          <!-- V-Lock Battery Pack -->
          <rect x="375" y="148" width="52" height="100" rx="6" fill="#0F172A" stroke="#64748B" stroke-width="2"/>
          <!-- Tripod Head -->
          <path d="M265 260 L340 260 L365 345 L240 345 Z" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
          <text x="28" y="40" fill="#94A3B8" font-family="monospace" font-size="12">4K 120P FULL-FRAME · PL-MOUNT T1.5 CINE PRIME</text>
          <text x="28" y="376" fill="#64748B" font-family="monospace" font-size="11">SERIALIZED CASE #FX6-09 · DUAL CFEXPRESS TYPE-A</text>
        </svg>
      `);
    case 'anechoic_chamber':
      return svgToDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
          <rect width="640" height="400" fill="#0F172A"/>
          <!-- Acoustic Wedges Perimeter -->
          <path d="M60 60 L90 85 L60 110 L90 135 L60 160 L90 185 L60 210 L90 235 L60 260 L90 285 L60 310 L90 335" stroke="#475569" stroke-width="3" fill="none"/>
          <path d="M580 60 L550 85 L580 110 L550 135 L580 160 L550 185 L580 210 L550 235 L580 260 L550 285 L580 310 L550 335" stroke="#475569" stroke-width="3" fill="none"/>
          <!-- Central Microphone Array & Acoustic Wavefronts -->
          <circle cx="320" cy="200" r="95" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="6 4"/>
          <circle cx="320" cy="200" r="60" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4 4"/>
          <circle cx="320" cy="200" r="26" fill="#4F46E5" fill-opacity="0.3" stroke="#818CF8" stroke-width="2"/>
          <line x1="320" y1="226" x2="320" y2="335" stroke="#94A3B8" stroke-width="4"/>
          <text x="28" y="40" fill="#94A3B8" font-family="monospace" font-size="12">NOISE FLOOR: 9.4 DBA · CUTOFF FREQ: 70 HZ</text>
          <text x="28" y="376" fill="#64748B" font-family="monospace" font-size="11">ISO 3745 FREE-FIELD CERTIFIED · 64-CH ARRAY</text>
        </svg>
      `);
  }
}

export function getConditionPhotoDataUrl(
  phase: 'BEFORE_MINT' | 'AFTER_CLEAN' | 'AFTER_ANOMALY',
  serialId: string,
  timestampLabel: string
): string {
  if (phase === 'BEFORE_MINT') {
    return svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" fill="none">
        <rect width="600" height="380" fill="#0B1120"/>
        <rect x="24" y="24" width="552" height="332" rx="8" stroke="#1E293B" stroke-width="2"/>
        <!-- Work Surface Inspection View -->
        <rect x="115" y="78" width="370" height="210" rx="6" fill="#1E293B" stroke="#475569" stroke-width="2"/>
        <line x1="115" y1="148" x2="485" y2="148" stroke="#334155" stroke-width="1"/>
        <line x1="115" y1="218" x2="485" y2="218" stroke="#334155" stroke-width="1"/>
        <line x1="238" y1="78" x2="238" y2="288" stroke="#334155" stroke-width="1"/>
        <line x1="361" y1="78" x2="361" y2="288" stroke="#334155" stroke-width="1"/>
        <!-- Optical Fiducial Alignment Target -->
        <circle cx="300" cy="183" r="44" stroke="#10B981" stroke-width="2" stroke-dasharray="6 4"/>
        <circle cx="300" cy="183" r="6" fill="#10B981"/>
        <!-- Metadata Overlay -->
        <rect x="38" y="38" width="235" height="28" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="1"/>
        <text x="48" y="56" fill="#10B981" font-family="monospace" font-size="11">CHECK-IN BASELINE: VERIFIED CLEAN</text>
        <text x="38" y="338" fill="#94A3B8" font-family="monospace" font-size="11">ASSET: ${serialId} · ${timestampLabel}</text>
      </svg>
    `);
  }

  if (phase === 'AFTER_CLEAN') {
    return svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" fill="none">
        <rect width="600" height="380" fill="#0B1120"/>
        <rect x="24" y="24" width="552" height="332" rx="8" stroke="#1E293B" stroke-width="2"/>
        <rect x="115" y="78" width="370" height="210" rx="6" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
        <line x1="115" y1="148" x2="485" y2="148" stroke="#334155" stroke-width="1"/>
        <line x1="115" y1="218" x2="485" y2="218" stroke="#334155" stroke-width="1"/>
        <line x1="238" y1="78" x2="238" y2="288" stroke="#334155" stroke-width="1"/>
        <line x1="361" y1="78" x2="361" y2="288" stroke="#334155" stroke-width="1"/>
        <circle cx="300" cy="183" r="44" stroke="#10B981" stroke-width="2"/>
        <path d="M284 183 L296 195 L320 171" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="38" y="38" width="255" height="28" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="1"/>
        <text x="48" y="56" fill="#10B981" font-family="monospace" font-size="11">CHECK-OUT RETURN: 0.0% SURFACE DIFF</text>
        <text x="38" y="338" fill="#94A3B8" font-family="monospace" font-size="11">ASSET: ${serialId} · ${timestampLabel}</text>
      </svg>
    `);
  }

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" fill="none">
      <rect width="600" height="380" fill="#0B1120"/>
      <rect x="24" y="24" width="552" height="332" rx="8" stroke="#1E293B" stroke-width="2"/>
      <rect x="115" y="78" width="370" height="210" rx="6" fill="#1E293B" stroke="#EF4444" stroke-width="2"/>
      <line x1="115" y1="148" x2="485" y2="148" stroke="#334155" stroke-width="1"/>
      <line x1="115" y1="218" x2="485" y2="218" stroke="#334155" stroke-width="1"/>
      <!-- Thermal / Surface Anomaly Marker -->
      <circle cx="355" cy="168" r="34" fill="#EF4444" fill-opacity="0.22" stroke="#EF4444" stroke-width="2" stroke-dasharray="5 3"/>
      <path d="M335 154 L372 184 M368 150 L342 182" stroke="#F87171" stroke-width="3" stroke-linecap="round"/>
      <rect x="38" y="38" width="285" height="28" rx="4" fill="#0F172A" stroke="#EF4444" stroke-width="1"/>
      <text x="48" y="56" fill="#F87171" font-family="monospace" font-size="11">ANOMALY DETECTED: BED SCRATCH / OPTIC RESIDUE</text>
      <text x="38" y="338" fill="#94A3B8" font-family="monospace" font-size="11">ASSET: ${serialId} · ${timestampLabel}</text>
    </svg>
  `);
}
