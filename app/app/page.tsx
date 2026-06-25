'use client'

import { useState, useMemo, useRef, useEffect, createContext, useContext } from 'react'
import { ContractFormModal } from './ContractForm'

// ─── 타입 & 상수 ─────────────────────────────────────────────────

type Cat = { id: string; label: string; color: string }
type CategoryId = string

// 기본(시드) 카테고리 — 시트 '설정' 탭이 비어있을 때만 사용. 이후 추가/삭제/이름수정은 시트에 저장된다.
const DEFAULT_CATEGORIES: Cat[] = [
  { id: '드레스팀',      label: '드레스팀',      color: '#e879a0' },
  { id: '헤어메이크업팀', label: '헤어메이크업팀', color: '#a855f7' },
  { id: '스타일리스트1', label: '스타일리스트 1', color: '#3b82f6' },
  { id: '스타일리스트2', label: '스타일리스트 2', color: '#22c55e' },
  { id: '스타일리스트3', label: '스타일리스트 3', color: '#f97316' },
  { id: '스타일리스트4', label: '스타일리스트 4', color: '#06b6d4' },
  { id: '스타일리스트5', label: '스타일리스트 5', color: '#ef4444' },
  { id: '스타일리스트6', label: '스타일리스트 6', color: '#a16207' },
  { id: '회계',         label: '회계',          color: '#64748b' },
]

// 새 카테고리 색상 팔레트 (추가 시 순환 배정)
const CAT_PALETTE = ['#e879a0', '#a855f7', '#3b82f6', '#22c55e', '#f97316', '#06b6d4', '#ef4444', '#a16207', '#64748b', '#0096f7', '#14b8a6', '#eab308', '#f43f5e', '#8b5cf6']

// 카테고리 목록을 컨텍스트로 공유 (추가/삭제/이름수정 반영)
const CategoryCtx = createContext<Cat[]>(DEFAULT_CATEGORIES)
function useCats() { return useContext(CategoryCtx) }
function useCatLabel() {
  const cats = useCats()
  return (id: string) => cats.find(c => c.id === id)?.label || id
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
  lists,
}: {
  initialDate: string | null
  onClose: () => void
  onSubmit: (r: Omit<Reservation, 'id'>, showContract: boolean) => void
  lists?: { photoVendors: string[]; products: string[] }
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
  const cats = useCats()

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
                <input style={inputStyle} list="rsv-vendors" value={form.photoStudio} onChange={set('photoStudio')} placeholder="목록 선택 또는 직접 입력" />
                <datalist id="rsv-vendors">
                  {(lists?.photoVendors || []).map(v => <option key={v} value={v} />)}
                </datalist>
              </div>
              <div>
                <label style={labelStyle}>오드리 이용상품</label>
                <input style={inputStyle} list="rsv-products" value={form.product} onChange={set('product')} placeholder="목록 선택 또는 직접 입력" />
                <datalist id="rsv-products">
                  {(lists?.products || []).map(p => <option key={p} value={p} />)}
                </datalist>
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
              {cats.map(cat => {
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
  const cats = useCats()

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
                    const cat = cats.find(c => c.id === catId)
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

// ─── 직원 관리 패널 ───────────────────────────────────────────────

type Staff = {
  registeredAt?: string; hireDate: string; name: string; dept: string; position: string
  phone: string; rrn: string; address: string; memo: string; categories: string
  staffNo?: string; password?: string
}

function StaffPanel({
  staffList,
  onClose,
  onRegistered,
}: {
  staffList: Staff[]
  onClose: () => void
  onRegistered: () => void
}) {
  const labelOf = useCatLabel()
  const cats = useCats()
  const empty = { hireDate: '', name: '', dept: '', position: '', phone: '', rrn: '', address: '', memo: '', categories: [] as string[] }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<{ name: string; staffNo: string; password: string } | null>(null)
  const [editPermNo, setEditPermNo] = useState<string | null>(null) // 권한 수정 중인 직원번호
  const [draftPerms, setDraftPerms] = useState<string[]>([])
  const [savingPerm, setSavingPerm] = useState(false)

  const startEditPerm = (s: Staff) => {
    setEditPermNo(s.staffNo || null)
    setDraftPerms(String(s.categories || '').split(', ').filter(Boolean))
  }
  const togglePerm = (id: string) =>
    setDraftPerms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const savePerm = async () => {
    setSavingPerm(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStaffCategories', staffNo: editPermNo, categories: draftPerms.join(', ') }),
      })
      const data = await res.json()
      if (data.success) { setEditPermNo(null); onRegistered() }
      else alert('권한 저장 실패: ' + (data.error || ''))
    } catch { alert('권한 저장 중 오류가 발생했습니다.') } finally { setSavingPerm(false) }
  }

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleCat = (id: string) =>
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter(c => c !== id)
        : [...f.categories, id],
    }))

  const submit = async () => {
    if (!form.name.trim()) { alert('성명을 입력하세요.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addStaff', staff: { ...form, categories: form.categories.join(', ') } }),
      })
      const data = await res.json()
      if (data.success) {
        setCreated({ name: form.name, staffNo: data.staffNo, password: data.password })
        setForm(empty)
        onRegistered()
      } else {
        alert('직원 저장 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch {
      alert('직원 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
    }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '92vh', overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>직원 관리</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>✕</button>
        </div>

        {/* 등록 폼 */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>직원 등록</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={labelStyle}>입사일</label><input style={inputStyle} type="date" value={form.hireDate} onChange={set('hireDate')} /></div>
            <div><label style={labelStyle}>성명 *</label><input style={inputStyle} value={form.name} onChange={set('name')} placeholder="성명" /></div>
            <div><label style={labelStyle}>부서</label><input style={inputStyle} value={form.dept} onChange={set('dept')} placeholder="예: 드레스팀" /></div>
            <div><label style={labelStyle}>직급</label><input style={inputStyle} value={form.position} onChange={set('position')} placeholder="예: 실장" /></div>
            <div><label style={labelStyle}>연락처</label><input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" /></div>
            <div><label style={labelStyle}>주민번호</label><input style={inputStyle} value={form.rrn} onChange={set('rrn')} placeholder="000000-0000000" /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>주소</label>
            <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="주소" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>기타 메모</label>
            <textarea style={{ ...inputStyle, height: 56, resize: 'none' }} value={form.memo} onChange={set('memo')} placeholder="기타 메모 사항" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>카테고리 권한</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cats.map(cat => {
                const active = form.categories.includes(cat.id)
                return (
                  <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)}
                    style={{
                      padding: '5px 13px', borderRadius: 24, border: `1.5px solid ${cat.color}`,
                      backgroundColor: active ? cat.color : 'transparent', color: active ? '#fff' : cat.color,
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {labelOf(cat.id)}
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={submit} disabled={saving}
            style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', backgroundColor: '#0096f7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            {saving ? '저장 중…' : '직원 등록'}
          </button>

          {created && (
            <div style={{ marginTop: 14, padding: '14px 16px', backgroundColor: '#eaf6ff', border: '1px solid #b6e0ff', borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0070c0', marginBottom: 8 }}>✓ {created.name} 님 등록 완료 — 로그인 정보</div>
              <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
                <span style={{ color: '#333' }}>직원번호 <b style={{ fontSize: 16 }}>{created.staffNo}</b></span>
                <span style={{ color: '#333' }}>비밀번호 <b style={{ fontSize: 16, letterSpacing: 1 }}>{created.password}</b></span>
              </div>
              <p style={{ fontSize: 11, color: '#5a9', marginTop: 8 }}>이 정보를 직원에게 전달하세요. (직원 목록에서 다시 확인 가능)</p>
            </div>
          )}
        </div>

        {/* 직원 목록 */}
        <div>
          <div style={sectionTitleStyle}>등록된 직원 ({staffList.length}명)</div>
          {staffList.length === 0 ? (
            <p style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>아직 등록된 직원이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staffList.map((s, i) => (
                <div key={i} style={{ padding: '12px 14px', backgroundColor: '#fafaf7', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>{s.name}</span>
                    {s.position && <span style={{ fontSize: 12, color: '#888' }}>{s.position}</span>}
                    {s.dept && <span style={{ fontSize: 11, color: '#0096f7' }}>{s.dept}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#777', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    {s.phone && <span>{s.phone}</span>}
                    {s.hireDate && <span>입사 {s.hireDate}</span>}
                    <span>권한: {String(s.categories || '').split(', ').filter(Boolean).map(id => labelOf(id)).join(', ') || '없음'}</span>
                    {editPermNo !== s.staffNo && (
                      <button onClick={() => startEditPerm(s)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#0096f7', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>권한 수정</button>
                    )}
                  </div>
                  {editPermNo === s.staffNo && (
                    <div style={{ marginTop: 8, padding: 10, backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {cats.map(cat => {
                          const on = draftPerms.includes(cat.id)
                          return (
                            <button key={cat.id} type="button" onClick={() => togglePerm(cat.id)}
                              style={{ padding: '3px 10px', borderRadius: 20, border: `1.5px solid ${cat.color}`, backgroundColor: on ? cat.color : 'transparent', color: on ? '#fff' : cat.color, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {cat.label}
                            </button>
                          )
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditPermNo(null)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}>취소</button>
                        <button onClick={savePerm} disabled={savingPerm} style={{ background: 'none', border: 'none', fontSize: 12, color: '#0096f7', fontWeight: 600, cursor: savingPerm ? 'default' : 'pointer', fontFamily: 'inherit', opacity: savingPerm ? 0.5 : 1 }}>
                          {savingPerm ? '저장 중…' : '권한 저장'}
                        </button>
                      </div>
                    </div>
                  )}
                  {(s.staffNo || s.password) && (
                    <div style={{ fontSize: 12, color: '#0070c0', marginTop: 4, display: 'flex', gap: 14 }}>
                      <span>직원번호 <b>{s.staffNo}</b></span>
                      <span>비밀번호 <b>{s.password}</b></span>
                    </div>
                  )}
                  {s.memo && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{s.memo}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 통계 패널 ────────────────────────────────────────────────────

function StatBar({ label, count, max, color }: { label: string; count: number; max: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{ width: 96, fontSize: 12, color: '#555', textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <div style={{ flex: 1, background: '#f0ede8', borderRadius: 6, height: 18 }}>
        <div style={{ width: `${max ? (count / max) * 100 : 0}%`, minWidth: count ? 4 : 0, background: color || '#0096f7', height: '100%', borderRadius: 6 }} />
      </div>
      <span style={{ width: 30, fontSize: 12, fontWeight: 600, color: '#222', textAlign: 'right', flexShrink: 0 }}>{count}</span>
    </div>
  )
}

function StatsPanel({
  reservations,
  year,
  month,
  onClose,
}: {
  reservations: Reservation[]
  year: number
  month: number
  onClose: () => void
}) {
  const labelOf = useCatLabel()
  const cats = useCats()

  // 월별 (의상피팅 날짜 기준)
  const monthly = useMemo(() => {
    const map: Record<string, number> = {}
    reservations.forEach(r => {
      const ym = (r.fittingDate || '').slice(0, 7)
      if (ym) map[ym] = (map[ym] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [reservations])

  // 일별 (현재 보고 있는 달)
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const daily = useMemo(() => {
    const map: Record<string, number> = {}
    reservations.forEach(r => {
      if ((r.fittingDate || '').startsWith(monthPrefix)) {
        const day = r.fittingDate.slice(8, 10)
        if (day) map[day] = (map[day] || 0) + 1
      }
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [reservations, monthPrefix])

  // 카테고리별 (한 예약이 여러 카테고리에 속할 수 있음)
  const byCat = useMemo(() =>
    cats.map(c => ({
      id: c.id, color: c.color,
      count: reservations.filter(r => r.categories.includes(c.id)).length,
    })).filter(x => x.count > 0).sort((a, b) => b.count - a.count)
  , [reservations, cats])

  // 상품별
  const byProduct = useMemo(() => {
    const map: Record<string, number> = {}
    reservations.forEach(r => {
      const p = r.product || '(미지정)'
      map[p] = (map[p] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [reservations])

  const maxMonthly = Math.max(1, ...monthly.map(m => m[1]))
  const maxDaily = Math.max(1, ...daily.map(d => d[1]))
  const maxCat = Math.max(1, ...byCat.map(c => c.count))
  const maxProduct = Math.max(1, ...byProduct.map(p => p[1]))

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
    }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 18, width: '100%', maxWidth: 620, maxHeight: '92vh', overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>예약 통계</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>총 예약 <b style={{ color: '#0096f7' }}>{reservations.length}</b>건 · 의상피팅 날짜 기준</p>

        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>월별 예약 건수</div>
          {monthly.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>데이터 없음</p> :
            monthly.map(([ym, n]) => (
              <StatBar key={ym} label={`${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`} count={n} max={maxMonthly} />
            ))}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>일별 예약 건수 — {year}년 {month + 1}월</div>
          {daily.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>이 달 예약 없음</p> :
            daily.map(([day, n]) => (
              <StatBar key={day} label={`${Number(day)}일`} count={n} max={maxDaily} />
            ))}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>카테고리별 예약 건수</div>
          {byCat.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>데이터 없음</p> :
            byCat.map(c => (
              <StatBar key={c.id} label={labelOf(c.id)} count={c.count} max={maxCat} color={c.color} />
            ))}
        </div>

        <div>
          <div style={sectionTitleStyle}>상품별 예약 건수</div>
          {byProduct.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>데이터 없음</p> :
            byProduct.map(([p, n]) => (
              <StatBar key={p} label={p} count={n} max={maxProduct} color="#a855f7" />
            ))}
        </div>
      </div>
    </div>
  )
}

// ─── 회계 관리자 패널 ─────────────────────────────────────────────

type Income = { date: string; name: string; amount: number }
type Expense = { date: string; account: string; item: string; amount: number; method: string; memo: string }

const ACCOUNTS = ['임대료', '인건비', '재료/사입', '마케팅', '운영비', '세금/공과금', '외주비', '기타']
const won = (n: number) => `${Math.round(n).toLocaleString()}원`

function AccountingPanel({ onClose }: { onClose: () => void }) {
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const emptyForm = { date: '', account: '', item: '', amount: '', method: '', memo: '' }
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'getAccounting' }) })
      .then(r => r.json())
      .then((d: { income?: Income[]; expenses?: Expense[] }) => { setIncome(d.income || []); setExpenses(d.expenses || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const addExpense = async () => {
    if (!form.account.trim() || !form.amount) { alert('계정과 금액을 입력하세요.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addExpense', expense: { ...form, amount: String(form.amount).replace(/[^0-9.-]/g, '') } }),
      })
      const data = await res.json()
      if (data.success) { setForm(emptyForm); load() }
      else alert('지출 저장 실패: ' + (data.error || ''))
    } catch { alert('지출 저장 중 오류가 발생했습니다.') } finally { setSaving(false) }
  }

  const totalIncome = income.reduce((s, x) => s + x.amount, 0)
  const totalExpense = expenses.reduce((s, x) => s + x.amount, 0)
  const net = totalIncome - totalExpense

  const byAccount = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(x => { const a = x.account || '(미분류)'; map[a] = (map[a] || 0) + x.amount })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [expenses])
  const maxAcc = Math.max(1, ...byAccount.map(a => a[1]))

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
    }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '92vh', overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>회계 관리</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 22px' }}>수입은 저장된 대여계약서에서 자동 집계됩니다.</p>

        {/* 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { label: '총 수입', value: totalIncome, color: '#0096f7' },
            { label: '총 지출', value: totalExpense, color: '#ef4444' },
            { label: '순이익', value: net, color: net >= 0 ? '#16a34a' : '#ef4444' },
          ].map(c => (
            <div key={c.label} style={{ padding: '16px 18px', backgroundColor: '#fafaf7', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: c.color }}>{won(c.value)}</div>
            </div>
          ))}
        </div>

        {/* 지출 등록 */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>지출 등록</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>지출일</label><input style={inputStyle} type="date" value={form.date} onChange={set('date')} /></div>
            <div>
              <label style={labelStyle}>계정 *</label>
              <input style={inputStyle} list="acc-list" value={form.account} onChange={set('account')} placeholder="목록 선택 또는 직접 입력" />
              <datalist id="acc-list">{ACCOUNTS.map(a => <option key={a} value={a} />)}</datalist>
            </div>
            <div><label style={labelStyle}>금액 *</label><input style={inputStyle} value={form.amount} onChange={set('amount')} placeholder="예: 500,000" inputMode="numeric" /></div>
            <div><label style={labelStyle}>항목</label><input style={inputStyle} value={form.item} onChange={set('item')} placeholder="항목명" /></div>
            <div>
              <label style={labelStyle}>결제수단</label>
              <select style={inputStyle} value={form.method} onChange={set('method')}>
                <option value="">선택</option>
                <option value="카드">카드</option>
                <option value="이체">이체</option>
                <option value="현금">현금</option>
              </select>
            </div>
            <div><label style={labelStyle}>메모</label><input style={inputStyle} value={form.memo} onChange={set('memo')} placeholder="메모" /></div>
          </div>
          <button onClick={addExpense} disabled={saving}
            style={{ width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            {saving ? '저장 중…' : '지출 추가'}
          </button>
        </div>

        {/* 계정별 지출 */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>계정별 지출</div>
          {byAccount.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>지출 내역 없음</p> :
            byAccount.map(([acc, amt]) => (
              <StatBar key={acc} label={acc} count={amt} max={maxAcc} color="#ef4444" />
            ))}
        </div>

        {/* 지출 내역 */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitleStyle}>지출 내역 ({expenses.length}건)</div>
          {loading ? <p style={{ fontSize: 13, color: '#aaa' }}>불러오는 중…</p> :
            expenses.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>지출 내역 없음</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {expenses.map((x, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', backgroundColor: '#fafaf7', borderRadius: 8 }}>
                  <span style={{ width: 84, color: '#888', flexShrink: 0 }}>{x.date || '-'}</span>
                  <span style={{ width: 80, color: '#ef4444', fontWeight: 600, flexShrink: 0 }}>{x.account}</span>
                  <span style={{ flex: 1, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[x.item, x.memo].filter(Boolean).join(' · ')}</span>
                  <span style={{ fontWeight: 600, color: '#222', flexShrink: 0 }}>{won(x.amount)}</span>
                </div>
              ))}
            </div>}
        </div>

        {/* 수입 내역 (계약 기반) */}
        <div>
          <div style={sectionTitleStyle}>수입 내역 — 계약 ({income.length}건)</div>
          {loading ? <p style={{ fontSize: 13, color: '#aaa' }}>불러오는 중…</p> :
            income.length === 0 ? <p style={{ fontSize: 13, color: '#aaa' }}>저장된 계약서가 없습니다.</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {income.map((x, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', backgroundColor: '#f3f9ff', borderRadius: 8 }}>
                  <span style={{ flex: 1, color: '#444' }}>{x.name || '(이름없음)'}</span>
                  <span style={{ fontWeight: 600, color: '#0096f7', flexShrink: 0 }}>{won(x.amount)}</span>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

// ─── 로그인 화면 ──────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (staffNo: string, password: string) => Promise<string | null> }) {
  const [staffNo, setStaffNo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffNo.trim() || !password.trim()) { setError('직원번호와 비밀번호를 입력하세요.'); return }
    setLoading(true); setError('')
    const err = await onLogin(staffNo.trim(), password.trim())
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#fdfdf7',
      fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
    }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 340, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: '#000', marginBottom: 8 }}>AUDREYTAILOR</div>
          <div style={{ fontSize: 14, color: '#888' }}>직원 로그인</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>직원번호</label>
          <input style={inputStyle} value={staffNo} onChange={e => setStaffNo(e.target.value)} placeholder="예: 1001" inputMode="numeric" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>비밀번호</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />
        </div>
        {error && <p style={{ fontSize: 12, color: '#e54848', marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', backgroundColor: '#0096f7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
          {loading ? '확인 중…' : '로그인'}
        </button>
        <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 16 }}>
          직원번호·비밀번호는 관리자가 직원 등록 시 발급합니다.
        </p>
      </form>
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
    new Set(DEFAULT_CATEGORIES.map(c => c.id))
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
  const [cats, setCats] = useState<Cat[]>(DEFAULT_CATEGORIES)
  const [editingCats, setEditingCats] = useState(false)
  const [draftCats, setDraftCats] = useState<Cat[]>([])
  const [savingCats, setSavingCats] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [showStaffPanel, setShowStaffPanel] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showAccounting, setShowAccounting] = useState(false)
  const [lists, setLists] = useState<{ photoVendors: string[]; products: string[] }>({ photoVendors: [], products: [] })
  const [auth, setAuth] = useState<{ staffNo: string; name: string; categories?: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 로그인 세션 복원 (새로고침해도 유지)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('staffSession')
      if (saved) setAuth(JSON.parse(saved))
    } catch { /* 무시 */ }
    setAuthChecked(true)
  }, [])

  // 직원번호+비밀번호 로그인 — 성공 시 null, 실패 시 오류 메시지 반환
  const handleLogin = async (staffNo: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', staffNo, password }),
      })
      const data = await res.json()
      if (data.success) {
        const session = { staffNo: data.staffNo, name: data.name, categories: data.categories || '' }
        setAuth(session)
        try { localStorage.setItem('staffSession', JSON.stringify(session)) } catch { /* 무시 */ }
        return null
      }
      return data.error || '로그인에 실패했습니다.'
    } catch {
      return '로그인 중 오류가 발생했습니다.'
    }
  }

  const handleLogout = () => {
    setAuth(null)
    try { localStorage.removeItem('staffSession') } catch { /* 무시 */ }
  }

  // 직원 목록 새로고침
  const reloadStaff = () => {
    fetch('/api/sheets')
      .then(r => r.json())
      .then((data: { staff?: Staff[] }) => { if (data.staff) setStaff(data.staff) })
      .catch(() => {})
  }

  // 카테고리 표시 이름 (cats 기준)
  const labelOf = (id: string) => cats.find(c => c.id === id)?.label || id

  // ── 권한 ──
  // 내 권한 카테고리. 비어있거나 '회계' 포함 시 관리자(전체 접근).
  const myCats = auth?.categories ? auth.categories.split(', ').filter(Boolean) : []
  const isAdmin = myCats.length === 0 || myCats.includes('회계')
  // 화면에 보일 카테고리/예약 (비관리자는 본인 권한만)
  const visibleCats = isAdmin ? cats : cats.filter(c => myCats.includes(c.id))
  const visibleReservations = isAdmin ? reservations : reservations.filter(r => r.categories.some(c => myCats.includes(c)))

  // 카테고리 편집 시작 — 현재 목록을 draft 로 복사
  const startEditCats = () => {
    setDraftCats(cats.map(c => ({ ...c })))
    setEditingCats(true)
  }
  const updateDraftCat = (i: number, field: 'label' | 'color', value: string) =>
    setDraftCats(d => d.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  const cycleDraftColor = (i: number) =>
    setDraftCats(d => d.map((c, idx) => {
      if (idx !== i) return c
      const cur = CAT_PALETTE.indexOf(c.color)
      return { ...c, color: CAT_PALETTE[(cur + 1) % CAT_PALETTE.length] }
    }))
  const addDraftCat = () =>
    setDraftCats(d => [...d, { id: `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`, label: '새 카테고리', color: CAT_PALETTE[d.length % CAT_PALETTE.length] }])
  const removeDraftCat = (i: number) =>
    setDraftCats(d => d.filter((_, idx) => idx !== i))

  // 카테고리 목록 저장 — 시트에 전체 덮어쓰기 후 화면 반영
  const saveCats = async () => {
    const cleaned = draftCats.filter(c => c.label.trim())
    if (cleaned.length === 0) { alert('카테고리가 최소 1개는 있어야 합니다.'); return }
    setSavingCats(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveCategories', categories: cleaned }),
      })
      const data = await res.json()
      if (data.success) {
        setCats(cleaned)
        setActiveCategories(new Set(cleaned.map(c => c.id)))
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
      .then((data: { reservations?: Record<string, string>[]; categories?: Cat[]; staff?: Staff[]; lists?: { photoVendors: string[]; products: string[] } }) => {
        if (data.categories && data.categories.length > 0) {
          setCats(data.categories)
          setActiveCategories(new Set(data.categories.map(c => c.id)))
        }
        if (data.staff) setStaff(data.staff)
        if (data.lists) setLists(data.lists)
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
    return visibleReservations.filter(r =>
      r.brideName.toLowerCase().includes(lower) ||
      r.groomName.toLowerCase().includes(lower) ||
      r.bridePhone.includes(q) ||
      r.groomPhone.includes(q)
    ).slice(0, 6)
  }, [searchQuery, visibleReservations])

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

    const myCatsArr = auth?.categories ? auth.categories.split(', ').filter(Boolean) : []
    const admin = myCatsArr.length === 0 || myCatsArr.includes('회계')

    reservations.forEach(r => {
      if (r.categories.length === 0) {
        // 카테고리 미지정 — 관리자에게만 fittingDate에 기본 색으로 표시
        if (admin && r.fittingDate) push(r.fittingDate, { reservation: r, categoryId: '드레스팀', time: r.fittingTime })
        return
      }
      r.categories.forEach(catId => {
        if (!activeCategories.has(catId)) return
        if (!admin && !myCatsArr.includes(catId)) return // 권한 없는 카테고리는 숨김
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
  }, [reservations, activeCategories, auth])

  const totalThisMonth = useMemo(() =>
    visibleReservations.filter(r => r.fittingDate?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length
  , [visibleReservations, currentYear, currentMonth])

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

  // 로그인 게이트
  // - 세션 확인 전: 빈 화면
  // - 미로그인 + 직원 데이터 로딩 중: 빈 화면 (판단 보류)
  // - 미로그인 + 등록된 직원 있음: 로그인 화면
  // - 미로그인 + 등록된 직원 0명: 최초 셋업을 위해 통과 (첫 직원 등록 가능)
  if (!authChecked) return null
  if (!auth && sheetsLoading) return null
  if (!auth && staff.length > 0) return <LoginScreen onLogin={handleLogin} />

  return (
    <CategoryCtx.Provider value={cats}>
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
              isAdmin && <button onClick={startEditCats} style={{ background: 'none', border: 'none', fontSize: 11, color: '#bbb', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>편집</button>
            )}
          </div>

          {editingCats ? (
            <>
              {draftCats.map((cat, i) => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 4px' }}>
                  <div
                    onClick={() => cycleDraftColor(i)}
                    title="색상 변경"
                    style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 0 0 1px #ddd' }}
                  />
                  <input
                    value={cat.label}
                    onChange={e => updateDraftCat(i, 'label', e.target.value)}
                    style={{ flex: 1, minWidth: 0, fontSize: 13, padding: '3px 7px', border: '1px solid #e0ddd8', borderRadius: 6, fontFamily: 'inherit', color: '#222', outline: 'none' }}
                  />
                  <button onClick={() => removeDraftCat(i)} title="삭제"
                    style={{ background: 'none', border: 'none', color: '#d77', fontSize: 15, cursor: 'pointer', flexShrink: 0, padding: '0 2px', lineHeight: 1 }}>×</button>
                </div>
              ))}
              <button onClick={addDraftCat}
                style={{ marginTop: 4, background: 'none', border: '1px dashed #d6d2cc', borderRadius: 8, padding: '6px 0', fontSize: 12, color: '#888', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
                + 카테고리 추가
              </button>
            </>
          ) : (
            visibleCats.map(cat => (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 4px', cursor: 'pointer', borderRadius: 8,
                  opacity: activeCategories.has(cat.id) ? 1 : 0.3,
                  transition: 'opacity 0.15s',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#222' }}>{cat.label}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowStats(true)}
            style={{
              background: 'none', border: '1px solid #e7e3e1',
              borderRadius: 10, padding: '9px 0', fontSize: 12, color: '#666',
              cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            }}
          >
            통계
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowAccounting(true)}
                style={{
                  background: 'none', border: '1px solid #e7e3e1',
                  borderRadius: 10, padding: '9px 0', fontSize: 12, color: '#666',
                  cursor: 'pointer', width: '100%', fontFamily: 'inherit',
                }}
              >
                회계
              </button>
              <button
                onClick={() => setShowStaffPanel(true)}
                style={{
                  background: 'none', border: '1px solid #e7e3e1',
                  borderRadius: 10, padding: '9px 0', fontSize: 12, color: '#666',
                  cursor: 'pointer', width: '100%', fontFamily: 'inherit',
                }}
              >
                직원 관리
              </button>
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #f0ede8' }}>
            {auth ? (
              <>
                <span style={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {auth.name} 님
                </span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', fontSize: 11, color: '#bbb', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px', flexShrink: 0 }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <span style={{ fontSize: 11, color: '#e08a00' }}>최초 설정 — 직원을 등록하세요</span>
            )}
          </div>
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
                    const cat = cats.find(c => r.categories[0] === c.id)
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
                    const cat = cats.find(c => c.id === entry.categoryId)
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
          lists={lists}
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
          lists={lists}
        />
      )}

      {showStaffPanel && (
        <StaffPanel
          staffList={staff}
          onClose={() => setShowStaffPanel(false)}
          onRegistered={reloadStaff}
        />
      )}

      {showStats && (
        <StatsPanel
          reservations={visibleReservations}
          year={currentYear}
          month={currentMonth}
          onClose={() => setShowStats(false)}
        />
      )}

      {showAccounting && (
        <AccountingPanel onClose={() => setShowAccounting(false)} />
      )}
    </div>
    </CategoryCtx.Provider>
  )
}
