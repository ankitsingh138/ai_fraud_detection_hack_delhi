import { useEffect, useRef, useState } from 'react';

const NetworkGraph = ({ nodes, edges, title, height = 400 }) => {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);

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

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const width = svgRef.current?.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by type
    const nodesByType = {};
    nodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = [];
      nodesByType[node.type].push(node);
    });

    const types = Object.keys(nodesByType);
    const newPositions = {};

    // Position nodes in a circular layout with type clustering
    types.forEach((type, typeIndex) => {
      const typeNodes = nodesByType[type];
      const typeAngle = (2 * Math.PI * typeIndex) / types.length;
      const typeRadius = Math.min(width, height) * 0.25;
      const typeCenterX = centerX + Math.cos(typeAngle) * typeRadius;
      const typeCenterY = centerY + Math.sin(typeAngle) * typeRadius;

      typeNodes.forEach((node, nodeIndex) => {
        const nodeAngle = (2 * Math.PI * nodeIndex) / typeNodes.length;
        const nodeRadius = 60 + typeNodes.length * 15;
        newPositions[node.id] = {
          x: typeCenterX + Math.cos(nodeAngle) * nodeRadius,
          y: typeCenterY + Math.sin(nodeAngle) * nodeRadius,
        };
      });
    });

    setPositions(newPositions);
  }, [nodes, height]);

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
      
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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

          {/* Edges */}
          {edges && edges.map((edge, index) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  className="dark:stroke-gray-500"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const colors = nodeColors[node.type] || nodeColors.company;
            const isHovered = hoveredNode === node.id;

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
                  r={isHovered ? 28 : 24}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="3"
                  filter={isHovered ? 'url(#glow)' : undefined}
                  style={{ transition: 'all 0.2s ease' }}
                />
                
                {/* Icon */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  style={{ pointerEvents: 'none' }}
                >
                  {colors.icon}
                </text>

                {/* Label - show on hover or always for important nodes */}
                {(isHovered || node.type === 'address' || node.type === 'ip' || node.type === 'person' || node.type === 'bank') && (
                  <g>
                    <rect
                      x={-60}
                      y={32}
                      width={120}
                      height={24}
                      rx={4}
                      fill="rgba(0,0,0,0.8)"
                    />
                    <text
                      y={48}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="500"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.label.length > 18 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20">
          {Object.entries(nodeColors).map(([type, colors]) => {
            const hasType = nodes.some(n => n.type === type);
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

