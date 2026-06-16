import { NextResponse } from "next/server";

export async function GET() {
  // Return a simple SVG placeholder
  const svg = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="500" fill="#e5e7eb"/>
    <text x="250" y="250" font-family="Arial" font-size="20" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
      No Image Available
    </text>
  </svg>`;
  
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}