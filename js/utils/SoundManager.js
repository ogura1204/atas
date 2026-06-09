export default class SoundManager {
    constructor() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.6;
            this.compressor = this.ctx.createDynamicsCompressor();
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);

            this.delay = this.ctx.createDelay();
            this.delay.delayTime.value = 0.3; 
            this.delayGain = this.ctx.createGain();
            this.delayGain.gain.value = 0.3; 
            this.delay.connect(this.delayGain);
            this.delayGain.connect(this.delay); 
            this.delayGain.connect(this.masterGain);

            this.bgmTimer = null;
            this.isPlayingBGM = false;
        } catch (e) {
            console.error("Web Audio APIがサポートされていません:", e);
        }
    }

    playSynth(freq, type, duration, vol, useDelay = false) {
        if (!this.ctx || this.ctx.state === 'suspended') return;
        let time = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let subOsc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        let filter = this.ctx.createBiquadFilter();

        osc.type = type; subOsc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        subOsc.frequency.setValueAtTime(freq * 1.01, time); 

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, time);
        filter.frequency.exponentialRampToValueAtTime(300, time + duration);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + duration * 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration); 

        osc.connect(filter); subOsc.connect(filter); filter.connect(gain);
        gain.connect(this.masterGain);
        if (useDelay) gain.connect(this.delay); 

        osc.start(time); subOsc.start(time);
        osc.stop(time + duration); subOsc.stop(time + duration);
    }

    playKick(time) {
        if (!this.ctx || this.ctx.state === 'suspended') return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.3);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.start(time); osc.stop(time + 0.3);
    }

    playBass(freq, time) {
        if (!this.ctx || this.ctx.state === 'suspended') return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        let filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.4);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        osc.start(time); osc.stop(time + 0.4);
    }

    playJump() { this.playSynth(400, 'sine', 0.4, 0.4, true); }
    playDash() { this.playSynth(800, 'triangle', 0.3, 0.4, true); }
    playRapid() { this.playSynth(1200, 'square', 0.1, 0.1); }
    playHeavy() { this.playSynth(150, 'sawtooth', 0.3, 0.6); }
    playEmpty() { this.playSynth(100, 'square', 0.1, 0.3); }
    playExplosion() { if(this.ctx) this.playKick(this.ctx.currentTime); this.playSynth(50, 'sawtooth', 0.8, 0.8, true); }
    playATAS() { this.playSynth(880, 'sine', 0.3, 0.5, true); setTimeout(() => this.playSynth(1760, 'sine', 0.6, 0.5, true), 150); }

    playStageBGM(stageLevel) {
        this.stopBGM();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlayingBGM = true;

        let tempo = 110; 
        let beatDuration = 60 / tempo; 
        let nextNoteTime = this.ctx.currentTime + 0.1;
        let beatCount = 0;

        let bassNotes = []; let synthNotes = [];
        if (stageLevel === 1) { bassNotes = [55, 61, 58, 65]; synthNotes = [440, 466, 415, 493]; } 
        else if (stageLevel === 2) { bassNotes = [65, 65, 73, 65]; synthNotes = [523, 587, 659, 523]; } 
        else { bassNotes = [55, 55, 65, 65]; synthNotes = [440, 523, 587, 659]; }

        const schedule = () => {
            if (!this.isPlayingBGM || !this.ctx) return;
            while (nextNoteTime < this.ctx.currentTime + 0.1) {
                if (beatCount % 2 === 0) this.playKick(nextNoteTime);
                if (beatCount % 2 === 1) {
                    let bassFreq = bassNotes[Math.floor(beatCount / 8) % bassNotes.length];
                    this.playBass(bassFreq, nextNoteTime);
                }
                if (beatCount % 8 === 0) {
                    let synthFreq = synthNotes[Math.floor(beatCount / 16) % synthNotes.length];
                    this.playSynth(synthFreq, 'sawtooth', 1.0, 0.2, true);
                }
                nextNoteTime += beatDuration / 2; 
                beatCount++;
            }
            this.bgmTimer = setTimeout(schedule, 25);
        };
        schedule();
    }

    stopBGM() {
        this.isPlayingBGM = false;
        if (this.bgmTimer) clearTimeout(this.bgmTimer);
    }
}
window.SM = new SoundManager();
