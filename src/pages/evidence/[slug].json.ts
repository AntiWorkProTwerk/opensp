import type {APIRoute} from 'astro';
import {journeyChapters, type JourneyChapter} from '../../lib/journey';

export function getStaticPaths() {
  return journeyChapters.map(chapter => ({params: {slug: chapter.slug}, props: {chapter}}));
}

export const GET: APIRoute = ({props}) => {
  const chapter = props.chapter as JourneyChapter;
  const record = {
    title: chapter.title,
    period: chapter.period,
    evidenceLabel: chapter.evidenceLabel,
    publicationNote: 'Curated summaries of retained project reports. The underlying records and firmware artifacts are not published here.',
    sources: chapter.sources.map(({title, evidence}) => ({title, evidence})),
    limits: chapter.limits,
    exerciseScope: 'The accompanying Python example uses invented in-memory data. It does not connect to hardware, install firmware or reproduce a device test.',
  };
  return new Response(JSON.stringify(record, null, 2) + '\n', {headers: {'Content-Type': 'application/json; charset=utf-8'}});
};
