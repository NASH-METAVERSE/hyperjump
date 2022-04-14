//
const Fs = require("fs");
const Path = require("path");

// const converter = require("../tools/ShaderToyConverter");
const converter = require("../tools/ShaderToyConverterO");

exports.template = Fs.readFileSync(Path.join(__dirname, 'index.html'), "utf8");

exports.$ = {
    btn: '#btn',
    textArea: '#textArea',
    nameInput: '#nameInput',
    refInput: '#refInput',
    templateOption: '#templateOption',
    cbFixUV: '#cbFixUV',
    cbParseUniforms: '#cbParseUniforms',
    cbParseDefine: '#cbParseDefine',
    cbParseGlobalUniforms: '#cbParseGlobalUniforms',
    cbFixAlpha: '#cbFixAlpha',
    cbAutolpha: '#cbAutolpha',
    cbFixUVFlipY: '#cbFixUVFlipY',
};

exports.ready = async function () {
    this.$.btn.addEventListener('confirm', this.convertShaderButton.bind(this));
};

exports.methods = {
    convertShaderButton () {
        converter.convert(
            this.$.textArea.value, 
            this.$.nameInput.value, 
            this.$.refInput.value, 
            this.$.templateOption.value,
            this.$.cbFixUV.value,
            this.$.cbParseUniforms.value,
            this.$.cbParseDefine.value,
            this.$.cbParseGlobalUniforms.value,
            this.$.cbFixAlpha.value,
            this.$.cbAutolpha.value,
            this.$.cbFixUVFlipY.value
        );
    }
};

exports.load = function () {
};

exports.unload = function () {
};

exports.close = function () {
};

exports.listeners = {
};