import {expect} from 'chai';
import {Pattern} from 'multimethods';


describe('Matching a pattern against a string', () => {

    let tests = [
        '∅ MATCHES ∅',
        '* MATCHES ∅',
        '* MATCHES abc',
        '∅ DOES NOT MATCH /',
        '* DOES NOT MATCH abc/def',
        '… MATCHES abc',
        '… MATCHES abc/def',
        '{Name} MATCHES abc WITH { Name: "abc" }',
        '{name} DOES NOT MATCH abc/def',
        '{...path} MATCHES abc/def WITH { path: "abc/def" }',
        'aaa MATCHES aaa',
        'aa DOES NOT MATCH aaa',
        '…bbb MATCHES bbb',
        '...bbb MATCHES aaa/bbb',
        '…bbb DOES NOT MATCH bbbabb',
        '{x}/y MATCHES x/y WITH {x: "x"}',
        '{X}/Y MATCHES X/Y WITH {X: "X"}',
        '/foo/* DOES NOT MATCH /foo',
        '/foo/* MATCHES /foo/bar',
        '/... MATCHES /foo/bar',
        '/{a} MATCHES / WITH {a:""}',
        '/a/{b} MATCHES /a/ WITH {b:""}',
        '/{...a}/ MATCHES // WITH {a:""}',
        '/{...path} MATCHES /foo/bar WITH { path: "foo/bar" }',
        '*ab* MATCHES aaabbb',
        '*aaa* MATCHES aaabbb',
        '*aaa* MATCHES aaaaaa',
        '*bbb* MATCHES aaabbb',
        '*ab* DOES NOT MATCH AABB',
        '*AB* DOES NOT MATCH aabb',
        '*bbb* DOES NOT MATCH bb/baaabb',
        '/{lhs}/bbb/{...rhs} MATCHES /aaa/bbb/ccc/ddd WITH {lhs: "aaa", rhs: "ccc/ddd"}',
        '{lhs}/bbb/{...rhs} DOES NOT MATCH /aaa/bbb/ccc/ddd',
        '/f*o/bar/{baz}z/{...rest}.html MATCHES /foo/bar/baz/some/more/stuff.html WITH { baz: "ba", rest: "some/more/stuff" }',
        '{first} {...rest} MATCHES a b c d WITH { first: "a b c", rest: "d" }',
        '{first} {...rest} DOES NOT MATCH abcd',
        '{first} {rest} DOES NOT MATCH abcd',
        '{first} {rest} MATCHES a b c d WITH { first: "a b c", rest: "d" }',
        '{...first} {...rest} MATCHES a/b c/d e/f WITH { first: "a/b c/d", rest: "e/f" }',
        '{first} {...rest} DOES NOT MATCH a/b c/d e/f',
        '{first} {...rest} MATCHES a / b c / d e / f WITH { first: "a", rest: "/ b c / d e / f" }',
        '  {first}    {...rest}   MATCHES   a    b   WITH { first: "a", rest: "b  " }',
        '  {first}    {...rest}   MATCHES   a    b WITH { first: "a", rest: "b" }',
        '  {first}    {...rest}   MATCHES   a      b WITH { first: "a  ", rest: "b" }',
        '  {first}  /  {...rest}   MATCHES     a  /      b WITH { first: "  a", rest: "    b" }'
    ];

    tests.forEach(test => {
        it(test, () => {
            let isMatch = test.indexOf(' MATCHES ') !== -1;
            let split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
            let patternSource = test.split(split)[0].replace(/^∅$/, '');
            let rhs = test.split(split)[1];
            let address = rhs.split(' WITH ')[0].replace(/^∅$/, '');
            let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) || {} : null;
            let pattern = new Pattern(patternSource);
            let actualCaptures = pattern.match(address);
            expect(actualCaptures).to.deep.equal(expectedCaptures);
        });
    });
});
