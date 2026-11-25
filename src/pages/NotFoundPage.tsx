import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { buttonClasses } from '../components/common/Button';

export function NotFoundPage() {
  usePageMeta({
    title: 'Halaman Tidak Ditemukan (404)',
    description: 'Halaman yang Anda cari tidak ditemukan di FazuraStream.',
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#12141B]">
      <div className="max-w-lg w-full rounded-[20px] bg-[#191C25] border border-[#343744] p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-[10px] bg-[#232633] border border-[#343744] text-[#F0A15B] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F0A15B]">Error 404</p>
          <h1 className="font-heading text-3xl font-bold text-[#F2F0EC]">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#A2A4B1] leading-relaxed">
            Tautan yang Anda tuju mungkin sudah dipindahkan atau tidak tersedia. Kembali ke beranda atau jelajahi katalog hiburan kami.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link to="/search" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            <Search className="w-4 h-4" />
            <span>Cari Konten</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
