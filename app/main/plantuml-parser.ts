/**
 * PlantUML parser helpers.
 *
 * Pure functions, no Electron deps - safe to import from both the main
 * process and unit tests. Anything that needs `app`, `BrowserWindow`,
 * or IPC stays in `index.ts`.
 */

export interface DiagramError {
  line: number;
  shortMessage: string;
  details: string;
}

export interface DiagramRenderResult {
  ok: boolean;
  format?: 'svg' | 'png';
  data?: string;
  error?: DiagramError;
  renderMs?: number;
}

const DIAGRAM_START =
  /^\s*@(startuml|startmindmap|startgantt|startsalt|startjson|startyaml|startwireframe|startdot|startmermaid|startcreole|startmath|startditaa|startebnf|startregex|startflow|startstack|startchronology|startmonthlyplanner|startnetwork|startnwdiag|starttiming|starttree|startwbs|startarchimate|startbpm|startc4|startsitemap|startboard|startgalaxy|startgit|starthcl)/i;

/**
 * Split a PlantUML source string into individual diagram blocks.
 *
 * PlantUML's `-pipe` mode only renders the first block in a multi-block
 * file. planttext.com-style behavior is to render every block. This
 * helper powers that: it walks line-by-line, tracks the start tag, and
 * pushes each block onto the result list when it sees the matching
 * `@endXXX` (or `@enduml` for any block - PlantUML tolerates that).
 *
 * An unterminated trailing block is still returned - PlantUML renders it.
 * Plain text with no `@startXXX` is treated as a single block.
 */
export function splitDiagrams(source: string): string[] {
  const lines = source.split('\n');
  const diagrams: string[] = [];
  let current: string[] = [];
  let inside = false;
  let endMarker: string | null = null;

  for (const line of lines) {
    const startMatch = line.match(DIAGRAM_START);
    if (!inside && startMatch) {
      inside = true;
      endMarker = `@end${startMatch[1].slice(5).toLowerCase()}`;
      current = [line];
      continue;
    }
    if (inside) {
      current.push(line);
      const trimmed = line.trim().toLowerCase();
      // PlantUML accepts `@enduml` as the closer for any block type.
      if (trimmed === '@enduml' || (endMarker !== null && trimmed === endMarker)) {
        diagrams.push(current.join('\n'));
        current = [];
        inside = false;
        endMarker = null;
      }
    }
  }
  if (inside && current.length > 0) {
    diagrams.push(current.join('\n'));
  }
  if (diagrams.length === 0 && source.trim() !== '') {
    diagrams.push(source);
  }
  return diagrams;
}

/**
 * PlantUML writes a rendered error IMAGE with exit code 0 for syntax
 * errors, so "exit 0 + non-empty stdout" is not success. The error image
 * carries these markers and stderr carries the line number in
 * PlantUML's own format ("ERROR\n<line>\n<message>").
 */
export function looksLikeErrorImage(output: Buffer): boolean {
  const head = output.subarray(0, Math.min(4096, output.length)).toString('utf-8');
  if (!head.includes('<svg')) {
    return false;
  }
  return (
    head.includes('Syntax Error') ||
    head.toLowerCase().includes('cannot find') ||
    head.includes('Preprocessing error') ||
    head.toLowerCase().includes('preprocessor error') ||
    head.includes('null pointer exception')
  );
}

/**
 * Parse PlantUML's stderr into a structured error. PlantUML emits
 * `ERROR\n<line>\n<message>` for syntax errors; older releases or
 * other failures use `line: <N>`. Falls back to whatever is in
 * `output` if stderr is empty.
 */
export function parsePlantumlError(stderr: string, output: Buffer): DiagramError {
  // stderr format for a syntax error: "ERROR\n<line>\n<message>"
  const errMatch = /^ERROR\s*\n\s*(\d+)\s*\n([\s\S]*)$/.exec(stderr);
  if (errMatch) {
    return {
      line: parseInt(errMatch[1], 10) || 0,
      shortMessage: (errMatch[2].trim().split('\n')[0] || 'Syntax error'),
      details: stderr,
    };
  }
  const lineMatch = /line\s*[:=]?\s*(\d+)/i.exec(stderr);
  const details = stderr || output.subarray(0, 2000).toString('utf-8');
  return {
    line: lineMatch ? parseInt(lineMatch[1], 10) : 0,
    shortMessage: stderr.trim().split('\n')[0] || 'Rendering failed',
    details,
  };
}
