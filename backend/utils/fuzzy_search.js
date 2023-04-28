import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    threshold: 0.6,
};

/**
 * Uses a fuzzy search algorithm ([with Fuse.js](https://fusejs.io/)) to filter
 * a list based on a search pattern.
 *
 * This function is curried.
 *
 * @type {<T>(list: Array<T>, keys: Array<keyof T>) =>
 * (searchKeyword: string) =>
 *   Array<{
 *     item: T,
 *     refIndex: number,
 *     score: number,
 *   }>}
 */
const fuzzySearch = (list, keys = [], searchKeyword) => {
    const fuse = new Fuse(list, {
        ...FUSE_OPTIONS,
        keys
    });
    return fuse.search(searchKeyword, {
        limit: 10
    }).map(a => {
        Object.entries(a.item).forEach(([key, val]) => {
            a[key] = val;
        });
        delete a.item;
        a.score = 100 - ((a.score / FUSE_OPTIONS.threshold) * 100).toFixed(2);
        return a;
    });
};

export default fuzzySearch;

/**     EXAMPLE USE BELOW
 * 
 const data = [{
         id: 1,
         name: 'John',
         role: 'Manager'
     },
     {
         id: 2,
         name: 'Johanson',
         role: 'Janitor'
     },
     {
         id: 3,
         name: 'Alice',
         role: 'Accountant'
     }
 ];

 let query = 'Alice' //-->this would come from the user
 *
 let similar_results = fuzzySearch(data, ['role', 'name', 'id'], search_query);
 * 
 */
