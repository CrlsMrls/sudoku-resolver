import {Subject, Observable} from 'rxjs';
import {Board} from './board';
import { Store } from './store';

export interface Position {
    pad: number;
    pos: number;
    row: number;
    col: number;
    num?: number;
}

export class Template {

    private clickSubject = new Subject<Position>();
    public onPadClicked$: Observable<Position> = this.clickSubject;
    private boardElement: HTMLDivElement;
    private selectedPosition: Position;
    private storeReference: Store;

    build(parentTag:string = 'body', store: Store) : void {
        
        this.storeReference = store;
        
        const parent = document.querySelector(parentTag);
        if (!parent) {
            throw new Error(`${parentTag} is not a valid tag`);
        }
        this.boardElement = this.generateBoard();
        parent.appendChild(this.boardElement);
        parent.appendChild(this.generateNumPad());
        parent.appendChild(this.generateButtons());

        document.addEventListener('keydown', (event:KeyboardEvent) => {
            if('1234567890'.includes(event.key) && this.selectedPosition != null) {
                this.numPadClicked(+event.key);
            }
        });

        store.onBoardChange$.subscribe((board:Board) => this.drawBoard(board));
        store.hasNext$.subscribe((hasNext: boolean) => this.disableButton('next', !hasNext));
        store.hasBack$.subscribe((hasBack: boolean) => this.disableButton('back', !hasBack));

    }

    private disableButton(buttonId:string, disable: boolean) {
        const button:HTMLButtonElement = this.boardElement.parentElement.querySelector(`.buttons__${buttonId}`);
        if (button != null ) {
            button.disabled = disable;
        }
    }

    private buttonClicked(button:string):void {
        switch (button) {
            case 'back':
                this.storeReference.back();
                break;
            case 'next':
                this.storeReference.next();
                break;
            case 'clean':
                this.storeReference.add(new Board());
                break;
            case 'resolve':
                this.storeReference.add(this.storeReference.getCurrent().resolve());
                break;
        }
        
    }

    private generateBoard():HTMLDivElement {
        const boardElement: HTMLDivElement = document.createElement('div');
        boardElement.classList.add('board');

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const pad = document.createElement('div');
                pad.classList.add('board__pad');
                pad.classList.add(`row-${row}`);
                pad.classList.add(`col-${col}`);
                pad.classList.add(`pad-${Board.mapPad(col, row)}`);
                pad.classList.add(`pos-${Board.mapPad(col, row)}-${Board.mapPos(col, row)}`);
                const position: Position = {
                    pad: Board.mapPad(col, row),
                    pos: Board.mapPos(col, row),
                    col,
                    row,
                }
                pad.addEventListener('click', () => this.boardPadClicked(position));
                boardElement.appendChild(pad);
            }
        }
        return boardElement;
    }

    private generateNumPad():HTMLDivElement {
        const numPad = document.createElement('div');
        numPad.classList.add('numbers');
        for (let num = 1; num <= 9; num++) {
            const pad = document.createElement('div');
            pad.classList.add('numbers__pad');
            pad.innerHTML = '' + num;
            pad.addEventListener('click', () => this.numPadClicked(num));
            numPad.appendChild(pad);
        }
        const remove =  document.createElement('div');
        remove.classList.add('numbers__pad');
        remove.addEventListener('click', () => this.numPadClicked(0));
        remove.innerHTML = ' ';
        numPad.appendChild(remove);
        return numPad;
    }
    
    private generateButtons():HTMLDivElement {
        const buttons = document.createElement('div');
        buttons.classList.add('buttons');

        ['back', 'next', 'clean', 'resolve'].forEach((text:string) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerHTML = text;
            // button.disabled = true;
            button.className = `buttons__${text}`;
            button.addEventListener('click', () => this.buttonClicked(text));
            buttons.appendChild(button);
        });
        
        return buttons;
    }

    private numPadClicked(newNumber:number): void {
        this.selectedPosition.num = newNumber;
        this.clickSubject.next(this.selectedPosition);
        this.selectedPosition = null;
        this.boardElement.querySelectorAll('.board__pad').forEach((pad: Element) => pad.classList.remove('board__pad--selected'));
        this.boardElement.parentElement.querySelector('.numbers').classList.remove('numbers--visible');
    }

    private boardPadClicked(position:Position): void {
        // show numberBoard
        this.boardElement.parentElement.querySelector('.numbers').classList.add('numbers--visible');
        // deselect all and select the clicked position
        this.boardElement.querySelectorAll('.board__pad').forEach((pad: Element) => pad.classList.remove('board__pad--selected'));
        this.boardElement.querySelector(`.pos-${position.pad}-${position.pos}`).classList.add('board__pad--selected')
        this.selectedPosition = position;
    }

    drawBoard(board: Board) {
        // un bold all numbers
        this.boardElement.querySelectorAll('.board__pad').forEach((pad: Element) => pad.classList.remove('board__pad--bold'));
        for (let col = 0; col < 9; col++) {
            for (let row = 0; row < 9; row++) {
                const pad = Board.mapPad(col, row);
                const pos = Board.mapPos(col, row);
                const padElement = this.boardElement.querySelector(`.pos-${pad}-${pos}`);
                padElement.innerHTML = ( board.getValue(pad, pos) > 0) ? '' + board.getValue(pad, pos) : '';
                if( board.isUserInput(pad, pos)) {
                    padElement.classList.add('board__pad--bold');
                }
            }
        }

        // remove all error marks and then highlight errors on pads, columns and rows
        this.boardElement.querySelectorAll('.board__pad').forEach((pad: Element) => pad.classList.remove('board__pad--error'));
        if(board.errors.isError) {
            for (let pad = 0; pad < 9; pad++) {
                if(board.errors.pad[pad]) {
                    this.boardElement.querySelectorAll(`.pad-${pad}`).forEach((pad: Element) => pad.classList.add('board__pad--error'));
                }
            }
            for (let col = 0; col < 9; col++) {
                if(board.errors.col[col]) {
                    this.boardElement.querySelectorAll(`.col-${col}`).forEach((pad: Element) => pad.classList.add('board__pad--error'));
                }
            }
            for (let row = 0; row < 9; row++) {
                if(board.errors.row[row]) {
                    this.boardElement.querySelectorAll(`.row-${row}`).forEach((pad: Element) => pad.classList.add('board__pad--error'));
                }
            }
        }

        // update clean button
        this.disableButton('clean', board.numValues === 0);

        // only show resolve if num values > 17 and not complete
        // https://cs.stackexchange.com/questions/163/minimum-number-of-clues-to-fully-specify-any-sudoku
        this.disableButton('resolve', board.numValues < 7 || board.numValues === 81);
    }


}