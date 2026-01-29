export async function GET() {
  console.log("[v0] Diagnostic check")
  
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✓ Set" : "✗ Missing",
    STEAM_API_KEY: process.env.STEAM_API_KEY ? "✓ Set" : "✗ Missing",
    DB_HOST: process.env.DB_HOST ? "✓ Set" : "✗ Missing",
    DB_USER: process.env.DB_USER ? "✓ Set" : "✗ Missing",
    DB_NAME: process.env.DB_NAME ? "✓ Set" : "✗ Missing",
    NODE_ENV: process.env.NODE_ENV,
  }

  console.log("[v0] Env check:", env)

  return Response.json({
    status: "ok",
    environment: env,
  })
}
