import BaseStage from './BaseStage.js';

export default class Stage1 extends BaseStage {
    constructor() { super('Stage1'); }

    create() {
        // 広大なマップ用の地形データを生成
        let groundData = [];
        for (let i = 0; i < 10; i++) {
            groundData.push({ x: 400 + (i * 800), y: 700, key: 'ground', scale: 1 });
            // アスレチック的な足場をランダム配置
            groundData.push({ x: 800 + (i * 800), y: 550, key: 'platform' });
            groundData.push({ x: 1000 + (i * 800), y: 400, key: 'platform' });
        }

        // 雑魚敵を道中に大量配置
        let enemyData = [];
        for (let i = 1; i < 15; i++) {
            enemyData.push({ x: 600 * i, y: 500, key: 'enemy_base', hp: 5, speed: 100 });
        }

        this.setupStage({
            stageWidth: 8000, // ★ 従来の10倍の長さのステージ
            bgBack: 'bg1_back',  // 奥の背景
            bgMid: 'bg1_mid',    // 中間の背景
            title: 'STAGE 1: 表層インフラ (炎熱地帯)',
            platformsData: groundData,
            enemiesData: enemyData,
            
            // ★ ボス（HP500で長期戦。スピードも速い）
            bossData: { x: 7500, y: 400, key: 'boss1', hp: 500, speed: 200 },
            triggerX: 6800, // ボスエリアの手前
            
            dialogues: [
                "ナビ：前方から高熱源体反応を確認。",
                "ナビ：暴走した焼却システム「オーバーヒート・ファーネス」です。",
                "ナビ：装甲が非常に分厚いです。回避に専念しつつヘビーショットを叩き込んでください。"
            ],
            epilogueData: { stageId: 1, bossName: "オーバーヒート・ファーネス", reward: "【属性パーツ：炎】" }
        });
    }
}
