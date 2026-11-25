import { useCachedFetch } from './useCachedFetch';
import { fetchPublishedCase, fetchPublicContact, fetchPublishedCases } from '../services/casesService';
import { fetchActiveMethods } from '../services/methodsService';

export const usePublishedCases = () => useCachedFetch('cases', fetchPublishedCases);
export const useActiveMethods = () => useCachedFetch('methods', fetchActiveMethods);
export const usePublishedCase = (id) => useCachedFetch(`case:${id}`, () => fetchPublishedCase(id));
export const usePublicContact = (id) => useCachedFetch(`contact:${id}`, () => fetchPublicContact(id));
