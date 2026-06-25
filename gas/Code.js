// 웨딩예약 시스템 ↔ Google Sheets 연동
// 기존 원본 시트(1narswOt...)는 건드리지 않고, 별도 탭 "예약마스터"에만 기록한다.

const SPREADSHEET_ID = '1narswOt-LTZ6TGvRJcucGrql7HB5GGEU5tHEDg5j50I'
const SHEET_NAME = '예약마스터'
const CONTRACT_SHEET = '대여계약서'
const SETTINGS_SHEET = '설정'
const STAFF_SHEET = '직원'
const PHOTO_SHEET = '포토거래처'
const PRODUCT_SHEET = '이용상품'
const EXPENSE_SHEET = '지출'

const EXPENSE_HEADERS = ['등록일시', '지출일', '계정', '항목', '금액', '결제수단', '메모']

const STAFF_HEADERS = [
  '등록일시', '입사일', '성명', '부서', '직급', '연락처',
  '주민번호', '주소', '기타메모', '카테고리권한', '직원번호', '비밀번호',
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
  'photos', 'raw',
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
  '첨부사진', '데이터',
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

// 설정 탭 (카테고리 목록) 가져오기/생성 — id / 표시이름 / 색상
function getSettingsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(SETTINGS_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET)
    sheet.setFrozenRows(1)
  }
  sheet.getRange(1, 1, 1, 3).setValues([['카테고리ID', '표시이름', '색상']]).setFontWeight('bold')
  sheet.getRange(1, 1, sheet.getMaxRows(), 3).setNumberFormat('@')
  return sheet
}

// 직원 탭 가져오기/생성 (날짜·번호가 자동 변환되지 않게 전 열 텍스트 형식)
function getStaffSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(STAFF_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(STAFF_SHEET)
    sheet.setFrozenRows(1)
  }
  // 헤더를 항상 최신 STAFF_HEADERS 로 맞춤 (직원번호·비밀번호 컬럼 추가 반영)
  sheet.getRange(1, 1, 1, STAFF_HEADERS.length).setValues([STAFF_HEADERS]).setFontWeight('bold')
  // 등록일시(1열)만 날짜, 나머지는 텍스트 (입사일·연락처·주민번호·직원번호 보존)
  sheet.getRange(1, 2, sheet.getMaxRows(), STAFF_HEADERS.length - 1).setNumberFormat('@')
  return sheet
}

// 6자리 직원번호 생성 (기존 최대값 + 1, 시작 1001)
function nextStaffNo(sheet) {
  const values = sheet.getDataRange().getValues()
  let max = 1000
  for (let i = 1; i < values.length; i++) {
    const n = parseInt(values[i][10], 10) // 11열 = 직원번호
    if (!isNaN(n) && n > max) max = n
  }
  return String(max + 1)
}

// 읽기 쉬운 6자리 비밀번호 생성 (혼동되는 0/O/1/l 제외)
function genPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
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
      staffNo: r[10], password: r[11],
    })
  }
  return list
}

// ── 회계 ──────────────────────────────────────────────
// 금액 문자열("1,500,000")을 숫자로 파싱
function parseAmt(v) {
  const n = Number(String(v == null ? '' : v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

// 지출 탭 가져오기/생성
function getExpenseSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(EXPENSE_SHEET)
  if (!sheet) {
    sheet = ss.insertSheet(EXPENSE_SHEET)
    sheet.appendRow(EXPENSE_HEADERS)
    sheet.getRange(1, 1, 1, EXPENSE_HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  // 등록일시(1열)만 날짜, 나머지는 텍스트 (지출일·금액 보존)
  sheet.getRange(1, 2, sheet.getMaxRows(), EXPENSE_HEADERS.length - 1).setNumberFormat('@')
  return sheet
}

// 지출 내역 읽기
function getExpenses() {
  const sheet = getExpenseSheet()
  const values = sheet.getDataRange().getValues()
  const out = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r[2] && !r[4]) continue // 계정·금액 둘 다 없으면 제외
    out.push({
      registeredAt: r[0], date: r[1], account: r[2], item: r[3],
      amount: parseAmt(r[4]), method: r[5], memo: r[6],
    })
  }
  return out
}

// 예약ID로 저장된 계약서(가장 최근) 불러오기 — 없으면 null
function getContractById(id) {
  if (!id) return null
  const sheet = getContractSheet()
  const values = sheet.getDataRange().getValues()
  let found = null
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][1]) === String(id)) { // 2열 = 예약ID
      const obj = { savedAt: values[i][0] }
      CONTRACT_KEYS.forEach(function (k, idx) { obj[k] = values[i][idx + 1] })
      found = obj // 마지막(최근) 행 유지
    }
  }
  return found
}

// 대여계약서에서 계약 수입 집계 (결제합계 상품+생화+대여품, 없으면 상품금액)
function getIncomeList() {
  const sheet = getContractSheet()
  const values = sheet.getDataRange().getValues()
  const iName = CONTRACT_KEYS.indexOf('brideName') + 1
  const iProduct = CONTRACT_KEYS.indexOf('totalProduct') + 1
  const iFlower = CONTRACT_KEYS.indexOf('totalFlower') + 1
  const iRental = CONTRACT_KEYS.indexOf('totalRental') + 1
  const iProductAmt = CONTRACT_KEYS.indexOf('productAmount') + 1
  const out = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r[1]) continue // 예약ID 없으면 제외
    let amt = parseAmt(r[iProduct]) + parseAmt(r[iFlower]) + parseAmt(r[iRental])
    if (amt === 0) amt = parseAmt(r[iProductAmt])
    out.push({ date: r[0], name: r[iName], amount: amt })
  }
  return out
}

// ── 당일 일정 카카오 알림톡 ──────────────────────────────
// 예약마스터를 객체 배열로 읽기
function getReservations() {
  const values = getSheet().getDataRange().getValues()
  const out = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r[1]) continue
    out.push({
      id: r[1], brideName: r[3], bridePhone: r[4],
      fittingDate: r[7], fittingTime: r[8], hairDate: r[9], hairTime: r[10],
      snapDate: r[11], snapTime: r[12], product: r[14], category: r[20],
    })
  }
  return out
}

// 특정 날짜(yyyy-MM-dd)의 담당 스타일리스트별 일정 묶음
// 반환: [{ staffNo, name, phone, items:[{bride, time, category, product}] }]
function getScheduleFor(dateStr) {
  const resvs = getReservations()
  const staffList = getStaffList()
  const byStaff = {}
  resvs.forEach(function (r) {
    const cats = String(r.category || '').split(', ').filter(Boolean)
    cats.forEach(function (cat) {
      const date = cat === '헤어메이크업팀' ? r.hairDate : r.fittingDate
      if (String(date) !== String(dateStr)) return
      const time = cat === '헤어메이크업팀' ? r.hairTime : r.fittingTime
      staffList.forEach(function (s) {
        const perms = String(s.categories || '').split(', ').filter(Boolean)
        if (perms.indexOf(cat) === -1) return
        const key = s.staffNo || s.name
        if (!byStaff[key]) byStaff[key] = { staffNo: s.staffNo, name: s.name, phone: s.phone, items: [] }
        byStaff[key].items.push({ bride: r.brideName, time: time, category: cat, product: r.product })
      })
    })
  })
  return Object.keys(byStaff).map(function (k) { return byStaff[k] })
}

// 알림톡 메시지 본문 (승인 템플릿과 내용이 일치해야 함)
function composeMessage(name, items) {
  const lines = items.map(function (it) {
    return '· ' + (it.time || '시간미정') + '  ' + (it.bride || '') + ' (' + it.category + ')'
  })
  return '[오드리테일러] ' + name + '님, 오늘 일정 안내드립니다.\n\n' + lines.join('\n') + '\n\n확인 부탁드립니다.'
}

// 알리고 알림톡 발송 (Script Properties 에 키 설정 필요)
function sendAlimTalk_(phone, message) {
  const p = PropertiesService.getScriptProperties()
  const apikey = p.getProperty('ALIGO_APIKEY')
  const userid = p.getProperty('ALIGO_USERID')
  const senderkey = p.getProperty('ALIGO_SENDERKEY')
  const tplcode = p.getProperty('ALIGO_TPLCODE')
  const sender = p.getProperty('ALIGO_SENDER')
  if (!apikey || !userid || !senderkey || !tplcode || !sender) {
    return { configured: false }
  }
  const res = UrlFetchApp.fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
    method: 'post',
    payload: {
      apikey: apikey, userid: userid, senderkey: senderkey, tpl_code: tplcode,
      sender: sender, receiver_1: String(phone).replace(/[^0-9]/g, ''),
      subject_1: '오늘 일정 안내', message_1: message,
    },
    muteHttpExceptions: true,
  })
  return { configured: true, response: res.getContentText() }
}

// 매일 자동 실행 — 오늘 일정 알림톡 발송 (트리거가 호출)
function dailyScheduleNotify() {
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd')
  const schedule = getScheduleFor(today)
  schedule.forEach(function (s) {
    if (!s.phone) return
    const msg = composeMessage(s.name, s.items)
    const r = sendAlimTalk_(s.phone, msg)
    Logger.log('알림 ' + s.name + '(' + s.phone + '): ' + JSON.stringify(r))
  })
  return schedule.length
}

// 매일 오전 8시 자동 실행 트리거 설치 (편집기에서 1회 실행)
function installDailyTrigger() {
  uninstallDailyTrigger()
  ScriptApp.newTrigger('dailyScheduleNotify').timeBased().everyDays(1).atHour(8).inTimezone('Asia/Seoul').create()
  return '매일 오전 8시 알림 트리거 설치됨'
}
function uninstallDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dailyScheduleNotify') ScriptApp.deleteTrigger(t)
  })
  return '기존 트리거 제거됨'
}

// 직원번호+비밀번호로 로그인 검증
function loginStaff(staffNo, password) {
  const sheet = getStaffSheet()
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (String(r[10]) === String(staffNo) && String(r[11]) === String(password)) {
      return { success: true, name: r[2], dept: r[3], position: r[4], staffNo: String(r[10]), categories: r[9] }
    }
  }
  return { success: false, error: '직원번호 또는 비밀번호가 올바르지 않습니다.' }
}

// 설정 탭에서 카테고리 목록 읽기 [{id, label, color}] (비어있으면 빈 배열 → 앱이 기본값 사용)
function getCategories() {
  const sheet = getSettingsSheet()
  const values = sheet.getDataRange().getValues()
  const list = []
  for (let i = 1; i < values.length; i++) {
    const id = String(values[i][0] || '').trim()
    if (id) list.push({ id: id, label: String(values[i][1] || ''), color: String(values[i][2] || '#64748b') })
  }
  return list
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
      const staffNo = nextStaffNo(stSheet)   // 직원번호 자동 생성
      const password = genPassword()          // 비밀번호 자동 생성
      stSheet.appendRow([
        new Date(), s.hireDate || '', s.name || '', s.dept || '', s.position || '',
        s.phone || '', s.rrn || '', s.address || '', s.memo || '', s.categories || '',
        staffNo, password,
      ])
      return jsonRes({ success: true, staffNo: staffNo, password: password })
    }

    if (body.action === 'login') {
      return jsonRes(loginStaff(body.staffNo, body.password))
    }

    if (body.action === 'updateStaffCategories') {
      const stSheet = getStaffSheet()
      const values = stSheet.getDataRange().getValues()
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][10]) === String(body.staffNo)) { // 11열 = 직원번호
          stSheet.getRange(i + 1, 10).setValue(body.categories || '') // 10열 = 카테고리권한
          return jsonRes({ success: true })
        }
      }
      return jsonRes({ success: false, error: '직원을 찾을 수 없습니다.' })
    }

    if (body.action === 'addExpense') {
      const x = body.expense || {}
      getExpenseSheet().appendRow([
        new Date(), x.date || '', x.account || '', x.item || '',
        x.amount || '', x.method || '', x.memo || '',
      ])
      return jsonRes({ success: true })
    }

    if (body.action === 'getAccounting') {
      return jsonRes({ income: getIncomeList(), expenses: getExpenses() })
    }

    if (body.action === 'getContract') {
      return jsonRes({ contract: getContractById(body.id) })
    }

    if (body.action === 'previewSchedule') {
      const date = body.date || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd')
      const schedule = getScheduleFor(date).map(function (s) {
        return { name: s.name, phone: s.phone, items: s.items, message: composeMessage(s.name, s.items) }
      })
      const p = PropertiesService.getScriptProperties()
      const ready = !!(p.getProperty('ALIGO_APIKEY') && p.getProperty('ALIGO_SENDERKEY') && p.getProperty('ALIGO_TPLCODE'))
      return jsonRes({ date: date, schedule: schedule, alimtalkReady: ready })
    }

    if (body.action === 'saveCategories') {
      // body.categories = [{id, label, color}, ...] (전체 목록 덮어쓰기)
      const cats = body.categories || []
      const sSheet = getSettingsSheet()
      const last = sSheet.getLastRow()
      if (last > 1) sSheet.deleteRows(2, last - 1) // 헤더만 남기고 비움
      cats.forEach(function (c) {
        if (c && c.id) sSheet.appendRow([c.id, c.label || '', c.color || '#64748b'])
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
