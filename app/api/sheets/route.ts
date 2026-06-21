import { NextRequest, NextResponse } from 'next/server'

// .env.local 에 GAS_URL=https://script.google.com/... 형식으로 추가
const GAS_URL = process.env.GAS_URL

export async function GET() {
  if (!GAS_URL) {
    return NextResponse.json({ reservations: [] })
  }
  try {
    const res = await fetch(`${GAS_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ reservations: [], error: '시트 연결 실패' })
  }
}

export async function POST(req: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json({ success: false, error: 'GAS_URL 미설정' })
  }
  try {
    const body = await req.json()
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: false, error: '시트 저장 실패' })
  }
}
