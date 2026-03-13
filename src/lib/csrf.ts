import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32;

function generateToken(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a CSRF token and set it as an httpOnly=false cookie
 * so that client-side JavaScript can read it and send it back as a header.
 */
export function setCsrfCookie(response: NextResponse, token?: string): string {
  const csrfToken = token || generateToken(TOKEN_LENGTH);
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false, // Client JS must be able to read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return csrfToken;
}

/**
 * Validate CSRF token: the header must match the cookie.
 * Returns true if valid, false if not.
 */
export function validateCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) return false;

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return result === 0;
}

export { CSRF_COOKIE, CSRF_HEADER };
