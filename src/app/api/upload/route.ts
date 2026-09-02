import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireAuth();

    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[] || [];

    // Fallback if single file under 'file'
    const singleFile = data.get('file') as File | null;
    if (singleFile && files.length === 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate clean unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${randomStr}-${cleanName}`;

      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploadedUrls.push(`/uploads/${filename}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'No valid image files uploaded' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
