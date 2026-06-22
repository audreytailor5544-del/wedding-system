// 웨딩예약 시스템 ↔ Google Sheets 연동
// 기존 원본 시트(1narswOt...)는 건드리지 않고, 별도 탭 "예약마스터"에만 기록한다.

const SPREADSHEET_ID = '1narswOt-LTZ6TGvRJcucGrql7HB5GGEU5tHEDg5j50I'
const SHEET_NAME = '예약마스터'
const CONTRACT_SHEET = '대여계약서'
const SETTINGS_SHEET = '설정'
const STAFF_SHEET = '직원'
const PHOTO_SHEET = '포토거래처'
const PRODUCT_SHEET = '이용상품'

const STAFF_HEADERS = [
  '등록일시', '입사일', '성명', '부서', '직급', '연락처',
  '주민번호', '주소', '기타메모', '카테고리권한',
]

// 대여계약서 컬럼 — KEYS(영문, 클라이언트 전송 키)와 HEADERS(한글, 시트 표시)는
// 같은 순서/길이를 유지한다. (작성일시는 1열에 별도로 GAS가 채움)
const CONTRACT_KEYS = [
  'id', 'brideName', 'bridePhone', 'groomName',
  'emergencyPhone', 'emergencyName',
  'product', 'productAmount', 'depositAmount', 'depositDate', 'paymentMethod',
  'photoStudio', 'snapDate', 'hairShop',
  'helperService', 'helperStaff', 'helperTime', 'carSupport',
  'flowerApplied', 'flowerShop', 'flowerColor', 'flowerAmount', 'flowerPayment',
  'fittingDate', 'fittingTime', 'fittingStaff', 'fittingPlace',
  'dress1', 'dress2', 'dress3',
  'suit1', 'suit2', 'suit3',
  'bouquetDetail', 'hairAcc', 'crown', 'veil', 'underwear', 'brideShoeSize', 'brideShoeQty',
  'boutonniere', 'bowtie', 'tie', 'suspender', 'shirt', 'groomShoeSize', 'groomShoeQty',
  'extra1', 'extra1Amount', 'extra2', 'extra2Amount', 'contractNotes',
  'totalProduct', 'totalFlower', 'totalRental',
  'payCard', 'payTransfer', 'payCash', 'receiptNumber', 'approvalNumber', 'issueDate',
]
const CONTRACT_HEADERS = [
  '예약ID', '신부성함', '신부연락처', '신랑성함',
  '비상연락처', '비상연락처성명',
  '이용상품', '상품금액', '예약금', '입금일자', '상품결제방법',
  '작가업체', '촬영일자', '헤어메이크업샵',
  '헬퍼신청', '헬퍼담당자', '헬퍼동행시간', '차량지원',
  '생화신청', '생화업체', '생화컬러', '생화금액', '생화결제방법',
  '피팅일자', '피팅시간', '피팅담당자', '피팅장소',
  '드레스1', '드레스2', '드레스3',
  '수트1', '수트2', '수트3',
  '신부_부케', '신부_헤어악세', '신부_화관', '신부_베일', '신부_속옷', '신부_구두사이즈', '신부_구두수량',
  '신랑_부토니에', '신랑_보타이', '신랑_넥타이', '신랑_서스팬더', '신랑_셔츠', '신랑_구두사이즈', '신랑_구두수량',
  '기타1', '기타1금액', '기타2', '기타2금액', '비고',
  '결제합계_상품', '결제합계_생화', '결제합계_대여품',
  '결제_카드', '결제_이체', '결제_현금', '현금영수증번호', '승인번호', '발행일',
]

// service-prd.md 예약 양식 필드 순서와 일치
const HEADERS = [
  '등록일시', '예약ID', '예약상태',
  '신부성함', '신부연락처', '신랑성함', '신랑연락처',
  '의상피팅날짜', '의상피팅시간',
  '헤어메이크업날짜', '헤어메이크업시간',
  '스냅촬영날짜', '스냅촬영시간',
  '포토업체', '이용상품', '헬퍼서비스', '생화부케',
  '유입경로', '요청사항', '현금영수증번호', '담당카테고리',
]

// 예약마스터 탭을 가져오거나 없으면 새로 만든다 (기존 탭은 절대 손대지 않음)
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  // 날짜·시간 열(8~13: 의상피팅~스냅촬영)을 텍스트 형식으로 고정 —
  // "2026-07-01" 같은 문자열이 Date 로 자동 변환돼 날짜가 밀리는 것을 방지
  sheet.getRange(1, 8, sheet.getMaxRows(), 6).setNumberFormat('@')
  return sheet
}

// 대여계약서 탭을 가져오거나 없으면 새로 만든다 (기존 탭은 절대 손대지 않음)
function getContractSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(CONTRACT_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(CONTRACT_SHEET)
    sheet.appendRow(['작성일시'].concat(CONTRACT_HEADERS))
    sheet.getRange(1, 1, 1, CONTRACT_HEADERS.length + 1).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  // 작성일시(1열)만 날짜, 나머지 열은 텍스트로 고정 —
  // 금액·날짜·사이즈가 입력한 그대로 보존되도록 (자동 변환 방지)
  sheet.getRange(1, 2, sheet.getMaxRows(), CONTRACT_HEADERS.length).setNumberFormat('@')
  return sheet
}

// 설정 탭 (카테고리 이름 등 키-값) 가져오기/생성
function getSettingsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(SETTINGS_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET)
    sheet.appendRow(['카테고리ID', '표시이름'])
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

// 직원 탭 가져오기/생성 (날짜·번호가 자동 변환되지 않게 전 열 텍스트 형식)
function getStaffSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(STAFF_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(STAFF_SHEET)
    sheet.appendRow(STAFF_HEADERS)
    sheet.getRange(1, 1, 1, STAFF_HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  // 등록일시(1열)만 날짜, 나머지는 텍스트 (입사일·연락처·주민번호 보존)
  sheet.getRange(1, 2, sheet.getMaxRows(), STAFF_HEADERS.length - 1).setNumberFormat('@')
  return sheet
}

// 단일 컬럼 목록 탭(포토거래처/이용상품 등) 가져오기/생성
function getListSheet(name, header) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow([header])
    sheet.getRange(1, 1, 1, 1).setFontWeight('bold')
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, sheet.getMaxRows(), 1).setNumberFormat('@')
  }
  return sheet
}

// 목록 값 배열 읽기 (헤더 제외, 빈값·중복 제거)
function getListValues(name, header) {
  const sheet = getListSheet(name, header)
  const values = sheet.getDataRange().getValues()
  const out = []
  for (let i = 1; i < values.length; i++) {
    const v = String(values[i][0] || '').trim()
    if (v && out.indexOf(v) === -1) out.push(v)
  }
  return out
}

// 목록에 값 추가 (이미 있으면 무시) — 입력값이 목록으로 쌓여 재사용됨
function addToList(name, header, value) {
  const v = String(value || '').trim()
  if (!v) return
  const sheet = getListSheet(name, header)
  const existing = getListValues(name, header)
  if (existing.indexOf(v) === -1) sheet.appendRow([v])
}

// 직원 목록 읽기
function getStaffList() {
  const sheet = getStaffSheet()
  const values = sheet.getDataRange().getValues()
  const list = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r[2]) continue // 성명 없는 행 제외
    list.push({
      registeredAt: r[0], hireDate: r[1], name: r[2], dept: r[3], position: r[4],
      phone: r[5], rrn: r[6], address: r[7], memo: r[8], categories: r[9],
    })
  }
  return list
}

// 설정 탭에서 카테고리 이름 맵 {id: label} 읽기
function getCategories() {
  const sheet = getSettingsSheet()
  const values = sheet.getDataRange().getValues()
  const map = {}
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) map[String(values[i][0])] = String(values[i][1] || '')
  }
  return map
}

// 예약마스터 행을 예약ID로 찾아 겹치는 항목 갱신 (값이 있는 항목만)
function updateReservationRow(id, fields) {
  if (!id) return
  const sheet = getSheet()
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][1]) === String(id)) {
      Object.keys(fields).forEach(function (col) {
        const val = fields[col]
        if (val != null && val !== '') sheet.getRange(i + 1, Number(col)).setValue(val)
      })
      return
    }
  }
}

// GET: 예약마스터 탭의 모든 예약 + 카테고리 이름을 JSON으로 반환
function doGet() {
  try {
    const sheet = getSheet()
    const values = sheet.getDataRange().getValues()
    const rows = values.slice(1) // 헤더 제외
    const reservations = rows
      .filter(function (r) { return r[1] }) // 예약ID 있는 행만
      .map(function (r) {
        return {
          registeredAt: r[0], id: r[1], status: r[2],
          brideName: r[3], bridePhone: r[4], groomName: r[5], groomPhone: r[6],
          fittingDate: r[7], fittingTime: r[8],
          hairDate: r[9], hairTime: r[10],
          snapDate: r[11], snapTime: r[12],
          photoStudio: r[13], product: r[14], helperService: r[15], bouquet: r[16],
          inflow: r[17], notes: r[18], receiptNumber: r[19], category: r[20],
        }
      })
    return jsonRes({
      reservations: reservations,
      categories: getCategories(),
      staff: getStaffList(),
      lists: {
        photoVendors: getListValues(PHOTO_SHEET, '포토거래처'),
        products: getListValues(PRODUCT_SHEET, '이용상품'),
      },
    })
  } catch (err) {
    return jsonRes({ reservations: [], categories: {}, staff: [], lists: { photoVendors: [], products: [] }, error: String(err) })
  }
}

// POST: action 에 따라 예약 추가 / 상태 변경
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const sheet = getSheet()

    if (body.action === 'add') {
      const r = body.reservation || {}
      const id = r.id || ('R' + new Date().getTime())
      sheet.appendRow([
        new Date(), id, r.status || '대기',
        r.brideName || '', r.bridePhone || '', r.groomName || '', r.groomPhone || '',
        r.fittingDate || '', r.fittingTime || '',
        r.hairDate || '', r.hairTime || '',
        r.snapDate || '', r.snapTime || '',
        r.photoStudio || '', r.product || '', r.helperService || '', r.bouquet || '',
        r.inflow || '', r.notes || '', r.receiptNumber || '', r.category || '',
      ])
      // 새 포토거래처·이용상품을 목록에 자동 등록 (재사용)
      addToList(PHOTO_SHEET, '포토거래처', r.photoStudio)
      addToList(PRODUCT_SHEET, '이용상품', r.product)
      return jsonRes({ success: true, id: id })
    }

    if (body.action === 'saveContract') {
      const c = body.contract || {}
      const cSheet = getContractSheet()
      const row = [new Date()].concat(CONTRACT_KEYS.map(function (k) {
        return c[k] != null ? c[k] : ''
      }))
      cSheet.appendRow(row)
      // 예약마스터의 해당 예약 행에 겹치는 항목 동기화 (열 번호 = 예약마스터 컬럼)
      updateReservationRow(c.id, {
        5: c.bridePhone, 6: c.groomName,
        8: c.fittingDate, 9: c.fittingTime, 12: c.snapDate,
        14: c.photoStudio, 15: c.product, 16: c.helperService,
        17: c.flowerApplied === 'O' ? c.flowerShop : '', 20: c.receiptNumber,
      })
      // 계약서에서 입력/수정한 포토거래처·이용상품도 목록에 등록
      addToList(PHOTO_SHEET, '포토거래처', c.photoStudio)
      addToList(PRODUCT_SHEET, '이용상품', c.product)
      return jsonRes({ success: true, id: c.id || '' })
    }

    if (body.action === 'addStaff') {
      const s = body.staff || {}
      const stSheet = getStaffSheet()
      stSheet.appendRow([
        new Date(), s.hireDate || '', s.name || '', s.dept || '', s.position || '',
        s.phone || '', s.rrn || '', s.address || '', s.memo || '', s.categories || '',
      ])
      return jsonRes({ success: true })
    }

    if (body.action === 'saveCategories') {
      const cats = body.categories || {}
      const sSheet = getSettingsSheet()
      const last = sSheet.getLastRow()
      if (last > 1) sSheet.deleteRows(2, last - 1) // 헤더만 남기고 비움
      Object.keys(cats).forEach(function (id) {
        sSheet.appendRow([id, cats[id]])
      })
      return jsonRes({ success: true })
    }

    if (body.action === 'updateStatus') {
      const values = sheet.getDataRange().getValues()
      for (let i = 1; i < values.length; i++) {
        if (values[i][1] === body.id) {
          sheet.getRange(i + 1, 3).setValue(body.status) // 3번째 열 = 예약상태
          return jsonRes({ success: true })
        }
      }
      return jsonRes({ success: false, error: '예약ID를 찾을 수 없음' })
    }

    return jsonRes({ success: false, error: '알 수 없는 action' })
  } catch (err) {
    return jsonRes({ success: false, error: String(err) })
  }
}

function jsonRes(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
