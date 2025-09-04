import { NextResponse } from "next/server"
import { SYSTEM_PROMPT } from "@/lib/generator/prompt"
// Use any LLM SDK here
// Example with OpenAI (swap with your provider as needed):
import OpenAI from "openai"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const { description } = await req.json()

  const userPrompt = `
Description:
${description}

Example Component:
{
  "componentName": "AIMetricsDashboard",
  "code": "export function AIMetricsDashboard() {\n  return (\n    <div className='w-[480px] bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl p-6'>\n      {/* Header */}\n      <div className='flex items-center justify-between mb-6'>\n        <div>\n          <h2 className='text-xl font-semibold text-white'>AI Performance</h2>\n          <p className='text-sm text-zinc-400'>Real-time model metrics</p>\n        </div>\n        <div className='flex items-center gap-2'>\n          <div className='h-2 w-2 bg-emerald-400 rounded-full animate-pulse' />\n          <span className='text-xs font-mono text-emerald-400'>Live</span>\n        </div>\n      </div>\n      \n      {/* Metrics Grid */}\n      <div className='grid grid-cols-2 gap-4 mb-6'>\n        <div className='bg-zinc-900/80 border border-zinc-800 rounded-lg p-4'>\n          <div className='flex items-center justify-between mb-2'>\n            <span className='text-sm text-zinc-400'>Tokens/sec</span>\n            <div className='h-1 w-1 bg-cyan-400 rounded-full' />\n          </div>\n          <div className='text-2xl font-mono font-bold text-white'>2,847</div>\n          <div className='text-xs text-emerald-400'>+12.3%</div>\n        </div>\n        \n        <div className='bg-zinc-900/80 border border-zinc-800 rounded-lg p-4'>\n          <div className='flex items-center justify-between mb-2'>\n            <span className='text-sm text-zinc-400'>Latency</span>\n            <div className='h-1 w-1 bg-blue-400 rounded-full' />\n          </div>\n          <div className='text-2xl font-mono font-bold text-white'>43ms</div>\n          <div className='text-xs text-emerald-400'>-8.1%</div>\n        </div>\n        \n        <div className='bg-zinc-900/80 border border-zinc-800 rounded-lg p-4'>\n          <div className='flex items-center justify-between mb-2'>\n            <span className='text-sm text-zinc-400'>Accuracy</span>\n            <div className='h-1 w-1 bg-purple-400 rounded-full' />\n          </div>\n          <div className='text-2xl font-mono font-bold text-white'>94.2%</div>\n          <div className='text-xs text-emerald-400'>+1.5%</div>\n        </div>\n        \n        <div className='bg-zinc-900/80 border border-zinc-800 rounded-lg p-4'>\n          <div className='flex items-center justify-between mb-2'>\n            <span className='text-sm text-zinc-400'>Cost</span>\n            <div className='h-1 w-1 bg-orange-400 rounded-full' />\n          </div>\n          <div className='text-2xl font-mono font-bold text-white'>$0.34</div>\n          <div className='text-xs text-red-400'>+2.8%</div>\n        </div>\n      </div>\n      \n      {/* Status Section */}\n      <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-4'>\n        <div className='flex items-center justify-between mb-3'>\n          <span className='text-sm font-medium text-white'>Model Status</span>\n          <span className='text-xs font-mono text-zinc-400'>Updated 2s ago</span>\n        </div>\n        \n        <div className='space-y-2'>\n          <div className='flex items-center justify-between'>\n            <div className='flex items-center gap-2'>\n              <div className='h-2 w-2 bg-emerald-400 rounded-full' />\n              <span className='text-sm text-zinc-300'>GPT-4 Turbo</span>\n            </div>\n            <span className='text-xs font-mono text-zinc-400'>99.9%</span>\n          </div>\n          \n          <div className='flex items-center justify-between'>\n            <div className='flex items-center gap-2'>\n              <div className='h-2 w-2 bg-yellow-400 rounded-full' />\n              <span className='text-sm text-zinc-300'>Claude-3 Opus</span>\n            </div>\n            <span className='text-xs font-mono text-zinc-400'>87.3%</span>\n          </div>\n          \n          <div className='flex items-center justify-between'>\n            <div className='flex items-center gap-2'>\n              <div className='h-2 w-2 bg-emerald-400 rounded-full' />\n              <span className='text-sm text-zinc-300'>Gemini Pro</span>\n            </div>\n            <span className='text-xs font-mono text-zinc-400'>98.1%</span>\n          </div>\n        </div>\n      </div>\n      \n      {/* Action Buttons */}\n      <div className='flex gap-3'>\n        <button className='flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200'>\n          View Details\n        </button>\n        <button className='bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200'>\n          Export Data\n        </button>\n      </div>\n    </div>\n  )\n}"
}

Now generate a similar component for the description above.
`

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", // or your chosen model
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
  })

  const content = res.choices[0]?.message?.content || "{}"
  let payload
  try { payload = JSON.parse(content) } catch { payload = { error: "Bad JSON" } }

  // tiny guardrail to ensure a safe-ish file name
  payload.componentName = (payload.componentName || "GeneratedComponent")
    .replace(/[^A-Za-z0-9]/g, "")

    if (payload.code) {
        // force named exports
        payload.code = payload.code
          .replace(/export default function\s+([A-Za-z0-9_]+)/, "export function $1")
        
        // ensure no problematic imports
        payload.code = payload.code
          .replace(/import.*from.*['"]lucide-react['"];?\n?/g, "")
          .replace(/import.*from.*['"]@\/components\/ui\/(?!button|input|label|card|badge).*['"];?\n?/g, "")
      }
      

  return NextResponse.json(payload)
}
