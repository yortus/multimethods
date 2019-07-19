import {expect} from 'chai';
import {ALL, intersect, NONE, toNormalPattern} from 'multimethods/patterns';
import {Taxon, Taxonomy} from 'multimethods/taxonomies';




describe('Traversing a taxonomy', () => {

    let tests = [
        ['∅', 'foo', 'bar', 'f{chars}', '*o'],
        ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f', '∅'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*', '∅', 'a/b', 'a/*', '*/b/b'],
    ];

    tests.forEach(test => {
        it(test.join(', '), () => {
            let patterns = test;
            let taxonomy = new Taxonomy(patterns);

            // A taxonomy is always rooted at '**'.
            expect(taxonomy.rootTaxon.pattern).to.equal(ALL);

            // A taxonomy is never contains '∅'.
            expect(taxonomy.allTaxons.every(taxon => taxon.pattern !== NONE)).to.equal(true);

            // All input patterns are in the taxonomy constructed from them, except `∅`.
            let normalPatterns = patterns.filter(p => p !== NONE).map(toNormalPattern);
            let taxonomyPatterns = taxonomy.allTaxons.map(taxon => taxon.pattern).sort();
            expect(taxonomyPatterns).to.include.members(normalPatterns);

            // Every child taxon's pattern matches a subset of the addresses matched by its parent taxon's pattern.
            let edges = getAllEdges(taxonomy.rootTaxon);
            expect(edges.every(edge => {
                let intersection = intersect(edge.parent.pattern, edge.child.pattern);
                return intersection === edge.child.pattern;
            })).to.equal(true);

            // For each taxon S, all specialisations of S have S as a generalisation.
            taxonomy.allTaxons.forEach(taxon => {
                taxon.specialisations.forEach(subset => expect(subset.generalisations).to.include(taxon));
            });

            // For each taxon S, all generalisations of S have S as a specialisation.
            taxonomy.allTaxons.forEach(taxon => {
                taxon.generalisations.forEach(superset => expect(superset.specialisations).to.include(taxon));
            });
        });
    });
});




/** Helper function that enumerates all edges in a taxonomy. */
function getAllEdges(taxon: Taxon): Array<{parent: Taxon; child: Taxon}> {
    let direct = taxon.specialisations.map(spec => ({parent: taxon, child: spec}));
    let all = direct.concat(...taxon.specialisations.map(getAllEdges));
    return all;
}
