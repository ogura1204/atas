import BaseStage from './BaseStage.js';
export default class Stage2 extends BaseStage {
    constructor() { super('Stage2'); }
    create() {
        this.setupStage({
            bgKey: 'bg2', title: 'STAGE 2: 交通管制ターミナル',
            platformsData: [ { x: 400, y: 425, key: 'ground' }, { x: 300, y: 320, key: 'platform' }, { x: 300, y: 150, key: 'platform' }, { x: 600, y: 250, key: 'platform' } ],
            enemiesData: [ { x: 300, y: 250, key: 'enemy_base', hp: 3, speed: 50 }, { x: 600, y: 150, key: 'enemy_base', hp: 3, speed: 50 } ],
            bossData: { x: 750, y: 300, key: 'boss2', hp: 40, speed: 80 },
            triggerX: 650,
            dialogues: [ "ナビ：管制ターミナルの異常な過負荷（サージ）を検知。", "ナビ：システム「サージ・トラフィッカー」が雷の属性を持って暴走しています。", "ナビ：動きが速いです。ジャンプで立体的に回避してください。" ],
            epilogueData: { stageId: 2, bossName: "サージ・トラフィッカー", reward: "【タイミング：ヘビー発射時 / 行動：属性弾発射】" }
        });
    }
}
