import { NextResponse } from 'next/server';

// This endpoint is intended to be used as the "External Login" URL in MikroTik Hotspot.
// MikroTik will redirect users here with query parameters like mac, ip, link-login, link-orig, etc.
// We simply forward the user to the main web portal preserving those params so the UI can act on them.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // Build redirect to homepage preserving MikroTik params
  const forward = new URL('/', url.origin);
  for (const [k, v] of params.entries()) {
    forward.searchParams.set(k, v);
  }

  return NextResponse.redirect(forward.toString());
}
