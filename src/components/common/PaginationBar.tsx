import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationBarProps) {
  const [jumpInput, setJumpInput] = useState('');

  if (totalPages <= 1) return null;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput.trim(), 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpInput('');
    }
  };

  const pageNumbers: number[] = [];
  if (currentPage > 2) pageNumbers.push(1);
  if (currentPage > 1) pageNumbers.push(currentPage - 1);
  pageNumbers.push(currentPage);
  if (currentPage < totalPages) pageNumbers.push(currentPage + 1);
  if (currentPage < totalPages - 1) pageNumbers.push(totalPages);

  const uniquePages = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);

  return (
    <div className="w-full space-y-4 pt-6 border-t border-[#343744]/60">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto scrollbar-none py-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-[10px] bg-[#191C25] hover:bg-[#232633] disabled:opacity-40 text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {uniquePages.map((p, index) => {
            const prev = uniquePages[index - 1];
            const showEllipsis = prev && p - prev > 1;
            const isActive = p === currentPage;

            return (
              <React.Fragment key={p}>
                {showEllipsis && (
                  <span className="px-1 text-xs text-[#747887]">...</span>
                )}
                <button
                  type="button"
                  onClick={() => !isActive && onPageChange(p)}
                  disabled={isLoading}
                  className={`w-9 h-9 rounded-[10px] text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#F0A15B] text-[#0B0C10] border-transparent font-bold'
                      : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || isLoading}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-40 text-[#0B0C10] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {totalPages > 3 && (
        <form
          onSubmit={handleJump}
          className="flex items-center justify-center gap-2 text-xs text-[#A2A4B1]"
        >
          <span>Lompat ke halaman:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder={String(currentPage)}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            className="w-16 h-8 px-2 rounded-[6px] bg-[#191C25] border border-[#343744] text-[#F2F0EC] text-center focus:border-[#F0A15B] focus:outline-none"
          />
          <button
            type="submit"
            className="h-8 px-3 rounded-[6px] bg-[#232633] hover:bg-[#F0A15B] hover:text-[#0B0C10] text-[#F2F0EC] font-semibold border border-[#343744] transition-colors cursor-pointer"
          >
            Buka
          </button>
        </form>
      )}
    </div>
  );
}
