export function cloneMatrix(matrix:any[][]) : any[][] {
    const clone:any[][] = new Array(matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        clone[i] = [...matrix[i]];
    }
    return clone;
}


export function hasDuplicatedNumbers(values: number[]): boolean {
    const valuesWithoutZero = values.filter(e => e !== 0);
    return new Set(valuesWithoutZero).size !== valuesWithoutZero.length;
}