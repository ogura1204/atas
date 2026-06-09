import BaseStage from './BaseStage.js';
export default class Stage3 extends BaseStage {
    constructor() { super('Stage3'); }
    create() {
        this.setupStage({
            bgKey: 'bg3', title: 'STAGE 3: 廃棄物処理プラント',
            platformsData: [ { x: 400, y: 425, key: 'ground' }, { x: 150, y: 300, key: 'platform' }, { x: 400, y: 200, key: 'platform' }, { x: 650, y: 100, key: 'platform' } ],
            enemiesData: [ { x: 400, y: 100, key: 'enemy_base', hp: 3, speed: 50 }, { x: 400, y: 350, key: 'enemy_base', hp: 3, speed: 50 }, { x: 700, y: 350, key: 'enemy_base', hp: 3, speed: 50 } ],
            bossData: { x: 650, y: 50, key: 'boss3', hp: 50, speed: 30 },
            triggerX: 600,
            dialogues: [ "ナビ：周囲の重力場に異常な偏りを確認。", "ナビ：廃棄物圧縮機「グラビティ・コンパクター」です。", "ナビ：この階層（Tier 1）最後のバグです。解体し、コードを抽出してください！" ],
            epilogueData: { stageId: 3, bossName: "グラビティ・コンパクター", reward: "【属性パーツ：重力】" }
        });
    }
}
