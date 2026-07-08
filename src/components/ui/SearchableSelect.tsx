'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Cari...',
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCoords = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, updateCoords]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-white px-3 py-2 text-xs font-bold text-foreground shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary hover:bg-muted/10",
          isOpen && "ring-1 ring-primary border-primary",
          className?.includes('h-9') && 'h-9 rounded-lg'
        )}
      >
        <span className={cn(selectedOption ? 'text-foreground' : 'text-muted-foreground', 'truncate')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200 shrink-0 ml-2", isOpen && "rotate-180")} />
      </button>

      {mounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          className="z-[9999] mt-1 max-h-64 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 origin-top pointer-events-auto searchable-select-dropdown"
        >
          <div className="relative flex items-center border-b border-border pb-1.5 mb-1.5 px-1">
            <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-lg bg-muted/30 pl-8 pr-7 text-xs font-medium focus:outline-none focus:bg-muted/50 border border-transparent focus:border-border text-foreground"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs font-semibold text-muted-foreground">
                Tidak ditemukan
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-all hover:bg-primary/5 hover:text-primary cursor-pointer",
                      isSelected ? "bg-primary/10 text-primary" : "text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.subLabel && (
                      <span className="text-[10px] font-normal text-muted-foreground mt-0.5">
                        {opt.subLabel}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
