import * as Images from "./index";

const bombs ={};
for(let i =0; i<9; i++) bombs[i]=Images['b'+i];
bombs.bomb = Images.bomb;
bombs['this-mine'] = Images.bomb;
bombs['bomb-false'] = Images.bombFalse;
bombs['flag'] = Images.flag;
export default bombs;