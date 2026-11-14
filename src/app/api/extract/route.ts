import { NextResponse } from 'next/server';
import path from 'path';
import { pathToFileURL } from 'url';
import { jsonError, rateLimitGuard, readBodyLimited } from '@/lib/api/http';
import {
    EXTRACT_TIME_BUDGET_MS,
    MAX_PDF_PAGES,
    MAX_STUDY_TEXT_CHARS,
    MAX_UPLOAD_BYTES,
    MULTIPART_OVERHEAD_BYTES,
} from '@/lib/api/limits';
import { devLog } from '@/lib/logger';

// 1. Engineering Standard: Use the ESM build for Turbopack compatibility
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * ARCHITECTURE FIX: The "File-Scheme" Shield
 * Node.js ESM loader restricts dynamic imports. 
 * We resolve the absolute path to the worker to prevent extraction crashes.
 */
if (typeof window === 'undefined') {
    const workerPath = path.join(process.cwd(), 'public', 'pdf.worker.min.mjs');
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
}

/**
 * TEXT LAYOUT NORMALIZATION
 * Cleans raw extracted PDF text for downstream processing:
 * - De-hyphenates line-break word splits
 * - Strips common header/footer patterns
 * - Standardizes bullet markers
 * - Collapses multi-column whitespace artifacts
 * - Collapses excessive blank lines
 */
function normalizeExtractedText(text: string): string {
    // De-hyphenate line-break splits: e.g. "hyphen-\nated" → "hyphenated"
    text = text.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

    // Strip common header/footer patterns (page numbers, download banners, URLs)
    text = text.replace(/^(Page \d+( of \d+)?|Downloaded by.*|www\..+\.com.*)$/gmi, '');

    // Standardize bullet markers to a uniform "• " prefix
    text = text.replace(/^[ \t]*[•●○*▪]\s*/gm, '• ');

    // Collapse 3+ consecutive spaces/tabs to a newline (handles multi-column layouts)
    text = text.replace(/[ \t]{3,}/g, '\n');

    // Collapse 3+ consecutive blank lines down to two newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Trim leading/trailing whitespace
    return text.trim();
}

/**
 * PDFs start with "%PDF-" (the spec allows up to 1024 bytes of leading junk).
 * We trust these magic bytes, not the browser-supplied MIME type or filename.
 */
function looksLikePdf(bytes: Uint8Array): boolean {
    const head = Buffer.from(bytes.subarray(0, 1024)).toString('latin1');
    return head.includes('%PDF-');
}

function looksLikeZip(bytes: Uint8Array): boolean {
    // PPTX/DOCX/XLSX are ZIP containers ("PK").
    return bytes.length > 1 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export async function POST(req: Request) {
    const limited = rateLimitGuard(req, 'extract');
    if (limited) return limited;

    try {
        // 1. Read the body with a hard size cap (never buffers more than the limit).
        const raw = await readBodyLimited(req, MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES);
        if (raw === null) {
            return jsonError('PAYLOAD_TOO_LARGE', 'Intel too dense. Max 20MB limit exceeded.', 413);
        }

        // 2. Parse multipart form data from the buffered bytes.
        let file: FormDataEntryValue | null;
        try {
            const formData = await new Response(new Uint8Array(raw), {
                headers: { 'content-type': req.headers.get('content-type') ?? '' },
            }).formData();
            file = formData.get('file');
        } catch {
            return jsonError('INVALID_INPUT', 'Upload could not be read. Please try again.', 400);
        }

        if (!file || typeof file === 'string') {
            return jsonError('INVALID_INPUT', 'No intel file provided. Operation aborted.', 400);
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return jsonError('PAYLOAD_TOO_LARGE', 'Intel too dense. Max 20MB limit exceeded.', 413);
        }

        // 3. Validate the actual file contents, not the declared type.
        const buffer = new Uint8Array(await file.arrayBuffer());

        if (!looksLikePdf(buffer)) {
            const message = looksLikeZip(buffer)
                ? 'PowerPoint (PPTX) files are not supported yet. Please export your slides to PDF and upload that.'
                : 'Incompatible Intel. Please upload a valid PDF file.';
            return jsonError('INVALID_FILE', message, 400);
        }

        // 4. Extraction Logic: Server-Side Parsing
        const loadingTask = pdfjs.getDocument({
            data: buffer,
            disableWorker: true, // Forces extraction on the main server thread for stability
            useSystemFonts: true,
            isEvalSupported: false,
            verbosity: 0
        } as any);

        const pdf = await loadingTask.promise;

        try {
            let extractedText = "";
            let truncated = pdf.numPages > MAX_PDF_PAGES;
            const pagesToRead = Math.min(pdf.numPages, MAX_PDF_PAGES);
            const startedAt = Date.now();

            // Iterate through pages, stopping early if the text, page, or time budget is exhausted
            for (let i = 1; i <= pagesToRead; i++) {
                if (extractedText.length >= MAX_STUDY_TEXT_CHARS || Date.now() - startedAt > EXTRACT_TIME_BUDGET_MS) {
                    truncated = true;
                    break;
                }

                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                const pageText = textContent.items
                    .map((item) => ('str' in item ? item.str : ''))
                    .join(" ");

                extractedText += pageText + "\n";
            }

            devLog(`\n--- [SCANNER SUCCESS: ${pdf.numPages} PAGES, ${extractedText.length} CHARS${truncated ? ', TRUNCATED' : ''}] ---`);

            // Normalize the raw extracted text, then enforce the hard character cap
            extractedText = normalizeExtractedText(extractedText);
            if (extractedText.length > MAX_STUDY_TEXT_CHARS) {
                extractedText = extractedText.slice(0, MAX_STUDY_TEXT_CHARS);
                truncated = true;
            }

            // 5. Content Validation
            if (!extractedText || extractedText.trim().length < 50) {
                return jsonError(
                    'INVALID_FILE',
                    'This PDF appears to be a scanned image with no selectable text. Please upload a text-based PDF or a typed document.',
                    400
                );
            }

            // 6. Response: Return raw text to be cached in the Store's pendingExtractedText
            return NextResponse.json({
                extractedText,
                pageCount: pdf.numPages,
                truncated,
            });
        } finally {
            await pdf.destroy();
        }
    } catch (error) {
        const name = (error as { name?: string } | null)?.name;

        if (name === 'PasswordException') {
            return jsonError('INVALID_FILE', 'This PDF is password-protected. Please remove the password and try again.', 400);
        }
        if (name === 'InvalidPDFException' || name === 'FormatError') {
            return jsonError('INVALID_FILE', 'This PDF appears to be corrupted or invalid.', 400);
        }

        console.error('SCANNER_CRASH_DETAILS:', error);
        return jsonError('EXTRACTION_FAILED', 'The intel extraction system encountered a critical failure.', 500);
    }
}
