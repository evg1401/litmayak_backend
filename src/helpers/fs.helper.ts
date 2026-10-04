import { realpath } from 'node:fs/promises';
import { sep } from 'node:path';

export const resolveInsideDir = async (
  filePath: string,
  dir: string,
): Promise<string | null> => {
  try {
    const [realFile, realDir] = await Promise.all([
      realpath(filePath),
      realpath(dir),
    ]);

    return realFile.startsWith(realDir + sep) ? realFile : null;
  } catch {
    return null;
  }
};
