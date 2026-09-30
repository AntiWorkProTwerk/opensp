import type {APIRoute} from 'astro';
import {journeyChapters, type JourneyChapter} from '../../lib/journey';

export function getStaticPaths() {
  return journeyChapters.map(chapter => ({params: {slug: chapter.slug}, props: {chapter}}));
}

export const GET: APIRoute = ({props}) => {
  const chapter = props.chapter as JourneyChapter;
  return new Response(chapter.exercise.code.trimEnd() + '\n', {headers: {'Content-Type': 'text/x-python; charset=utf-8'}});
};
