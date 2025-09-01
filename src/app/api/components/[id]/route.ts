import { NextResponse } from "next/server"
import { db } from "../route" // replace with real DB lookup

export async function GET(_: Request, { params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  const row = db.get(id)
  if (!row) return new NextResponse("Not found", { status: 404 })
  return NextResponse.json(row)
}
