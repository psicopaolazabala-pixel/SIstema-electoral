// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const esRutaAdmin = url.pathname.startsWith('/admin');
  const esRutaLogin = url.pathname === '/admin/login';

  // Si intenta acceder a cualquier ruta /admin (excepto el login) y no hay usuario, enviar a login
  if (esRutaAdmin && !esRutaLogin && !user) {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Si ya está logueado e intenta volver a /admin/login, redirigirlo a resultados
  if (esRutaLogin && user) {
    url.pathname = '/admin/resultados';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};