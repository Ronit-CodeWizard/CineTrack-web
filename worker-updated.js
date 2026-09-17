/**
 * CineTrack Cloudflare Worker
 *
 * Supabase Auth proxy + TMDB proxy.
 * Secrets stay in Cloudflare Worker environment variables.
 */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, X-Client-Info",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const incomingUrl = new URL(request.url);
    const pathname = incomingUrl.pathname;

    // Supabase Auth proxy.
    // This also covers:
    // POST /supabase/auth/v1/recover
    // GET/PUT/PATCH /supabase/auth/v1/user
    // POST /supabase/auth/v1/signup
    // POST /supabase/auth/v1/token
    // POST /supabase/auth/v1/logout
    if (pathname.startsWith("/supabase/")) {
      const supabaseBase = (env.SUPABASE_URL || "").trim().replace(/\/$/, "");

      if (!supabaseBase) {
        return new Response(
          JSON.stringify({ error: "SUPABASE_URL is missing." }),
          {
            status: 500,
            headers: { ...corsHeaders(), "Content-Type": "application/json" },
          }
        );
      }

      const pathSuffix = pathname.replace(/^\/supabase\/?/, "");
      const targetUrl = new URL(`${supabaseBase}/${pathSuffix}${incomingUrl.search}`);

      const headers = new Headers();
      headers.set(
        "Content-Type",
        request.headers.get("Content-Type") || "application/json"
      );
      headers.set(
        "Accept",
        request.headers.get("Accept") || "application/json"
      );

      // Only the publishable key is exposed to upstream Auth requests.
      // NEVER send SUPABASE_SECRET_KEY to the browser.
      const key = env.SUPABASE_PUBLISHABLE_KEY || "";

      if (key) {
        headers.set("apikey", key);
      }

      const incomingAuth = request.headers.get("Authorization");

      if (incomingAuth) {
        headers.set("Authorization", incomingAuth);
      } else if (key) {
        headers.set("Authorization", `Bearer ${key}`);
      }

      try {
        const upstream = await fetch(targetUrl.toString(), {
          method: request.method,
          headers,
          body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : request.body,
        });

        const responseHeaders = new Headers(upstream.headers);

        for (const [k, v] of Object.entries(corsHeaders())) {
          responseHeaders.set(k, v);
        }

        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: `Failed to proxy to Supabase: ${err.message}`,
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders(),
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // TMDB proxy.
    if (pathname.startsWith("/3/") || pathname.startsWith("/4/")) {
      if (!env.TMDB_READ_ACCESS_TOKEN) {
        return new Response(
          "TMDB_READ_ACCESS_TOKEN secret is not configured",
          { status: 500, headers: corsHeaders() }
        );
      }

      const tmdbUrl = new URL(`https://api.themoviedb.org${pathname}`);

      incomingUrl.searchParams.forEach((value, key) => {
        if (key.toLowerCase() !== "api_key") {
          tmdbUrl.searchParams.set(key, value);
        }
      });

      const headers = new Headers(request.headers);
      headers.delete("host");

      const incomingAuthorization = request.headers.get("Authorization");
      headers.set(
        "Authorization",
        incomingAuthorization || `Bearer ${env.TMDB_READ_ACCESS_TOKEN}`
      );
      headers.set("Accept", "application/json");

      try {
        const upstream = await fetch(tmdbUrl.toString(), {
          method: request.method,
          headers,
          body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : request.body,
        });

        const responseHeaders = new Headers(upstream.headers);

        for (const [k, v] of Object.entries(corsHeaders())) {
          responseHeaders.set(k, v);
        }

        responseHeaders.set(
          "Cache-Control",
          request.method === "GET"
            ? "public, max-age=300"
            : "no-store"
        );

        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: `Failed to proxy to TMDB: ${err.message}`,
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders(),
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        service: "Cinetrack API & Supabase Auth Proxy",
        status: "active",
        routes: [
          "/3/* (TMDB v3 API)",
          "/4/* (TMDB v4 API)",
          "/supabase/auth/v1/recover",
          "/supabase/auth/v1/signup",
          "/supabase/auth/v1/token",
          "/supabase/auth/v1/user",
          "/supabase/auth/v1/logout"
        ]
      }, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders(),
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  },
};
