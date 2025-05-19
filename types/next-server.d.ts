// Type definitions for Next.js server components
declare module 'next/server' {
  export class NextRequest extends Request {
    constructor(input: RequestInfo, init?: RequestInit);
    
    readonly cookies: {
      get: (name: string) => { name: string; value: string } | undefined;
      getAll: () => Array<{ name: string; value: string }>;
      set: (name: string, value: string, options?: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) => void;
      delete: (name: string) => void;
      has: (name: string) => boolean;
      clear: () => void;
    };
    
    readonly geo: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    
    readonly ip?: string;
    readonly nextUrl: URL;
    readonly url: string;
  }
  
  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    
    readonly cookies: {
      get: (name: string) => { name: string; value: string } | undefined;
      getAll: () => Array<{ name: string; value: string }>;
      set: (name: string, value: string, options?: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) => NextResponse;
      delete: (name: string) => NextResponse;
    };
    
    static json<T = any>(body: T, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}
