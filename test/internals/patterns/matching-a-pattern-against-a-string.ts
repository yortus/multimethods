// tslint:disable:no-eval
import {expect} from 'chai';
import {Pattern, toMatchFunction} from 'multimethods/internals/patterns';




describe('Matching a pattern against a string', () => {

    // NB: For visual clarity, `⨂` is used below to mean the empty pattern. This is not the
    //     same as the ∅ pattern. ∅ does not match any strings, but ⨂ matches the empty string.
    let tests = [
        '⨂ MATCHES ⨂', // NB: empty pattern and string
        '* MATCHES ⨂', // NB: empty string
        '* MATCHES abc',
        '⨂ DOES NOT MATCH /', // NB: empty string
        '* DOES NOT MATCH abc/def',
        '** MATCHES abc',
        '** MATCHES abc/def',
        '∅ DOES NOT MATCH ∅',
        '∅ DOES NOT MATCH ⨂',
        '∅ DOES NOT MATCH abc',

        '{Name} MATCHES abc WITH { Name: "abc" }',
        '{name} DOES NOT MATCH abc/def',
        '{**path} MATCHES abc/def WITH { path: "abc/def" }',
        'aaa MATCHES aaa',
        'aa DOES NOT MATCH aaa',
        '**bbb MATCHES bbb',
        '**bbb MATCHES aaa/bbb',
        '**bbb DOES NOT MATCH bbbabb',
        '{x}/y MATCHES x/y WITH {x: "x"}',
        '{X}/Y MATCHES X/Y WITH {X: "X"}',
        '/foo/* DOES NOT MATCH /foo',
        '/foo/* MATCHES /foo/bar',
        '/** MATCHES /foo/bar',
        '/{a} MATCHES / WITH {a:""}',
        '/a/{b} MATCHES /a/ WITH {b:""}',
        '/{**a}/ MATCHES // WITH {a:""}',
        '/{**path} MATCHES /foo/bar WITH { path: "foo/bar" }',
        '*ab* MATCHES aaabbb',
        '*aaa* MATCHES aaabbb',
        '*aaa* MATCHES aaaaaa',
        '*bbb* MATCHES aaabbb',
        '*ab* DOES NOT MATCH AABB',
        '*AB* DOES NOT MATCH aabb',
        '*bbb* DOES NOT MATCH bb/baaabb',

        '/{lhs}/bbb/{**rhs} MATCHES /aaa/bbb/ccc/ddd WITH {lhs: "aaa", rhs: "ccc/ddd"}',
        '{lhs}/bbb/{**rhs} DOES NOT MATCH /aaa/bbb/ccc/ddd',
        '/f*o/bar/{baz}z/{**rest}.html MATCHES /foo/bar/baz/1/more/part.html WITH { baz: "ba", rest: "1/more/part" }',

        '{first} {**rest} MATCHES a b c d WITH { first: "a b c", rest: "d" }',
        '{first} {**rest} DOES NOT MATCH abcd',
        '{first} {rest} DOES NOT MATCH abcd',
        '{first} {rest} MATCHES a b c d WITH { first: "a b c", rest: "d" }',
        '{**first} {**rest} MATCHES a/b c/d e/f WITH { first: "a/b c/d", rest: "e/f" }',
        '{first} {**rest} DOES NOT MATCH a/b c/d e/f',
        '{first} {**rest} MATCHES a / b c / d e / f WITH { first: "a", rest: "/ b c / d e / f" }',
        '  {first}    {**rest}   MATCHES   a    b   WITH { first: "a", rest: "b" }',
        '  {first}    {**rest}   DOES NOT MATCH   a    b',
        '  {first}    {**rest}   MATCHES   a      b   WITH { first: "a  ", rest: "b" }',
        '  {first}    {**rest}   DOES NOT MATCH   a      b',
        '  {first}  /  {**rest} MATCHES     a  /      b   WITH { first: "  a", rest: "    b  " }',
        '  {first}  /  {**rest} MATCHES     a  /      b WITH { first: "  a", rest: "    b" }',

        'a|b MATCHES a',
        'a|b MATCHES b',
        'a|b DOES NOT MATCH ab',
        'a*|b*b MATCHES a foobar',
        'a*|b*b MATCHES baobab',
        'a*|b*b DOES NOT MATCH baaa',
        'aaa| MATCHES ⨂',
        'bbb||ccc MATCHES ⨂',
        'abc|bcd|cde|def|efg|ab0|123|a|b|c MATCHES 123',
        'abc|bcd|cde|def|efg|ab0|123|a|b|c DOES NOT MATCH bc',
        'a*|*b|*c* MATCHES barb',
        'abc|a* MATCHES ace',
        'abc|*x|*2** MATCHES 12/34/56',
    ];

    tests.forEach(test => {
        it(test, () => {
            test = test.replace(/⨂/g, '');
            let isMatch = test.indexOf(' MATCHES ') !== -1;
            let split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
            let patternSource = test.split(split)[0];
            let rhs = test.split(split)[1];
            let address = rhs.split(' WITH ')[0];
            let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) || {} : null;
            let pattern = Pattern(patternSource);
            let actualCaptures = toMatchFunction(pattern)(address);
            expect(actualCaptures).to.deep.equal(expectedCaptures);
        });
    });
});
