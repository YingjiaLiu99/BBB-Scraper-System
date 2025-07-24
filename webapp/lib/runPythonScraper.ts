import { spawn } from 'child_process';
import path from 'path';

/**
 * Run the Python scraper with a given URL and CSV output path.
 * 
 * @param url - The target URL to scrape
 * @param outputCsvPath - Full path to where CSV should be written
 */
export function runPythonScraper(url: string, outputCsvPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const rootDir = path.resolve(process.cwd(), '..'); // Adjust to BBB-Scraper-System folder position
    const pythonPath = path.join(rootDir, '.venv/bin/python');
    const scriptPath = path.join(rootDir, 'scraper/main.py');

    const child = spawn(
      pythonPath,
      ['-u', scriptPath, '--url', url, '--out', outputCsvPath],
      { cwd: rootDir }
    );

    // Stream logs
    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(`[PYTHON stdout] ${chunk.toString()}`);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write(`[PYTHON stderr] ${chunk.toString()}`);
    });

    child.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Python scraper exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err: Error) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}




