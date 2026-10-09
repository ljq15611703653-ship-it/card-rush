import {analyze as baseAnalyze,type Card,type PokerPattern} from '../conveyor/rules';
export type {Card,PokerPattern};
export function analyze(cards:Card[]):PokerPattern{
 if(cards.length===2&&cards[0].rank===cards[1].rank)return {id:'pair',name:'对子',index:1,factor:1.2,volley:1,detail:'两张牌分别命中后弹射一次。'};
 const result=baseAnalyze(cards);
 if(cards.length<4&&result.id.includes('flush'))return baseAnalyze(cards.map((c,i)=>({...c,suit:i%4})));
 return result;
}
