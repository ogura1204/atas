import BaseStage from './BaseStage.js';

export default class Stage3 extends BaseStage {
    constructor() { super('Stage3'); }

    create() {
        let groundData = [];
        for (let i = 0; i < 15; i++) {
            groundData.push({ x: 400 + (i * 600), y: 700, key: 'ground', scale: 1 });
            // ★ ダメージを受けるトゲ（hazard）を配置
            groundData.push({ x: 700 + (i * 600), y: 680, key: 'hazard', scale: 1 });
            groundData.push({ x: 700 + (i * 600), y: 500, key: 'platform', scale: 0.5 });
        }

        let enemyData = [];
        for (let i = 1; i < 20; i++) {
            // shooter（遠距離から弾を撃ってくる敵）を配置
            enemyData.push({ x: 400 * i, y: 600, key: 'enemy_base', hp: 5, speed: 80, type: 'shooter' });
        }

        this.setupStage({
            stageWidth: 8000, 
            bgBack: 'bg3_back', 
            bgMid: 'bg3_mid',
            title: 'STAGE 3: 廃棄物処理プラント (重力異常区画)',
            platformsData: groundData,
            enemiesData: enemyData,
            
            // ★ 超大型ボス（boss3）。動かず大量の弾を乱射する
            bossData: { x: 7600, y: 400, key: 'boss3', hp: 800, speed: 0, type: 'boss3' },
            triggerX: 6500,
            
            dialogues: [
                "ナビ：周囲の重力場に異常な偏りを確認。",
                "ナビ：超巨大廃棄物圧縮機「グラビティ・コンパクター」です。",
                "ナビ：弾幕が濃いです。ATASの「シールド展開」を活用して防いでください！"
            ],
            epilogueData: { stageId: 3, bossName: "グラビティ・コンパクター", reward: "【属性パーツ：重力】" }
        });
    }
}
