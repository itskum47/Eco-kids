import React, { useRef, useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

// ─── Image compression config ─────────────────────────────────────────────────
// Target: ≤ 500 KB, ≤ 1280px wide. Runs in a Web Worker to avoid UI blocking.
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.85,
};

const ActivityFormInputs = ({ formData, handleChange, handleFileChange, error }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [compressedSize, setCompressedSize] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    setCompressing(true);
    setPreviewUrl(null);
    setCompressedSize(null);

    try {
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
      const sizeKB = Math.round(compressed.size / 1024);
      setCompressedSize(sizeKB);

      // Show local preview immediately — no need to wait for upload
      const localUrl = URL.createObjectURL(compressed);
      setPreviewUrl(localUrl);

      // Pass compressed File object up to the parent form handler
      handleFileChange(compressed);

      // Auto-capture GPS position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            handleChange({ target: { name: 'latitude',  value: String(pos.coords.latitude) } });
            handleChange({ target: { name: 'longitude', value: String(pos.coords.longitude) } });
          },
          () => {} // silent fail — GPS not required for all activity types
        );
      }
    } catch (err) {
      console.error('[ImageUpload] Compression failed:', err);
      // Fall back to original file if compression fails
      handleFileChange(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  }, [handleChange, handleFileChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <>
      {/* Description */}
      <div className="relative z-10 w-full">
        <label className="block text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest mb-2">
          Activity Description <span className="text-[var(--red)]">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what you did, when, and where. Include specific details..."
          rows="4"
          className={`w-full bg-[var(--s2)] border ${error && !formData.description ? 'border-[var(--red)]' : 'border-[var(--b2)]'} text-[var(--t1)] font-ui px-4 py-3 rounded-xl focus:outline-none focus:border-[var(--v1)] focus:ring-1 focus:ring-[var(--v1)] transition-colors placeholder:text-[var(--t3)] resize-none`}
        />
        <p className="text-[10px] text-[var(--t2)] font-ui mt-1.5 ml-1">
          Be detailed to help our AI verify your activity quickly.
        </p>
      </div>

      {/* Image Evidence — file upload with compression */}
      <div className="relative z-0 w-full mt-6">
        <label className="block text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Evidence Photo <span className="text-[var(--red)]">*</span></span>
          <span className="text-[10px] text-[var(--t3)] normal-case tracking-normal font-normal">
            Auto-compressed · GPS auto-detected
          </span>
        </label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed transition-all
            flex flex-col items-center justify-center gap-3 py-8 px-4
            ${dragOver
              ? 'border-[var(--v1)] bg-[rgba(108,71,255,0.07)]'
              : error && !previewUrl
                ? 'border-[var(--red)] bg-[rgba(255,64,96,0.04)]'
                : 'border-[var(--b2)] bg-[var(--s2)] hover:border-[var(--v1)] hover:bg-[rgba(108,71,255,0.04)]'
            }
          `}
        >
          {compressing ? (
            <>
              <span className="w-8 h-8 border-4 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin" />
              <p className="font-ui text-xs text-[var(--t2)] font-bold uppercase tracking-widest">Compressing...</p>
            </>
          ) : previewUrl ? (
            <div className="w-full relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-[240px] object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-white font-ui text-sm font-bold">Click to change photo</span>
              </div>
              {compressedSize && (
                <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-ui font-bold px-2 py-1 rounded-full">
                  ✓ {compressedSize} KB
                </span>
              )}
            </div>
          ) : (
            <>
              <span className="text-4xl">📸</span>
              <div className="text-center">
                <p className="font-ui text-sm font-bold text-[var(--t1)]">Drop photo here or tap to select</p>
                <p className="font-ui text-[10px] text-[var(--t3)] mt-1">Auto-compressed to under 500 KB · JPEG, PNG, HEIC</p>
              </div>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default ActivityFormInputs;

