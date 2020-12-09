import {cloneMatrix, hasDuplicatedNumbers} from '../utils';

describe('cloneMatrix', () => {
    test('modifying the original matrix does not affect the cloned', () => {
        const original = [[1,2,3,4],[5,6,7,8]];
        const cloned = cloneMatrix(original);
        
        expect(original[0][0]).toBe(1);
        expect(original[0][1]).toBe(2);
        expect(original[0][2]).toBe(3);

        original[0][0] = 0;
        original[0][1] = 0;
        original[0][2] = 0;
        
        expect(original[0][0]).toBe(0);
        expect(original[0][1]).toBe(0);
        expect(original[0][2]).toBe(0);

        expect(cloned[0][0]).toBe(1);
        expect(cloned[0][1]).toBe(2);
        expect(cloned[0][2]).toBe(3);
    });

    test('cloned matrix is same size as original', () => {
        const original = [[1,2,3,4],[5,6,7,8]];
        const cloned = cloneMatrix(original);
        
        expect(cloned.length).toBe(original.length);
        expect(cloned[0].length).toBe(original[0].length);
        expect(cloned[1].length).toBe(original[1].length);
    });

    test('cloned matrix is not the same matrix as original', () => {
        const original = [[1,2,3,4],[5,6,7,8]];
        const cloned = cloneMatrix(original);
        
        expect(cloned).not.toBe(original);
    });
});

describe('hasDuplicatedNumbers', () => {
    test('detects duplicates', () => {
        const array = [1,2,3,4,1];
        expect(hasDuplicatedNumbers(array)).toBeTruthy();
    });
    
    test('returns false if not duplicates', () => {
        const array = [1,2,3,4,5,6,7,8,9];
        expect(hasDuplicatedNumbers(array)).toBeFalsy();
    });

    test('does not consider zero', () => {
        const array = [1,2,3,4,5,6,7,8,9,0,0,0,0,0,0,0,0];
        expect(hasDuplicatedNumbers(array)).toBeFalsy();
    });
});

