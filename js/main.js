import './SoundManager.js';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import PrologueScene from './scenes/PrologueScene.js';
import LabScene from './scenes/LabScene.js';
import Stage1 from './scenes/Stage1.js';
import Stage2 from './scenes/Stage2.js';
import Stage3 from './scenes/Stage3.js';
import EpilogueScene from './scenes/EpilogueScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280, 
    height: 720,
    physics: { default: 'arcade', arcade: { gravity: { y: 2500 }, debug: false } },
    // ★ ドット絵をクッキリ表示する最高画質設定（アンチエイリアスOFF、ピクセルアートON）
    render: { antialias: false, pixelArt: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, TitleScene, PrologueScene, LabScene, Stage1, Stage2, Stage3, EpilogueScene]
};
const game = new Phaser.Game(config);
