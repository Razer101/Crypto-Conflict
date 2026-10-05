import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Globe, MapPin, Eye, Filter, RefreshCw } from 'lucide-react';
import { NewsHeadline } from '../types/snapshot';

interface ConflictWorldMapProps {
  headlines: NewsHeadline[];
  selectedRegionFilter: string | null;
  onSelectRegion: (region: string | null) => void;
}

interface RegionDefinition {
  id: string;
  name: string;
  isoCodes: string[];
  keywords: string[];
  coordinates: [number, number]; // [longitude, latitude]
}

// Key Geopolitical Regions & Flashpoints
const REGION_DEFINITIONS: RegionDefinition[] = [
  {
    id: 'russia_ukraine',
    name: 'Russia & Ukraine (War Theater)',
    isoCodes: ['643', '804', '112'], // Russia, Ukraine, Belarus
    keywords: ['russia', 'russian', 'ukraine', 'ukrainian', 'kyiv', 'kiev', 'moscow', 'putin', 'zelensky', 'black sea', 'crimea', 'kursk', 'donbas', 'donetsk', 'luhansk', 'kharkiv', 'dnipro', 'odesa', 'zaporizhzhia', 'urals', 'druzhba', 'gazprom', 'shadow fleet', 'refinery', 'refineries', 'sanctions', 'belgorod', 'nato', 'baltic'],
    coordinates: [37.6, 52.0],
  },
  {
    id: 'middle_east',
    name: 'Middle East & Persian Gulf',
    isoCodes: ['364', '376', '682', '887', '368', '760', '818', '784'], // Iran, Israel, Saudi, Yemen, Iraq, Syria, Egypt, UAE
    keywords: ['iran', 'israel', 'tehran', 'gaza', 'saudi', 'yemen', 'houthi', 'middle east', 'hormuz', 'red sea', 'opec', 'persian gulf', 'lebanon', 'syria', 'iraq'],
    coordinates: [53.68, 28.5],
  },
  {
    id: 'east_asia',
    name: 'East Asia & Taiwan Strait',
    isoCodes: ['156', '158', '392', '410', '408'], // China, Taiwan, Japan, South Korea, North Korea
    keywords: ['china', 'taiwan', 'beijing', 'taipei', 'south china sea', 'indo-pacific', 'korea', 'japan'],
    coordinates: [118.0, 31.0],
  },
  {
    id: 'north_america',
    name: 'North America / USA',
    isoCodes: ['840', '124'], // USA, Canada
    keywords: ['trump', 'biden', 'u.s.', 'usa', 'united states', 'washington', 'fed', 'treasury', 'dollar', 'pentagon'],
    coordinates: [-98.5, 39.5],
  },
  {
    id: 'western_europe',
    name: 'Western Europe / EU',
    isoCodes: ['826', '276', '250'], // UK, Germany, France
    keywords: ['britain', 'uk', 'london', 'germany', 'berlin', 'france', 'paris', 'european union', 'ecb'],
    coordinates: [5.0, 50.0],
  },
  {
    id: 'latin_america',
    name: 'Latin America & Caribbean',
    isoCodes: ['862', '076'], // Venezuela, Brazil
    keywords: ['venezuela', 'caracas', 'brazil', 'panama canal', 'guyana'],
    coordinates: [-66.0, 8.0],
  },
];

export const ConflictWorldMap: React.FC<ConflictWorldMapProps> = ({
  headlines,
  selectedRegionFilter,
  onSelectRegion,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<{
    name: string;
    headlineCount: number;
    sampleHeadline?: string;
    x: number;
    y: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load local world-atlas GeoJSON
  useEffect(() => {
    fetch('/countries-110m.json')
      .then((r) => r.json())
      .then((topology) => {
        const countries = topojson.feature(topology, topology.objects.countries);
        setGeoData(countries);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load world map dataset:', err);
        setLoading(false);
      });
  }, []);

  // Analyze headlines and extract mentioned regions
  const activeHotspots = useMemo(() => {
    return REGION_DEFINITIONS.map((region) => {
      const matchingHeadlines = headlines.filter((h) => {
        const text = (h.title + ' ' + (h.fullTitle || '')).toLowerCase();
        return region.keywords.some((kw) => text.includes(kw));
      });

      return {
        ...region,
        count: matchingHeadlines.length,
        headlines: matchingHeadlines,
      };
    }).filter((r) => r.count > 0);
  }, [headlines]);

  // Set of active ISO codes to highlight
  const highlightedIsoMap = useMemo(() => {
    const map = new Map<string, { region: RegionDefinition; count: number; headlines: NewsHeadline[] }>();
    activeHotspots.forEach((spot) => {
      spot.isoCodes.forEach((code) => {
        map.set(code, {
          region: spot,
          count: spot.count,
          headlines: spot.headlines,
        });
      });
    });
    return map;
  }, [activeHotspots]);

  // Projection setup
  const width = 900;
  const height = 430;

  const projection = useMemo(() => {
    return d3
      .geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2 + 10]);
  }, []);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl overflow-hidden mb-6">
      {/* Map Control Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-[#070A10] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Geopolitical Conflict &amp; Chokepoint Radar
          </span>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            (D3.js Natural Earth Vector Projection)
          </span>
        </div>

        {/* Hotspots Quick Filter Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedRegionFilter && (
            <button
              onClick={() => onSelectRegion(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            >
              <Filter className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}

          {activeHotspots.map((spot) => {
            const isSelected = selectedRegionFilter === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => onSelectRegion(isSelected ? null : spot.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{spot.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                  {spot.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[2.1/1] min-h-[260px] max-h-[460px] bg-[#070A12] flex items-center justify-center overflow-hidden">
        {loading || !geoData ? (
          <div className="flex flex-col items-center gap-2 text-xs font-mono text-slate-500">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            <span>Rendering geopolitical world vector map...</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Graticule styling & glow filters */}
              <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Latitude / Longitude Subtle Grid Lines */}
            <path
              d={pathGenerator(d3.geoGraticule10()) || ''}
              fill="none"
              stroke="#131B2E"
              strokeWidth="0.6"
              strokeDasharray="2,2"
            />

            {/* Countries GeoJSON paths */}
            <g>
              {(geoData as any).features.map((feature: any) => {
                const isoId = String(feature.id);
                const highlight = highlightedIsoMap.get(isoId);
                const isHighlighted = Boolean(highlight);
                const isSelected = selectedRegionFilter && highlight?.region.id === selectedRegionFilter;

                return (
                  <path
                    key={isoId}
                    d={pathGenerator(feature) || ''}
                    className="transition-colors duration-150 cursor-pointer"
                    fill={
                      isSelected
                        ? '#F59E0B'
                        : isHighlighted
                        ? 'rgba(245, 158, 11, 0.35)'
                        : '#141D30'
                    }
                    stroke={
                      isSelected
                        ? '#F59E0B'
                        : isHighlighted
                        ? 'rgba(245, 158, 11, 0.8)'
                        : '#1E293B'
                    }
                    strokeWidth={isHighlighted ? 1.2 : 0.6}
                    onMouseEnter={(e) => {
                      if (highlight) {
                        const rect = svgRef.current?.getBoundingClientRect();
                        setHoveredRegion({
                          name: highlight.region.name,
                          headlineCount: highlight.count,
                          sampleHeadline: highlight.headlines[0]?.title,
                          x: e.clientX - (rect?.left || 0),
                          y: e.clientY - (rect?.top || 0),
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => {
                      if (highlight) {
                        onSelectRegion(selectedRegionFilter === highlight.region.id ? null : highlight.region.id);
                      }
                    }}
                  />
                );
              })}
            </g>

            {/* Tactical Radar Marker Rings on Active Hotspots */}
            <g>
              {activeHotspots.map((spot) => {
                const projected = projection(spot.coordinates);
                if (!projected) return null;
                const [cx, cy] = projected;
                const isSelected = selectedRegionFilter === spot.id;

                return (
                  <g
                    key={spot.id}
                    className="cursor-pointer group"
                    onClick={() => onSelectRegion(isSelected ? null : spot.id)}
                  >
                    {/* Animated Pulsing Radar Rings */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 18 : 14}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1"
                      opacity="0.3"
                      className="animate-ping"
                      style={{ animationDuration: '2.5s' }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 12 : 9}
                      fill="rgba(245, 158, 11, 0.2)"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#F59E0B"
                    />

                    {/* Region Callout Label */}
                    <text
                      x={cx + 12}
                      y={cy + 4}
                      fill="#F1F5F9"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      className="drop-shadow-md select-none"
                    >
                      {spot.name.split(' ')[0]} ({spot.count})
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Hover Tooltip Card */}
        {hoveredRegion && (
          <div
            className="absolute pointer-events-none z-20 bg-[#0F172A]/95 border border-amber-500/40 p-3 rounded-lg shadow-xl text-xs font-mono max-w-xs backdrop-blur-sm animate-in fade-in duration-100"
            style={{
              left: Math.min(hoveredRegion.x + 12, width - 260),
              top: Math.max(hoveredRegion.y - 45, 10),
            }}
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hoveredRegion.name}</span>
            </div>
            <div className="text-slate-300 font-normal">
              Active in <span className="text-amber-300 font-semibold">{hoveredRegion.headlineCount}</span> conflict headline(s)
            </div>
            {hoveredRegion.sampleHeadline && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 italic line-clamp-2">
                "{hoveredRegion.sampleHeadline}"
              </div>
            )}
            <div className="mt-1.5 text-[10px] text-amber-400/80 font-medium">
              Click region to filter wire feed ↓
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="px-5 py-2.5 bg-[#070A10] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/35 border border-amber-500/80" />
            <span>Mentioned in Live Headlines</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Tactical Hotspot Centroid</span>
          </span>
        </div>

        <div className="text-slate-500">
          {selectedRegionFilter ? (
            <span className="text-amber-400">
              Filtered to: {REGION_DEFINITIONS.find((r) => r.id === selectedRegionFilter)?.name}
            </span>
          ) : (
            <span>Click any highlighted region or hotspot to filter headline dispatches</span>
          )}
        </div>
      </div>
    </div>
  );
};
