import { NextResponse } from 'next/server';
import path from 'path';
import { pathToFileURL } from 'url';

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
 * FEATURE: Tactical Payload Capacity
 * Protocol: 20MB threshold for dense academic PDFs and PPTX conversions.
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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

export async function POST(req: Request) {
    try {
        // 🎯 LOGIC: We use formData here because the FileUpload sends a physical file.
        const formData = await req.formData();
        const file = formData.get('file') as File;

        // 1. Boundary Checks: Architecture is kindness to my future self
        if (!file) {
            return NextResponse.json(
                { error: 'No intel file provided. Operation aborted.' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Intel too dense. Max 20MB limit exceeded.` },
                { status: 400 }
            );
        }

        // 2. Data Access: Prepare Buffer for PDF.js
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);

        // 3. Extraction Logic: Server-Side Parsing
        const loadingTask = pdfjs.getDocument({
            data: buffer,
            disableWorker: true, // Forces extraction on the main server thread for stability
            useSystemFonts: true,
            isEvalSupported: false,
            verbosity: 0
        } as any);

        const pdf = await loadingTask.promise;
        let extractedText = "";

        // Iterate through all pages to capture total intel
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item: any) => (item as any).str)
                .join(" ");

            extractedText += pageText + "\n";
        }

        // 🔍 Console Log: ReviewQuest Engine Status
        console.log(`\n--- [SCANNER SUCCESS: ${pdf.numPages} PAGES EXTRACTED] ---`);

        // Normalize the raw extracted text before validation
        extractedText = normalizeExtractedText(extractedText);

        // 4. Content Validation
        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'This PDF appears to be a scanned image with no selectable text. Please upload a text-based PDF or a typed document.' },
                { status: 400 }
            );
        }

        // 5. Response: Return raw text to be cached in the Store's pendingExtractedText
        return NextResponse.json({
            extractedText,
            pageCount: pdf.numPages
        });

    } catch (error: any) {
        console.error('SCANNER_CRASH_DETAILS:', error);

        return NextResponse.json(
            { error: 'The intel extraction system encountered a critical failure.' },
            { status: 500 }
        );
    }
}
