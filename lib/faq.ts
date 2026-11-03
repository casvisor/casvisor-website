import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type FaqItem = { question: string; answer: string };

// The FAQ page is plain Markdown: every `##` heading is a question and the text below it is the answer.
export async function readFaq(pagePath: string): Promise<FaqItem[]> {
  const markdown = await readFile(path.join(process.cwd(), 'content/docs', pagePath), 'utf8');
  const sections: { question: string; lines: string[] }[] = [];
  let fenced = false;

  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) fenced = !fenced;
    if (!fenced && line.startsWith('## ')) {
      sections.push({ question: line.slice(3).trim(), lines: [] });
    } else if (sections.length > 0) {
      const section = sections[sections.length - 1];
      if (section.lines.length > 0 || line.trim() !== '') section.lines.push(line);
    }
  }

  return sections
    .map(({ question, lines }) => ({ question, answer: plainText(lines.join('\n')) }))
    .filter((item) => item.question !== '' && item.answer !== '');
}

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}