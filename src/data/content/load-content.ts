/**
 * Typed accessors for content JSON — JSON imports widen literal unions to string.
 */
import type { ContentCollection } from '../../utils/content-presentation';
import activitiesJson from './activities.json';
import newsJson from './news.json';

export const activitiesCollection = activitiesJson as ContentCollection;
export const newsCollection = newsJson as ContentCollection;
