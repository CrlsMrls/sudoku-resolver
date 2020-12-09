
import Worker from "worker-loader!./resolver.worker";

import {cloneMatrix, hasDuplicatedNumbers} from './utils';

export const BOARD_SIZE: number = 9;

// no need to export this interface
interface BoardErrors {
    isError:boolean;
    pad: boolean[];
    col: boolean[];
    row: boolean[];
}

export class Board {
    private values: number[][];
    private userInput: boolean[][];
    public errors: BoardErrors;
    public numValues: number;
    
    constructor(cloneBoard: Board = null) {
        if(cloneBoard != null) {
            this.values = cloneMatrix(cloneBoard.values);
            this.userInput = cloneMatrix(cloneBoard.userInput);
            this.numValues = cloneBoard.numValues;
        } else {
            this.values = new Array(BOARD_SIZE);
            this.userInput = new Array(BOARD_SIZE);
            for (let i = 0; i < BOARD_SIZE; i++) {
                this.values[i] = new Array(BOARD_SIZE).fill(0);
                this.userInput[i] = new Array(BOARD_SIZE).fill(false);
                this.numValues = 0;
            }
        }

        this.errors = {
            isError: false,
            pad: new Array(BOARD_SIZE).fill(false), 
            col: new Array(BOARD_SIZE).fill(false), 
            row: new Array(BOARD_SIZE).fill(false), 
        }
    }

    static of(values: number[][], userInput:boolean[][]):Board {
        const newBoard = new Board();
        newBoard.values = cloneMatrix(values);
        newBoard.userInput = cloneMatrix(userInput);
        newBoard.updateInternalState();

        return newBoard;
    }

    static exampleInstance():Board {
        const board: Board  = new Board();

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                board.values[this.mapPad(col, row)][this.mapPos(col,row)] = this.mapPos(col, row) + 1;                
            }
        }

        return board;
    }

    static mapPad = (col: number, row: number) : number => Math.floor(col/3) + Math.floor(row/3)*3;
    static mapPos = (col: number, row: number) : number => col%3 + (row%3)*3;

    toString(): string {
        let str: string = '';

        for (let row = 0; row < 9; row++) {
            if(row%3===0) {
                str += '\n'
            }
            for (let col = 0; col < 9; col++) {
                const pad = Board.mapPad(col, row);
                const pos = Board.mapPos(col, row);
                
                if ( col%3===0) str += '|';
                str += ` ${this.getValue(pad, pos)} `;
            }
            str += '|\n'            
        }
        return str;
    }

    setValue(pad: number, pos: number, value: number = 0): Board {
        const newBoard = new Board(this);
        newBoard.values[pad][pos] = value;
        newBoard.userInput[pad][pos] = (value != 0);
        newBoard.updateInternalState();

        return newBoard;
    }

    getValue(pad: number, pos: number): number {
        return this.values[pad][pos];
    }

    isUserInput(pad: number, pos: number): boolean {
        return this.userInput[pad][pos];
    }

    resolve(): Promise<Board> {
        return new Promise<Board>( (resolve, rejectionFunc) => {
            
            const worker = new Worker();
            worker.postMessage({
                values: this.values,
                userInput: this.userInput
            });
            worker.onmessage = (event:any) => {
                const solution = new Board(this);
                worker.terminate();
                solution.values = event.data;
                solution.updateInternalState();
                resolve(solution);
            }
        });
    }

    private updateInternalState() {
        this.numValues = this.calculateNumValues();
        this.errors = this.getErrors();
    }

    private calculateNumValues():number {
        let sum: number = 0;
        this.values.forEach((values:number[]) => {
            const valuesWithoutZero = values.filter(e => e !== 0);
            sum += new Set(valuesWithoutZero).size;
        });

        return sum;
    }

    private getErrors():BoardErrors {
        const errors: BoardErrors = {
            isError: false,
            pad: new Array(BOARD_SIZE).fill(false), 
            col: new Array(BOARD_SIZE).fill(false), 
            row: new Array(BOARD_SIZE).fill(false), 
        }

        for(let i = 0; i < BOARD_SIZE; i++) {
            if(hasDuplicatedNumbers(this.values[i])) {
                errors.isError = true;
                errors.pad[i] = true;
            }
        }
        if(errors.isError) {
            // if pads have errors, show them first
            return errors;
        }

        for(let col = 0; col < BOARD_SIZE; col++) {
            const colValues:number[] = [];
            for(let row = 0; row < BOARD_SIZE; row++) {
                const pad = Board.mapPad(col, row);
                const pos = Board.mapPos(col, row);
                colValues.push(this.getValue(pad, pos));
            }
            if(hasDuplicatedNumbers(colValues)) {
                errors.isError = true;
                errors.col[col] = true;
            }
        }

        for(let row = 0; row < BOARD_SIZE; row++) {
            const rowValues:number[] = [];
            for(let col = 0; col < BOARD_SIZE; col++) {
                const pad = Board.mapPad(col, row);
                const pos = Board.mapPos(col, row);
                rowValues.push(this.getValue(pad, pos));
            }
            if(hasDuplicatedNumbers(rowValues)) {
                errors.isError = true;
                errors.row[row] = true;
            }
        }

        return errors;
    }

   
}