import {expect} from 'chai';
import {EulerDiagram, Set, intersect, toNormalPredicate, ANY, toPredicate} from 'multimethods';


describe('Traversing an euler diagram', () => {

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
            let predicates = test.map(p => toPredicate(p));
            let eulerDiagram = new EulerDiagram(predicates);

            // An euler diagram is always rooted at '…'.
            expect(eulerDiagram.universe.predicate.toString()).equals(ANY);

            // All input predicates are in the euler diagram constructed from them.
            let eulerDiagramPredicates = eulerDiagram.sets.map(set => set.predicate.toString());
            expect(predicates.every(p => eulerDiagramPredicates.indexOf(toNormalPredicate(p)) !== -1)).to.be.true;

            // Every child set's predicate matches a subset of the addresses matched by its parent set's predicate.
            let edges = getAllEdges(eulerDiagram.universe);
            expect(edges.every(edge => {
                let intersections = intersect(<any> edge.parent.predicate.toString(), <any> edge.child.predicate.toString()); // TODO: messy & casty... fix...
                return intersections.length === 1 && intersections[0] === edge.child.predicate.toString();
            })).to.be.true;
        });
    });
});


/** Helper function that enumerates all edges in an euler diagram. */
function getAllEdges(set: Set): {parent: Set; child: Set}[] {
    let direct = set.subsets.map(spec => ({parent: set, child: spec}));
    let all = direct.concat(...set.subsets.map(getAllEdges)); 
    return all;
}