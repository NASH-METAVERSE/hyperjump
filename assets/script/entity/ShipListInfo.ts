
import { _decorator, Component, Node } from 'cc';
import { ShipListDetail } from './ShipListDetail';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipListInfo
 * DateTime = Mon Nov 22 2021 16:31:25 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipListInfo.ts
 * FileBasenameNoExtension = ShipListInfo
 * URL = db://assets/script/entity/ShipListInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 飞船列表信息
 */

export interface ShipListInfo {

    /*
    * 当前页页码
    */
    pageNum: number;

    /*
     * 页面数量
     */
    pageSize: number;

    /*
     * 总页数
     */
    totalPage: number;

    /*
     * 总条数
     */
    totalCount: number;

    /*
     * 飞船信息
     */
    shipListInfos: ShipListDetail[];

}

