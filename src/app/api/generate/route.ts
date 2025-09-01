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
  "componentName": "AuthForm",
  "code": "import { Button } from '@/components/ui/button'\nimport { Input } from '@/components/ui/input'\nimport { Label } from '@/components/ui/label'\nimport { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'\n\nexport function AuthForm() {\n  return (\n    <Card className='w-[400px] bg-card border-border/50 shadow-2xl backdrop-blur-sm'>\n      <CardHeader className='text-center'>\n        <CardTitle className='text-2xl font-bold text-foreground'>Welcome Back</CardTitle>\n        <CardDescription className='text-muted-foreground'>\n          Sign in to your account to continue\n        </CardDescription>\n      </CardHeader>\n      <CardContent className='space-y-4'>\n        <div className='space-y-2'>\n          <Label htmlFor='email' className='text-foreground'>Email</Label>\n          <Input \n            id='email' \n            type='email' \n            placeholder='Enter your email'\n            className='bg-background border-border/50 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'\n          />\n        </div>\n        <div className='space-y-2'>\n          <Label htmlFor='password' className='text-foreground'>Password</Label>\n          <Input \n            id='password' \n            type='password' \n            placeholder='Enter your password'\n            className='bg-background border-border/50 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20'\n          />\n        </div>\n        <div className='flex items-center justify-between text-sm'>\n          <label className='flex items-center gap-2 cursor-pointer'>\n            <input type='checkbox' className='rounded border-border bg-background' />\n            <span className='text-muted-foreground'>Remember me</span>\n          </label>\n          <button className='text-primary hover:text-primary/80 transition-colors'>\n            Forgot password?\n          </button>\n        </div>\n      </CardContent>\n      <CardFooter className='flex flex-col space-y-3'>\n        <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-200'>\n          Sign In\n        </Button>\n        <div className='text-center text-sm text-muted-foreground'>\n          Don't have an account?{' '}\n          <button className='text-primary hover:text-primary/80 transition-colors font-medium'>\n            Sign up\n          </button>\n        </div>\n      </CardFooter>\n    </Card>\n  )\n}"
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
