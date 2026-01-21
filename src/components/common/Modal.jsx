import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '560px',
  closeOnOverlay = true
}) => {
  // 모달 오픈 시 본문 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all duration-300"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-modal-up"
        style={{ maxWidth }}
      >
        {/* 헤더 */}
        {(title || onClose) && (
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            {title ? (
              <h3 className="text-xl font-extrabold text-toss-dark tracking-tight">
                {title}
              </h3>
            ) : <div />}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 바디 */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="p-6 border-t border-gray-50">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modal-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-modal-up {
          animation: modal-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
