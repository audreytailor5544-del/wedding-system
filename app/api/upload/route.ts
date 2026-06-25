import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

// 계약서 첨부 사진을 Vercel Blob 에 업로드하고 공개 URL 반환
export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB 미설정' }, { status: 500 })
  }
  if (!req.body) {
    return NextResponse.json({ error: '파일 없음' }, { status: 400 })
  }
  try {
    const filename = req.nextUrl.searchParams.get('filename') || 'photo.png'
    const data = await req.arrayBuffer()
    const blob = await put(`contracts/${filename}`, Buffer.from(data), {
      access: 'public',
      addRandomSuffix: true,
      contentType: req.headers.get('content-type') || 'image/png',
    })
    return NextResponse.json({ url: blob.url })
  } catch (e) {
    return NextResponse.json({ error: '업로드 실패: ' + String(e) }, { status: 500 })
  }
}
