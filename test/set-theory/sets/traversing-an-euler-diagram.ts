// tslint:disable:no-unused-expression
import {expect} from 'chai';
import {ANY, intersect, toNormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Traversing an euler diagram', () => {

    let tests = [
        ['foo', 'bar', 'f{chars}', '*o'],
        ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*', 'a/b', 'a/*', '*/b/b'],
    ];

    tests.forEach(test => {
        it(test.join(', '), () => {
            let predicates = test;
            let eulerDiagram = new EulerDiagram(predicates);

            // An euler diagram is always rooted at '**'.
            expect(eulerDiagram.universalSet.predicate).equals(ANY);

            // All input predicates are in the euler diagram constructed from them.
            let eulerDiagramPredicates = eulerDiagram.allSets.map(set => set.predicate.toString());
            expect(predicates.every(p => eulerDiagramPredicates.indexOf(toNormalPredicate(p)) !== -1)).to.be.true;

            // Every child set's predicate matches a subset of the addresses matched by its parent set's predicate.
            let edges = getAllEdges(eulerDiagram.universalSet);
            expect(edges.every(edge => {
                let intersections = intersect(edge.parent.predicate, edge.child.predicate);
                return intersections.length === 1 && intersections[0] === edge.child.predicate.toString();
            })).to.be.true;
        });
    });
});





/** Helper function that enumerates all edges in an euler diagram. */
function getAllEdges(set: EulerSet): Array<{parent: EulerSet; child: EulerSet}> {
    let direct = set.subsets.map(spec => ({parent: set, child: spec}));
    let all = direct.concat(...set.subsets.map(getAllEdges));
    return all;
}
