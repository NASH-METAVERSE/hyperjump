
import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameConstans } from '../entity/GameConstans';
import { ClientEvent } from '../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = TrackSyncScale
 * DateTime = Wed Jan 19 2022 14:52:28 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = TrackSyncScale.ts
 * FileBasenameNoExtension = TrackSyncScale
 * URL = db://assets/script/function/TrackSyncScale.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 同步摄像机轨道线和轨道线的缩放
 */

@ccclass('TrackSyncScale')
export class TrackSyncScale extends Component {

    private _curScale: Vec3 = new Vec3(1, 1, 1);

    private track_z = 0;

    onEnable() {
        ClientEvent.on(GameConstans.CLIENTEVENT_CAMERA_LIST.SYNC_TRACK, this.onSyncTrack, this);
    }

    private onSyncTrack(camera_z: number) {
        this.node.children.forEach(child => {
            child.getScale(this._curScale);
            this.track_z = (camera_z - 10) / 55;
            if (this.track_z === 0) {
                this._curScale.y = 0.2;
                this._curScale.z = 0.2;
            } else if (this.track_z === 1) {
                this._curScale.y = 1;
                this._curScale.z = 1;
            } else {
                this._curScale.y = this.track_z * 0.8;
                this._curScale.z = this.track_z * 0.8;
            }
            child.setScale(this._curScale);
        });
    }

}

