import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  ArrowRight,
  RefreshCw,
  FolderSync,
  Layers,
  Copy,
  Check,
  BookOpen,
  Film,
  Tv,
  Clapperboard,
  Music,
} from 'lucide-react';
import {
  createBackupData,
  downloadBackupFile,
  validateBackupData,
  applyBackupData,
} from '../../services/categoryStorage';
import type {
  BackupData,
  BackupValidationResult,
  CategoryType,
} from '../../services/categoryStorage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'sync'>('export');
  const [exportStats, setExportStats] = useState<{
    totalBookmarks: number;
    totalHistory: number;
    byCategory: Record<CategoryType, { bookmarks: number; history: number }>;
  } | null>(null);

  // Sync Code State
  const [syncCode, setSyncCode] = useState<string>('');
  const [inputSyncCode, setInputSyncCode] = useState<string>('');
  const [copiedSync, setCopiedSync] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // Import State
  const [dragOver, setDragOver] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'overwrite'>('merge');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    stats?: { bookmarks: number; history: number };
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current stats for export view
  useEffect(() => {
    if (isOpen) {
      const data = createBackupData();
      const categories: CategoryType[] = ['manga', 'anime', 'donghua', 'movies', 'music'];
      let bCount = 0;
      let hCount = 0;
      const byCat = {
        manga: { bookmarks: 0, history: 0 },
        anime: { bookmarks: 0, history: 0 },
        donghua: { bookmarks: 0, history: 0 },
        movies: { bookmarks: 0, history: 0 },
        music: { bookmarks: 0, history: 0 },
      };

      for (const cat of categories) {
        const b = data.bookmarks[cat]?.length || 0;
        const h = data.history[cat]?.length || 0;
        byCat[cat] = { bookmarks: b, history: h };
        bCount += b;
        hCount += h;
      }

      setExportStats({
        totalBookmarks: bCount,
        totalHistory: hCount,
        byCategory: byCat,
      });

      // Reset import state when opened
      setFileContent(null);
      setFileName('');
      setValidationResult(null);
      setImportStatus(null);
      setRestoreMode('merge');
      setConfirmOverwrite(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = () => {
    downloadBackupFile();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setValidationResult({
        valid: false,
        error: 'File harus berformat .json',
      });
      return;
    }

    setFileName(file.name);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      const res = validateBackupData(content);
      setValidationResult(res);
    };
    reader.onerror = () => {
      setValidationResult({
        valid: false,
        error: 'Gagal membaca isi file yang diunggah.',
      });
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!validationResult?.valid || !validationResult.data) return;
    if (restoreMode === 'overwrite' && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = applyBackupData(validationResult.data, restoreMode);
      setConfirmOverwrite(false);
      setImportStatus({
        success: true,
        message: `Berhasil memulihkan ${result.bookmarksImported} bookmark dan ${result.historyImported} item riwayat (${
          restoreMode === 'merge' ? 'Mode Penggabungan' : 'Mode Timpa Total'
        }).`,
        stats: {
          bookmarks: result.bookmarksImported,
          history: result.historyImported,
        },
      });
      onDataChanged?.();
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: `Terjadi kesalahan saat memulihkan data (data lama tetap aman): ${err?.message || 'Error'}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSyncCode = () => {
    try {
      const data = createBackupData();
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      setSyncCode(encoded);
      navigator.clipboard.writeText(encoded);
      setCopiedSync(true);
      setTimeout(() => setCopiedSync(false), 2500);
    } catch {
      setSyncError('Gagal membuat kode sinkronisasi.');
    }
  };

  const handleApplySyncCode = () => {
    if (!inputSyncCode.trim()) return;
    setSyncError(null);
    setSyncSuccess(null);

    try {
      const decodedJson = decodeURIComponent(escape(atob(inputSyncCode.trim())));
      const validation = validateBackupData(decodedJson);
      if (!validation.valid || !validation.data) {
        setSyncError(validation.error || 'Format kode sinkronisasi tidak valid.');
        return;
      }

      const result = applyBackupData(validation.data, restoreMode);
      setSyncSuccess(
        `Sinkronisasi berhasil! ${result.bookmarksImported} bookmark dan ${result.historyImported} riwayat berhasil diterapkan.`
      );
      setInputSyncCode('');
      onDataChanged?.();
    } catch {
      setSyncError('Kode sinkronisasi rusak atau tidak dikenali.');
    }
  };

  const categoryIcons: Record<CategoryType, React.ReactNode> = {
    manga: <BookOpen className="w-3.5 h-3.5 text-[#75C9A0]" />,
    anime: <Tv className="w-3.5 h-3.5 text-[#A78BFA]" />,
    donghua: <Film className="w-3.5 h-3.5 text-[#67BFD5]" />,
    movies: <Clapperboard className="w-3.5 h-3.5 text-[#F0A15B]" />,
    music: <Music className="w-3.5 h-3.5 text-[#E68BA6]" />,
  };

  const categoryLabels: Record<CategoryType, string> = {
    manga: 'Manga',
    anime: 'Anime',
    donghua: 'Donghua',
    movies: 'Movies & TV',
    music: 'Music',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#191C25] border border-[#343744] rounded-2xl shadow-dialog overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#343744] bg-[#232633]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#232633] border border-[#343744] flex items-center justify-center text-[#F0A15B]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-[#F2F0EC] flex items-center gap-2">
                Backup & Restore FazuraStream
              </h2>
              <p className="text-xs text-[#A2A4B1]">
                Simpan atau pulihkan data bookmark dan riwayat tontonan/bacaan antar perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-[10px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#232633] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-[#343744] bg-[#12141B] px-5 sm:px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-[10px] transition-colors border-b-2 shrink-0 ${
              activeTab === 'export'
                ? 'text-[#F0A15B] border-[#F0A15B] bg-[#191C25]'
                : 'text-[#747887] border-transparent hover:text-[#F2F0EC]'
            }`}
          >
            <Download className="w-4 h-4" />
            Ekspor Data (Backup)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-[10px] transition-colors border-b-2 shrink-0 ${
              activeTab === 'import'
                ? 'text-[#F0A15B] border-[#F0A15B] bg-[#191C25]'
                : 'text-[#747887] border-transparent hover:text-[#F2F0EC]'
            }`}
          >
            <Upload className="w-4 h-4" />
            Impor Data (Restore)
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-[10px] transition-colors border-b-2 shrink-0 ${
              activeTab === 'sync'
                ? 'text-[#F0A15B] border-[#F0A15B] bg-[#191C25]'
                : 'text-[#747887] border-transparent hover:text-[#F2F0EC]'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            Kode Sinkronisasi Cepat
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'export' ? (
            /* EXPORT TAB */
            <div className="space-y-6">
              <div className="p-4 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#F2F0EC]">Ringkasan Data Saat Ini</span>
                  <span className="text-xs text-[#F0A15B] font-mono">
                    Total: {(exportStats?.totalBookmarks || 0) + (exportStats?.totalHistory || 0)} item
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-[10px] bg-[#191C25] border border-[#343744]">
                    <div className="text-xs text-[#747887] mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#F0A15B]" />
                      Total Bookmark
                    </div>
                    <div className="text-2xl font-bold font-heading text-[#F2F0EC]">
                      {exportStats?.totalBookmarks || 0}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#191C25] border border-[#343744]">
                    <div className="text-xs text-[#747887] mb-1 flex items-center gap-1.5">
                      <FolderSync className="w-3.5 h-3.5 text-[#67BFD5]" />
                      Total Riwayat
                    </div>
                    <div className="text-2xl font-bold font-heading text-[#F2F0EC]">
                      {exportStats?.totalHistory || 0}
                    </div>
                  </div>
                </div>

                {/* Per Category Breakdown */}
                <div className="pt-2 border-t border-[#343744]">
                  <div className="text-[11px] font-semibold text-[#747887] mb-2 uppercase tracking-wider">
                    Rincian per Kategori
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['manga', 'anime', 'donghua', 'movies', 'music'] as CategoryType[]).map((cat) => {
                      const b = exportStats?.byCategory[cat]?.bookmarks || 0;
                      const h = exportStats?.byCategory[cat]?.history || 0;
                      return (
                        <div
                          key={cat}
                          className="p-2.5 rounded-[10px] bg-[#191C25] border border-[#343744] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {categoryIcons[cat]}
                            <span className="text-xs font-semibold text-[#A2A4B1]">
                              {categoryLabels[cat]}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#747887]">
                            {b} b / {h} r
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#12141B] border border-[#343744] text-xs text-[#A2A4B1] space-y-2">
                <p className="font-semibold text-[#F2F0EC] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#75C9A0]" />
                  Format Standar FazuraStream
                </p>
                <p>
                  File backup akan diunduh dengan nama{' '}
                  <code className="text-[#F2F0EC] bg-[#232633] px-1.5 py-0.5 rounded font-mono">
                    fazurastream-backup-{new Date().toISOString().split('T')[0]}.json
                  </code>
                  . Anda dapat menyimpannya di Google Drive, flashdisk, atau membukanya di browser lain.
                </p>
              </div>

              <button
                onClick={handleExport}
                className="w-full min-h-[44px] flex items-center justify-center gap-2.5 py-3 px-6 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh File Backup Sekarang
              </button>
            </div>
          ) : activeTab === 'import' ? (
            /* IMPORT TAB */
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer p-8 rounded-[12px] border-2 border-dashed transition-colors text-center flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? 'border-[#F0A15B] bg-[#232633]'
                    : 'border-[#343744] hover:border-[#454958] bg-[#12141B]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-[10px] bg-[#232633] border border-[#343744] flex items-center justify-center text-[#F0A15B]">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F2F0EC]">
                    {fileName ? fileName : 'Pilih atau Tarik File Backup JSON'}
                  </div>
                  <p className="text-xs text-[#747887] mt-1">
                    Mendukung file backup resmi FazuraStream (.json)
                  </p>
                </div>
              </div>

              {/* Validation Status & Preview */}
              {validationResult && (
                <div className="space-y-4">
                  {validationResult.valid ? (
                    <div className="p-4 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-3">
                      <div className="flex items-center gap-2 text-[#75C9A0] font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>File Terverifikasi Valid: Ditemukan {validationResult.summary?.totalBookmarks} Bookmark & {validationResult.summary?.totalHistory} Riwayat</span>
                      </div>

                      {/* Category Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#343744]">
                        {(['manga', 'anime', 'donghua', 'movies', 'music'] as CategoryType[]).map((cat) => {
                          const b = validationResult.summary?.byCategory[cat]?.bookmarks || 0;
                          const h = validationResult.summary?.byCategory[cat]?.history || 0;
                          if (b === 0 && h === 0) return null;
                          return (
                            <div
                              key={cat}
                              className="p-2 rounded-[10px] bg-[#191C25] border border-[#343744] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-1.5">
                                {categoryIcons[cat]}
                                <span className="font-semibold text-[#A2A4B1]">
                                  {categoryLabels[cat]}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-[#F0A15B]">
                                {b}b / {h}r
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Restore Mode Options */}
                      <div className="pt-3 border-t border-[#343744] space-y-2">
                        <div className="text-xs font-bold text-[#F2F0EC]">Metode Pemulihan:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRestoreMode('merge');
                              setConfirmOverwrite(false);
                            }}
                            className={`p-3 rounded-[10px] border text-left transition-colors ${
                              restoreMode === 'merge'
                                ? 'bg-[#232633] border-[#F0A15B] text-[#F2F0EC]'
                                : 'bg-[#191C25] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>Gabungkan (Merge)</span>
                              <span className="text-[10px] bg-[#F0A15B]/15 text-[#F0A15B] px-1.5 py-0.5 rounded-[6px]">
                                Rekomendasi
                              </span>
                            </div>
                            <p className="text-[11px] text-[#747887] mt-1">
                              Menambahkan data baru tanpa menghapus koleksi yang sudah ada saat ini.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRestoreMode('overwrite');
                              setConfirmOverwrite(false);
                            }}
                            className={`p-3 rounded-[10px] border text-left transition-colors ${
                              restoreMode === 'overwrite'
                                ? 'bg-rose-500/15 border-rose-500/60 text-[#F2F0EC]'
                                : 'bg-[#191C25] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                            }`}
                          >
                            <div className="text-xs font-bold text-rose-400">Timpa Semua (Overwrite)</div>
                            <p className="text-[11px] text-[#747887] mt-1">
                              Menghapus seluruh koleksi saat ini dan menggantinya dengan isi file backup.
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Overwrite Explicit Confirmation Warning */}
                      {restoreMode === 'overwrite' && confirmOverwrite && (
                        <div className="p-3.5 rounded-[10px] bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold text-[#F2F0EC]">Konfirmasi Timpa Seluruh Data</p>
                            <p>
                              Semua bookmark dan riwayat lama saat ini akan diganti dengan isi file backup. Klik tombol konfirmasi di bawah untuk melanjutkan.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Apply Button */}
                      <button
                        onClick={handleApplyRestore}
                        disabled={isProcessing}
                        className={`w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-6 rounded-[10px] font-bold text-sm transition-colors disabled:opacity-50 ${
                          restoreMode === 'overwrite' && confirmOverwrite
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10]'
                        }`}
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                        {restoreMode === 'overwrite' && confirmOverwrite
                          ? 'Konfirmasi & Timpa Semua Data'
                          : 'Terapkan Pemulihan Data'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-200">File Tidak Valid</div>
                        <p className="mt-0.5">{validationResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Result Feedback */}
              {importStatus && (
                <div
                  className={`p-4 rounded-[10px] border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    importStatus.success
                      ? 'bg-[#12141B] border-[#75C9A0]/40 text-[#75C9A0]'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#75C9A0] mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-[#F2F0EC]">
                      {importStatus.success ? 'Pemulihan Selesai' : 'Pemulihan Gagal'}
                    </div>
                    <p className="mt-0.5 text-[#A2A4B1]">{importStatus.message}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: Instant Cross-Device Sync Code */
            <div className="space-y-6">
              {/* Generate & Copy Sync Code Section */}
              <div className="p-5 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#F2F0EC] flex items-center gap-2">
                      <Copy className="w-4 h-4 text-[#F0A15B]" /> 1. Buat Kode Sinkronisasi
                    </h3>
                    <p className="text-xs text-[#747887] mt-0.5">
                      Salin kode ini untuk memindahkan koleksi dan riwayat ke HP atau perangkat lain secara instan.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateSyncCode}
                    className="px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    {copiedSync ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSync ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>

                {syncCode && (
                  <div className="p-3 rounded-[10px] bg-[#191C25] border border-[#343744] font-mono text-[11px] text-[#A78BFA] break-all max-h-24 overflow-y-auto">
                    {syncCode}
                  </div>
                )}
              </div>

              {/* Paste & Apply Sync Code Section */}
              <div className="p-5 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-3">
                <h3 className="text-sm font-bold text-[#F2F0EC] flex items-center gap-2">
                  <FolderSync className="w-4 h-4 text-[#75C9A0]" /> 2. Tempel Kode Sinkronisasi
                </h3>
                <p className="text-xs text-[#747887]">
                  Masukkan kode sinkronisasi yang Anda salin dari perangkat lain untuk memulihkan koleksi Anda.
                </p>

                <textarea
                  value={inputSyncCode}
                  onChange={(e) => setInputSyncCode(e.target.value)}
                  placeholder="Tempel kode sinkronisasi di sini..."
                  rows={3}
                  className="w-full p-3 bg-[#191C25] border border-[#343744] rounded-[10px] text-xs font-mono text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#F0A15B] transition-colors resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#747887]">Metode:</span>
                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors ${
                        restoreMode === 'merge'
                          ? 'bg-[#232633] text-[#F0A15B] border border-[#F0A15B]'
                          : 'text-[#A2A4B1] hover:text-[#F2F0EC] border border-transparent'
                      }`}
                    >
                      Gabungkan (Merge)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestoreMode('overwrite')}
                      className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors ${
                        restoreMode === 'overwrite'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'text-[#A2A4B1] hover:text-[#F2F0EC] border border-transparent'
                      }`}
                    >
                      Timpa (Overwrite)
                    </button>
                  </div>

                  <button
                    onClick={handleApplySyncCode}
                    disabled={!inputSyncCode.trim()}
                    className="px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    Terapkan Sinkronisasi
                  </button>
                </div>
              </div>

              {/* Status Feedback */}
              {syncError && (
                <div className="p-3.5 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}

              {syncSuccess && (
                <div className="p-3.5 rounded-[10px] bg-[#12141B] border border-[#75C9A0]/40 text-[#75C9A0] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#75C9A0] shrink-0" />
                  <span>{syncSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-5 sm:px-6 border-t border-[#343744] bg-[#12141B] flex items-center justify-between text-xs text-[#747887]">
          <span>FazuraStream Storage Engine v2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
