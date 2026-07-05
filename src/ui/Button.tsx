import { useEffect, useState, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default'
  block?: boolean
  loading?: boolean
  loadingDelay?: number
}

/** 轻量按钮（替代 antd Button） */
export default function Button({
  variant = 'default',
  block = false,
  loading = false,
  loadingDelay = 180,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const [showLoading, setShowLoading] = useState(false)
  const base =
    'relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-[transform,background-color,border-color,box-shadow,filter,color] duration-150 ease-out enabled:active:translate-y-px enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    variant === 'primary'
      ? 'popup-btn-primary text-white'
      : 'popup-btn-default border text-slate-700 hover:text-indigo-600'
  const spinnerColor =
    variant === 'primary' ? 'border-white/40 border-t-white' : 'border-slate-300 border-t-slate-600'

  useEffect(() => {
    if (!loading) {
      setShowLoading(false)
      return undefined
    }

    const timer = window.setTimeout(() => setShowLoading(true), loadingDelay)
    return () => window.clearTimeout(timer)
  }, [loading, loadingDelay])

  return (
    <button
      type='button'
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${styles} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      <span className={showLoading ? 'opacity-0' : ''}>{children}</span>
      {showLoading && (
        <span
          className={`absolute h-3 w-3 animate-spin rounded-full border-2 ${spinnerColor}`}
          aria-hidden='true'
        />
      )}
    </button>
  )
}
