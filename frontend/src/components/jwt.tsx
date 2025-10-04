export function getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

export function base64UrlDecode(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
    return atob(base64); 
}

interface JWTHeader {
    alg: string;
    typ: string;
}

interface JWTPayload {
    [key: string]: any;
}

export function parseJWT(token: string): { header: JWTHeader, payload: JWTPayload } {
    const parts = token.split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
    }

    const header: JWTHeader = JSON.parse(base64UrlDecode(parts[0]));
    const payload: JWTPayload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload }; 
}

export function getAndParseJWT(): { header: JWTHeader; payload: JWTPayload } | null {
  const token = getCookie("token");
  if (token) {
    return parseJWT(token);
  }
  return null;
}