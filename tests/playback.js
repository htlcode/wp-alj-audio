const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let checks = 0;
function check(actual, expected, label) {
    assert.equal(actual, expected, label);
    checks++;
}
class Element {
    constructor(attributes = {}) {
        this.attributes = attributes;
        this.listeners = new Map();
        this.hidden = true;
        this.disabled = false;
        this.style = { setProperty() {} };
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    click() {
        const callback = this.listeners.get('click');
        callback();
    }
}
function makeRoot(mode) {
    const attributes = { 'data-audioclip-src': 'https://example.test/test.mp3', 'data-audioclip-mode': mode };
    const root = new Element(attributes);
    const label = { 'data-audioclip-label': 'Écouter la phrase' };
    root.playButton = new Element(label);
    root.toggle = new Element();
    root.panel = new Element();
    const rates = { 'data-audioclip-normal-rate': '1', 'data-audioclip-slow-rate': '0.7' };
    root.speed = new Element(rates);
    root.querySelector = (selector) => {
        if (selector === 'audio') { return null; }
        if (selector === '.audioclip_play') { return root.playButton; }
        if (mode === 'light') { return null; }
        if (selector === '.audioclip_toggle') { return root.toggle; }
        if (selector === '.audioclip_panel') { return root.panel; }
        return root.speed;
    };
    return root;
}
const audios = [];
class Audio {
    constructor(source) {
        this.source = source;
        this.paused = true;
        this.currentTime = 0;
        this.readyState = 3;
        this.HAVE_FUTURE_DATA = 3;
        this.listeners = new Map();
        audios.push(this);
    }
    addEventListener(name, callback) {
        let callbacks = this.listeners.get(name);
        if (callbacks === undefined) { callbacks = []; }
        callbacks.push(callback);
        this.listeners.set(name, callbacks);
    }
    emit(name) {
        const callbacks = this.listeners.get(name) ?? [];
        callbacks.forEach(callback => callback());
    }
    play() {
        this.paused = false;
        this.emit('play');
        return Promise.resolve();
    }
    pause() {
        this.paused = true;
        this.emit('pause');
    }
}
const first = makeRoot('light');
const second = makeRoot('light');
const full = makeRoot(null);
const roots = [first, second, full];
const document = { readyState: 'complete', querySelectorAll() { return roots; } };
const scriptPath = path.join(__dirname, '../js/public.js');
const source = fs.readFileSync(scriptPath, 'utf8');
const environment = { document, Audio, requestAnimationFrame() { return 1; } };
vm.runInNewContext(source, environment);
check(audios.length, 0, 'Audio remains unloaded before a click');
first.playButton.click();
check(audios.length, 1, 'Click creates one audio');
check(audios[0].playbackRate, 1, 'Compact playback stays at normal speed');
check(first.playButton.attributes['aria-pressed'], 'true', 'Playing state is announced');
audios[0].currentTime = 0.5;
first.playButton.click();
check(audios[0].paused, true, 'Second click stops compact playback');
check(audios[0].currentTime, 0, 'Stopping resets compact playback');
first.playButton.click();
second.playButton.click();
check(audios[0].paused, true, 'Starting another compact player stops the first');
check(audios[1].paused, false, 'Second compact player starts');
full.toggle.click();
check(audios[1].paused, true, 'Full player stops compact playback');
check(full.panel.hidden, false, 'Full player still opens its panel');
full.speed.click();
check(audios[2].playbackRate, 0.7, 'Full player retains slow playback');
first.playButton.click();
check(audios[2].paused, true, 'Compact player stops full playback');
check(full.panel.hidden, true, 'Stopped full player closes its panel');
audios[0].paused = true;
audios[0].emit('ended');
check(first.playButton.attributes['aria-pressed'], 'false', 'Finished audio restores play state');
audios[0].emit('error');
check(first.playButton.disabled, true, 'Failed audio disables its button');
check(first.playButton.attributes['aria-label'], 'Audio indisponible', 'Failure is accessible');
const nativeRoot = makeRoot('light');
const nativeAudio = new Audio('https://example.test/native.mp3');
const previousQuery = nativeRoot.querySelector;
nativeRoot.querySelector = (selector) => {
    if (selector === 'audio') { return nativeAudio; }
    return previousQuery(selector);
};
roots.splice(0, roots.length, nativeRoot);
const constructedBefore = audios.length;
vm.runInNewContext(source, environment);
nativeRoot.playButton.click();
check(audios.length, constructedBefore, 'Native audio is reused without creating another player');
check(nativeAudio.paused, false, 'Native audio plays through the common engine');
const message = `${checks} playback checks passed`;
console.log(message);
