import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

const db = new Map<string, {name:string, code:string}>() // swap with real DB

export async function POST(req: Request) {
  const { name, code } = await req.json()
  const id = randomUUID()
  db.set(id, { name, code })
  return NextResponse.json({ id })
}

// (Optionally export this in-memory db for quick demo; replace with real storage.)
export { db }
