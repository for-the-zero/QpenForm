const $ = mdui.$;
mdui.setColorScheme('#44FFAA');
const form_source = window.location.search.slice(1);
//console.log(form_source);
// 啊？只有ai能写出这种正则表达式了……
const urlPattern = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
const pathPattern = /^(?:[a-zA-Z]:\\)?(?:\.{1,2}\/|[a-zA-Z]:\/|\/)?[^\s]+(\.[^\s]+)+$/;
if (form_source && (urlPattern.test(form_source) || pathPattern.test(form_source))) {
    $.ajax({
        url: form_source,
        type: 'GET',
        success: function(data){load_form(data);},
        error: function(){load_faild();}
    });
} else {
    load_faild();
};
function load_faild(){
    $('.invalid-dialog mdui-text-field').val(form_source);
    $('.invalid-dialog').attr('open','');
    $('.invalid-dialog mdui-button').on('click',function(){
        let new_url = window.location.href.replace(window.location.search, '');
        new_url += '?' + $('.invalid-dialog mdui-text-field').val()
        window.location.href = new_url;
    });
};


var markdown = new markdownit({html:true,linkify:true,typographer:true});
markdown.renderer.rules.hr = function(tokens, idx) {
    return '<mdui-divider></mdui-divider>';
};
markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const content = token.content;
    const langName = token.info ? ` language-${token.info.trim()}` : '';
    return `<pre class="codeblock"><code class="codeblock${langName}">${content}</code></pre>\n`;
};
customs();
function customs(){
    // 1. 独占一行，只有一个，所有文本最开头，交给函数meta_load(内容)处理，以!&-->开头，阻止默认行为
    // 2. 独占一行，有多个，交给函数add_ctrls(内容)处理，以&-->开头，阻止默认行为
    markdown.renderer.rules.paragraph_open = function(tokens, idx) {
        let token = tokens[idx];
        let content = tokens[idx + 1].content;
        if (content.startsWith('!&-->')) {
            return meta_load(content);
        } else if (content.startsWith('&-->')){
            return add_ctrls(content);
        } else {
            return '<p>';
        };
    };
};
function load_form(data){
    $('.main').html(markdown.render(data));
    document.querySelectorAll('.main').forEach(function(main) {
        var childNodes = main.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--) {
            var node = childNodes[i];
            if (node.nodeType === 3) {
                node.parentNode.removeChild(node);
          };
        };
    });
    $('.main p').filter(function(){
        return $(this).text().trim() === '';
    }).remove();
    $('.main').append('<mdui-divider></mdui-divider>');
    $('.main').append('<mdui-button class="submit-btn" full-width>提交</mdui-button>');

};

var send_to = 'localhost';
function meta_load(meta){
    //console.log(meta);
    meta = meta.slice(5);
    meta = JSON.parse(meta);
    document.title = meta.title;
    if (meta.theme){
        mdui.setColorScheme(meta.theme);
    };
    send_to = meta.to;
    return '';
};
var ctrls = [];
function add_ctrls(jsondata){
    //console.log(jsondata);
    let ctrl = JSON.parse(jsondata.slice(4));
    ctrls.push(ctrl);
    let processing = '';
    switch (ctrl.type) {
        case 'text':
            processing = `<mdui-text-field id="${ctrl.id}" class="space" variant="outlined" label="${ctrl.config.holder}" type="${ctrl.config.type}"></mdui-text-field>`;
            return processing;
        case 'textarea':
            processing = `<mdui-text-field id="${ctrl.id}" class="space" rows="4" label="${ctrl.config.holder}" variant="outlined"></mdui-text-field>`;
            return processing;
        case 'radios':
            processing = `<mdui-radio-group id="${ctrl.id}" class="space" value="${ctrl.config.opt[0]}">`
            for (let i = 0; i < ctrl.config.opt.length; i++) {
                processing += `<mdui-radio value="${ctrl.config.opt[i]}">${ctrl.config.opt[i]}</mdui-radio>`
                processing += '<br>'
            };
            processing += '</mdui-radio-group>';
            processing += '<br>'
            return processing;
        case 'checkboxs':
            processing = `<mdui-checkbox id="${ctrl.id}" class="space">${ctrl.config.label}</mdui-checkbox>`;
            processing += '<br>';
            return processing;
        case 'select':
            processing = `<mdui-select id="${ctrl.id}" variant="outlined" value="${ctrl.config.opt[0]}" end-icon="keyboard_arrow_down">`;
            for (let i = 0; i < ctrl.config.opt.length; i++) {
                processing += `<mdui-menu-item value="${ctrl.config.opt[i]}">${ctrl.config.opt[i]}</mdui-menu-item>`;
            }
            processing += '</mdui-select>'
            return processing;
        case  'taginput':
            return '';
        case 'files':
            return '';
        case 'table':
            return '';
    }
};

