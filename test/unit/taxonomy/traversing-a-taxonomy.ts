import {expect} from 'chai';
import {Pattern, Taxonomy, TaxonomyNode} from 'multimethods';


describe('Traversing a taxonomy', () => {

    let tests = [
        ['foo', 'bar', 'f{chars}', '*o'],
        ['...', '/f...', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['...', '*', '*/*', '.../*', '*/*', '*/*/*'],
        ['...', '*', '*/*', '.../*', '*/*', '*/*/*', 'a/b', 'a/*', '*/b/b']
    ];

    tests.forEach(test => {
        it(test.join(', '), () => {
            let patterns = test.map(p => new Pattern(p));
            let taxonomy = new Taxonomy(patterns);

            // A taxonomy is always rooted at '…'.
            expect(taxonomy.rootNode.pattern).equals(Pattern.ANY);

            // All input patterns are in the taxonomy constructed from them.
            let taxonomyPatterns = taxonomy.allNodes.map(node => node.pattern);
            expect(patterns.every(p => taxonomyPatterns.indexOf(p.normalized) !== -1)).to.be.true;

            // Every child node's pattern matches a subset of the addresses matched by its parent node's pattern.
            let edges = getAllEdges(taxonomy.rootNode);
            expect(edges.every(edge => {
                let intersections = edge.parent.pattern.intersect(edge.child.pattern);
                return intersections.length === 1 && intersections[0] === edge.child.pattern
            })).to.be.true;
        });
    });
});


/** Helper function that enumerates all edges in a taxonomy. */
function getAllEdges(node: TaxonomyNode): {parent: TaxonomyNode; child: TaxonomyNode}[] {
    let direct = node.specializations.map(spec => ({parent: node, child: spec}));
    let all = direct.concat(...node.specializations.map(getAllEdges)); 
    return all;
}
