import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  currentValue: string;
  onChange: (base64Value: string) => void;
  onClear: () => void;
  placeholderText?: string;
  onNotify?: (msg: string) => void;
}

export default function ImageUploader({
  label,
  currentValue,
  onChange,
  onClear,
  placeholderText = "Enter direct URL or drag-and-drop a security badge binary...",
  onNotify
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse if value is base64 for preview vs standard URL
  const isBase64 = currentValue?.startsWith('data:image/');
  const hasValue = currentValue && currentValue.trim() !== '';

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (onNotify) onNotify("ERROR: Selected cyber payload is not a valid image format.");
      return;
    }

    // Limit size for localStorage limits (approx 1.8MB to be safe)
    if (file.size > 1800000) {
      if (onNotify) onNotify("PAYLOAD WARNING: Base64 image exceeds 1.8MB standard. Please compress the payload for local registry storage!");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        if (onNotify) onNotify("SECURE DECRYPTION COMPLETE: Asset converted to safe base64-payload registries.");
      }
    };
    reader.onerror = () => {
      if (onNotify) onNotify("ERROR: Direct file read corrupted.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 w-full font-mono">
      <div className="flex justify-between items-center select-none">
        <label className="text-[10px] text-primary-fixed block font-bold uppercase tracking-wider">{label}</label>
        {hasValue && (
          <span className="text-[9px] bg-secondary/15 text-secondary px-1.5 py-0.5 rounded border border-secondary/25 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE IMAGE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Drag/Drop and Manual Input Form */}
        <div className="md:col-span-8 space-y-2">
          {/* Text Input Row */}
          <div className="relative">
            <input 
              type="text" 
              value={isBase64 ? "BINARY DATA STREAM [BASE64 ENCODED]" : currentValue || ''}
              disabled={isBase64}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholderText}
              className={`w-full bg-surface-container border ${isBase64 ? 'border-secondary/40 text-secondary' : 'border-outline-variant/60'} rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-secondary/70`}
            />
            {isBase64 && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-2 top-1.5 text-error hover:text-white px-2 py-0.5 rounded bg-error/15 hover:bg-error/30 text-[9px] font-mono border border-error/30 uppercase tracking-widest cursor-pointer transition-all"
                title="Purge base64 stream"
              >
                Reset link
              </button>
            )}
          </div>

          {/* Interactive Drag Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border border-dashed rounded-2xl p-4 text-center transition-all ${
              isDragging 
                ? 'border-secondary bg-secondary/10 shadow-[0_0_12px_rgba(0,255,100,0.15)]Scale-102' 
                : 'border-outline-variant/60 bg-surface-container-low/50 hover:bg-surface-container-low hover:border-secondary/40'
            }`}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex flex-col items-center justify-center gap-1.5 select-none">
              <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-secondary animate-bounce' : 'text-on-surface-variant'}`} />
              <div className="text-[10px] text-on-surface leading-normal text-center">
                <span className="text-secondary font-bold">DRAG & DROP</span> FILE OR <span className="underline font-bold text-primary-fixed">CLICK TO LOAD</span>
              </div>
              <p className="text-[8px] text-on-surface-variant font-medium">
                Saves locally to portfolio registry: PNG, JPG, GIF, WebP
              </p>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview and File Information Area */}
        <div className="md:col-span-4 flex flex-col justify-between p-3.5 bg-surface-container rounded-2xl border border-outline-variant/40 min-h-[90px]">
          <div className="text-[9px] text-on-surface-variant select-none font-bold uppercase tracking-wider mb-2">PREVIEW PANEL</div>
          
          <div className="flex items-center gap-3">
            <div className="w-[54px] h-[54px] rounded-xl overflow-hidden bg-black/40 border border-outline-variant flex items-center justify-center shrink-0 relative group">
              {hasValue ? (
                <img 
                  src={currentValue} 
                  alt="Upload preview" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // fall back
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-on-surface-variant/40" />
              )}
            </div>

            <div className="space-y-1 overflow-hidden">
              <span className="text-[9px] text-on-surface font-semibold block truncate">
                {isBase64 ? "Local Base64 Binary" : hasValue ? "Dynamic Web Link" : "No file loaded"}
              </span>
              <span className="text-[8px] text-on-surface-variant block truncate">
                {isBase64 ? "Approx. size verified" : hasValue ? "External asset" : "Crypotographic placeholder fallback"}
              </span>
              {hasValue && (
                <button
                  type="button"
                  onClick={onClear}
                  className="flex items-center gap-1 text-[9px] text-error hover:text-white hover:bg-error/25 p-1 rounded-md transition-all font-mono font-bold cursor-pointer"
                  title="Wipe and clear current profile picture specification"
                >
                  <Trash2 className="w-3 h-3" /> DELETE ASSET
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
