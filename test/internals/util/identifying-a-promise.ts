// tslint:disable:no-eval
import {expect} from 'chai';
import {isPromise} from 'multimethods/internals/util';





describe('Identifying a Promise', () => {

    let tests = [
        `T: new Promise(res => {})`,
        `T: Promise.resolve(1)`,
        `T: Promise.reject('error').catch(()=>{})`,
        `F: null`,
        `F: undefined`,
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
        `T: {Then: () => {}, then: () => {}}`,
    ];

    tests.forEach(test => {
        it(test, () => {
            let testVal = eval(`(${test.slice(3)})`);
            let expected = test[0] === 'T' ? true : false;
            let actual = isPromise(testVal);
            expect(actual).equals(expected);
        });
    });
});
