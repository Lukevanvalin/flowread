import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Normalize: prepend https:// if no protocol
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalized);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FlowRead/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${res.status})` },
        { status: 422 }
      );
    }

    const html = await res.text();

    // Use JSDOM + Readability for best extraction
    const dom = new JSDOM(html, { url: parsedUrl.toString() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article?.textContent) {
      return NextResponse.json({ text: article.textContent.trim() });
    }

    // Fallback: use cheerio to get body text
    const $ = cheerio.load(html);
    $('script, style, nav, header, footer, aside').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    if (text) {
      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: 'No readable text found' }, { status: 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
