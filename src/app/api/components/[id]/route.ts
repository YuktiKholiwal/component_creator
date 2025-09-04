import { NextResponse } from "next/server"
import { fakeDB } from "../route"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const row = fakeDB[id]

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(row)
}
