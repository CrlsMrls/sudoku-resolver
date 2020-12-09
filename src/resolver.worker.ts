const ctx: Worker = self as any;
ctx.addEventListener("message", (event) => resolveSudoku(event.data.values, event.data.userInput, 0));
let isResolved = false;

function resolveSudoku(partial: number[][], userInput:boolean[][], num:number) {
    if(isResolved) {
        // real sudoku's have only one solution. Prevent boards that go beyond that limit
        // idea, let the user kill the worker (i.e. worker.terminate())
        return;
    }
    if(num === 81) {
        isResolved = true;
        ctx.postMessage(partial);
        return;
    }
    const col = num%9;
    const row = Math.floor(num/9);
    const pad = mapPad(col, row);
    const pos = mapPos(col, row);
    
    if(!userInput[pad][pos]) {
        for(let i  = 1; i <= 9; i++) {
            partial[pad][pos] = i;
            if (!hasErrors(partial)) {
                resolveSudoku(partial, userInput, num+1);
            }
            partial[pad][pos] = 0;
        }
    } else {
        resolveSudoku(partial, userInput, num+1);
    }                
}


function hasErrors(values: number[][]):boolean {

    for(let i = 0; i < 9; i++) {
        if(hasDuplicatedNumbers(values[i])) {
            return true;
        }
    }
    
    for(let col = 0; col < 9; col++) {
        const colValues:number[] = [];
        for(let row = 0; row < 9; row++) {
            const pad = mapPad(col, row);
            const pos = mapPos(col, row);
            colValues.push(values[pad][pos]);
        }
        if(hasDuplicatedNumbers(colValues)) {
            return true;
        }
    }

    for(let row = 0; row < 9; row++) {
        const rowValues:number[] = [];
        for(let col = 0; col < 9; col++) {
            const pad = mapPad(col, row);
            const pos = mapPos(col, row);
            rowValues.push(values[pad][pos]);
        }
        if(hasDuplicatedNumbers(rowValues)) {
            return true;
        }
    }

    return false;
}


////// These methods do not belong there, but webpack does not compile the worker if import/require from different file
const mapPad = (col: number, row: number) : number => Math.floor(col/3) + Math.floor(row/3)*3;
const mapPos = (col: number, row: number) : number => col%3 + (row%3)*3;


function hasDuplicatedNumbers(values: number[]): boolean {
    const valuesWithoutZero = values.filter(e => e !== 0);
    return new Set(valuesWithoutZero).size !== valuesWithoutZero.length;
};

