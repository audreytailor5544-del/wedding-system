'use client'

import { useState, useEffect } from 'react'

type Photo = { id: string; preview: string; file?: File; url?: string }

// ─── 타입 ─────────────────────────────────────────────────────────

export type RsvForContract = {
  id: string
  brideName: string; bridePhone: string
  groomName: string; groomPhone: string
  fittingDate: string; fittingTime: string
  hairDate: string; hairTime: string
  snapDate: string; snapTime: string
  photoStudio: string; product: string
  helperService: string; bouquet: string
  notes: string; receiptNumber: string
}

type Dress = { type: string; itemName: string; size: string; corsType: string; isPkg: string; price: string }
type Suit = {
  topItem: string; topSize: string; topColor: string; topQty: string; topPkg: string; topPrice: string
  bottomItem: string; bottomSize: string; bottomColor: string; bottomQty: string; bottomPkg: string; bottomPrice: string
}

const mkDress = (): Dress => ({ type: '', itemName: '', size: '', corsType: '코르셋', isPkg: 'PKG', price: '' })
const mkSuit = (): Suit => ({
  topItem: '', topSize: '', topColor: '', topQty: '1', topPkg: 'PKG', topPrice: '',
  bottomItem: '', bottomSize: '', bottomColor: '', bottomQty: '1', bottomPkg: 'PKG', bottomPrice: '',
})

// ─── 공통 스타일 ──────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
  padding: '7px 10px', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.02)',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#000',
}
const inpFilled: React.CSSProperties = { ...inp, backgroundColor: '#f5f2e8', color: '#555' }
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }
const sec: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#0096f7',
  letterSpacing: '0.07em', marginBottom: 12, paddingBottom: 6,
  borderBottom: '1px solid #e7e3e1',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={lbl}>{label}</label>{children}</div>
}

// ─── HTML 생성 함수 ───────────────────────────────────────────────

function buildHTML(r: RsvForContract, f: ReturnType<typeof makeInitialForm>, photoUrls: string[] = []) {
  const td = (content: string, opts?: { colspan?: number; rowspan?: number; bg?: string; align?: string; bold?: boolean; w?: string }) => {
    const attrs = [
      opts?.colspan ? `colspan="${opts.colspan}"` : '',
      opts?.rowspan ? `rowspan="${opts.rowspan}"` : '',
      opts?.w ? `width="${opts.w}"` : '',
    ].filter(Boolean).join(' ')
    const style = [
      'border:1px solid #aaa; padding:4px 6px; font-size:11px; vertical-align:middle;',
      opts?.bg ? `background:${opts.bg};` : '',
      opts?.align ? `text-align:${opts.align};` : '',
      opts?.bold ? 'font-weight:700;' : '',
    ].join('')
    return `<td ${attrs} style="${style}">${content ?? ''}</td>`
  }
  const th = (content: string, opts?: { colspan?: number; rowspan?: number; w?: string }) => {
    const attrs = [
      opts?.colspan ? `colspan="${opts.colspan}"` : '',
      opts?.rowspan ? `rowspan="${opts.rowspan}"` : '',
      opts?.w ? `width="${opts.w}"` : '',
    ].filter(Boolean).join(' ')
    return `<th ${attrs} style="border:1px solid #aaa; padding:4px 6px; font-size:11px; background:#e8e8e8; font-weight:700; vertical-align:middle; text-align:center;">${content}</th>`
  }
  const tr = (...cells: string[]) => `<tr>${cells.join('')}</tr>`
  const v = (val: string) => val || ''

  const helperType = r.helperService !== '없음' ? r.helperService : '없음'

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>오드리테일러 대여계약서 — ${r.brideName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 11px; color: #000; padding: 20px 30px; }
  h1 { text-align: center; font-size: 17px; margin-bottom: 12px; letter-spacing: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th, td { border: 1px solid #aaa; padding: 4px 6px; font-size: 11px; vertical-align: middle; }
  th { background: #e8e8e8; font-weight: 700; text-align: center; }
  .logo { font-size: 10px; text-align: right; font-weight: 700; letter-spacing: 1px; padding: 4px 6px; }
  .section-title { background: #d0d0d0; font-weight: 700; text-align: center; font-size: 12px; padding: 5px; }
  .notice { background: #f0f0f0; padding: 12px; font-size: 10px; line-height: 1.8; margin-top: 8px; }
  .notice p { margin-bottom: 6px; }
  .sign-table { margin-top: 16px; }
  .sign-table td { height: 36px; }
  @media print {
    body { padding: 10px 16px; }
    @page { margin: 10mm; }
  }
</style>
</head>
<body>
<h1>오드리테일러 대여계약서</h1>

<!-- 기본 예약 정보 -->
<table>
  <tr><td colspan="12" class="section-title">기본 예약 정보</td></tr>
  <tr>
    ${th('예약자 성명', { w: '8%' })}${td(v(r.brideName), { w: '10%' })}
    ${th('연락처', { w: '7%' })}${td(v(r.bridePhone), { w: '10%' })}
    ${th('비상 연락처', { w: '8%' })}${td(v(f.emergencyPhone), { w: '10%' })}
    ${th('성명', { w: '6%' })}${td(v(f.emergencyName), { w: '8%' })}
    ${th('이용 상품', { w: '8%' })}${td(v(f.product), { colspan: 3 })}
  </tr>
  <tr>
    ${th('상품 금액')}${td(v(f.productAmount))}
    ${th('예약금')}${td(v(f.depositAmount))}
    ${th('입금일자')}${td(v(f.depositDate))}
    ${th('결제방법')}${td(v(f.paymentMethod))}
    ${td('<div style="text-align:center; font-weight:700; font-size:12px; letter-spacing:2px;">AudreyTailor<br><span style="font-size:9px; font-weight:400;">WEDDING SHOP</span></div>', { colspan: 4, bg: '#f8f8f8' })}
  </tr>
  <tr>
    ${th('작가 업체명')}${td(v(f.photoStudio), { colspan: 2 })}
    ${th('활영 일자')}${td(v(r.snapDate))}
    ${th('활영 시작 시간')}${td(v(r.snapTime))}
    ${th('예약금')}${td(v(f.depositAmount))}
    ${th('입금일자')}${td(v(f.depositDate), { colspan: 4 })}
  </tr>
  <tr>
    ${th('헤어/메이크업샵')}${td(v(f.hairShop), { colspan: 2 })}
    ${th('헤어/메이크업 시작 시간')}${td(v(r.hairTime))}
    ${th('상품결제방법')}${td(v(f.paymentMethod), { colspan: 6 })}
  </tr>
</table>

<!-- 헬퍼 서비스 -->
<table>
  <tr>
    ${th('헬퍼서비스', { rowspan: 2, w: '8%' })}
    ${th('신청여부', { w: '10%' })}${th('헬퍼 담당자명', { w: '12%' })}${th('헬퍼 동행 시간', { w: '14%' })}${th('차량지원 신청여부', { w: '12%' })}
    ${td('<b>AudreyTailor</b><br><span style="font-size:9px">WEDDING SHOP</span>', { rowspan: 2, colspan: 2, bg: '#f8f8f8', align: 'center' })}
  </tr>
  <tr>
    ${td(`<span style="font-weight:700">${helperType}</span>`, { align: 'center' })}
    ${td(v(f.helperStaff), { align: 'center' })}
    ${td(v(f.helperTime), { align: 'center' })}
    ${td(v(f.carSupport), { align: 'center' })}
  </tr>
</table>

<!-- 생화 -->
<table>
  <tr>
    ${th('생화', { rowspan: 2, w: '8%' })}
    ${th('신청여부', { w: '8%' })}${th('생화 업체', { w: '14%' })}${th('생화 컬러', { w: '12%' })}${th('생화 금액', { w: '10%' })}${th('생화 결제 방법', { colspan: 4 })}
  </tr>
  <tr>
    ${td(v(f.flowerApplied), { align: 'center' })}
    ${td(v(f.flowerShop))}${td(v(f.flowerColor))}${td(v(f.flowerAmount), { align: 'right' })}
    ${td('PKG', { align: 'center', bg: f.flowerPayment === 'PKG' ? '#ffffc0' : '' })}
    ${td('삼 결제', { align: 'center', bg: f.flowerPayment === '삼 결제' ? '#ffffc0' : '' })}
    ${td('사전 결제', { align: 'center', bg: f.flowerPayment === '사전 결제' ? '#ffffc0' : '' })}
    ${td('고객 직접 결제', { align: 'center', bg: f.flowerPayment === '고객 직접 결제' ? '#ffffc0' : '' })}
  </tr>
</table>

<!-- 대여 품목 -->
<table>
  <tr><td colspan="12" class="section-title">대여 품목</td></tr>
  <tr>
    ${th('피팅 일자', { w: '10%' })}${td(v(r.fittingDate), { w: '10%' })}
    ${th('피팅 시간', { w: '8%' })}${td(v(r.fittingTime), { w: '10%' })}
    ${th('피팅 담당자', { w: '10%' })}${td(v(f.fittingStaff), { w: '12%' })}
    ${th('피팅 장소', { w: '8%' })}${td(v(f.fittingPlace), { colspan: 4 })}
  </tr>
</table>

<!-- 드레스 -->
<table>
  <tr>
    ${th('구분', { w: '10%' })}${th('유형', { w: '8%' })}${th('품명', { w: '22%' })}
    ${th('사이즈', { w: '8%' })}${th('종류', { w: '8%' })}${th('수량', { w: '5%' })}
    ${th('PKG여부', { w: '9%' })}${th('금액', { w: '12%' })}${th('합계', { w: '12%' })}
  </tr>
  ${f.dresses.map((d, i) => `<tr>
    ${th(`드레스${i + 1}`)}${td(v(d.type))}${td(v(d.itemName))}
    ${td(v(d.size), { align: 'center' })}${td(v(d.corsType), { align: 'center' })}${td('1', { align: 'center' })}
    ${td(v(d.isPkg), { align: 'center' })}${td(v(d.price), { align: 'right' })}${td('', { align: 'right' })}
  </tr>`).join('')}
</table>

<!-- 수트 -->
<table>
  <tr>
    ${th('구분', { w: '10%' })}${th('상/하의', { w: '8%' })}${th('품목', { w: '22%' })}
    ${th('사이즈', { w: '8%' })}${th('컬러', { w: '8%' })}${th('수량', { w: '5%' })}
    ${th('PKG여부', { w: '9%' })}${th('금액', { w: '12%' })}${th('합계', { w: '12%' })}
  </tr>
  ${f.suits.flatMap((s, i) => [
    `<tr>${th(`수트${i + 1}`, { rowspan: 2 })}${th('상의')}${td(v(s.topItem))}${td(v(s.topSize), { align: 'center' })}${td(v(s.topColor), { align: 'center' })}${td(v(s.topQty), { align: 'center' })}${td(v(s.topPkg), { align: 'center' })}${td(v(s.topPrice), { align: 'right' })}${td('', { align: 'right' })}</tr>`,
    `<tr>${th('하의')}${td(v(s.bottomItem))}${td(v(s.bottomSize), { align: 'center' })}${td(v(s.bottomColor), { align: 'center' })}${td(v(s.bottomQty), { align: 'center' })}${td(v(s.bottomPkg), { align: 'center' })}${td(v(s.bottomPrice), { align: 'right' })}${td('', { align: 'right' })}</tr>`,
  ]).join('')}
</table>

<!-- 신부님/신랑님 체크 -->
<table>
  <tr>
    ${th('신부님 체크', { rowspan: 2, w: '8%' })}
    ${th('항목', { w: '6%' })}${th('부케', { w: '7%' })}${th('헤어악세사리', { w: '9%' })}${th('화관', { w: '7%' })}${th('베일', { w: '7%' })}${th('속옷', { w: '7%' })}
    ${th('사이즈')}${th('수량')}${th('합계')}
  </tr>
  <tr>
    ${th('수량')}
    ${td(v(f.bouquetDetail), { align: 'center' })}${td(v(f.hairAcc), { align: 'center' })}
    ${td(v(f.crown), { align: 'center' })}${td(v(f.veil), { align: 'center' })}
    ${td(v(f.underwear), { align: 'center' })}
    ${td(v(f.brideShoeSize), { align: 'center' })}${td(v(f.brideShoeQty), { align: 'center' })}${td('')}
  </tr>
  <tr>
    ${th('신랑님 체크', { rowspan: 2 })}
    ${th('항목')}${th('부토니에')}${th('보타이')}${th('넥타이')}${th('서스팬더')}${th('셔츠')}
    ${th('사이즈')}${th('수량')}${th('합계')}
  </tr>
  <tr>
    ${th('수량')}
    ${td(v(f.boutonniere), { align: 'center' })}${td(v(f.bowtie), { align: 'center' })}
    ${td(v(f.tie), { align: 'center' })}${td(v(f.suspender), { align: 'center' })}
    ${td(v(f.shirt), { align: 'center' })}
    ${td(v(f.groomShoeSize), { align: 'center' })}${td(v(f.groomShoeQty), { align: 'center' })}${td('')}
  </tr>
</table>

<!-- 비고 -->
<table>
  <tr>
    ${th('비고', { rowspan: 3, w: '8%' })}
    ${td(v(f.contractNotes), { rowspan: 3, colspan: 5 })}
    ${th('기타 추가 항목', { colspan: 2 })}${th('금액')}${th('합계')}
  </tr>
  <tr>${th('기타1')}${td(v(f.extra1))}${td(v(f.extra1Amount), { align: 'right' })}${td('')}</tr>
  <tr>${th('기타2')}${td(v(f.extra2))}${td(v(f.extra2Amount), { align: 'right' })}${td('')}</tr>
</table>

<!-- 결제금액 -->
<table>
  <tr>
    ${th('결제금액', { rowspan: 2, w: '8%' })}
    ${th('합계', { w: '8%' })}
    ${th('상품', { w: '10%' })}${td(v(f.totalProduct), { align: 'right' })}
    ${th('생화', { w: '8%' })}${td(v(f.totalFlower), { align: 'right' })}
    ${th('대여품', { w: '8%' })}${td(v(f.totalRental), { align: 'right' })}
    ${td('', { colspan: 2 })}
  </tr>
</table>

<!-- 결제방법 -->
<table>
  <tr>
    ${th('결제방법', { w: '8%' })}
    ${th('카드', { w: '8%' })}${td(v(f.payCard), { align: 'right' })}
    ${th('이체', { w: '8%' })}${td(v(f.payTransfer), { align: 'right' })}
    ${th('현금', { w: '8%' })}${td(v(f.payCash), { align: 'right' })}
    ${th('현금영수증')}${td(r.receiptNumber ? 'O' : 'X', { align: 'center' })}
    ${th('승인번호')}${td(v(f.approvalNumber))}
    ${th('발행일')}${td(v(f.issueDate))}
  </tr>
</table>

<!-- 이용 안내 사항 -->
<div class="notice">
  <p style="font-weight:700; font-size:12px; text-align:center; margin-bottom:8px;">이용 안내 사항</p>
  <p>□ 1. 대여 물품 확인 : 대여 물품 수령 시 즉시 상태를 확인하시고, 이상이 있을 경우 즉시 '오드리테일러' 측에 알려주시기 바랍니다. 수령 후 발생한 문제에 대해서는 대여자에게 책임이 있을 수 있습니다.</p>
  <p>□ 2. 반납 - 촬영일 당일 반납을 기준으로 하며, 촬영 종료 후 PM10시까지 반납 부탁드립니다. - 의상 정리 : 대여하신 의상의 분실, 훼손, 오염(이염 등) 여부를 확인 후 케이스에 정리 부탁드립니다. - 소품 정리 : 소품 개수를 빠짐없이 확인하신 뒤 케이스에 담아 반납 부탁드립니다. - 사전에 협의되지 않은 지연 반납 시 추가 비용이 발생할 수 있습니다.</p>
  <p>□ 3. 소품 분실 시 분실 소품에 대한 정가(혹은 구매 비용)가 청구됩니다.</p>
  <p>□ 4. 본 대여 물품이 분실, 훼손, 의상 오염(이염 등)이 발생할 시 대여 금액의 3배 이상 등의 손해배상이 발생할 수 있음을 사전에 안내드립니다.</p>
  <p>□ 5. 헬퍼서비스 - 비용 안내: 해당 서비스는 본 계약의 웨딩 상품 외 추가 옵션으로, 촬영 종료 후 현장에서 현금으로 결제해 주시면 됩니다. - 제공 범위: 의상 환복, 간단한 메이크업 수정, 그리고 열기구를 사용하지 않는 손을 이용한 헤어 변형 서비스가 포함됩니다. - 유의 사항: 원활한 촬영 진행과 분실 방지를 위해 개인 소지품 보관 및 현장 내 개인 휴대폰 촬영은 제한하고 있습니다.</p>
  <p>□ 6. 수집된 개인정보는 '오드리테일러' 서비스 운영 목적 외에는 사용되지 않으며, 대여 물품 반납 완료 후 개인정보보호법에 따라 지체 없이 안전하게 파기됩니다.</p>
  <p style="text-align:center; margin-top:8px;">위 대여 및 이용과 관련된 사항에 대해 숙지하였으며, 이에 서명합니다.</p>
</div>

<!-- 서명 -->
<table class="sign-table" style="margin-top:16px; width:200px; margin-left:auto;">
  <tr>${th('일자', { w: '30%' })}${td('', { colspan: 2 })}</tr>
  <tr>${th('성명')}${td('')}${th('서명')}${td('')}</tr>
</table>

${photoUrls.length ? `
<div style="margin-top:18px;">
  <div class="section-title" style="margin-bottom:8px;">첨부 사진</div>
  <div style="display:flex; flex-wrap:wrap; gap:8px;">
    ${photoUrls.map(u => `<img src="${u}" style="max-width:180px; max-height:180px; border:1px solid #ccc;" />`).join('')}
  </div>
</div>` : ''}

</body>
</html>`
}

// ─── 초기 폼 상태 ─────────────────────────────────────────────────

function makeInitialForm(r: RsvForContract) {
  return {
    photoStudio: r.photoStudio || '', product: r.product || '',
    emergencyPhone: '', emergencyName: '',
    productAmount: '', depositAmount: '', depositDate: '', hairShop: '', paymentMethod: '',
    helperStaff: '', helperTime: '', carSupport: 'X' as string,
    flowerApplied: r.bouquet ? 'O' : 'X' as string,
    flowerShop: r.bouquet || '', flowerColor: '', flowerAmount: '',
    flowerPayment: 'PKG' as string,
    fittingStaff: '', fittingPlace: '',
    dresses: [mkDress(), mkDress(), mkDress()],
    suits: [mkSuit(), mkSuit(), mkSuit()],
    bouquetDetail: '', hairAcc: '', crown: '', veil: '', underwear: '',
    brideShoeSize: '', brideShoeQty: '',
    boutonniere: '', bowtie: '', tie: '', suspender: '', shirt: '',
    groomShoeSize: '', groomShoeQty: '',
    extra1: '', extra1Amount: '', extra2: '', extra2Amount: '',
    contractNotes: r.notes || '',
    totalProduct: '', totalFlower: '', totalRental: '',
    payCard: '', payTransfer: '', payCash: '',
    approvalNumber: '', issueDate: '',
  }
}

// ─── 계약서 폼 모달 ───────────────────────────────────────────────

export function ContractFormModal({
  reservation: r,
  onClose,
  lists,
}: {
  reservation: RsvForContract
  onClose: () => void
  lists?: { photoVendors: string[]; products: string[] }
}) {
  const [f, setF] = useState(() => makeInitialForm(r))
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const photoVendors = lists?.photoVendors || []
  const products = lists?.products || []

  // 저장된 계약서가 있으면 불러와서 폼·사진 복원 (스타일리스트 열람용)
  useEffect(() => {
    let alive = true
    fetch('/api/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getContract', id: r.id }),
    })
      .then(res => res.json())
      .then((data: { contract?: Record<string, string> }) => {
        if (!alive || !data.contract) return
        const c = data.contract
        if (c.raw) {
          try { setF(JSON.parse(c.raw)) } catch { /* 무시 */ }
        }
        if (c.photos) {
          setPhotos(String(c.photos).split(',').filter(Boolean).map((url, i) => ({ id: `s${i}`, preview: url, url })))
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingSaved(false) })
    return () => { alive = false }
  }, [r.id])

  // 클립보드에서 이미지 붙여넣기
  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const file = it.getAsFile()
        if (file) setPhotos(p => [...p, { id: `p${Date.now()}_${p.length}`, preview: URL.createObjectURL(file), file }])
      }
    }
  }
  const removePhoto = (id: string) => setPhotos(p => p.filter(x => x.id !== id))

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF(p => ({ ...p, [key]: e.target.value }))

  const setDress = (i: number, key: keyof Dress) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF(p => { const d = [...p.dresses]; d[i] = { ...d[i], [key]: e.target.value }; return { ...p, dresses: d } })

  const setSuit = (i: number, key: keyof Suit) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF(p => { const s = [...p.suits]; s[i] = { ...s[i], [key]: e.target.value }; return { ...p, suits: s } })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handlePrint = () => {
    const html = buildHTML(r, f, photos.map(p => p.url || p.preview))
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 600)
  }

  // 드레스 한 줄 요약 — 입력이 없으면 빈 문자열
  const dressSummary = (d: Dress) => {
    if (!(d.type || d.itemName || d.size || d.price)) return ''
    return [d.type, d.itemName, d.size, d.corsType, d.isPkg, d.price ? `${d.price}원` : '']
      .filter(Boolean).join(' / ')
  }
  // 수트 한 줄 요약 (상의/하의) — 입력이 없으면 빈 문자열
  const suitSummary = (s: Suit) => {
    const top = [s.topItem, s.topSize, s.topColor, s.topQty, s.topPkg, s.topPrice ? `${s.topPrice}원` : '']
      .filter(Boolean).join('/')
    const bottom = [s.bottomItem, s.bottomSize, s.bottomColor, s.bottomQty, s.bottomPkg, s.bottomPrice ? `${s.bottomPrice}원` : '']
      .filter(Boolean).join('/')
    if (!s.topItem && !s.bottomItem) return ''
    return [top && `상의: ${top}`, bottom && `하의: ${bottom}`].filter(Boolean).join(' | ')
  }

  // 아직 업로드 안 된 사진(파일)을 Blob 에 올리고 URL 목록 반환
  const uploadPendingPhotos = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const p of photos) {
      if (p.url) { urls.push(p.url); continue }
      if (p.file) {
        const ext = (p.file.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
        const res = await fetch(`/api/upload?filename=contract.${ext}`, {
          method: 'POST',
          headers: { 'Content-Type': p.file.type },
          body: p.file,
        })
        const data = await res.json()
        if (data.url) urls.push(data.url)
        else throw new Error(data.error || '사진 업로드 실패')
      }
    }
    return urls
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const photoUrls = await uploadPendingPhotos()
      // 업로드 결과를 화면에도 반영 (재저장 시 중복 업로드 방지)
      setPhotos(photoUrls.map((url, i) => ({ id: `s${i}`, preview: url, url })))
      const contract = {
        id: r.id,
        photos: photoUrls.join(','),
        raw: JSON.stringify(f),
        brideName: r.brideName, bridePhone: r.bridePhone, groomName: r.groomName,
        emergencyPhone: f.emergencyPhone, emergencyName: f.emergencyName,
        product: f.product, productAmount: f.productAmount, depositAmount: f.depositAmount,
        depositDate: f.depositDate, paymentMethod: f.paymentMethod,
        photoStudio: f.photoStudio, snapDate: r.snapDate, hairShop: f.hairShop,
        helperService: r.helperService, helperStaff: f.helperStaff, helperTime: f.helperTime, carSupport: f.carSupport,
        flowerApplied: f.flowerApplied, flowerShop: f.flowerShop, flowerColor: f.flowerColor,
        flowerAmount: f.flowerAmount, flowerPayment: f.flowerPayment,
        fittingDate: r.fittingDate, fittingTime: r.fittingTime, fittingStaff: f.fittingStaff, fittingPlace: f.fittingPlace,
        dress1: dressSummary(f.dresses[0]), dress2: dressSummary(f.dresses[1]), dress3: dressSummary(f.dresses[2]),
        suit1: suitSummary(f.suits[0]), suit2: suitSummary(f.suits[1]), suit3: suitSummary(f.suits[2]),
        bouquetDetail: f.bouquetDetail, hairAcc: f.hairAcc, crown: f.crown, veil: f.veil,
        underwear: f.underwear, brideShoeSize: f.brideShoeSize, brideShoeQty: f.brideShoeQty,
        boutonniere: f.boutonniere, bowtie: f.bowtie, tie: f.tie, suspender: f.suspender,
        shirt: f.shirt, groomShoeSize: f.groomShoeSize, groomShoeQty: f.groomShoeQty,
        extra1: f.extra1, extra1Amount: f.extra1Amount, extra2: f.extra2, extra2Amount: f.extra2Amount,
        contractNotes: f.contractNotes,
        totalProduct: f.totalProduct, totalFlower: f.totalFlower, totalRental: f.totalRental,
        payCard: f.payCard, payTransfer: f.payTransfer, payCash: f.payCash,
        receiptNumber: r.receiptNumber, approvalNumber: f.approvalNumber, issueDate: f.issueDate,
      }
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveContract', contract }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        alert('시트 저장 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch {
      alert('시트 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const subInp = { ...inp, padding: '5px 8px', fontSize: 12 }
  const subLbl = { ...lbl, fontSize: 10 }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, padding: 16,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 18,
        width: '100%', maxWidth: 800,
        maxHeight: '94vh', overflow: 'auto', padding: 32,
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#bbb', marginBottom: 4 }}>AUDREYTAILOR</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>대여계약서 작성</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {/* ── 기본 예약 정보 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>기본 예약 정보</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Field label="예약자 성명"><input style={inpFilled} readOnly value={r.brideName} /></Field>
            <Field label="신부 연락처"><input style={inpFilled} readOnly value={r.bridePhone} /></Field>
            <Field label="신랑 성함"><input style={inpFilled} readOnly value={r.groomName} /></Field>
            <Field label="신랑 연락처"><input style={inpFilled} readOnly value={r.groomPhone} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Field label="비상 연락처"><input style={inp} value={f.emergencyPhone} onChange={set('emergencyPhone')} placeholder="010-0000-0000" /></Field>
            <Field label="비상 연락처 성명"><input style={inp} value={f.emergencyName} onChange={set('emergencyName')} placeholder="성함" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Field label="이용 상품">
              <input style={inp} list="contract-products" value={f.product} onChange={set('product')} placeholder="목록 선택 또는 직접 입력" />
              <datalist id="contract-products">
                {products.map(p => <option key={p} value={p} />)}
              </datalist>
            </Field>
            <Field label="상품 금액"><input style={inp} value={f.productAmount} onChange={set('productAmount')} placeholder="예: 1,500,000" /></Field>
            <Field label="예약금"><input style={inp} value={f.depositAmount} onChange={set('depositAmount')} placeholder="예: 300,000" /></Field>
            <Field label="입금일자"><input style={inp} type="date" value={f.depositDate} onChange={set('depositDate')} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Field label="작가 업체명">
              <input style={inp} list="contract-vendors" value={f.photoStudio} onChange={set('photoStudio')} placeholder="목록 선택 또는 직접 입력" />
              <datalist id="contract-vendors">
                {photoVendors.map(v => <option key={v} value={v} />)}
              </datalist>
            </Field>
            <Field label="촬영 일자"><input style={inpFilled} readOnly value={r.snapDate} /></Field>
            <Field label="촬영 시작시간"><input style={inpFilled} readOnly value={r.snapTime} /></Field>
            <Field label="헤어/메이크업샵"><input style={inp} value={f.hairShop} onChange={set('hairShop')} placeholder="업체명" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <Field label="헤어메이크업 날짜"><input style={inpFilled} readOnly value={r.hairDate} /></Field>
            <Field label="헤어메이크업 시간"><input style={inpFilled} readOnly value={r.hairTime} /></Field>
            <Field label="현금영수증 번호"><input style={inpFilled} readOnly value={r.receiptNumber} /></Field>
            <Field label="상품 결제 방법">
              <select style={inp} value={f.paymentMethod} onChange={set('paymentMethod')}>
                <option value="">선택</option>
                <option value="카드">카드</option>
                <option value="이체">이체</option>
                <option value="현금">현금</option>
                <option value="PKG">PKG</option>
              </select>
            </Field>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 헬퍼 서비스 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>헬퍼 서비스</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <Field label="신청 여부">
              <input style={inpFilled} readOnly value={r.helperService} />
            </Field>
            <Field label="헬퍼 담당자명"><input style={inp} value={f.helperStaff} onChange={set('helperStaff')} /></Field>
            <Field label="헬퍼 동행 시간"><input style={inp} value={f.helperTime} onChange={set('helperTime')} placeholder="예: 09:00~14:00" /></Field>
            <Field label="차량 지원">
              <select style={inp} value={f.carSupport} onChange={set('carSupport')}>
                <option value="X">X</option>
                <option value="O">O</option>
              </select>
            </Field>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 생화 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>생화</div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr 1fr 1.4fr', gap: 10 }}>
            <Field label="신청 여부">
              <select style={inp} value={f.flowerApplied} onChange={set('flowerApplied')}>
                <option value="X">X</option>
                <option value="O">O</option>
              </select>
            </Field>
            <Field label="생화 업체"><input style={inp} value={f.flowerShop} onChange={set('flowerShop')} /></Field>
            <Field label="생화 컬러"><input style={inp} value={f.flowerColor} onChange={set('flowerColor')} /></Field>
            <Field label="생화 금액"><input style={inp} value={f.flowerAmount} onChange={set('flowerAmount')} placeholder="금액" /></Field>
            <Field label="결제 방법">
              <select style={inp} value={f.flowerPayment} onChange={set('flowerPayment')}>
                <option value="PKG">PKG</option>
                <option value="삼 결제">삼 결제</option>
                <option value="사전 결제">사전 결제</option>
                <option value="고객 직접 결제">고객 직접 결제</option>
              </select>
            </Field>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 피팅 정보 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>피팅 정보</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <Field label="피팅 일자"><input style={inpFilled} readOnly value={r.fittingDate} /></Field>
            <Field label="피팅 시간"><input style={inpFilled} readOnly value={r.fittingTime} /></Field>
            <Field label="피팅 담당자"><input style={inp} value={f.fittingStaff} onChange={set('fittingStaff')} /></Field>
            <Field label="피팅 장소"><input style={inp} value={f.fittingPlace} onChange={set('fittingPlace')} placeholder="예: 강남점" /></Field>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 드레스 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>드레스</div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ marginBottom: 10, padding: '12px 14px', backgroundColor: '#fafaf7', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>드레스 {i + 1}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 0.8fr 0.8fr 0.8fr 1fr', gap: 8 }}>
                <div><label style={subLbl}>유형</label><input style={subInp} value={f.dresses[i].type} onChange={setDress(i, 'type')} placeholder="유형" /></div>
                <div><label style={subLbl}>품명</label><input style={subInp} value={f.dresses[i].itemName} onChange={setDress(i, 'itemName')} placeholder="품명" /></div>
                <div><label style={subLbl}>사이즈</label><input style={subInp} value={f.dresses[i].size} onChange={setDress(i, 'size')} /></div>
                <div><label style={subLbl}>종류</label>
                  <select style={subInp} value={f.dresses[i].corsType} onChange={setDress(i, 'corsType')}>
                    <option value="코르셋">코르셋</option>
                    <option value="지퍼">지퍼</option>
                  </select>
                </div>
                <div><label style={subLbl}>PKG/추가</label>
                  <select style={subInp} value={f.dresses[i].isPkg} onChange={setDress(i, 'isPkg')}>
                    <option value="PKG">PKG</option>
                    <option value="추가">추가</option>
                  </select>
                </div>
                <div><label style={subLbl}>금액</label><input style={subInp} value={f.dresses[i].price} onChange={setDress(i, 'price')} placeholder="금액" /></div>
              </div>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 수트 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>수트</div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ marginBottom: 10, padding: '12px 14px', backgroundColor: '#fafaf7', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>수트 {i + 1}</div>
              {['상의', '하의'].map(part => {
                const prefix = part === '상의' ? 'top' : 'bottom'
                return (
                  <div key={part} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{part}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.6fr 0.8fr 1fr', gap: 8 }}>
                      <div><label style={subLbl}>품목</label><input style={subInp} value={(f.suits[i] as any)[`${prefix}Item`]} onChange={setSuit(i, `${prefix}Item` as keyof Suit)} /></div>
                      <div><label style={subLbl}>사이즈</label><input style={subInp} value={(f.suits[i] as any)[`${prefix}Size`]} onChange={setSuit(i, `${prefix}Size` as keyof Suit)} /></div>
                      <div><label style={subLbl}>컬러</label><input style={subInp} value={(f.suits[i] as any)[`${prefix}Color`]} onChange={setSuit(i, `${prefix}Color` as keyof Suit)} /></div>
                      <div><label style={subLbl}>수량</label><input style={subInp} value={(f.suits[i] as any)[`${prefix}Qty`]} onChange={setSuit(i, `${prefix}Qty` as keyof Suit)} /></div>
                      <div><label style={subLbl}>PKG/추가</label>
                        <select style={subInp} value={(f.suits[i] as any)[`${prefix}Pkg`]} onChange={setSuit(i, `${prefix}Pkg` as keyof Suit)}>
                          <option value="PKG">PKG</option>
                          <option value="추가">추가</option>
                        </select>
                      </div>
                      <div><label style={subLbl}>금액</label><input style={subInp} value={(f.suits[i] as any)[`${prefix}Price`]} onChange={setSuit(i, `${prefix}Price` as keyof Suit)} /></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 신부님 체크 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>신부님 체크</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[
              ['부케', 'bouquetDetail'], ['헤어악세사리', 'hairAcc'], ['화관', 'crown'],
              ['베일', 'veil'], ['속옷', 'underwear'], ['구두 사이즈', 'brideShoeSize'], ['구두 수량', 'brideShoeQty'],
            ].map(([label, key]) => (
              <div key={key}>
                <label style={subLbl}>{label}</label>
                <input style={subInp} value={(f as any)[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 신랑님 체크 ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sec}>신랑님 체크</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
            {[
              ['부토니에', 'boutonniere'], ['보타이', 'bowtie'], ['넥타이', 'tie'],
              ['서스팬더', 'suspender'], ['셔츠', 'shirt'], ['구두 사이즈', 'groomShoeSize'], ['구두 수량', 'groomShoeQty'],
            ].map(([label, key]) => (
              <div key={key}>
                <label style={subLbl}>{label}</label>
                <input style={subInp} value={(f as any)[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 비고 & 결제 ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={sec}>비고 & 결제</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>기타 항목 1</label>
              <input style={inp} value={f.extra1} onChange={set('extra1')} placeholder="항목명" />
            </div>
            <div><label style={lbl}>금액</label><input style={inp} value={f.extra1Amount} onChange={set('extra1Amount')} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>기타 항목 2</label>
              <input style={inp} value={f.extra2} onChange={set('extra2')} placeholder="항목명" />
            </div>
            <div><label style={lbl}>금액</label><input style={inp} value={f.extra2Amount} onChange={set('extra2Amount')} /></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>비고</label>
            <textarea style={{ ...inp, height: 64, resize: 'none' }} value={f.contractNotes} onChange={set('contractNotes')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={lbl}>결제 합계 — 상품</label><input style={inp} value={f.totalProduct} onChange={set('totalProduct')} /></div>
            <div><label style={lbl}>결제 합계 — 생화</label><input style={inp} value={f.totalFlower} onChange={set('totalFlower')} /></div>
            <div><label style={lbl}>결제 합계 — 대여품</label><input style={inp} value={f.totalRental} onChange={set('totalRental')} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>카드</label><input style={inp} value={f.payCard} onChange={set('payCard')} /></div>
            <div><label style={lbl}>이체</label><input style={inp} value={f.payTransfer} onChange={set('payTransfer')} /></div>
            <div><label style={lbl}>현금</label><input style={inp} value={f.payCash} onChange={set('payCash')} /></div>
            <div><label style={lbl}>승인번호</label><input style={inp} value={f.approvalNumber} onChange={set('approvalNumber')} /></div>
            <div><label style={lbl}>발행일</label><input style={inp} type="date" value={f.issueDate} onChange={set('issueDate')} /></div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0ede8', margin: '0 0 20px' }} />

        {/* ── 첨부 사진 ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={sec}>첨부 사진</div>
          <div
            onPaste={onPaste}
            tabIndex={0}
            style={{ border: '1.5px dashed #cdd6e0', borderRadius: 12, padding: 16, textAlign: 'center', color: '#8aa', fontSize: 13, cursor: 'text', outline: 'none', marginBottom: photos.length ? 12 : 0 }}
          >
            여기를 클릭한 뒤 <b style={{ color: '#0096f7' }}>Ctrl+V</b> 로 사진을 붙여넣으세요 (여러 장 가능)
          </div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {photos.map(p => (
                <div key={p.id} style={{ position: 'relative', width: 92, height: 92, borderRadius: 8, overflow: 'hidden', border: '1px solid #e7e3e1' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="첨부" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removePhoto(p.id)}
                    style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button onClick={onClose} style={{ padding: '11px 20px', borderRadius: 12, border: '1px solid #e7e3e1', background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#555' }}>
            닫기
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '11px 24px', borderRadius: 12, border: '1px solid #0096f7', background: saved ? '#0096f7' : 'none', color: saved ? '#fff' : '#0096f7', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            {saving ? '저장 중…' : saved ? '✓ 저장됨' : '시트에 저장'}
          </button>
          <button onClick={handlePrint} style={{ padding: '11px 32px', borderRadius: 12, border: 'none', backgroundColor: '#0096f7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            계약서 출력 / PDF 저장
          </button>
        </div>
      </div>
    </div>
  )
}
