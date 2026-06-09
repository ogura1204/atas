import './SoundManager.js'; // ★ utilsフォルダではなく直下から読み込むように変更
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
    render: { antialias: true, pixelArt: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, TitleScene, PrologueScene, LabScene, Stage1, Stage2, Stage3, EpilogueScene]
};
const game = new Phaser.Game(config);import './utils/SoundManager.js';
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
    width: 1280,  // ★内部解像度をフルHD水準に引き上げ（高画質化）
    height: 720,
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 2500 }, // ★重力を従来の3倍にして「重み」を表現
            debug: false 
        } 
    },
    render: {
        antialias: true,       // ★画像のフチを滑らかにする高画質設定
        pixelArt: false        // ドット絵ではなく高解像度イラスト用にする
    },
    scale: { 
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH 
    },
    scene: [BootScene, TitleScene, PrologueScene, LabScene, Stage1, Stage2, Stage3, EpilogueScene]
};
const game = new Phaser.Game(config);
