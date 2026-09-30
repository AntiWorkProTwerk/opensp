export interface JourneyStep {
  title: string;
  body: string;
  display: [string, string, string, string];
}

export interface JourneyChapter {
  slug: string;
  title: string;
  description: string;
  order: number;
  category: 'Display' | 'Controls' | 'USB' | 'Audio' | 'SDK' | 'Research';
  period: string;
  evidenceLabel: string;
  summary: string;
  timeline: {
    kind: 'sequence' | 'r3';
    title: string;
    caption: string;
    duration: number;
    steps: JourneyStep[];
  };
  sections: {
    id: string;
    title: string;
    short: string;
    paragraphs: string[];
    steps?: string[];
    checkpoint?: string;
  }[];
  exercise: {
    title: string;
    intro: string;
    code: string;
    expected: string;
    explanation: string;
  };
  sources: {title: string; path: string; evidence: string}[];
  limits: string[];
}

const files = import.meta.glob<{default: JourneyChapter}>('../content/journey/*.json', {eager: true});
export const journeyChapters = Object.values(files).map(file => file.default).sort((a, b) => a.order - b.order);

export function journeyChapter(slug: string): JourneyChapter | undefined {
  return journeyChapters.find(chapter => chapter.slug === slug);
}

export function chapterContents(chapter: JourneyChapter) {
  return [
    ...chapter.sections.map(({id, short}) => ({id, short})),
    {id: 'exercise', short: 'Try the offline check'},
    {id: 'evidence', short: 'Evidence and limits'},
  ];
}
