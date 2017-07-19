import {expect} from 'chai';
import {toPredicate, parsePredicateSource, toNormalPredicate} from 'multimethods/math/predicates';


describe('Constructing a Predicate instance', () => {

    let tests = [
        '∅ ==> ∅ WITH []',
        '/api/foo ==> /api/foo WITH []',
        '/api/foo/BAR ==> /api/foo/BAR WITH []',
        '/api/foo… ==> /api/foo… WITH []',
        '/api/foo... ==> /api/foo… WITH []',
        '/api/foo/… ==> /api/foo/… WITH []',
        '/api/foo/{…rest} ==> /api/foo/… WITH ["rest"]',
        '/API/f*## ==> ERROR',
        '/api/{foO}O ==> /api/*O WITH ["foO"]',
        '/…/{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
        '/.../{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
        '/{...aPath}/{name}.{ext} ==> /…/*.* WITH ["aPath", "name", "ext"]',
        '/-/./- ==> /-/./-',
        'GET /foo ==> GET /foo WITH []',
        '{method} {...path} ==> * … WITH ["method", "path"]',
        'GET   /foo ==> GET   /foo WITH []',
        '   GET /foo ==>    GET /foo WITH []',
        '   /    ==>    /    WITH []',
        '& ==> ERROR',
        '/& ==> ERROR',
        '/*** ==> ERROR',
        '/*… ==> ERROR',
        '/foo/{...rest}* ==> ERROR',
        '/foo/{name}{ext} ==> ERROR',
        '/$foo ==> ERROR',
        '/bar/? ==> ERROR',
        '{} ==> ERROR',
        '{a...} ==> ERROR',
        '{...} ==> ERROR',
        '{..} ==> ERROR',
        '{..a} ==> ERROR',
        '{foo-bar} ==> ERROR',
        '{"foo"} ==> ERROR',
        '{ ==> ERROR',
        '} ==> ERROR',
        '{{} ==> ERROR',
        '{}} ==> ERROR',
        '{$} ==> * WITH ["$"]',
        '{...__} ==> … WITH ["__"]',

        // NB: comments were supported until commit b908107. Now these are erorrs.
        '#comment ==> ERROR',
        '   #comment ==> ERROR',
        '# /a/b/c   fsdfsdf ==> ERROR',
        '/a/b#comment ==> ERROR',
        '/.../{name}.js   #12 ==> ERROR',
    ];

    tests.forEach(test => {
        it(test, () => {
            let predicateSource = test.split(' ==> ')[0].replace(/^∅$/, '');
            let rhs = test.split(' ==> ')[1];
            let expectedSignature = rhs.split(' WITH ')[0].replace(/^∅$/, '');
            let expectedCaptureNames = eval(rhs.split(' WITH ')[1] || '[]');
            let expectedComment = predicateSource.split('#')[1] || '';
            let actualSignature = 'ERROR';
            let actualCaptureNames = [];
            try {
                let ast = parsePredicateSource(predicateSource);
                actualSignature = toNormalPredicate(predicateSource);
                actualCaptureNames = ast.captureNames;
            }
            catch (ex) { }
            expect(actualSignature).equals(expectedSignature);
            expect(actualCaptureNames).to.deep.equal(expectedCaptureNames);
        });
    });
});
