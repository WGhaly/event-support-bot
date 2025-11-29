import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Missing registrationId parameter' },
        { status: 400 }
      )
    }

    // Generate the attendance URL that the QR code will point to
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const attendanceUrl = `${baseUrl}/attendance/${registrationId}`

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(attendanceUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
    })

    // Return the QR code image
    return new NextResponse(qrCodeBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('[QR Code API] Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
