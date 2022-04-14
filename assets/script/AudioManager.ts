
import { _decorator, Component, Node, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = AudioManager
 * DateTime = Wed Apr 06 2022 15:44:16 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = AudioManager.ts
 * FileBasenameNoExtension = AudioManager
 * URL = db://assets/script/AudioManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('AudioManager')
export class AudioManager extends Component {

    private audioSource: AudioSource = null;

    start() {
        this.audioSource = this.node.getComponent(AudioSource);
        this.playAudio();
    }

    private playAudio() {
        this.audioSource.play();
    }
}
