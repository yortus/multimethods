// tslint:disable:no-unused-expression
import {expect} from 'chai';
import {ALL, intersect, NONE, toNormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Traversing an euler diagram', () => {

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
            let predicates = test;
            let eulerDiagram = new EulerDiagram(predicates);

            // An euler diagram is always rooted at '**'.
            expect(eulerDiagram.universalSet.predicate).to.equal(ALL);

            // An euler diagram is never contains '∅'.
            expect(eulerDiagram.allSets.every(set => set.predicate !== NONE)).to.be.true;

            // All input predicates are in the euler diagram constructed from them, except `∅`.
            let normalPredicates = predicates.filter(p => p !== NONE).map(toNormalPredicate);
            let eulerDiagramPredicates = eulerDiagram.allSets.map(set => set.predicate).sort();
            expect(eulerDiagramPredicates).to.include.members(normalPredicates);

            // Every child set's predicate matches a subset of the addresses matched by its parent set's predicate.
            let edges = getAllEdges(eulerDiagram.universalSet);
            expect(edges.every(edge => {
                let intersection = intersect(edge.parent.predicate, edge.child.predicate);
                return intersection === edge.child.predicate;
            })).to.be.true;

            // For each set S, all subsets of S have S as a superset.
            eulerDiagram.allSets.forEach(set => {
                set.subsets.forEach(subset => expect(subset.supersets).to.include(set));
            });

            // For each set S, all supersets of S have S as a subset.
            eulerDiagram.allSets.forEach(set => {
                set.supersets.forEach(superset => expect(superset.subsets).to.include(set));
            });
        });
    });
});





/** Helper function that enumerates all edges in an euler diagram. */
function getAllEdges(set: EulerSet): Array<{parent: EulerSet; child: EulerSet}> {
    let direct = set.subsets.map(spec => ({parent: set, child: spec}));
    let all = direct.concat(...set.subsets.map(getAllEdges));
    return all;
}
