import {expect} from 'chai';
import isPromiseLike from 'multimethods/util/is-promise-like';


describe('Identifying a Promise-like object', () => {

    let tests = [
        `T: new Promise(res => {})`,
        `T: Promise.resolve(1)`,
        `T: Promise.reject('error').catch(()=>{})`,
        `F: null`,
        `F: void 0`,
        `F: 'a string'`,
        `F: 1234`,
        `F: {}`,
        `F: []`,
        `F: ['then']`,
        `F: Promise`,
        `F: {then: null}`,
        `T: {then: () => {}}`,
        `F: {then: {}}`,
        `F: {Then: () => {}}`,
        `T: {Then: () => {}, then: () => {}}`
    ];

    tests.forEach(test => {
        it(test, () => {
            let testVal = eval(`(${test.slice(3)})`);
            let expected = test[0] === 'T' ? true : false;
            let actual = isPromiseLike(testVal);
            expect(actual).equals(expected);
        });
    });
});
