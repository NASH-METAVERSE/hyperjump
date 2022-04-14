
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = AttackReport
 * DateTime = Thu Dec 09 2021 14:27:45 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = UserProfile.ts
 * FileBasenameNoExtension = UserProfile
 * URL = db://assets/script/entity/UserProfile.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface AttackReport {

    /**
    * 攻击方策略
    */
    attackStrategy: string;

    /**
     * 被攻击方策略
     */
    attackedStrategy: string;

    /**
     * 战斗结果(0失败1成功)
     */
    processorAttack: number;

    /*
     * 奖励
     */
    reward: number;

    /**
     * 完全冷却时间 (单位: s)
     */
    fullCoolingTime: number;

    /**
     * 战斗冷却时间 (单位: s)
     */
    attackCoolingTime: number;

}

