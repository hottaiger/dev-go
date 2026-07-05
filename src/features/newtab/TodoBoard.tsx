/**
 * TODO 面板：以浮层形式打开，按状态分组展示任务流。
 * 支持新增、跨状态拖拽改状态 / 排序、编辑、删除，及导入导出。
 * 数据通过 useTodos 持久化并跨页面（popup）实时同步。
 */

import { useEffect, useRef, useState } from 'react'

import { isImeComposing } from '@/utils/ime'
import type { TodoStatus } from '@/utils/settings'
import {
  downloadTodos,
  mergeTodos,
  parseTodos,
  TODO_STATUS_LABEL,
  type DropPosition,
} from '@/features/todo/todo'
import { useTodos } from '@/features/todo/useTodos'

const COLUMNS: {
  status: TodoStatus
  accent: string
  dot: string
  line: string
  tint: string
  active: string
}[] = [
  {
    status: 'todo',
    accent: 'text-slate-700 dark:text-slate-200',
    dot: 'bg-slate-500 dark:bg-slate-300',
    line: 'border-slate-300/90 dark:border-slate-500/50',
    tint: 'bg-slate-500/[0.08] dark:bg-slate-400/[0.08]',
    active:
      'border-slate-400/90 bg-slate-100/95 ring-2 ring-slate-300/40 dark:border-slate-300/50 dark:bg-slate-700/20 dark:ring-slate-300/10',
  },
  {
    status: 'doing',
    accent: 'text-blue-700 dark:text-blue-200',
    dot: 'bg-blue-500 dark:bg-blue-300',
    line: 'border-blue-300/90 dark:border-blue-400/50',
    tint: 'bg-blue-500/[0.08] dark:bg-blue-400/[0.09]',
    active:
      'border-blue-400/90 bg-blue-50/95 ring-2 ring-blue-300/40 dark:border-blue-300/50 dark:bg-blue-500/15 dark:ring-blue-300/10',
  },
  {
    status: 'done',
    accent: 'text-teal-700 dark:text-teal-200',
    dot: 'bg-teal-500 dark:bg-teal-300',
    line: 'border-teal-300/90 dark:border-teal-400/50',
    tint: 'bg-teal-500/[0.08] dark:bg-teal-400/[0.09]',
    active:
      'border-teal-400/90 bg-teal-50/95 ring-2 ring-teal-300/40 dark:border-teal-300/50 dark:bg-teal-500/15 dark:ring-teal-300/10',
  },
]

function BoardIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5 fill-none stroke-current'>
      <path
        d='M5 5.5h4.5v13H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5ZM14.5 5.5H19A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5h-4.5v-13ZM9.5 8.5h5M9.5 15.5h5'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.8'
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path d='M12 5v14M5 12h14' strokeLinecap='round' strokeWidth='2' />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-4 w-4 fill-none stroke-current'>
      <path d='M6 6l12 12M18 6 6 18' strokeLinecap='round' strokeWidth='2' />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path
        d='M5 12.5 10 17.5 19.5 7'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.4'
      />
    </svg>
  )
}

function CancelIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path d='M6 6l12 12M18 6 6 18' strokeLinecap='round' strokeWidth='2.2' />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path
        d='M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.7'
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path
        d='M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17.2V20zM14 7l3 3'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.7'
      />
    </svg>
  )
}

function GripIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-current'>
      <path d='M8 7a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 8 7ZM16 7a1.4 1.4 0 1 0 0-2.8A1.4 1.4 0 0 0 16 7ZM8 13.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM16 13.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM8 19.8A1.4 1.4 0 1 0 8 17a1.4 1.4 0 0 0 0 2.8ZM16 19.8A1.4 1.4 0 1 0 16 17a1.4 1.4 0 0 0 0 2.8Z' />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path
        d='M12 4v10M8 10l4 4 4-4M5 19h14'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-3.5 w-3.5 fill-none stroke-current'>
      <path
        d='M12 20V10M8 14l4-4 4 4M5 5h14'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
    </svg>
  )
}

interface TodoBoardProps {
  onClose: () => void
  onToast: (msg: string) => void
}

export default function TodoBoard({ onClose, onToast }: TodoBoardProps) {
  const todos = useTodos()
  const [drafts, setDrafts] = useState<Record<TodoStatus, string>>({
    todo: '',
    doing: '',
    done: '',
  })
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TodoStatus | null>(null)
  // 当前悬停的目标任务与落点（前 / 后），用于显示插入指示线
  const [dropMarker, setDropMarker] = useState<{ id: string; position: DropPosition } | null>(null)
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const draftComposingRef = useRef<Record<TodoStatus, boolean>>({
    todo: false,
    doing: false,
    done: false,
  })
  const editingComposingRef = useRef(false)

  const startEditing = (id: string, text: string) => {
    editingComposingRef.current = false
    setEditing({ id, text })
  }

  const stopEditing = () => {
    editingComposingRef.current = false
    setEditing(null)
  }

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addTo = (status: TodoStatus) => {
    const text = drafts[status].trim()
    if (!text) return
    todos.add(text, status)
    setDrafts((d) => ({ ...d, [status]: '' }))
  }

  const handleExport = () => {
    if (todos.items.length === 0) {
      onToast('暂无任务可导出')
      return
    }
    downloadTodos(todos.items, new Date().toISOString())
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const incoming = parseTodos(await file.text())
      const { items: merged, added } = mergeTodos(todos.items, incoming)
      todos.replaceAll(merged)
      onToast(added > 0 ? `已导入 ${added} 个任务` : '没有新任务（已存在的已跳过）')
    } catch (err) {
      onToast(err instanceof Error ? err.message : '导入失败')
    }
  }

  // 拖到分组空白处：移到该状态末尾
  const dropToColumn = (status: TodoStatus) => {
    if (dragId) todos.move(dragId, null, status)
    resetDrag()
  }

  // 拖到某任务上：依据落点插到其前 / 后，并继承该分组状态
  const dropToCard = (targetId: string, status: TodoStatus) => {
    if (dragId && dropMarker) todos.move(dragId, targetId, status, dropMarker.position)
    else if (dragId) todos.move(dragId, targetId, status)
    resetDrag()
  }

  const resetDrag = () => {
    setDragId(null)
    setOverCol(null)
    setDropMarker(null)
  }

  // 根据指针在任务行内的垂直位置判断插入到前还是后
  const cardDropPosition = (e: React.DragEvent<HTMLElement>): DropPosition => {
    const rect = e.currentTarget.getBoundingClientRect()
    return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  }

  const remaining = todos.items.filter((i) => i.status !== 'done').length
  const completed = todos.items.length - remaining
  const progress = todos.items.length > 0 ? Math.round((completed / todos.items.length) * 100) : 0
  const summaryItems = [
    { label: '全部', value: todos.items.length },
    { label: '未完', value: remaining },
    { label: '完成', value: completed },
  ]

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-200/45 p-3 backdrop-blur-2xl dark:bg-slate-950/70 sm:p-5'
      onClick={onClose}
    >
      <div
        className='grid max-h-[92vh] w-full max-w-[1380px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-slate-950/10 bg-slate-50/95 shadow-[0_30px_100px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950/90 dark:shadow-black/50 lg:h-[min(760px,90vh)] lg:grid-cols-[236px_minmax(0,1fr)] lg:grid-rows-1'
        onClick={(e) => e.stopPropagation()}
      >
        <aside className='flex min-h-0 flex-col border-b border-slate-950/10 bg-slate-100/80 dark:border-white/10 dark:bg-white/[0.025] lg:border-b-0 lg:border-r'>
          <div className='flex min-h-0 flex-1 flex-col p-4 sm:p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-2.5'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-950/10 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100'>
                  <BoardIcon />
                </span>
                <div className='min-w-0'>
                  <h2 className='text-base font-semibold tracking-tight text-slate-950 dark:text-slate-50'>
                    TODO
                  </h2>
                  <p className='mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                    {remaining} 未完 / {todos.items.length} 总计
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                title='关闭'
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-950/10 bg-white/80 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              >
                <CloseIcon />
              </button>
            </div>

            <div className='mt-6'>
              <div className='flex items-end justify-between gap-3'>
                <span className='text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500'>
                  PROGRESS
                </span>
                <strong className='text-3xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white'>
                  {progress}%
                </strong>
              </div>
              <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 transition-all duration-500'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className='mt-5 divide-y divide-slate-950/10 border-y border-slate-950/10 dark:divide-white/10 dark:border-white/10'>
              {summaryItems.map((item) => (
                <div key={item.label} className='flex items-center justify-between py-2.5'>
                  <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                    {item.label}
                  </span>
                  <span className='text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100'>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className='mt-5 space-y-2'>
              {COLUMNS.map((col) => {
                const count = todos.items.filter((i) => i.status === col.status).length
                return (
                  <div
                    key={col.status}
                    className={`flex items-center justify-between rounded-md px-2.5 py-2 ${col.tint}`}
                  >
                    <span className='flex min-w-0 items-center gap-2'>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${col.dot}`} />
                      <span className={`truncate text-xs font-semibold ${col.accent}`}>
                        {TODO_STATUS_LABEL[col.status]}
                      </span>
                    </span>
                    <span className='text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-300'>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className='mt-5 grid grid-cols-2 gap-2 lg:mt-auto lg:grid-cols-1'>
              <button
                type='button'
                onClick={handleExport}
                className='flex h-9 items-center justify-center gap-2 rounded-md border border-slate-950/10 bg-white/85 px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.055] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              >
                <DownloadIcon />
                <span>导出</span>
              </button>
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='flex h-9 items-center justify-center gap-2 rounded-md border border-slate-950/10 bg-white/85 px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.055] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              >
                <UploadIcon />
                <span>导入</span>
              </button>
              <input
                ref={fileRef}
                type='file'
                accept='application/json,.json'
                className='hidden'
                onChange={handleImport}
              />
            </div>
          </div>
        </aside>

        <main className='flex min-h-0 flex-col bg-white/50 dark:bg-white/[0.012]'>
          <div className='flex flex-col gap-1 border-b border-slate-950/10 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <div className='min-w-0'>
              <div className='text-sm font-semibold text-slate-950 dark:text-slate-50'>看板</div>
              <div className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                {completed} 已完成，{remaining} 待处理
              </div>
            </div>
            <div className='hidden items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 sm:flex'>
              {COLUMNS.map((col) => (
                <span key={col.status} className='flex items-center gap-1.5'>
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  {TODO_STATUS_LABEL[col.status]}
                </span>
              ))}
            </div>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:overflow-hidden'>
            <div className='grid min-h-full grid-cols-1 gap-3 lg:grid-cols-3 lg:items-stretch'>
              {COLUMNS.map((col) => {
                const colItems = todos.items.filter((i) => i.status === col.status)
                const isOver = overCol === col.status
                return (
                  <section
                    key={col.status}
                    onDragOver={(e) => {
                      if (dragId) {
                        e.preventDefault()
                        setOverCol(col.status)
                        // 在任务行上时由行处理器接管（已 stopPropagation）；
                        // 能到这里说明在分组空白处，清除插入标记。
                        setDropMarker(null)
                      }
                    }}
                    onDragLeave={(e) => {
                      // 仅当真正离开分组容器时清除高亮
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setOverCol(null)
                        setDropMarker(null)
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      dropToColumn(col.status)
                    }}
                    className={`overflow-hidden rounded-lg border transition-colors ${
                      isOver
                        ? col.active
                        : 'border-slate-950/10 bg-white/80 dark:border-white/10 dark:bg-white/[0.035]'
                    } flex min-h-[360px] flex-col lg:min-h-0`}
                  >
                    <div
                      className={`flex flex-col gap-3 border-b border-l-4 border-slate-950/10 px-3 py-3 dark:border-b-white/10 ${col.line}`}
                    >
                      <div className='flex min-w-0 items-center gap-2'>
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${col.dot}`} />
                        <h3 className={`text-xs font-semibold tracking-wide ${col.accent}`}>
                          {TODO_STATUS_LABEL[col.status]}
                        </h3>
                        <span className='rounded-md bg-slate-950/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-300'>
                          {colItems.length}
                        </span>
                      </div>

                      <div className='flex min-w-0 items-center gap-1.5 rounded-md border border-slate-950/10 bg-slate-50/85 px-2 py-1.5 transition-colors focus-within:border-blue-400/70 focus-within:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:focus-within:border-blue-300/50 dark:focus-within:bg-slate-950/70'>
                        <input
                          value={drafts[col.status]}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [col.status]: e.target.value }))
                          }
                          onCompositionStart={() => {
                            draftComposingRef.current[col.status] = true
                          }}
                          onCompositionEnd={() => {
                            draftComposingRef.current[col.status] = false
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === 'Enter' &&
                              !isImeComposing(e, draftComposingRef.current[col.status])
                            ) {
                              addTo(col.status)
                            }
                          }}
                          placeholder='添加任务…'
                          className='min-w-0 flex-1 bg-transparent px-1 text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500'
                        />
                        <button
                          type='button'
                          onClick={() => addTo(col.status)}
                          disabled={!drafts[col.status].trim()}
                          title='添加'
                          className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-900 hover:text-white disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </div>

                    <div className='min-h-[54px] flex-1 divide-y divide-slate-950/[0.06] overflow-y-auto dark:divide-white/[0.07]'>
                      {colItems.length === 0 && (
                        <div className='flex min-h-16 items-center justify-center px-3 py-4 text-xs font-medium text-slate-400 dark:text-slate-500'>
                          空
                        </div>
                      )}
                      {colItems.map((item) => {
                        const isEditing = editing?.id === item.id
                        const marker = dropMarker?.id === item.id ? dropMarker.position : null
                        return (
                          <div
                            key={item.id}
                            draggable={!isEditing}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move'
                              setDragId(item.id)
                            }}
                            onDragOver={(e) => {
                              if (!dragId || dragId === item.id) return
                              e.preventDefault()
                              e.stopPropagation()
                              setOverCol(col.status)
                              setDropMarker({ id: item.id, position: cardDropPosition(e) })
                            }}
                            onDrop={(e) => {
                              if (!dragId) return
                              e.preventDefault()
                              e.stopPropagation()
                              dropToCard(item.id, col.status)
                            }}
                            onDragEnd={resetDrag}
                            className={`group relative flex min-h-12 items-start gap-2 px-3 py-2.5 transition-colors hover:bg-slate-50/90 dark:hover:bg-white/[0.055] ${
                              isEditing ? '' : 'cursor-grab active:cursor-grabbing'
                            } ${dragId === item.id ? 'opacity-40' : ''} ${
                              marker === 'before'
                                ? 'before:absolute before:left-3 before:right-3 before:top-0 before:h-0.5 before:rounded-full before:bg-blue-500'
                                : ''
                            } ${
                              marker === 'after'
                                ? 'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-blue-500'
                                : ''
                            }`}
                          >
                            {!isEditing && (
                              <>
                                <span className={`mt-1 h-7 w-1 shrink-0 rounded-full ${col.dot}`} />
                                <span className='mt-0.5 flex h-7 w-5 shrink-0 items-center justify-center text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300'>
                                  <GripIcon />
                                </span>
                              </>
                            )}
                            {isEditing ? (
                              <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                                <input
                                  autoFocus
                                  value={editing.text}
                                  onChange={(e) =>
                                    setEditing({ id: item.id, text: e.target.value })
                                  }
                                  onCompositionStart={() => {
                                    editingComposingRef.current = true
                                  }}
                                  onCompositionEnd={() => {
                                    editingComposingRef.current = false
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (isImeComposing(e, editingComposingRef.current)) return
                                      todos.setText(item.id, editing.text)
                                      stopEditing()
                                    }
                                    if (e.key === 'Escape') stopEditing()
                                  }}
                                  className='min-w-0 flex-1 rounded-md border border-slate-300/80 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-blue-300/50'
                                />
                                <button
                                  type='button'
                                  onClick={() => {
                                    todos.setText(item.id, editing.text)
                                    stopEditing()
                                  }}
                                  disabled={!editing.text.trim()}
                                  title='保存'
                                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white transition-colors hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  type='button'
                                  onClick={stopEditing}
                                  title='取消'
                                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300/80 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                                >
                                  <CancelIcon />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p
                                  className={`min-w-0 flex-1 break-words text-sm leading-6 ${
                                    col.status === 'done'
                                      ? 'text-slate-400 line-through decoration-slate-400/60 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {item.text}
                                </p>
                                <div className='ml-auto flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100'>
                                  <button
                                    type='button'
                                    onClick={() => startEditing(item.id, item.text)}
                                    title='编辑'
                                    className='flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-900 hover:text-white dark:hover:bg-white/15'
                                  >
                                    <EditIcon />
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => todos.remove(item.id)}
                                    title='删除'
                                    className='flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-500 hover:text-white'
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
