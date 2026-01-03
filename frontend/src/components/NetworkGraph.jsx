import { useEffect, useRef, useState, useCallback } from 'react';

const NetworkGraph = ({ nodes, edges, title, height = 500 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Interactive state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [minConnections, setMinConnections] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Deterministic pseudo-random based on string (for consistent positioning)
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Color scheme for different node types
  const nodeColors = {
    address: { fill: '#ef4444', stroke: '#dc2626', icon: '📍' },
    company: { fill: '#3b82f6', stroke: '#2563eb', icon: '🏢' },
    ip: { fill: '#f59e0b', stroke: '#d97706', icon: '🌐' },
    bid: { fill: '#10b981', stroke: '#059669', icon: '📄' },
    person: { fill: '#8b5cf6', stroke: '#7c3aed', icon: '👤' },
    bank: { fill: '#06b6d4', stroke: '#0891b2', icon: '🏦' },
    guarantor: { fill: '#ec4899', stroke: '#db2777', icon: '🤝' },
  };

  // Calculate connection count for each node
  const connectionCounts = {};
  edges?.forEach(edge => {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;
    connectionCounts[source] = (connectionCounts[source] || 0) + 1;
    connectionCounts[target] = (connectionCounts[target] || 0) + 1;
  });

  // Filter nodes based on minimum connections and search
  const filteredNodes = nodes?.filter(node => {
    const connections = connectionCounts[node.id] || 0;
    const matchesConnections = connections >= minConnections;
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesConnections && matchesSearch;
  }) || [];

  // Filter edges to only show edges between visible nodes
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges?.filter(edge => {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;
    return filteredNodeIds.has(source) && filteredNodeIds.has(target);
  }) || [];

  // Max connections for slider
  const maxConnections = Math.max(...Object.values(connectionCounts), 1);

  useEffect(() => {
    if (!filteredNodes || filteredNodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 60;

    // Group nodes by type
    const nodesByType = {};
    filteredNodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = [];
      nodesByType[node.type].push(node);
    });

    const types = Object.keys(nodesByType);
    const newPositions = {};
    
    // Use force-directed-like layout for better distribution
    const totalNodes = filteredNodes.length;
    const graphRadius = Math.min(width, height) / 2 - padding;
    
    if (totalNodes < 30) {
      // Simple circular layout for small graphs
      types.forEach((type, typeIndex) => {
        const typeNodes = nodesByType[type];
        const typeAngle = (2 * Math.PI * typeIndex) / types.length;
        const typeRadius = graphRadius * 0.5;
        const typeCenterX = centerX + Math.cos(typeAngle) * typeRadius * 0.3;
        const typeCenterY = centerY + Math.sin(typeAngle) * typeRadius * 0.3;

        typeNodes.forEach((node, nodeIndex) => {
          const nodeAngle = (2 * Math.PI * nodeIndex) / typeNodes.length + typeAngle;
          const nodeRadius = Math.min(typeRadius * 0.8, 50 + typeNodes.length * 15);
          newPositions[node.id] = {
            x: typeCenterX + Math.cos(nodeAngle) * nodeRadius,
            y: typeCenterY + Math.sin(nodeAngle) * nodeRadius,
          };
        });
      });
    } else {
      // Spiral layout for larger graphs - better distribution
      types.forEach((type, typeIndex) => {
        const typeNodes = nodesByType[type];
        const sectorAngle = (2 * Math.PI) / types.length;
        const startAngle = typeIndex * sectorAngle;
        
        typeNodes.forEach((node, nodeIndex) => {
          // Spiral within sector
          const t = nodeIndex / (typeNodes.length - 1 || 1);
          const spiralRadius = padding + t * (graphRadius - padding);
          const angleSpread = sectorAngle * 0.8; // Use 80% of sector
          const nodeAngle = startAngle + sectorAngle * 0.1 + t * angleSpread;
          
          // Add slight deterministic variation based on node id
          const jitter = 15;
          const seed = hashCode(node.id);
          const jx = (seededRandom(seed) - 0.5) * jitter;
          const jy = (seededRandom(seed + 1) - 0.5) * jitter;
          
          newPositions[node.id] = {
            x: centerX + Math.cos(nodeAngle) * spiralRadius + jx,
            y: centerY + Math.sin(nodeAngle) * spiralRadius + jy,
          };
        });
      });
    }

    setPositions(newPositions);
  }, [filteredNodes, height, minConnections, searchTerm]);

  // Zoom handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, transform.scale * delta));
    
    // Zoom towards mouse position
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
    
    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setTransform(t => ({
        ...t,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  // Reset view
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Zoom controls
  const zoomIn = () => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale / 1.2) }));

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary dark:bg-accent-secondary animate-pulse" />
          {title}
        </h3>
      )}
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          />
        </div>

        {/* Connection filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Min connections:</span>
          <input
            type="range"
            min="1"
            max={maxConnections}
            value={minConnections}
            onChange={(e) => setMinConnections(parseInt(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-6">{minConnections}</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors ml-1"
            title="Reset view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Node count */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredNodes.length}</span> of {nodes.length} nodes
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          className="block"
        >
          {/* Background pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
            </pattern>
            
            {/* Glow filter for nodes */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
                className="dark:fill-gray-500"
              />
            </marker>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Transformed content */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* Edges */}
            {filteredEdges.map((edge, index) => {
              const sourceId = edge.source || edge.from;
              const targetId = edge.target || edge.to;
              const fromPos = positions[sourceId];
              const toPos = positions[targetId];
              if (!fromPos || !toPos) return null;

              const isHighlighted = hoveredNode === sourceId || hoveredNode === targetId;

              return (
                <g key={`edge-${index}`}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={isHighlighted ? '#3b82f6' : '#6b7280'}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    strokeOpacity={isHighlighted ? 1 : 0.4}
                    className="dark:stroke-gray-500 transition-all duration-200"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const colors = nodeColors[node.type] || nodeColors.company;
              const isHovered = hoveredNode === node.id;
              const connections = connectionCounts[node.id] || 0;
              const nodeSize = Math.min(30, 18 + connections * 2);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Node circle with glow on hover */}
                  <circle
                    r={isHovered ? nodeSize + 4 : nodeSize}
                    fill={colors.fill}
                    stroke={isHovered ? '#fff' : colors.stroke}
                    strokeWidth={isHovered ? 3 : 2}
                    filter={isHovered ? 'url(#glow)' : undefined}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  
                  {/* Icon */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={nodeSize * 0.6}
                    style={{ pointerEvents: 'none' }}
                  >
                    {colors.icon}
                  </text>

                  {/* Connection count badge */}
                  {connections > 1 && (
                    <g transform={`translate(${nodeSize * 0.7}, ${-nodeSize * 0.7})`}>
                      <circle r={10} fill="#1f2937" stroke="#fff" strokeWidth={1.5} />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {connections}
                      </text>
                    </g>
                  )}

                </g>
              );
            })}

            {/* Tooltip layer - rendered last to be on top */}
            {hoveredNode && (() => {
              const node = filteredNodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              const pos = positions[node.id];
              if (!pos) return null;
              const connections = connectionCounts[node.id] || 0;
              const nodeSize = Math.min(30, 18 + connections * 2);
              
              return (
                <g transform={`translate(${pos.x}, ${pos.y})`} style={{ pointerEvents: 'none' }}>
                  <rect
                    x={-80}
                    y={nodeSize + 8}
                    width={160}
                    height={28}
                    rx={6}
                    fill="rgba(0,0,0,0.95)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                  />
                  <text
                    y={nodeSize + 26}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {node.label?.length > 24 ? node.label.substring(0, 24) + '...' : node.label}
                  </text>
                </g>
              );
            })()}
          </g>
        </svg>

        {/* Help text */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
          Scroll to zoom • Drag to pan
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20">
          {Object.entries(nodeColors).map(([type, colors]) => {
            const hasType = filteredNodes.some(n => n.type === type);
            if (!hasType) return null;
            
            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors.fill }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
