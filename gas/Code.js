// 웨딩예약 시스템 ↔ Google Sheets 연동
// 기존 원본 시트(1narswOt...)는 건드리지 않고, 별도 탭 "예약마스터"에만 기록한다.

const SPREADSHEET_ID = '1narswOt-LTZ6TGvRJcucGrql7HB5GGEU5tHEDg5j50I'
const SHEET_NAME = '예약마스터'
const CONTRACT_SHEET = '대여계약서'

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

// GET: 예약마스터 탭의 모든 예약을 JSON으로 반환
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
    return jsonRes({ reservations: reservations })
  } catch (err) {
    return jsonRes({ reservations: [], error: String(err) })
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
      return jsonRes({ success: true, id: id })
    }

    if (body.action === 'saveContract') {
      const c = body.contract || {}
      const cSheet = getContractSheet()
      const row = [new Date()].concat(CONTRACT_KEYS.map(function (k) {
        return c[k] != null ? c[k] : ''
      }))
      cSheet.appendRow(row)
      return jsonRes({ success: true, id: c.id || '' })
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
