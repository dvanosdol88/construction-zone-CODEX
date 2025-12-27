import { getDocument } from 'pdfjs-dist';

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'html']);
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
const MAX_CHARS = 15000;

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return text.slice(0, MAX_CHARS);
}

async function extractPdfText(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  let output = '';

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string }>;
    const pageText = items.map((item) => item.str || '').join(' ');
    const nextChunk = `${pageText}\n`;

    if (output.length + nextChunk.length >= MAX_CHARS) {
      output += nextChunk.slice(0, MAX_CHARS - output.length);
      break;
    }

    output += nextChunk;
  }

  return truncate(output.trim());
}

export async function generatePdfThumbnail(file: File): Promise<string | null> {
  try {
    const data = await file.arrayBuffer();
    const pdf = await getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
}

export async function extractText(file: File): Promise<string> {
  const extension = getFileExtension(file.name);

  if (extension === 'pdf') {
    return extractPdfText(file);
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return truncate(await file.text());
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return file.name;
  }

  return truncate(await file.text());
}
