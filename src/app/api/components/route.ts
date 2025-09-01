import { NextResponse } from "next/server"

export const fakeDB: Record<string, { name: string; code: string }> = {}

export async function POST(req: Request) {
  const { name, code } = await req.json()
  const id = crypto.randomUUID()
  fakeDB[id] = { name, code }
  return NextResponse.json({ id })
}
