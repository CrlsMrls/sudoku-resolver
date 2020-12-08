import './styles/index.scss'
import { Board } from './board';
import {Template, Position} from './template';
import { Store } from './store';

let board:Board = new Board();
let store:Store = new Store(new Board());

const template = new Template();
template.build('#board-placeholder', store);

template.onPadClicked$.subscribe(updateBoard);


// template.drawBoard(board);


function updateBoard(position:Position): void {
    store.add(store.getCurrent().setValue(position.pad, position.pos, position.num));
    // template.drawBoard(board);
    console.log(position);
}

