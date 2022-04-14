

/**
 * Predefined variables
 * Name = ShipLogInfo
 * DateTime = Thu Feb 24 2022 16:58:51 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipLogInfo.ts
 * FileBasenameNoExtension = ShipLogInfo
 * URL = db://assets/script/entity/ShipLogInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

export interface ShipLogInfo {

    /*
    * 飞船编码
    */
    shipCode: string;

    /*
     * 飞船所在星球
     */
    planetCode: string;

    /*
     * 飞船操作类型(0闲置1跃迁2攻击3受击)
     */
    shipOperate: string;

    /*
     * 目标对象
     */
    target: string;

    /*
     * 星球资源
     */
    planetMineral: string;

    /*
     * 星球占领者
     */
    planetOwner: string;

    /*
     * 飞行或跃迁时间
     */
    costTime: number;

    /*
     * 采集数量
     */
    totalCollect: number;

    /*
     * 日志结果
     */
    result: string;

}
