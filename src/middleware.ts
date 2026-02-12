import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname, searchParams } = request.nextUrl

  // 1. Protección de Rutas: Si NO hay sesión y quiere entrar a zonas privadas
  const isProtectedRoute = pathname.startsWith('/admin') || pathname === '/update-password'
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Lógica de Redirección Inteligente: Si SÍ hay sesión y está en el login
  if (user && pathname === '/login') {
    const next = searchParams.get('next')
    
    // EXCEPCIÓN CRÍTICA: Si el flujo viene de una recuperación de contraseña
    if (next === '/update-password') {
      return NextResponse.redirect(new URL('/update-password', request.url))
    }

    // Por defecto, si ya está logueado, mandarlo al dashboard
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}