import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090912]/90 backdrop-blur-md text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] via-[#A78BFA] to-amber-400 p-[2px] transition-transform group-hover:scale-105 shadow-md shadow-[#8B5CF6]/20">
                <div className="w-full h-full bg-[#11111D] rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-white">
                  FAZURA<span className="text-[#8B5CF6]">VERSE</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                  次元
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#A1A1B5] max-w-sm leading-relaxed">
              FAZURAVERSE adalah platform all-in-one hiburan digital terlengkap di Indonesia. Baca puluhan ribu komik manga, streaming anime sub Indo, tonton donghua resolusi tinggi, dan nikmati film box office & serial TV gratis.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#717187]">
              <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Multi-Source APIs: BacaKomik • Otakudesu • Anichin • FazuraDex Movie • Fazura Music</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Portal Hiburan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/manga" className="hover:text-[#A78BFA] transition-colors">
                  Manga & Komik
                </Link>
              </li>
              <li>
                <Link to="/anime" className="hover:text-amber-400 transition-colors">
                  Anime Streaming
                </Link>
              </li>
              <li>
                <Link to="/donghua" className="hover:text-emerald-400 transition-colors">
                  Donghua Chinese Animation
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-rose-400 transition-colors">
                  Movie & Series Bioskop
                </Link>
              </li>
              <li>
                <Link to="/music" className="hover:text-[#1DB954] transition-colors">
                  Musik & Lagu (Fazura Music)
                </Link>
              </li>
            </ul>
          </div>

          {/* Personal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Pustaka</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/bookmarks" className="hover:text-[#A78BFA] transition-colors">
                  Daftar Favorit
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#A78BFA] transition-colors">
                  Riwayat Baca & Tonton
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#A78BFA] transition-colors">
                  Pencarian Komik & Media
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#717187]">
          <p>© {new Date().getFullYear()} FAZURAVERSE. All rights reserved.</p>
          <p className="flex items-center gap-1 font-mono text-[11px]">
            Manga • Anime • Donghua • Movie • Music Digital Hub
          </p>
        </div>
      </div>
    </footer>
  );
}
