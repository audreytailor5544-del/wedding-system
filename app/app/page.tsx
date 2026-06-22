'use client'

import { useState, useMemo, useRef, useEffect, createContext, useContext } from 'react'
import { ContractFormModal } from './ContractForm'

// ─── 타입 & 상수 ─────────────────────────────────────────────────

const CATEGORIES = [
  { id: '드레스팀',      label: '드레스팀',      color: '#e879a0' },
  { id: '헤어메이크업팀', label: '헤어메이크업팀', color: '#a855f7' },
  { id: '스타일리스트1', label: '스타일리스트 1', color: '#3b82f6' },
  { id: '스타일리스트2', label: '스타일리스트 2', color: '#22c55e' },
  { id: '스타일리스트3', label: '스타일리스트 3', color: '#f97316' },
  { id: '스타일리스트4', label: '스타일리스트 4', color: '#06b6d4' },
  { id: '스타일리스트5', label: '스타일리스트 5', color: '#ef4444' },
  { id: '스타일리스트6', label: '스타일리스트 6', color: '#a16207' },
  { id: '회계',         label: '회계',          color: '#64748b' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

// 카테고리 표시 이름 — 시트의 '설정' 탭에서 불러온 override 를 컨텍스트로 공유한다.
// id/색상은 고정, 이름(label)만 직원이 수정 가능.
const CatLabelCtx = createContext<Record<string, string>>({})
function useCatLabel() {
  const overrides = useContext(CatLabelCtx)
  return (id: string) =>
    overrides[id] || CATEGORIES.find(c => c.id === id)?.label || id
}

type Reservation = {
  id: string
  brideName: string
  bridePhone: string
  groomName: string
  groomPhone: string
  fittingDate: string
  fittingTime: string
  hairDate: string
  hairTime: string
  snapDate: string
  snapTime: string
  photoStudio: string
  product: string
  helperService: string
  bouquet: string
  source: string
  notes: string
  receiptNumber: string
  categories: CategoryId[]
  status: '대기' | '확정' | '완료'
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  '대기': { bg: '#fef3c7', color: '#d97706' },
  '확정': { bg: '#dbeafe', color: '#1d4ed8' },
  '완료': { bg: '#f3f4f6', color: '#6b7280' },
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// ─── 공통 스타일 ──────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 14,
  backgroundColor: 'rgba(0,0,0,0.03)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  color: '#000',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  marginBottom: 6,
  display: 'block',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#0096f7',
  letterSpacing: '0.06em',
  marginBottom: 12,
}

// ─── 계약서 모달 ──────────────────────────────────────────────────

function ContractModal({
  reservation,
  onClose,
}: {
  reservation: Reservation
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const fmt = (date: string, time: string) =>
    date ? `${date}${time ? ` ${time}` : ''}` : ''

  const contractText = [
    'AUDREYTAILOR 예약 계약서',
    '─────────────────────────────',
    '',
    '■ 고객 정보',
    `신부: ${reservation.brideName}${reservation.bridePhone ? ` / ${reservation.bridePhone}` : ''}`,
    reservation.groomName ? `신랑: ${reservation.groomName}${reservation.groomPhone ? ` / ${reservation.groomPhone}` : ''}` : '',
    '',
    '■ 예약 일정',
    reservation.fittingDate ? `의상피팅: ${fmt(reservation.fittingDate, reservation.fittingTime)}` : '',
    reservation.hairDate    ? `헤어메이크업: ${fmt(reservation.hairDate, reservation.hairTime)}` : '',
    reservation.snapDate    ? `스냅촬영: ${fmt(reservation.snapDate, reservation.snapTime)}` : '',
    '',
    '■ 이용 서비스',
    reservation.product     ? `이용상품: ${reservation.product}` : '',
    reservation.photoStudio ? `포토업체: ${reservation.photoStudio}` : '',
    reservation.helperService !== '없음' ? `헬퍼 서비스: ${reservation.helperService}` : '',
    reservation.bouquet     ? `생화부케: ${reservation.bouquet}` : '',
    '',
    reservation.notes ? `■ 요청사항\n${reservation.notes}` : '',
    '',
    '─────────────────────────────',
  ].filter(l => l !== '').join('\n').trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(contractText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => {
    const rows = (label: string, value: string) =>
      value ? `<div class="row"><span class="lbl">${label}</span><span>${value}</span></div>` : ''

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>AUDREYTAILOR 계약서 — ${reservation.brideName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Pretendard', -apple-system, sans-serif; padding: 48px 56px; color: #000; font-size: 14px; }
  h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.12em; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #888; margin-bottom: 32px; }
  hr { border: none; border-top: 1px solid #d0d0d0; margin: 20px 0; }
  .sec { font-size: 10px; font-weight: 700; color: #888; letter-spacing: 0.1em; margin: 20px 0 10px; }
  .row { display: flex; gap: 16px; padding: 4px 0; }
  .lbl { min-width: 90px; color: #888; font-size: 13px; flex-shrink: 0; }
  .notes { background: #f9f9f7; border-radius: 8px; padding: 12px 14px; font-size: 13px; line-height: 1.6; margin-top: 4px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #d0d0d0; font-size: 11px; color: #bbb; text-align: center; }
  @media print { body { padding: 24px 32px; } }
</style>
</head>
<body>
  <h1>AUDREYTAILOR</h1>
  <div class="subtitle">예약 계약서</div>
  <hr>
  <div class="sec">고객 정보</div>
  ${rows('신부', reservation.brideName + (reservation.bridePhone ? ' / ' + reservation.bridePhone : ''))}
  ${rows('신랑', reservation.groomName + (reservation.groomPhone ? ' / ' + reservation.groomPhone : ''))}
  <hr>
  <div class="sec">예약 일정</div>
  ${rows('의상피팅', fmt(reservation.fittingDate, reservation.fittingTime))}
  ${rows('헤어메이크업', fmt(reservation.hairDate, reservation.hairTime))}
  ${rows('스냅촬영', fmt(reservation.snapDate, reservation.snapTime))}
  <hr>
  <div class="sec">이용 서비스</div>
  ${rows('이용상품', reservation.product)}
  ${rows('포토업체', reservation.photoStudio)}
  ${reservation.helperService !== '없음' ? rows('헬퍼 서비스', reservation.helperService) : ''}
  ${rows('생화부케', reservation.bouquet)}
  ${reservation.notes ? `<hr><div class="sec">요청사항</div><div class="notes">${reservation.notes}</div>` : ''}
  <div class="footer">AUDREYTAILOR 내부 예약 시스템 발행</div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 300)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: 24,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 18,
        width: '100%', maxWidth: 540,
        maxHeight: '88vh', overflow: 'auto',
        padding: 32,
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.08em' }}>AUDREYTAILOR</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>예약 계약서</div>

        {/* 계약서 본문 */}
        <div style={{ backgroundColor: '#fafaf7', borderRadius: 12, padding: '20px 20px', fontSize: 13, lineHeight: 1.8, color: '#222', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {contractText}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 12,
              border: '1.5px solid #e7e3e1', background: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              color: copied ? '#22c55e' : '#333',
              transition: 'color 0.2s',
            }}
          >
            {copied ? '✓ 복사됨' : '텍스트 복사'}
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 12,
              border: 'none', backgroundColor: '#0096f7',
              color: '#fff', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            인쇄 / PDF 저장
          </button>
        </div>
        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 8, padding: '10px 0', borderRadius: 12, border: 'none', background: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          닫기
        </button>
      </div>
    </div>
  )
}

// ─── 예약 입력 폼 모달 ────────────────────────────────────────────

function ReservationForm({
  initialDate,
  onClose,
  onSubmit,
}: {
  initialDate: string | null
  onClose: () => void
  onSubmit: (r: Omit<Reservation, 'id'>, showContract: boolean) => void
}) {
  const [form, setForm] = useState({
    brideName: '',
    bridePhone: '',
    groomName: '',
    groomPhone: '',
    fittingDate: initialDate || '',
    fittingTime: '',
    hairDate: '',
    hairTime: '',
    snapDate: '',
    snapTime: '',
    photoStudio: '',
    product: '',
    helperService: '없음',
    bouquet: '',
    source: '',
    notes: '',
    receiptNumber: '',
    categories: [] as CategoryId[],
    status: '대기' as const,
  })

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleCat = (id: CategoryId) =>
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter(c => c !== id)
        : [...f.categories, id],
    }))

  const handleSubmit = (e: React.FormEvent, withContract: boolean) => {
    e.preventDefault()
    if (!form.brideName || !form.fittingDate) return
    onSubmit(form, withContract)
  }

  const labelOf = useCatLabel()

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 18,
        width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflow: 'auto',
        padding: 32,
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>새 예약 등록</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={e => handleSubmit(e, false)}>
          {/* 고객 정보 */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>고객 정보</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>신부 성함 *</label>
                <input style={inputStyle} value={form.brideName} onChange={set('brideName')} placeholder="신부 성함" required />
              </div>
              <div>
                <label style={labelStyle}>신부 연락처</label>
                <input style={inputStyle} value={form.bridePhone} onChange={set('bridePhone')} placeholder="010-0000-0000" />
              </div>
              <div>
                <label style={labelStyle}>신랑 성함</label>
                <input style={inputStyle} value={form.groomName} onChange={set('groomName')} placeholder="신랑 성함" />
              </div>
              <div>
                <label style={labelStyle}>신랑 연락처</label>
                <input style={inputStyle} value={form.groomPhone} onChange={set('groomPhone')} placeholder="010-0000-0000" />
              </div>
            </div>
          </div>

          {/* 일정 */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>일정</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>의상피팅 날짜 *</label>
                <input style={inputStyle} type="date" value={form.fittingDate} onChange={set('fittingDate')} required />
              </div>
              <div>
                <label style={labelStyle}>의상피팅 시간</label>
                <input style={inputStyle} type="time" value={form.fittingTime} onChange={set('fittingTime')} />
              </div>
              <div>
                <label style={labelStyle}>헤어메이크업 날짜</label>
                <input style={inputStyle} type="date" value={form.hairDate} onChange={set('hairDate')} />
              </div>
              <div>
                <label style={labelStyle}>헤어메이크업 시간</label>
                <input style={inputStyle} type="time" value={form.hairTime} onChange={set('hairTime')} />
              </div>
              <div>
                <label style={labelStyle}>스냅촬영 날짜</label>
                <input style={inputStyle} type="date" value={form.snapDate} onChange={set('snapDate')} />
              </div>
              <div>
                <label style={labelStyle}>스냅촬영 시간</label>
                <input style={inputStyle} type="time" value={form.snapTime} onChange={set('snapTime')} />
              </div>
            </div>
          </div>

          {/* 서비스 */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>서비스</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>포토업체명</label>
                <input style={inputStyle} value={form.photoStudio} onChange={set('photoStudio')} placeholder="업체명" />
              </div>
              <div>
                <label style={labelStyle}>오드리 이용상품</label>
                <input style={inputStyle} value={form.product} onChange={set('product')} placeholder="이용 상품" />
              </div>
              <div>
                <label style={labelStyle}>헬퍼 서비스</label>
                <select style={inputStyle} value={form.helperService} onChange={set('helperService')}>
                  <option value="없음">없음</option>
                  <option value="일반">일반 (25만원)</option>
                  <option value="베테랑">베테랑 (50만원)</option>
                  <option value="프리미엄">프리미엄 (50만원)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>생화부케</label>
                <input style={inputStyle} value={form.bouquet} onChange={set('bouquet')} placeholder="없음 또는 업체명" />
              </div>
            </div>
          </div>

          {/* 담당 카테고리 */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>담당 카테고리</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => {
                const active = form.categories.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      padding: '5px 13px', borderRadius: 24,
                      border: `1.5px solid ${cat.color}`,
                      backgroundColor: active ? cat.color : 'transparent',
                      color: active ? '#fff' : cat.color,
                      fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {labelOf(cat.id)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 기타 */}
          <div style={{ marginBottom: 28 }}>
            <div style={sectionTitleStyle}>기타</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>예약 유입경로</label>
                <input style={inputStyle} value={form.source} onChange={set('source')} placeholder="인스타그램, 네이버 등" />
              </div>
              <div>
                <label style={labelStyle}>현금영수증 번호</label>
                <input style={inputStyle} value={form.receiptNumber} onChange={set('receiptNumber')} placeholder="번호 입력" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>기타 요청사항</label>
              <textarea
                style={{ ...inputStyle, height: 72, resize: 'none' }}
                value={form.notes}
                onChange={set('notes')}
                placeholder="요청사항을 입력하세요"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '11px 20px', borderRadius: 12,
                border: '1px solid #e7e3e1', background: 'none',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#444',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                border: '1.5px solid #0096f7', backgroundColor: 'transparent',
                color: '#0096f7', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              예약만 등록
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e as unknown as React.FormEvent, true)}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                border: 'none', backgroundColor: '#0096f7',
                color: '#fff', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              등록 + 계약서 발송
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── 예약 상세 모달 ───────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#999', minWidth: 90, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#222', lineHeight: 1.5 }}>{value}</span>
    </div>
  )
}

function ReservationDetail({
  reservation,
  onClose,
  onOpenContractForm,
}: {
  reservation: Reservation
  onClose: () => void
  onOpenContractForm?: () => void
}) {
  const statusStyle = STATUS_STYLE[reservation.status]
  const labelOf = useCatLabel()

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 18,
        width: '100%', maxWidth: 460,
        maxHeight: '85vh', overflow: 'auto',
        padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>{reservation.brideName}</h2>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 24,
              fontSize: 11, fontWeight: 600,
              backgroundColor: statusStyle.bg, color: statusStyle.color,
            }}>
              {reservation.status}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DetailRow label="신부 연락처" value={reservation.bridePhone} />
          <DetailRow label="신랑" value={[reservation.groomName, reservation.groomPhone].filter(Boolean).join('  ')} />

          <hr style={{ border: 'none', borderTop: '1px solid #e7e3e1', margin: '4px 0' }} />

          <DetailRow label="의상피팅" value={[reservation.fittingDate, reservation.fittingTime].filter(Boolean).join(' ')} />
          <DetailRow label="헤어메이크업" value={[reservation.hairDate, reservation.hairTime].filter(Boolean).join(' ')} />
          <DetailRow label="스냅촬영" value={[reservation.snapDate, reservation.snapTime].filter(Boolean).join(' ')} />
          <DetailRow label="포토업체" value={reservation.photoStudio} />

          <hr style={{ border: 'none', borderTop: '1px solid #e7e3e1', margin: '4px 0' }} />

          <DetailRow label="이용상품" value={reservation.product} />
          <DetailRow label="헬퍼 서비스" value={reservation.helperService !== '없음' ? reservation.helperService : undefined} />
          <DetailRow label="생화부케" value={reservation.bouquet} />

          <hr style={{ border: 'none', borderTop: '1px solid #e7e3e1', margin: '4px 0' }} />

          <DetailRow label="유입경로" value={reservation.source} />
          <DetailRow label="현금영수증" value={reservation.receiptNumber} />
          <DetailRow label="요청사항" value={reservation.notes} />

          {reservation.categories.length > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid #e7e3e1', margin: '4px 0' }} />
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>담당 카테고리</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {reservation.categories.map(catId => {
                    const cat = CATEGORIES.find(c => c.id === catId)
                    return cat ? (
                      <span
                        key={catId}
                        style={{
                          padding: '3px 10px', borderRadius: 24,
                          backgroundColor: cat.color, color: '#fff',
                          fontSize: 11, fontWeight: 500,
                        }}
                      >
                        {labelOf(cat.id)}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {onOpenContractForm && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e7e3e1' }}>
            <button
              onClick={onOpenContractForm}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12,
                border: 'none', backgroundColor: '#0096f7',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              대여계약서 작성
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 메인 대시보드 ────────────────────────────────────────────────

export default function AppDashboard() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    new Set(CATEGORIES.map(c => c.id))
  )
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [contractReservation, setContractReservation] = useState<Reservation | null>(null)
  const [contractFormReservation, setContractFormReservation] = useState<Reservation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sheetsLoading, setSheetsLoading] = useState(true)
  const [sheetsError, setSheetsError] = useState(false)
  const [catLabels, setCatLabels] = useState<Record<string, string>>({})
  const [editingCats, setEditingCats] = useState(false)
  const [draftLabels, setDraftLabels] = useState<Record<string, string>>({})
  const [savingCats, setSavingCats] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 카테고리 표시 이름 (override 없으면 기본값)
  const labelOf = (id: string) =>
    catLabels[id] || CATEGORIES.find(c => c.id === id)?.label || id

  // 이름 수정 시작 — 현재 이름들을 draft 로 복사
  const startEditCats = () => {
    const draft: Record<string, string> = {}
    CATEGORIES.forEach(c => { draft[c.id] = labelOf(c.id) })
    setDraftLabels(draft)
    setEditingCats(true)
  }

  // 이름 저장 — 시트에 기록하고 화면 반영
  const saveCats = async () => {
    setSavingCats(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveCategories', categories: draftLabels }),
      })
      const data = await res.json()
      if (data.success) {
        setCatLabels(draftLabels)
        setEditingCats(false)
      } else {
        alert('카테고리 저장 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch {
      alert('카테고리 저장 중 오류가 발생했습니다.')
    } finally {
      setSavingCats(false)
    }
  }

  // 앱 로드 시 구글 시트에서 예약 불러오기
  useEffect(() => {
    fetch('/api/sheets')
      .then(r => r.json())
      .then((data: { reservations?: Record<string, string>[]; categories?: Record<string, string> }) => {
        if (data.categories) setCatLabels(data.categories)
        if (data.reservations && data.reservations.length > 0) {
          setReservations(
            data.reservations.map(row => ({
              id: row['예약ID'] || String(Date.now()),
              brideName: row['신부성함'] || '',
              bridePhone: row['신부연락처'] || '',
              groomName: row['신랑성함'] || '',
              groomPhone: row['신랑연락처'] || '',
              fittingDate: row['의상피팅날짜'] || '',
              fittingTime: row['의상피팅시간'] || '',
              hairDate: row['헤어메이크업날짜'] || '',
              hairTime: row['헤어메이크업시간'] || '',
              snapDate: row['스냅촬영날짜'] || '',
              snapTime: row['스냅촬영시간'] || '',
              photoStudio: row['포토업체'] || '',
              product: row['이용상품'] || '',
              helperService: row['헬퍼서비스'] || '없음',
              bouquet: row['생화부케'] || '',
              source: row['유입경로'] || '',
              notes: row['요청사항'] || '',
              receiptNumber: row['현금영수증번호'] || '',
              categories: (row['담당카테고리'] || '')
                .split(', ')
                .filter(Boolean) as CategoryId[],
              status: (row['예약상태'] || '대기') as '대기' | '확정' | '완료',
            }))
          )
        }
      })
      .catch(() => setSheetsError(true))
      .finally(() => setSheetsLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchResults = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return []
    const lower = q.toLowerCase()
    return reservations.filter(r =>
      r.brideName.toLowerCase().includes(lower) ||
      r.groomName.toLowerCase().includes(lower) ||
      r.bridePhone.includes(q) ||
      r.groomPhone.includes(q)
    ).slice(0, 6)
  }, [searchQuery, reservations])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [currentYear, currentMonth])

  const toDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  // 카테고리별 캘린더 엔트리: 헤어메이크업팀은 hairDate, 나머지는 fittingDate
  type CalendarEntry = { reservation: Reservation; categoryId: CategoryId; time: string }

  const byDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {}

    const push = (date: string, entry: CalendarEntry) => {
      if (!date) return
      if (!map[date]) map[date] = []
      map[date].push(entry)
    }

    reservations.forEach(r => {
      if (r.categories.length === 0) {
        // 카테고리 미지정 — fittingDate에 기본 색으로 표시
        if (r.fittingDate) push(r.fittingDate, { reservation: r, categoryId: '드레스팀', time: r.fittingTime })
        return
      }
      r.categories.forEach(catId => {
        if (!activeCategories.has(catId)) return
        if (catId === '헤어메이크업팀') {
          const date = r.hairDate || r.fittingDate
          const time = r.hairDate ? r.hairTime : r.fittingTime
          push(date, { reservation: r, categoryId: catId, time })
        } else {
          push(r.fittingDate, { reservation: r, categoryId: catId, time: r.fittingTime })
        }
      })
    })

    return map
  }, [reservations, activeCategories])

  const totalThisMonth = useMemo(() =>
    reservations.filter(r => r.fittingDate?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length
  , [reservations, currentYear, currentMonth])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0) }
    else setCurrentMonth(m => m + 1)
  }

  const toggleCategory = (id: CategoryId) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addReservation = (r: Omit<Reservation, 'id'>, showContract: boolean) => {
    const newR: Reservation = { ...r, id: Date.now().toString() }
    setReservations(prev => [...prev, newR])
    setShowForm(false)
    setSelectedDate(null)
    if (showContract) setContractReservation(newR)

    // 구글 시트에 저장 (실패해도 UI에 영향 없음)
    fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', reservation: newR }),
    }).catch(console.error)
  }

  return (
    <CatLabelCtx.Provider value={catLabels}>
    <div style={{
      display: 'flex', height: '100vh',
      fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
      backgroundColor: '#fdfdf7',
    }}>
      {/* ─── 사이드바 ─── */}
      <aside style={{
        width: 216, flexShrink: 0,
        borderRight: '1px solid #e7e3e1',
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 24,
        backgroundColor: '#fff',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#000', padding: '0 4px' }}>
          AUDREYTAILOR
        </div>

        <button
          onClick={() => { setSelectedDate(null); setShowForm(true) }}
          style={{
            backgroundColor: '#0096f7', color: '#fff',
            border: 'none', borderRadius: 12,
            padding: '11px 0', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', width: '100%', fontFamily: 'inherit',
          }}
        >
          + 새 예약
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.1em' }}>
              카테고리
            </span>
            {editingCats ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditingCats(false)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>취소</button>
                <button onClick={saveCats} disabled={savingCats} style={{ background: 'none', border: 'none', fontSize: 11, color: '#0096f7', fontWeight: 600, cursor: savingCats ? 'default' : 'pointer', fontFamily: 'inherit', padding: 0, opacity: savingCats ? 0.5 : 1 }}>
                  {savingCats ? '저장 중…' : '저장'}
                </button>
              </div>
            ) : (
              <button onClick={startEditCats} style={{ background: 'none', border: 'none', fontSize: 11, color: '#bbb', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>이름 수정</button>
            )}
          </div>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={editingCats ? undefined : () => toggleCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '6px 4px', cursor: editingCats ? 'default' : 'pointer',
                borderRadius: 8,
                opacity: editingCats || activeCategories.has(cat.id) ? 1 : 0.3,
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                backgroundColor: cat.color, flexShrink: 0,
              }} />
              {editingCats ? (
                <input
                  value={draftLabels[cat.id] ?? ''}
                  onChange={e => setDraftLabels(d => ({ ...d, [cat.id]: e.target.value }))}
                  style={{ flex: 1, minWidth: 0, fontSize: 13, padding: '3px 7px', border: '1px solid #e0ddd8', borderRadius: 6, fontFamily: 'inherit', color: '#222', outline: 'none' }}
                />
              ) : (
                <span style={{ fontSize: 13, color: '#222' }}>{labelOf(cat.id)}</span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ─── 메인 ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '16px 28px',
          borderBottom: '1px solid #e7e3e1',
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: '#fff', flexShrink: 0,
        }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: '1px solid #e7e3e1', borderRadius: 8, padding: '4px 11px', cursor: 'pointer', fontSize: 15, color: '#666', lineHeight: 1 }}
          >‹</button>
          <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#000', minWidth: 96 }}>
            {currentYear}년 {currentMonth + 1}월
          </h1>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: '1px solid #e7e3e1', borderRadius: 8, padding: '4px 11px', cursor: 'pointer', fontSize: 15, color: '#666', lineHeight: 1 }}
          >›</button>
          <button
            onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()) }}
            style={{
              marginLeft: 4, background: 'none',
              border: '1px solid #e7e3e1', borderRadius: 8,
              padding: '4px 12px', cursor: 'pointer',
              fontSize: 12, color: '#888', fontFamily: 'inherit',
            }}
          >
            오늘
          </button>
          {/* 검색 */}
          <div ref={searchRef} style={{ marginLeft: 'auto', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #e7e3e1', borderRadius: 10,
              padding: '6px 12px', backgroundColor: '#fafaf7',
              width: 220,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="4.5" stroke="#aaa" strokeWidth="1.4" />
                <path d="M9.5 9.5L12 12" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                placeholder="고객명 검색"
                style={{
                  border: 'none', outline: 'none', background: 'none',
                  fontSize: 13, color: '#333', width: '100%', fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 14, lineHeight: 1, padding: 0 }}
                >✕</button>
              )}
            </div>

            {/* 검색 결과 드롭다운 */}
            {searchOpen && searchQuery.trim() && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                width: 320, backgroundColor: '#fff',
                borderRadius: 12, border: '1px solid #e7e3e1',
                boxShadow: 'rgba(0,0,0,0.12) 0px 4px 16px',
                zIndex: 500, overflow: 'hidden',
              }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '16px 16px', fontSize: 13, color: '#aaa', textAlign: 'center' }}>
                    검색 결과가 없습니다
                  </div>
                ) : (
                  searchResults.map(r => {
                    const cat = CATEGORIES.find(c => r.categories[0] === c.id)
                    const statusStyle = STATUS_STYLE[r.status]
                    return (
                      <div
                        key={r.id}
                        onClick={() => { setSelectedReservation(r); setSearchOpen(false); setSearchQuery('') }}
                        style={{
                          padding: '12px 16px', cursor: 'pointer',
                          borderBottom: '1px solid #f0ede8',
                          display: 'flex', alignItems: 'center', gap: 12,
                          transition: 'background-color 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdfdf7')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                      >
                        {/* 카테고리 색 dot */}
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: cat?.color ?? '#0096f7', flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                            {r.brideName}
                            {r.groomName && <span style={{ fontWeight: 400, color: '#888', fontSize: 12, marginLeft: 6 }}>· {r.groomName}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#aaa' }}>
                            {r.fittingDate || '날짜 미정'}
                            {r.fittingTime && ` ${r.fittingTime}`}
                            {r.categories.length > 0 && (
                              <span style={{ marginLeft: 6 }}>
                                {r.categories.map(cId => labelOf(cId)).filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          backgroundColor: statusStyle.bg, color: statusStyle.color, flexShrink: 0,
                        }}>
                          {r.status}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {totalThisMonth > 0 && searchQuery === '' && (
            <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>
              이번 달 {totalThisMonth}건
            </span>
          )}
        </header>

        {sheetsLoading && (
          <div style={{ padding: '12px 28px', backgroundColor: '#f0f7ff', borderBottom: '1px solid #dbeafe', fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            구글 시트에서 예약을 불러오는 중...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {sheetsError && !sheetsLoading && (
          <div style={{ padding: '10px 28px', backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa', fontSize: 12, color: '#c2410c' }}>
            구글 시트 연결 실패 — GAS_URL을 확인하거나, 연동 전 로컬 모드로 사용 중입니다.
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 28px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  padding: '6px 8px', textAlign: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#aaa',
                  letterSpacing: '0.05em',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            border: '1px solid #e7e3e1', borderRadius: 12, overflow: 'hidden',
          }}>
            {calendarDays.map((day, idx) => {
              const colIdx = idx % 7
              const borderTop = idx >= 7 ? '1px solid #e7e3e1' : 'none'
              const borderLeft = colIdx !== 0 ? '1px solid #e7e3e1' : 'none'

              if (!day) {
                return (
                  <div key={`e-${idx}`} style={{ minHeight: 100, backgroundColor: '#fafaf8', borderTop, borderLeft }} />
                )
              }

              const ds = toDateStr(day)
              const rsvs = byDate[ds] || []
              const isToday = ds === todayStr

              return (
                <div
                  key={ds}
                  onClick={() => { setSelectedDate(ds); setShowForm(true) }}
                  style={{
                    minHeight: 100, padding: '6px 5px',
                    borderTop, borderLeft,
                    backgroundColor: '#fff', cursor: 'pointer',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdfdf7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', marginBottom: 4,
                    backgroundColor: isToday ? '#0096f7' : 'transparent',
                    color: isToday ? '#fff' : colIdx === 0 ? '#ef4444' : colIdx === 6 ? '#3b82f6' : '#333',
                    fontSize: 12, fontWeight: isToday ? 700 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {day}
                  </div>

                  {rsvs.slice(0, 3).map((entry, i) => {
                    const cat = CATEGORIES.find(c => c.id === entry.categoryId)
                    return (
                      <div
                        key={`${entry.reservation.id}-${entry.categoryId}-${i}`}
                        onClick={e => { e.stopPropagation(); setSelectedReservation(entry.reservation) }}
                        style={{
                          backgroundColor: cat?.color ?? '#0096f7',
                          color: '#fff', fontSize: 10,
                          padding: '2px 5px', borderRadius: 4,
                          marginBottom: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                      >
                        {entry.time ? `${entry.time} ` : ''}{entry.reservation.brideName}
                      </div>
                    )
                  })}
                  {rsvs.length > 3 && (
                    <div style={{ fontSize: 10, color: '#aaa', padding: '1px 5px' }}>
                      +{rsvs.length - 3}건
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {showForm && (
        <ReservationForm
          initialDate={selectedDate}
          onClose={() => { setShowForm(false); setSelectedDate(null) }}
          onSubmit={addReservation}
        />
      )}

      {selectedReservation && (
        <ReservationDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onOpenContractForm={() => {
            setContractFormReservation(selectedReservation)
            setSelectedReservation(null)
          }}
        />
      )}

      {contractReservation && (
        <ContractModal
          reservation={contractReservation}
          onClose={() => setContractReservation(null)}
        />
      )}

      {contractFormReservation && (
        <ContractFormModal
          reservation={contractFormReservation}
          onClose={() => setContractFormReservation(null)}
        />
      )}
    </div>
    </CatLabelCtx.Provider>
  )
}
