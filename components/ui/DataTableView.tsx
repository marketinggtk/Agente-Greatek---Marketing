import React, { useState, useMemo } from 'react';

interface DataTableViewProps {
  headers: string[];
  rows: string[][];
}

type SortDirection = 'asc' | 'desc';

const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|https?:\/\/[^\s]+|\/[^\s]+|Google Search Console|Google Analytics|GA4)/gi;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        if (!part) return null;
        const lowerPart = part.toLowerCase();
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('http')) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (part.startsWith('/')) {
            return <a key={index} href={`https://www.greatek.com.br${part}`} target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (lowerPart === 'google search console') {
            return <a key={index} href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        if (lowerPart === 'google analytics' || lowerPart === 'ga4') {
            return <a key={index} href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-greatek-blue hover:underline">{part}</a>;
        }
        return part;
    });
};

export const DataTableView: React.FC<DataTableViewProps> = ({ headers, rows }) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedRows = useMemo(() => {
    if (sortColumn === null) {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
    });

    if (sortDirection === 'desc') {
      sorted.reverse();
    }
    
    return sorted;
  }, [rows, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) {
      return <i className="bi bi-arrow-down-up text-gray-400"></i>;
    }
    if (sortDirection === 'asc') {
      return <i className="bi bi-arrow-up text-greatek-blue"></i>;
    }
    return <i className="bi bi-arrow-down text-greatek-blue"></i>;
  };

  return (
    <div className="my-4 overflow-x-auto border border-greatek-border rounded-lg not-prose shadow-sm">
      <table className="min-w-full divide-y divide-greatek-border">
        <thead className="bg-greatek-bg-light/80">
          <tr>
            {headers.map((header, hIdx) => (
              <th
                key={hIdx}
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold text-greatek-dark-blue uppercase tracking-wider cursor-pointer hover:bg-greatek-border transition-colors"
                onClick={() => handleSort(hIdx)}
              >
                <div className="flex items-center justify-between">
                  <span>{header}</span>
                  {getSortIcon(hIdx)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-greatek-border">
          {sortedRows.map((row, rIdx) => (
            <tr key={rIdx} className="even:bg-black/5 hover:bg-greatek-blue/10 transition-colors duration-150">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 whitespace-normal text-sm text-text-secondary">
                   {parseInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
