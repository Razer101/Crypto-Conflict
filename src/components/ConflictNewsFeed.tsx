import React, { useState, useMemo } from 'react';
import { Newspaper, ExternalLink, Search, Clock, Map, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { NewsHeadline } from '../types/snapshot';
import { ConflictWorldMap } from './ConflictWorldMap';

interface ConflictNewsFeedProps {
  headlines: NewsHeadline[];
}

export const ConflictNewsFeed: React.FC<ConflictNewsFeedProps> = ({ headlines }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);

  const categories = [
    'All',
    'Russia-Ukraine Conflict',
    'Energy & Oil',
    'Precious Metals',
    'Geopolitics & Defense',
    'Macro & Monetary',
    'Crypto Risk-On',
  ];

  // Regional keywords mapping for wire filtering
  const REGION_KEYWORDS_MAP: Record<string, string[]> = {
    russia_ukraine: ['russia', 'russian', 'ukraine', 'ukrainian', 'kyiv', 'kiev', 'moscow', 'putin', 'zelensky', 'black sea', 'crimea', 'kursk', 'donbas', 'donetsk', 'luhansk', 'kharkiv', 'dnipro', 'odesa', 'zaporizhzhia', 'urals', 'druzhba', 'gazprom', 'shadow fleet', 'refinery', 'refineries', 'sanctions', 'belgorod', 'nato'],
    middle_east: ['iran', 'israel', 'tehran', 'gaza', 'saudi', 'yemen', 'houthi', 'middle east', 'hormuz', 'red sea', 'opec', 'persian gulf', 'lebanon', 'syria', 'iraq'],
    east_asia: ['china', 'taiwan', 'beijing', 'taipei', 'south china sea', 'indo-pacific', 'korea', 'japan'],
    north_america: ['trump', 'biden', 'u.s.', 'usa', 'united states', 'washington', 'fed', 'treasury', 'dollar', 'pentagon'],
    western_europe: ['britain', 'uk', 'london', 'germany', 'berlin', 'france', 'paris', 'european union', 'ecb'],
    latin_america: ['venezuela', 'caracas', 'brazil', 'panama canal', 'guyana'],
  };

  const REGION_LABELS: Record<string, string> = {
    russia_ukraine: 'Russia & Ukraine (War Theater)',
    middle_east: 'Middle East & Persian Gulf',
    east_asia: 'East Asia & Taiwan Strait',
    north_america: 'North America / USA',
    western_europe: 'Western Europe / EU',
    latin_america: 'Latin America',
  };

  const filteredHeadlines = useMemo(() => {
    return headlines.filter((item) => {
      const fullText = (item.title + ' ' + (item.fullTitle || '') + ' ' + item.source).toLowerCase();

      // Keyword Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        fullText.includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Region Filter from D3 Map
      let matchesRegion = true;
      if (selectedRegionFilter && REGION_KEYWORDS_MAP[selectedRegionFilter]) {
        const kws = REGION_KEYWORDS_MAP[selectedRegionFilter];
        matchesRegion = kws.some((kw) => fullText.includes(kw));
      }

      return matchesSearch && matchesCat && matchesRegion;
    });
  }, [headlines, searchQuery, selectedCategory, selectedRegionFilter]);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div id="conflict-news" className="bg-[#111827] border border-slate-800 rounded-xl p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Top Geopolitical Conflict &amp; Market Headlines
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time wire monitoring defense escalations, energy chokepoints, central bank reserves, and macro shocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle World Map View Button */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              showMap
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Conflict Map</span>
            {showMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wire..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* D3 Simplified World Map Integration */}
      {showMap && (
        <div className="mt-4">
          <ConflictWorldMap
            headlines={headlines}
            selectedRegionFilter={selectedRegionFilter}
            onSelectRegion={setSelectedRegionFilter}
          />
        </div>
      )}

      {/* Active Geographic Filter Banner (if set by map click) */}
      {selectedRegionFilter && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3.5 py-2 mb-4 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <Filter className="w-3.5 h-3.5" />
            <span>Map Filter Active: <strong>{REGION_LABELS[selectedRegionFilter] || selectedRegionFilter}</strong> ({filteredHeadlines.length} matching stories)</span>
          </div>
          <button
            onClick={() => setSelectedRegionFilter(null)}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
          >
            <X className="w-3 h-3" />
            <span>Clear Map Filter</span>
          </button>
        </div>
      )}

      {/* Category Tabs (Interactive Filter Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800/80 text-xs font-mono scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Headlines List */}
      <div className="divide-y divide-slate-800/60 mt-2">
        {filteredHeadlines.length > 0 ? (
          filteredHeadlines.map((item, index) => (
            <div
              key={item.id || index}
              className="py-3.5 px-2 hover:bg-slate-900/40 rounded-lg transition-colors group flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {/* Index numbering matching Python terminal output: 1. , 2. , 3. */}
                <span className="font-mono text-xs font-bold text-amber-400/80 shrink-0 w-6 pt-0.5 tabular-nums">
                  {(index + 1).toString().padStart(2, '0')}.
                </span>

                <div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-100 hover:text-amber-300 transition-colors group-hover:underline leading-snug"
                  >
                    {item.title}
                  </a>

                  {/* Clean Unboxed Metadata (Zero-Pills Discipline) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1.5">
                    <span className="text-slate-300 font-medium">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(item.pubDate)}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400/80">{item.category}</span>
                  </div>
                </div>
              </div>

              {/* External Link Action */}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                title="Read original dispatch"
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            No headlines match filter {searchQuery ? `"${searchQuery}"` : ''} {selectedRegionFilter ? `in ${REGION_LABELS[selectedRegionFilter]}` : ''}.
          </div>
        )}
      </div>
    </div>
  );
};
