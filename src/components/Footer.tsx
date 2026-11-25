import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#343744] bg-[#0B0C10] text-[#A2A4B1] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Summary */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-[10px] bg-[#191C25] border border-[#343744] group-hover:border-[#F0A15B] flex items-center justify-center transition-colors">
                <Play className="w-4 h-4 text-[#F0A15B] fill-[#F0A15B] ml-0.5" />
              </span>
              <span className="font-heading font-bold text-lg tracking-tight text-[#F2F0EC]">
                Fazura<span className="text-[#F0A15B]">Stream</span>
              </span>
            </Link>
            <p className="text-[13px] font-medium text-[#F2F0EC]">
              Your Universe of Entertainment.
            </p>
            <p className="text-xs text-[#747887] max-w-sm leading-relaxed">
              Platform hiburan terpadu untuk streaming anime, film bioskop & serial TV, donghua 3D, baca komik manga, serta memutar musik dalam satu ekosistem yang konsisten.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-semibold text-[#F2F0EC] uppercase tracking-wider">
              Kategori Hiburan
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link to="/anime" className="hover:text-[#A78BFA] transition-colors">
                  Anime Streaming
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-[#F0A15B] transition-colors">
                  Movies & Serial TV
                </Link>
              </li>
              <li>
                <Link to="/manga" className="hover:text-[#75C9A0] transition-colors">
                  Manga, Manhwa & Manhua
                </Link>
              </li>
              <li>
                <Link to="/donghua" className="hover:text-[#67BFD5] transition-colors">
                  Donghua Animasi
                </Link>
              </li>
              <li>
                <Link to="/music" className="hover:text-[#E68BA6] transition-colors">
                  Musik & Playlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Library & Search */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-semibold text-[#F2F0EC] uppercase tracking-wider">
              Pustaka Pengguna
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link to="/search" className="hover:text-[#F0A15B] transition-colors">
                  Pencarian Terpadu
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-[#F0A15B] transition-colors">
                  Daftar Favorit Saya
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#F0A15B] transition-colors">
                  Riwayat Tonton & Baca
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#343744]/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#747887]">
          <p>© {new Date().getFullYear()} FazuraStream. Your Universe of Entertainment.</p>
          <p>Anime • Movies • Manga • Donghua • Music</p>
        </div>
      </div>
    </footer>
  );
}
