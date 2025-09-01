import { NextResponse } from "next/server"
import { db } from "../route" // replace with real DB lookup

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const row = db.get(params.id)
  if (!row) return new NextResponse("Not found", { status: 404 })
  return NextResponse.json(row)
}
