import BaseStage from './BaseStage.js';
export default class Stage1 extends BaseStage {
    constructor() { super('Stage1'); }
    create() {
        this.setupStage({
            bgKey: 'bg1', title: 'STAGE 1: 表層インフラ',
            platformsData: [ { x: 400, y: 425, key: 'ground' }, { x: 600, y: 320, key: 'platform' }, { x: 200, y: 250, key: 'platform' }, { x: 750, y: 150, key: 'platform' } ],
            enemiesData: [ { x: 400, y: 350, key: 'enemy_base', hp: 3, speed: 50 }, { x: 600, y: 200, key: 'enemy_base', hp: 3, speed: 50 } ],
            bossData: { x: 750, y: 100, key: 'boss1', hp: 30, speed: 20 },
            triggerX: 650,
            dialogues: [ "ナビ：前方から高熱源体反応を確認。", "ナビ：暴走した焼却システム「オーバーヒート・ファーネス」です。", "ナビ：炎の散布に注意し、隙を見てヘビーショットを叩き込んでください。" ],
            epilogueData: { stageId: 1, bossName: "オーバーヒート・ファーネス", reward: "【属性パーツ：炎】" }
        });
    }
}
