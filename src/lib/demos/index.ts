import {earlyDemos} from './early.ts';
import {systemsDemos} from './systems.ts';
import {audioDemos} from './audio.ts';
export const demos = [...earlyDemos, ...systemsDemos, ...audioDemos];
export const demoFor = (slug: string) => demos.find(demo => demo.slug === slug);
