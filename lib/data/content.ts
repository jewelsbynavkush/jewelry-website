/**
 * Page content data access layer
 * Reads from JSON files
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { PageContent } from '@/types/data';
import { logError } from '@/lib/security/error-handler';

const DATA_DIR = join(process.cwd(), 'data', 'content');

/**
 * Get page content
 */
export async function getPageContent(page: string): Promise<PageContent | null> {
  try {
    const filePath = join(DATA_DIR, `${page}.json`);
    const fileContents = await readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as PageContent;
  } catch (error) {
    logError(`getPageContent(${page})`, error);
    return null;
  }
}

