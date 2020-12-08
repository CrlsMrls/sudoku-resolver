import { Board } from "./board";
import {BehaviorSubject, Observable} from 'rxjs';

export class Store {
    
    private stack:Board[];
    private position: number;

    private boardSubject: BehaviorSubject<Board>;
    public onBoardChange$: Observable<Board>;

    private hasNext: BehaviorSubject<boolean>;
    public hasNext$: Observable<boolean>;
    private hasBack: BehaviorSubject<boolean>;
    public hasBack$: Observable<boolean>;


    constructor(board:Board) {
        this.stack = [board];
        this.position = 0;
        this.boardSubject = new BehaviorSubject<Board>(board);
        this.onBoardChange$ = this.boardSubject;

        this.hasNext = new BehaviorSubject<boolean>(false);
        this.hasNext$ = this.hasNext;
        this.hasBack = new BehaviorSubject<boolean>(false);
        this.hasBack$ = this.hasBack;
    }

    getCurrent(): Board {
        return this.stack[this.position];
    }

    add(board:Board):void {
        this.position++;
        // remove all boards after position
        this.stack = this.stack.slice(0, this.position);

        this.stack.push(board);
        this.boardSubject.next(board);
        this.hasBack.next(true);
        this.hasNext.next(false);
    }

    back():void {
        if(this.position === 0 ) {
            throw new Error('Store says back is not possible');
        }        
        this.position--;
        this.boardSubject.next(this.stack[this.position]);
        
        // moving back theres is always one next, but if this is the first has no back
        this.hasNext.next(true);
        if(this.position === 0) {
            this.hasBack.next(false);
        }
    }

    next():void {
        if(this.position+1 === this.stack.length ) {
            throw new Error('Store says next is not possible');
        }
        this.position++;
        this.boardSubject.next(this.stack[this.position]);
        
        // moving next theres is always one back, but if this is the last has no next
        this.hasBack.next(true);
        if( this.position+1 === this.stack.length ) {
            this.hasNext.next(false);
        }
    }


}