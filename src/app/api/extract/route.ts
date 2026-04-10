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

        // 4. Content Validation
        if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
                { error: 'No extractable text found. Ensure the document is not an image-only scan.' },
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