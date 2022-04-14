
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = UserProfile
 * DateTime = Thu Dec 09 2021 14:27:45 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = UserProfile.ts
 * FileBasenameNoExtension = UserProfile
 * URL = db://assets/script/entity/UserProfile.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface UserProfile {
    username: string;
    mineral: number;
    shipCount: number;
    solarCount: number;
}

