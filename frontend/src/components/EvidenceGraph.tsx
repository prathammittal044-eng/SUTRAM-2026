'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Network, Filter, ZoomIn, ZoomOut, RefreshCw, Info, ShieldAlert,
  Phone, CreditCard, Globe, Mail, User, FileText, Search, Download,
  Maximize2, Eye, ShieldCheck, MapPin, Layers, CornerDownRight, X, ExternalLink
} from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: string;
  color: string;
  size?: number;
  occurrences?: number;
  first_seen?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  isFixed?: boolean;
  artifact_id?: number;
  exhibit_code?: string;
  artifact_type?: string;
  forgery_score?: number;
  raw_sha256?: string;
  details?: Record<string, any>;
}

interface Edge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
  details?: string;
}

interface EvidenceGraphProps {
  data: {
    nodes: Node[];
    edges: Edge[];
    summary?: {
      total_nodes: number;
      total_edges: number;
      case_nodes?: number;
      exhibit_nodes?: number;
      entity_nodes?: number;
    };
  };
  onOpenExhibitInspector?: (artifact: any) => void;
  caseTitle?: string;
}

export default function EvidenceGraph({ data, onOpenExhibitInspector, caseTitle }: EvidenceGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Transform state: Pan and Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Refs for animation & interaction
  const simulationNodes = useRef<Node[]>([]);
  const isDragging = useRef(false);
  const draggedNode = useRef<Node | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const dimensions = useRef({ width: 800, height: 600 });

  // Filter nodes based on active pill
  const activeNodes = useMemo(() => {
    const raw = data?.nodes || [];
    if (filterType === 'ALL') return raw;
    if (filterType === 'EXHIBIT') return raw.filter(n => n.type === 'EXHIBIT' || n.type === 'CASE');
    return raw.filter(n => n.type === filterType || n.type === 'CASE');
  }, [data?.nodes, filterType]);

  const activeNodeIds = useMemo(() => new Set(activeNodes.map(n => n.id)), [activeNodes]);

  const activeEdges = useMemo(() => {
    return (data?.edges || []).filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
  }, [data?.edges, activeNodeIds]);

  // Map of neighbor connections for fast highlight lookup
  const neighborMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    activeEdges.forEach(e => {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    });
    return map;
  }, [activeEdges]);

  // Connected edges for the currently selected/hovered node
  const activeFocusId = selectedNode?.id || hoveredNode?.id || null;
  const focusNeighbors = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>();
    set.add(activeFocusId);
    const neighbors = neighborMap.get(activeFocusId);
    if (neighbors) {
      neighbors.forEach(nid => set.add(nid));
    }
    return set;
  }, [activeFocusId, neighborMap]);

  // Layout initialization function: Distributes nodes into spacious orbits
  const setupLayout = useCallback((nodesToPlace: Node[]) => {
    const width = dimensions.current.width || 800;
    const height = dimensions.current.height || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const caseNodes = nodesToPlace.filter(n => n.type === 'CASE');
    const exhibitNodes = nodesToPlace.filter(n => n.type === 'EXHIBIT');
    const entityNodes = nodesToPlace.filter(n => n.type !== 'CASE' && n.type !== 'EXHIBIT');

    const newNodes: Node[] = [];

    // 1. Center Case
    caseNodes.forEach(n => {
      newNodes.push({ ...n, x: centerX, y: centerY, vx: 0, vy: 0, isFixed: true });
    });

    // 2. Inner Ring for Exhibits (radius 220)
    const exhCount = Math.max(exhibitNodes.length, 1);
    exhibitNodes.forEach((n, idx) => {
      const angle = (idx / exhCount) * 2 * Math.PI - Math.PI / 2;
      const radius = 220;
      newNodes.push({
        ...n,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    // 3. Outer Ring for Entities (radius 360-440 with staggering)
    const entCount = Math.max(entityNodes.length, 1);
    entityNodes.forEach((n, idx) => {
      const angle = (idx / entCount) * 2 * Math.PI;
      const radius = 360 + (idx % 3) * 55;
      newNodes.push({
        ...n,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    simulationNodes.current = newNodes;
  }, []);

  const handleUntangle = useCallback(() => {
    setupLayout(activeNodes);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [setupLayout, activeNodes]);

  const handleResetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // Update simulationNodes on activeNodes change or if empty
  useEffect(() => {
    const currentIds = new Set(simulationNodes.current.map(n => n.id));
    const isDifferent = activeNodes.some(n => !currentIds.has(n.id)) || simulationNodes.current.length === 0;

    if (isDifferent) {
      setupLayout(activeNodes);
    }
  }, [activeNodes, setupLayout]);

  // Update canvas size on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width, 640);
      const h = Math.max(rect.height, 560);
      dimensions.current = { width: w, height: h };

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Physics Simulation Step with Hard Non-Penetration Constraint
  const stepSimulation = useCallback(() => {
    const nodes = simulationNodes.current;
    if (!nodes || nodes.length === 0) return;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const width = dimensions.current.width || 800;
    const height = dimensions.current.height || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Collision Avoidance & Repulsion (Prevents any overlap)
    const minDistance = 150; // Guaranteed separation for nodes and labels
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = (n2.x || 0) - (n1.x || 0);
        const dy = (n2.y || 0) - (n1.y || 0);
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        // A. Hard Non-Penetration (instantly pushes overlapping nodes apart)
        if (dist < minDistance) {
          const overlap = minDistance - dist;
          const pushFraction = 0.35;
          const pfx = (dx / dist) * overlap * pushFraction;
          const pfy = (dy / dist) * overlap * pushFraction;

          if (!n1.isFixed && n1 !== draggedNode.current) {
            n1.x = (n1.x || 0) - pfx;
            n1.y = (n1.y || 0) - pfy;
            n1.vx = (n1.vx || 0) - pfx * 0.2;
            n1.vy = (n1.vy || 0) - pfy * 0.2;
          }
          if (!n2.isFixed && n2 !== draggedNode.current) {
            n2.x = (n2.x || 0) + pfx;
            n2.y = (n2.y || 0) + pfy;
            n2.vx = (n2.vx || 0) + pfx * 0.2;
            n2.vy = (n2.vy || 0) + pfy * 0.2;
          }
        }

        // B. Coulomb Long-Range Repulsion
        const k = 35000;
        const force = k / (distSq + 300);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!n1.isFixed && n1 !== draggedNode.current) {
          n1.vx = (n1.vx || 0) - fx;
          n1.vy = (n1.vy || 0) - fy;
        }
        if (!n2.isFixed && n2 !== draggedNode.current) {
          n2.vx = (n2.vx || 0) + fx;
          n2.vy = (n2.vy || 0) + fy;
        }
      }
    }

    // 2. Hooke's Spring Force along active edges (softened to prevent clumping)
    activeEdges.forEach(e => {
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      if (s && t) {
        const dx = (t.x || 0) - (s.x || 0);
        const dy = (t.y || 0) - (s.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = s.type === 'CASE' || t.type === 'CASE' ? 250 : 190;
        const springForce = (dist - targetDist) * 0.010;
        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (!s.isFixed && s !== draggedNode.current) {
          s.vx = (s.vx || 0) + fx;
          s.vy = (s.vy || 0) + fy;
        }
        if (!t.isFixed && t !== draggedNode.current) {
          t.vx = (t.vx || 0) - fx;
          t.vy = (t.vy || 0) - fy;
        }
      }
    });

    // 3. Gentle Centering Gravity & Velocity Integration
    const damping = 0.82;
    nodes.forEach(n => {
      if (n === draggedNode.current) return;
      if (n.type === 'CASE') {
        n.x = (n.x || centerX) * 0.95 + centerX * 0.05;
        n.y = (n.y || centerY) * 0.95 + centerY * 0.05;
        return;
      }

      const gx = (centerX - (n.x || 0)) * 0.0006;
      const gy = (centerY - (n.y || 0)) * 0.0006;

      n.vx = ((n.vx || 0) + gx) * damping;
      n.vy = ((n.vy || 0) + gy) * damping;

      n.x = (n.x || 0) + (n.vx || 0);
      n.y = (n.y || 0) + (n.vy || 0);
    });
  }, [activeEdges]);

  // Main Canvas Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = dimensions.current.width;
    const height = dimensions.current.height;

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark charcoal background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply DPR + Zoom + Pan Transform
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * (pan.x + (width * (1 - zoom)) / 2), dpr * (pan.y + (height * (1 - zoom)) / 2));

    // Draw Subtle Grid Dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const gridSize = 40;
    const startX = -width * 2;
    const endX = width * 3;
    const startY = -height * 2;
    const endY = height * 3;
    for (let gx = startX; gx < endX; gx += gridSize) {
      for (let gy = startY; gy < endY; gy += gridSize) {
        ctx.fillRect(gx, gy, 1.5, 1.5);
      }
    }

    const nodes = simulationNodes.current;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 1. Draw Edges
    activeEdges.forEach(edge => {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t || s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined) return;

      const isFocused = focusNeighbors ? focusNeighbors.has(s.id) && focusNeighbors.has(t.id) : false;
      const alpha = focusNeighbors ? (isFocused ? 0.95 : 0.08) : 0.40;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (isFocused && focusNeighbors) {
        ctx.strokeStyle = '#FF4E18';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 78, 24, 0.5)';
        ctx.shadowBlur = 6;
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // 2. Draw Nodes
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isNeighbor = focusNeighbors?.has(node.id);
      const isMatchedSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

      const isDimmed = focusNeighbors && !isNeighbor;
      const alpha = isDimmed ? 0.2 : 1.0;

      const radius = node.type === 'CASE' ? 24 : node.type === 'EXHIBIT' ? 18 : 14;

      // Outer Selection / Search Glow
      if (isSelected || isMatchedSearch) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
        ctx.fillStyle = isMatchedSearch ? 'rgba(255, 78, 24, 0.2)' : 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
        ctx.strokeStyle = isMatchedSearch ? '#FF4E18' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
      }

      // Distinct node colors by type:
      let nodeFill = '#3b82f6';
      if (node.type === 'PERSON') {
        nodeFill = '#3b82f6'; // Blue
      } else if (node.type === 'PHONE') {
        nodeFill = '#10b981'; // Green
      } else if (node.type === 'UPI_ID' || node.type === 'BANK_ACCOUNT') {
        nodeFill = '#f59e0b'; // Amber Gold
      } else if (node.type === 'IP_ADDRESS') {
        nodeFill = '#8b5cf6'; // Purple
      } else if (node.type === 'EMAIL') {
        nodeFill = '#06b6d4'; // Cyan
      } else if (node.type === 'LOCATION' || node.type === 'GPE') {
        nodeFill = '#f97316'; // Orange
      } else if (node.type === 'EXHIBIT') {
        nodeFill = '#64748b'; // Slate
      } else if (node.type === 'CASE') {
        nodeFill = '#ffffff'; // White
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeFill;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Border ring
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Node Icon / Glyph
      ctx.fillStyle = (node.type === 'CASE') ? '#000000' : '#ffffff';
      ctx.font = `bold ${radius * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const typeGlyph =
        node.type === 'CASE' ? '⚖' :
        node.type === 'EXHIBIT' ? '📄' :
        node.type === 'PHONE' ? '📱' :
        node.type === 'UPI_ID' ? '₹' :
        node.type === 'IP_ADDRESS' ? '🌐' :
        node.type === 'EMAIL' ? '✉' :
        node.type === 'PERSON' ? '👤' :
        node.type === 'LOCATION' ? '📍' : '•';
      ctx.fillText(typeGlyph, node.x, node.y);

      // Node Label Text with backdrop pill below node
      ctx.globalAlpha = isDimmed ? 0.25 : 1.0;
      const shortLabel = node.label.length > 18 ? node.label.substring(0, 16) + '…' : node.label;
      ctx.font = '600 10px "Plus Jakarta Sans", system-ui, sans-serif';
      const labelWidth = ctx.measureText(shortLabel).width;

      // Dark translucent backdrop pill for label
      ctx.fillStyle = 'rgba(9, 9, 11, 0.92)';
      ctx.beginPath();
      ctx.roundRect(node.x - labelWidth / 2 - 5, node.y + radius + 4, labelWidth + 10, 16, 4);
      ctx.fill();
      ctx.strokeStyle = isSelected ? 'rgba(255, 78, 24, 0.6)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shortLabel, node.x, node.y + radius + 12);
      ctx.globalAlpha = 1.0;
    });
  }, [activeEdges, selectedNode, hoveredNode, focusNeighbors, searchQuery, zoom, pan]);

  // Animation Loop Hook
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      stepSimulation();
      render();
      animFrameId.current = requestAnimationFrame(loop);
    };
    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [stepSimulation, render]);

  // Coordinate conversion from screen viewport to world coordinates
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const width = dimensions.current.width;
    const height = dimensions.current.height;

    const worldX = (screenX - (pan.x + (width * (1 - zoom)) / 2)) / zoom;
    const worldY = (screenY - (pan.y + (height * (1 - zoom)) / 2)) / zoom;
    return { x: worldX, y: worldY };
  }, [pan, zoom]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Hit test on nodes
    const clickedNode = simulationNodes.current.find(n => {
      if (n.x === undefined || n.y === undefined) return false;
      const dx = n.x - worldPos.x;
      const dy = n.y - worldPos.y;
      const r = (n.type === 'CASE' ? 24 : n.type === 'EXHIBIT' ? 18 : 14) + 6;
      return dx * dx + dy * dy <= r * r;
    });

    if (clickedNode) {
      isDragging.current = true;
      draggedNode.current = clickedNode;
      setSelectedNode(clickedNode);
    } else {
      // Pan start on background
      isDragging.current = true;
      draggedNode.current = null;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { x: pan.x, y: pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);

    if (isDragging.current) {
      if (draggedNode.current) {
        // Dragging node
        draggedNode.current.x = worldPos.x;
        draggedNode.current.y = worldPos.y;
        draggedNode.current.vx = 0;
        draggedNode.current.vy = 0;
      } else {
        // Panning canvas
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
      }
    } else {
      // Hover test
      const hovered = simulationNodes.current.find(n => {
        if (n.x === undefined || n.y === undefined) return false;
        const dx = n.x - worldPos.x;
        const dy = n.y - worldPos.y;
        const r = (n.type === 'CASE' ? 24 : n.type === 'EXHIBIT' ? 18 : 14) + 6;
        return dx * dx + dy * dy <= r * r;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    draggedNode.current = null;
  };

  // Zoom via mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  // 1-Click High-Res PNG Export
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an export canvas with watermark
    const expCanvas = document.createElement('canvas');
    expCanvas.width = canvas.width;
    expCanvas.height = canvas.height;
    const ctx = expCanvas.getContext('2d');
    if (!ctx) return;

    // Copy graph
    ctx.drawImage(canvas, 0, 0);

    // Forensic Watermark Header
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, expCanvas.width, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`SUTRAM 2026 FORENSIC KNOWLEDGE GRAPH • ${caseTitle || 'Case Dossier'}`, 20, 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Exported: ${new Date().toISOString()} • Section 63 BSA Admissible`, expCanvas.width - 20, 28);

    const link = document.createElement('a');
    link.download = `SUTRAM_Evidence_Graph_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = expCanvas.toDataURL('image/png');
    link.click();
  };

  // Helper for node icon in inspector
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'CASE': return <ShieldCheck className="w-4 h-4 text-white" />;
      case 'EXHIBIT': return <FileText className="w-4 h-4 text-white/80" />;
      case 'PHONE': return <Phone className="w-4 h-4 text-white/80" />;
      case 'UPI_ID': return <CreditCard className="w-4 h-4 text-white/80" />;
      case 'IP_ADDRESS': return <Globe className="w-4 h-4 text-white/80" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-white/80" />;
      case 'PERSON': return <User className="w-4 h-4 text-[#FF4E18]" />;
      case 'LOCATION': return <MapPin className="w-4 h-4 text-[#FFA95A]" />;
      default: return <Network className="w-4 h-4 text-white/60" />;
    }
  };

  // Get connected edges for selected node
  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return activeEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [selectedNode, activeEdges]);

  return (
    <div className="bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* TOP HEADER CONTROLS */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded border border-white/10 bg-white/5 text-white/70 flex items-center justify-center font-bold">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">Entity Knowledge Graph (DFIR Detective Board)</h3>
              <span className="text-[10px] bg-white/5 text-white/60 font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                {activeNodes.length} Nodes • {activeEdges.length} Edges
              </span>
            </div>
            <p className="text-[11px] text-white/40 font-mono mt-0.5">
              Interactive multi-source crime matrix. Drag nodes, scroll to zoom, click to inspect correlations.
            </p>
          </div>
        </div>

        {/* Search Bar & Export PNG */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone, UPI, IP, exhibit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/[0.02] border border-white/15 text-white text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-white/40 w-44 sm:w-56 font-mono placeholder-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleExportPNG}
            className="bg-white hover:bg-white/90 text-black font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Export high-resolution PNG for court filing"
          >
            <Download className="w-3.5 h-3.5" /> Export PNG
          </button>
        </div>
      </div>

      {/* FILTER PILLS BAR */}
      <div className="px-4 py-2 border-b border-white/10 bg-white/[0.01] flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>
        {[
          { key: 'ALL', label: 'All Evidence' },
          { key: 'EXHIBIT', label: 'Exhibits & Case' },
          { key: 'PHONE', label: 'Phones (+91)' },
          { key: 'UPI_ID', label: 'UPI VPAs' },
          { key: 'IP_ADDRESS', label: 'IP Logs' },
          { key: 'EMAIL', label: 'Emails' },
          { key: 'PERSON', label: 'Persons' },
          { key: 'LOCATION', label: 'GPS / Locations' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterType(item.key)}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all cursor-pointer ${
              filterType === item.key
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* MAIN CANVAS WORKSPACE */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[580px] w-full bg-black overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* FLOATING ZOOM / CAMERA CONTROLS */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-black/90 backdrop-blur-md border border-white/10 p-1.5 rounded-lg shadow-xl">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 3.0))}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.4))}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-all cursor-pointer"
            title="Reset View / Fit Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleUntangle}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-all cursor-pointer"
            title="Auto-Layout / Untangle Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* SLIDE-IN INSPECTOR DRAWER */}
        {selectedNode && (
          <div className="absolute top-4 right-4 max-w-sm w-full bg-black/95 backdrop-blur-xl border border-white/15 rounded-lg p-5 shadow-2xl text-white font-mono animate-in fade-in slide-in-from-right-4 duration-200 z-20">
            <div className="flex items-start justify-between mb-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded border border-white/20 flex items-center justify-center font-bold shadow-md bg-white/10 text-white"
                >
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {selectedNode.type}
                  </span>
                  <h4 className="font-bold text-white text-sm truncate max-w-[200px]">
                    {selectedNode.label}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* NODE DETAILS */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-white/[0.02] p-2.5 rounded border border-white/10 font-mono text-[11px] break-all text-white/80">
                {selectedNode.label}
              </div>

              {selectedNode.type === 'EXHIBIT' && (
                <div className="space-y-1.5 bg-white/[0.03] p-3 rounded border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/40">Exhibit Code:</span>
                    <strong className="text-white font-mono">{selectedNode.exhibit_code || 'EXH'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Type:</span>
                    <strong className="text-white/80">{selectedNode.artifact_type}</strong>
                  </div>
                  {selectedNode.forgery_score !== undefined && selectedNode.forgery_score > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/40">ELA Tamper Risk:</span>
                      <strong className={selectedNode.forgery_score >= 45 ? 'text-[#FF4E18]' : 'text-white/70'}>
                        {selectedNode.forgery_score}%
                      </strong>
                    </div>
                  )}

                  {onOpenExhibitInspector && (
                    <button
                      onClick={() => onOpenExhibitInspector(selectedNode)}
                      className="w-full mt-2 bg-white hover:bg-white/90 text-black font-bold py-1.5 px-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Exhibit Forensic Bitstream
                    </button>
                  )}
                </div>
              )}

              {/* CONNECTED LINKS LIST */}
              <div className="pt-1">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1.5">
                  Connected Links ({selectedNodeEdges.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedNodeEdges.map((edge, idx) => {
                    const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = simulationNodes.current.find(n => n.id === otherId);
                    return (
                      <div
                        key={idx}
                        onClick={() => otherNode && setSelectedNode(otherNode)}
                        className="p-2 rounded bg-white/[0.02] hover:bg-white/5 border border-white/10 cursor-pointer flex items-center justify-between text-[11px] transition-all group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CornerDownRight className="w-3 h-3 text-white/40 flex-shrink-0" />
                          <span className="font-medium text-white/90 truncate group-hover:text-white">
                            {otherNode?.label || otherId}
                          </span>
                        </div>
                        <span className="text-[9px] bg-white/10 text-white/70 font-mono px-1.5 py-0.5 rounded uppercase whitespace-nowrap ml-1 border border-white/10">
                          {edge.relation.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LEGEND FOOTER */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-sans">
        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Person / Suspect</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Phone / SIM</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Bank / UPI Account</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> IP / Server</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> Location</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Evidence Exhibit</span>
        </div>
        <div className="text-[11px] text-zinc-400">
          Click any node to inspect connections
        </div>
      </div>
    </div>
  );
}
