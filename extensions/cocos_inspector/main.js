'use strict';
const _0x1b94 = [
    'config.jso',
    'KSWoq',
    'KIOnQ',
    '14403FtPsBf',
    ':focusAsse',
    'd.js',
    'URDbk',
    'ZYGes',
    'parse',
    'NfIgP',
    'setMenuBar',
    'bZmyO',
    'esXCx',
    'webContent',
    'executeJav',
    'removeAllL',
    'server',
    'electron',
    'index_low_',
    'disableWeb',
    'Visibility',
    'vYaTD',
    '308667VDGwyu',
    'file://',
    'error',
    'node',
    'IXXOR',
    'setMenu',
    'ector\x20v',
    'de(',
    'OkLev',
    'Message',
    'Cocos\x20Insp',
    'v.switchMo',
    'version',
    'aScript',
    'Sec',
    '?port=',
    '&mode=',
    '1bCaVGL',
    'ch-asset',
    'mainPreloa',
    'unselect',
    './package.',
    '3HvZvlc',
    'loadURL',
    'onfig.json',
    'exports',
    '../cocos-i',
    'path',
    'csdsU',
    'ready-to-s',
    'tbYZb',
    '223992XAGlgr',
    'kJFHw',
    'json',
    'index.html',
    'broadcast',
    'laeKi',
    'Selection',
    'getSelecte',
    'mEHfW',
    'request',
    '198918VbjOdz',
    '65141dUwugR',
    'show',
    'query-port',
    'existsSync',
    'IZufF',
    'utf-8',
    'nspector-c',
    'isteners',
    '1BhSWlc',
    'versions',
    'electron.h',
    'MnIzW',
    'XCIvL',
    ':focusNode',
    'tml',
    'Owerp',
    'ui-kit:tou',
    'how',
    'readFileSy',
    'closed',
    '#2e2c29',
    'split',
    'PzMpZ',
    'select',
    '172369BwvQdq',
    'asset',
    'Tjbeq',
    'name',
    'process',
    '84690hVHreM',
    'join'
];
const _0xacce06 = _0x3581;
(function (_0x44bfdb, _0x5d5332) {
    const _0x4eb049 = _0x3581;
    while (!![]) {
        try {
            const _0x4e027b = parseInt(_0x4eb049(0xfd)) + parseInt(_0x4eb049(0x102)) * -parseInt(_0x4eb049(0xcc)) + parseInt(_0x4eb049(0xb6)) + parseInt(_0x4eb049(0xe8)) * parseInt(_0x4eb049(0xf8)) + parseInt(_0x4eb049(0xc7)) * parseInt(_0x4eb049(0xe0)) + -parseInt(_0x4eb049(0xdf)) + -parseInt(_0x4eb049(0xd5));
            if (_0x4e027b === _0x5d5332)
                break;
            else
                _0x44bfdb['push'](_0x44bfdb['shift']());
        } catch (_0x39179f) {
            _0x44bfdb['push'](_0x44bfdb['shift']());
        }
    }
}(_0x1b94, -0x47c6b + 0x11 * 0x22bd + 0x4b16a));
const {BrowserWindow, app, remote, ipcMain, Menu} = require(_0xacce06(0xb1)), path = require(_0xacce06(0xd1)), pcs = require(_0xacce06(0xfc)), folder = '', devTools = ![];
let win, mode = -0x8ed * 0x4 + -0xe8a + 0x323e, unloaded = ![];
const PKG_NAME = require(_0xacce06(0xcb) + _0xacce06(0xd7))[_0xacce06(0xfb)], PKG_VERSION = require(_0xacce06(0xcb) + _0xacce06(0xd7))[_0xacce06(0xc2)];
let fs = require('fs'), _configPath = path[_0xacce06(0xfe)](__dirname, _0xacce06(0xff) + 'n'), __parentConfig = path[_0xacce06(0xfe)](__dirname, _0xacce06(0xd0) + _0xacce06(0xe6) + _0xacce06(0xce));
function _0x3581(_0xf0c012, _0x113961) {
    _0xf0c012 = _0xf0c012 - (0x50b + -0x2 * 0x59 + -0x3af * 0x1);
    let _0x49b59f = _0x1b94[_0xf0c012];
    return _0x49b59f;
}
function readConfig() {
    const _0x2b4826 = _0xacce06, _0x4d097a = { 'NfIgP': _0x2b4826(0xe5) };
    let _0x492a2f = '';
    return fs[_0x2b4826(0xe3)](__parentConfig) ? _0x492a2f = fs[_0x2b4826(0xf2) + 'nc'](__parentConfig, { 'encoding': _0x4d097a[_0x2b4826(0x108)] }) : _0x492a2f = fs[_0x2b4826(0xf2) + 'nc'](_configPath, { 'encoding': _0x4d097a[_0x2b4826(0x108)] }), JSON[_0x2b4826(0x107)](_0x492a2f);
}
let disableWebSec = Boolean(readConfig()[_0xacce06(0xb3) + _0xacce06(0xc4)]);
module[_0xacce06(0xcf)] = {
    async 'load'() {
        const _0x17f8fc = _0xacce06;
        ipcMain['on'](PKG_NAME + _0x17f8fc(0xed), focusNode), ipcMain['on'](PKG_NAME + (_0x17f8fc(0x103) + 't'), focusAsset);
    },
    'unload'() {
        const _0x3c424b = _0xacce06;
        unloaded = !![], ipcMain[_0x3c424b(0xaf) + _0x3c424b(0xe7)](PKG_NAME + _0x3c424b(0xed)), ipcMain[_0x3c424b(0xaf) + _0x3c424b(0xe7)](PKG_NAME + (_0x3c424b(0x103) + 't'));
    },
    'methods': {
        'previewMode'() {
            const _0x1ea328 = _0xacce06, _0x237346 = {
                    'Tjbeq': function (_0x7d5e6e, _0x1f36f2) {
                        return _0x7d5e6e(_0x1f36f2);
                    }
                };
            if (unloaded)
                return;
            _0x237346[_0x1ea328(0xfa)](tryShowWindow, 0x19d2 + -0x14f * 0x6 + -0x11f8);
        },
        'buildMobileMode'() {
            const _0x473c8f = _0xacce06, _0x34b6bb = {
                    'mEHfW': function (_0x1c92db, _0x1b8d10) {
                        return _0x1c92db(_0x1b8d10);
                    }
                };
            if (unloaded)
                return;
            _0x34b6bb[_0x473c8f(0xdd)](tryShowWindow, 0x2e9 * -0xb + 0x373 * 0x1 + 0x1c91);
        },
        'buildDesktopMode'() {
            const _0x1293b8 = _0xacce06, _0x543569 = {
                    'laeKi': function (_0x424e98, _0x1989ea) {
                        return _0x424e98(_0x1989ea);
                    }
                };
            if (unloaded)
                return;
            _0x543569[_0x1293b8(0xda)](tryShowWindow, 0x552 + 0x9db + 0x287 * -0x6);
        },
        'openCustomPage'() {
            const _0x4e75bf = _0xacce06, _0x508388 = {
                    'KSWoq': function (_0x36e123, _0x1cf80a) {
                        return _0x36e123(_0x1cf80a);
                    }
                };
            if (unloaded)
                return;
            _0x508388[_0x4e75bf(0x100)](tryShowWindow, -0xa0c * 0x3 + -0xd + 0x1e33);
        }
    }
};
function focusNode(_0x32b896, _0x4cb44f) {
    const _0x5ca218 = _0xacce06, _0x4c34ca = { 'vYaTD': _0x5ca218(0xb9) };
    let _0x458408 = Editor[_0x5ca218(0xdb)][_0x5ca218(0xdc) + 'd'](_0x4c34ca[_0x5ca218(0xb5)]);
    Editor[_0x5ca218(0xdb)][_0x5ca218(0xca)](_0x4c34ca[_0x5ca218(0xb5)], _0x458408), Editor[_0x5ca218(0xdb)][_0x5ca218(0xf7)](_0x4c34ca[_0x5ca218(0xb5)], _0x4cb44f);
}
function focusAsset(_0x54750c, _0x37e952) {
    const _0x254429 = _0xacce06, _0x59b9f0 = {
            'OkLev': _0x254429(0xf0) + _0x254429(0xc8),
            'kJFHw': _0x254429(0xf9)
        };
    Editor[_0x254429(0xbf)][_0x254429(0xd9)](_0x59b9f0[_0x254429(0xbe)], _0x37e952);
    let _0x40f1d8 = Editor[_0x254429(0xdb)][_0x254429(0xdc) + 'd'](_0x59b9f0[_0x254429(0xd6)]);
    Editor[_0x254429(0xdb)][_0x254429(0xca)](_0x59b9f0[_0x254429(0xd6)], _0x40f1d8), Editor[_0x254429(0xdb)][_0x254429(0xf7)](_0x59b9f0[_0x254429(0xd6)], _0x37e952);
}
async function showWindow() {
    const _0x27c954 = _0xacce06, _0x5b3ecc = {
            'bZmyO': function (_0x12bd08, _0x19d2b1) {
                return _0x12bd08 + _0x19d2b1;
            },
            'ZYGes': _0x27c954(0xc0) + _0x27c954(0xbc),
            'tbYZb': _0x27c954(0xf4),
            'URDbk': _0x27c954(0xd3) + _0x27c954(0xf1),
            'IZufF': _0x27c954(0xf3),
            'esXCx': function (_0x3d731f, _0x104daa) {
                return _0x3d731f >= _0x104daa;
            },
            'IXXOR': _0x27c954(0xb0),
            'PzMpZ': _0x27c954(0xe2),
            'MnIzW': function (_0x3cb1bb, _0x3d4661) {
                return _0x3cb1bb + _0x3d4661;
            },
            'Owerp': function (_0x44b13d, _0xeea57c) {
                return _0x44b13d + _0xeea57c;
            },
            'csdsU': _0x27c954(0xc5),
            'KIOnQ': _0x27c954(0xc6)
        };
    if (win) {
        win[_0x27c954(0xe1)](), win[_0x27c954(0xad) + 's'][_0x27c954(0xae) + _0x27c954(0xc3)](_0x27c954(0xc1) + _0x27c954(0xbd) + mode + ')');
        return;
    }
    win = new BrowserWindow({
        'minWidth': 0x36e,
        'minHeight': 0x258,
        'width': 0x36e,
        'height': 0x258,
        'title': _0x5b3ecc[_0x27c954(0xab)](_0x5b3ecc[_0x27c954(0x106)], PKG_VERSION),
        'backgroundColor': _0x5b3ecc[_0x27c954(0xd4)],
        'useContentSize': ![],
        'autoHideMenuBar': !![],
        'webPreferences': {
            'enablePreferredSizeMode': !![],
            'preferredSizeMode': !![],
            'webviewTag': !![],
            'nodeIntegration': !![],
            'nodeIntegrationInSubFrames': !![],
            'enableRemoteModule': !![],
            'sandbox': ![],
            'devTools': devTools,
            'contextIsolation': ![],
            'webSecurity': !disableWebSec,
            'preload': path[_0x27c954(0xfe)](__dirname, folder + (_0x27c954(0xc9) + _0x27c954(0x104)))
        }
    });
    try {
        win[_0x27c954(0xbb)](null), win[_0x27c954(0xaa) + _0x27c954(0xb4)](![]);
    } catch (_0x444370) {
    }
    win['on'](_0x5b3ecc[_0x27c954(0x105)], () => win[_0x27c954(0xe1)]()), win['on'](_0x5b3ecc[_0x27c954(0xe4)], () => {
        win = null;
    });
    let _0x3ee36b = folder + (_0x27c954(0xb2) + _0x27c954(0xea) + _0x27c954(0xee));
    _0x5b3ecc[_0x27c954(0xac)](process[_0x27c954(0xe9)][_0x27c954(0xb1)][_0x27c954(0xf5)]('.')[-0xdd * -0x11 + -0x77d + 0x170 * -0x5], -0x4a9 * -0x4 + -0x24af + -0x8 * -0x242) && (_0x3ee36b = folder + _0x27c954(0xd8));
    let _0x4d5dbb = await Editor[_0x27c954(0xbf)][_0x27c954(0xde)](_0x5b3ecc[_0x27c954(0xba)], _0x5b3ecc[_0x27c954(0xf6)]), _0x5599a8 = path[_0x27c954(0xfe)](__dirname, _0x5b3ecc[_0x27c954(0xeb)](_0x5b3ecc[_0x27c954(0xeb)](_0x5b3ecc[_0x27c954(0xef)](_0x5b3ecc[_0x27c954(0xef)](_0x3ee36b, _0x5b3ecc[_0x27c954(0xd2)]), _0x4d5dbb), _0x5b3ecc[_0x27c954(0x101)]), mode));
    win[_0x27c954(0xcd)](_0x27c954(0xb7) + _0x5599a8);
}
function tryShowWindow(_0x4ad413) {
    const _0x543a3a = _0xacce06, _0x6c4779 = {
            'XCIvL': function (_0x22fa26) {
                return _0x22fa26();
            }
        };
    mode = _0x4ad413;
    try {
        _0x6c4779[_0x543a3a(0xec)](showWindow);
    } catch (_0x1a0fe3) {
        console[_0x543a3a(0xb8)](_0x1a0fe3);
    }
}