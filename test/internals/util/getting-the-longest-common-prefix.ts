// tslint:disable:no-eval
import {expect} from 'chai';
import {getLongestCommonPrefix} from 'multimethods/internals/util';





describe('Getting the longest common prefix', () => {

    let tests = [
        `[], [] ==> []`,
        `[1], [] ==> []`,
        `[1,2], [3] ==> []`,
        `[1,2], [1,3] ==> [1]`,
        `[1,2], [1,2] ==> [1,2]`,
        `[1,2], [2,2] ==> []`,
        `[1,1], [1,1,1] ==> [1,1]`,
        `[1,1], [1,1,1], [1] ==> [1]`,
        `[1], [1,2], [2,1] ==> []`,
        `[1,2,3], [1,2,4], [1,2,3,4] ==> [1,2]`,
        `[1,2], ['1','2'] ==> []`,
        `[1,'a', []], [1,'a'] ==> [1, 'a']`,
        `[[],[]], [[],[]] ==> []`,
        `['aaa',{}], ['aaa',{}] ==> ['aaa']`,
        `[true, false, 'blah', [], 5], [true, false, 'blah', [], 5] ==> [true, false, 'blah']`,
        `[1], [1], [true], [], [1] ==> []`,
        `[true, false, 'blah', [], {}, 5] ==> [true, false, 'blah', [], {}, 5]`,
        `[] ==> []`,
        ` ==> []`,
    ];

    tests.forEach(test => {
        it(test, () => {
            let arrays = eval(`[${test.split(' ==> ')[0]}]`);
            let expectedResult = eval(test.split(' ==> ')[1]);
            let actualResult = getLongestCommonPrefix(arrays);
            expect(actualResult).to.deep.equal(expectedResult);
        });
    });
});
