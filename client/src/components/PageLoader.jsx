import { useTranslation } from 'react-i18next';

export default function PageLoader() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e8f5e9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Leaf Icon Container */}
        <div className="relative w-24 h-24">
          {/* Animated background spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2e7d32] border-r-[#4a7a4a] animate-spin" />

          {/* Leaf icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#2e7d32] animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.92 7.02C17.45 4.18 14.97 2 12 2c-2.97 0-5.45 2.18-5.92 5.02C4.97 7.55 3 9.74 3 12c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6 0-2.26-1.97-4.45-4.08-4.98z" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-[#2e7d32] font-semibold text-lg animate-pulse">
            {t('loader.growing')}
          </p>
          <p className="text-[#4a7a4a] text-sm mt-2">
            {t('loader.preparing')}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#2e7d32] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#4a7a4a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#66bb6a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
