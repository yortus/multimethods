// tslint:disable:no-unused-expression
import {expect} from 'chai';
import {NormalPredicate} from 'multimethods/math/predicates';
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
        // ['*A*I*', '*B*', '*A*T*', '*B*I*T*'],
        // ['*A*', '*B*', '*C*', '*B*C*D*'],
        // [
        //     '*A*I*S*W*', '*B*W*', '*A*I*M*W*', '*W*', '*B*M*W*', '*A*J*M*S*', '*A*T*W*',
        //     '*A*E*S*T*W*', '*B*I*M*S*T*U*W*Y*Z*', '*A*B*X*Z*', '*A*B*M*W*X*Y*', '*D*E*Q*',
        // ],
        // [
        //     '*A*', '*B*', '*C*', '*D*', '*E*', '*F*', '*G*', '*H*', '*I*', '*J*',
        //     '*K*', '*L*', '*M*', '*N*', '*O*', '*P*', '*Q*', '*R*', '*S*', '*T*',
        //     '*0*', '*1*', '*2*', '*3*', '*4*', '*5*', '*6*', '*7*', '*8*', '*9*',
        // ],





        // TODO: takes ~2000ms
        [
            '*A*', '*B*', '*C*', '*D*', '*E*', '*F*', '*G*', '*H*', '*I*', '*J*',
            '*K*', '*L*', '*M*', '*N*', '*O*', '*P*', '*Q*', '*R*', '*S*', '*T*',
            '*0*', '*1*', '*2*', '*3*', '*4*', '*5*', '*6*', '*7*', '*8*', '*9*',
            '*A*Z*', '*B*Z*', '*C*Z*', '*D*Z*', '*E*Z*', '*F*Z*', '*G*Z*', '*H*Z*', '*I*Z*', '*J*Z*',
            '*K*Z*', '*L*Z*', '*M*Z*', '*N*Z*', '*O*Z*', '*P*Z*', '*Q*Z*', '*R*Z*', '*S*Z*', '*T*Z*',
            '*0*Z*', '*1*Z*', '*2*Z*', '*3*Z*', '*4*Z*', '*5*Z*', '*6*Z*', '*7*Z*', '*8*Z*', '*9*Z*',
            '*-*A*', '*-*B*', '*-*C*', '*-*D*', '*-*E*', '*-*F*', '*-*G*', '*-*H*', '*-*I*', '*-*J*',
            '*-*K*', '*-*L*', '*-*M*', '*-*N*', '*-*O*', '*-*P*', '*-*Q*', '*-*R*', '*-*S*', '*-*T*',
            '*-*0*', '*-*1*', '*-*2*', '*-*3*', '*-*4*', '*-*5*', '*-*6*', '*-*7*', '*-*8*', '*-*9*',
        ],
        ['*A*', '*B*', '*C*', '*B*C*D*', '*C*D*'],
    ];

    tests.forEach(test => {
        let testName = test.join(', ');
        if (testName.length > 60) testName = testName.slice(0, 60) + '...';
        it(testName, () => {

            // Construct an ED from the given predicates in the given order.
            let predicates = test;
            let ed1 = new EulerDiagram(predicates, isUnreachable);

            // Construct another ED from the same predicates arranged in reverse order.
            predicates.reverse();
            let ed2 = new EulerDiagram(predicates, isUnreachable);

            // The two EDs should represent identical DAGs.
            expect(setToObj(ed1.universalSet)).to.deep.equal(setToObj(ed2.universalSet));
        });
    });
});





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





// TODO: temp testing...
function isUnreachable(p: NormalPredicate) {

    // Only consider the form *A*B*C*...*
    if (p.length < 3) return;
    if (p.charAt(0) !== '*' || p.charAt(p.length - 1) !== '*') return;
    if (p.indexOf('**') !== -1 || p.indexOf('/') !== -1) return;

    // If the parts aren't strictly ordered, it's unreachable
    let parts = p.slice(1, -1).split('*');
    for (let i = 0, j = 1; j < parts.length; ++i, ++j) {
        if (parts[i] >= parts[j]) return true;
    }
    return;
}
