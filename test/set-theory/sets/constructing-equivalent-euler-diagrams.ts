// tslint:disable:no-unused-expression
import {expect} from 'chai';
//import {ALL, intersect, NONE, toNormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing equivalent euler diagrams', () => {

    let tests = [
        // ['∅', 'foo', 'bar', 'f{chars}', '*o'],
        // ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        // ['a', 'b', 'c', 'd', 'e', 'f', '∅'],
        // ['a', 'a', 'a', 'a', 'a', 'a'],
        // ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        // ['**', '*', '*/*', '**/*', '*/*', '*/*/*', '∅', 'a/b', 'a/*', '*/b/b'],
        // ['*A*', '*B*', '*BB*'],
        // ['*A*', '*BB*', '*B*'],
        // ['*A*S*', '*B*', '*A*M*', '*B*M*'],
        // [
        //     '*A*I*',
        //     '*B*',
        //     '*A*T*',
        //     '*B*I*T*',
        // ],
        // [
        //     '*A*',
        //     '*B*',
        //     '*C*',
        //     '*B*C*D*',
        // ],
        [
            '*A*I*S*W*',
            '*B*W*',
            '*A*I*M*W*',
            '*W*',
            '*B*M*W*',
            '*A*J*M*S*',
            '*A*T*W*',
            '*A*E*S*T*W*',
            '*B*I*M*S*T*U*W*Y*Z*',
            '*A*B*X*Z*',
            '*A*B*M*W*X*Y*',
            '*D*E*Q*',
        ],
    ];

    tests.forEach(test => {
        it(test.join(', '), () => {

            // Construct an ED from the given predicates in the given order.
            let predicates = test;
            let ed1 = new EulerDiagram(predicates);

            console.log('----------------------------------------');
            
            // Construct another ED from the same predicates arranged in reverse order.
            predicates.reverse();
            let ed2 = new EulerDiagram(predicates);

            normaliseEulerDiagram(ed1);
            normaliseEulerDiagram(ed2);
            console.log('\n\n\n\n\n');
            console.log(JSON.stringify(setToObj(ed1.universalSet), null, 4));
            console.log('================================================================================');
            console.log(JSON.stringify(setToObj(ed2.universalSet), null, 4));
            console.log('\n\n\n\n\n');


            // The two EDs should represent identical DAGs.
            // TODO: was... remove comment, since sorting isn't necessary for deep.equal to work...  The order of subsets/supersets is irrelevant to the shape of the DAG, so we ensure subsets are sorted before 
            expect(setToObj(ed1.universalSet)).to.deep.equal(setToObj(ed2.universalSet));

            // // For each set S, all subsets of S have S as a superset.
            // eulerDiagram.allSets.forEach(set => {
            //     set.subsets.forEach(subset => expect(subset.supersets).to.include(set));
            // });

            // // For each set S, all supersets of S have S as a subset.
            // eulerDiagram.allSets.forEach(set => {
            //     set.supersets.forEach(superset => expect(superset.subsets).to.include(set));
            // });
        });
    });
});





// TODO: doc helper... should EDs do this internally for consistency? Not much point, still can't easily compare them.
function normaliseEulerDiagram(ed: EulerDiagram) {
    ed.allSets.forEach(set => {
        set.subsets.sort((a, b) => {
            if (a.predicate < b.predicate) return -1;
            if (a.predicate > b.predicate) return 1;
            return 0;
        });
    });
}





/** Helper function that converts an EulerDiagram to a simple nested object with predicate sources for keys */
function setToObj(set: EulerSet): {} {
    return set.subsets.reduce(
        (obj, subset) => {
            let key = subset.predicate as string;
            if (!subset.isPrincipal) key = `[${key}]`;
            obj[key] = setToObj(subset);
            return obj;
        },
        {}
    );
}
