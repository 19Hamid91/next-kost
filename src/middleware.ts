export { default } from "next-auth/middleware";

export const config = { matcher: ["/dashboard/:path*", "/management/:path*", "/api/data/:path*"] };
