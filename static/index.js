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
    add_listeners();
    $('.main p').filter(function(){
        return $(this).text().trim() === '';
    }).remove();
    $('.main').append('<mdui-divider></mdui-divider>');
    $('.main').append('<mdui-button class="submit-btn" full-width>提交</mdui-button>');

};

var send_to = 'localhost';
var upload_to = 'localhost';
function meta_load(meta){
    //console.log(meta);
    meta = meta.slice(5);
    meta = JSON.parse(meta);
    document.title = meta.title;
    if (meta.theme){
        mdui.setColorScheme(meta.theme);
    };
    if (meta.upload){
        upload_to = meta.upload;
    };
    send_to = meta.to;
    return '';
};
var ctrls = [];
var record_files_or_tags = {};
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
                if (ctrl.config.br){processing += '<br>'};
            };
            processing += '</mdui-radio-group>';
            processing += '<br>'
            return processing;
        case 'checkboxs':
            processing = `<mdui-checkbox id="${ctrl.id}" class="space">${ctrl.config.label}</mdui-checkbox>`;
            if (ctrl.config.br){processing += '<br>';};
            return processing;
        case 'select':
            processing = `<mdui-select id="${ctrl.id}" variant="outlined" value="${ctrl.config.opt[0]}" icon="keyboard_arrow_down">`;
            for (let i = 0; i < ctrl.config.opt.length; i++) {
                processing += `<mdui-menu-item value="${ctrl.config.opt[i]}">${ctrl.config.opt[i]}</mdui-menu-item>`;
            }
            processing += '</mdui-select>'
            return processing;
        case 'tagsinput':
            if (ctrl.config.pinnedtags){
                processing = `<mdui-select id="${ctrl.id}" variant="outlined" multiple placeholder="选择标签">`;
                for (let i = 0; i < ctrl.config.tags.length; i++) {
                    processing += `<mdui-menu-item value="${ctrl.config.tags[i]}">${ctrl.config.tags[i]}</mdui-menu-item>`;
                };
                processing += `</mdui-select>`;
            } else {
                processing = `<mdui-card id="${ctrl.id}" variant="outlined" class="complex-con">`;
                    processing += `<div class="complex-con-list">`
                    processing += `</div>`;
                    processing += `<mdui-divider></mdui-divider>`;
                    processing += `<mdui-tooltip content="注：点击标签可删除标签"><div class="complex-con-controls">`;
                        processing += `<mdui-text-field label="标签"></mdui-text-field>`;
                        processing += `<mdui-button variant="elevated">添加</mdui-button>`;
                    processing += `</div></mdui-tooltip>`;
                processing += `</mdui-card>`;
                //
                record_files_or_tags[ctrl.id] = [];
            };
            return processing;
        case 'files':
            processing = `<mdui-card id="${ctrl.id}" variant="outlined" class="complex-con">`;
                processing += `<div class="complex-con-list">`
                processing += `</div>`;
                processing += `<mdui-divider></mdui-divider>`;
                processing += `<mdui-tooltip content="注：右键/长按可取消上传该文件"><div class="complex-con-controls">`;
                    if (ctrl.config.withtext) {
                        processing += `<mdui-text-field label="文件描述，上传后会自动添加进去"></mdui-text-field>`;
                    };
                    processing += `<mdui-button variant="elevated" icon="upload">上传</mdui-button>`;
                processing += `</div></mdui-tooltip>`;
            processing += `</mdui-card>`;
            return processing;
        case 'table':
            //TODO:
            return '';
    }
};

const fileinput = document.createElement('input');
fileinput.type = 'file';
fileinput.multiple = true;

function add_listeners(){
    for(let i = 0; i < ctrls.length; i++){
        if(ctrls[i].type == 'tagsinput'){
            tagsinput_listener(ctrls[i]);
        } else if (ctrls[i].type == 'files'){
            file_listener(ctrls[i]);
        };
    };
};

function chipsonclick(thisele,ctrl){
    let tag_value = $(thisele).text();
    record_files_or_tags[ctrl.id].splice(record_files_or_tags[ctrl.id].indexOf(tag_value),1);
    tagsreflash(ctrl);
}
function tagsreflash(ctrl){
    let tagshtml = '';
    for(let i = 0;i < record_files_or_tags[ctrl.id].length;i++){
        tagshtml += `<mdui-chip>${record_files_or_tags[ctrl.id][i]}</mdui-chip>`;
    };
    $(`#${ctrl.id} .complex-con-list`).html(tagshtml);
    $(`#${ctrl.id} .complex-con-list mdui-chip`).on('click',function(){chipsonclick(this,ctrl);});
};
function tagsinput_listener(ctrl){
    $(`#${ctrl.id} .complex-con-controls mdui-button`).on('click',function(){
        let tag_value = $(`#${ctrl.id} .complex-con-controls mdui-text-field`).val();
        $(`#${ctrl.id} .complex-con-controls mdui-text-field`).val('');
        if(tag_value != ''){
            record_files_or_tags[ctrl.id].push(tag_value);
        };
        tagsreflash(ctrl);
    });
};


function uploadfile(event,ctrl){
    for(let i = 0;i < event.target.files.length;i++){
        let file = event.target.files[i];
        if (file.size <= 0.5*1024*1024*1024){
            let formdata = new FormData();
            formdata.append('file',file);
            $.ajax({
                url: upload_to,
                type: 'POST',
                data: formdata,
                processData: false,
                contentType: false,
                success: function(res){
                    record_files_or_tags[ctrl.id].push([file.name,res.filename]);
                },
                error: function(){mdui.snackbar({message: '上传失败',closeable: true});}
            });
        } else {
            mdui.snackbar({message: '文件过大，已跳过',closeable: true});
        };
    };

};
function file_listener(ctrl){
    $(`#${ctrl.id} .complex-con-controls mdui-button`).on('click',function(){
        fileinput.click();
        fileinput.onchange = function(event){
            record_files_or_tags[ctrl.id] = [];
            $('.upload-dialog').attr('open','');
            uploadfile(event,ctrl);
            $('.upload-dialog').removeAttr('open');
            //console.log(record_files_or_tags);
            for(let i = 0;i<record_files_or_tags[ctrl.id].length;i++){
                if(record_files_or_tags[ctrl.id][i].length == 2){
                    if(ctrl.config.withtext){ //TODO:
                        record_files_or_tags[ctrl.id][i].push($(`#${ctrl.id} .complex-con-controls mdui-text-field`).val())
                        $(`#${ctrl.id} .complex-con-controls mdui-text-field`).val('');
                    } else {
                        record_files_or_tags[ctrl.id][i].push('');
                    };
                };
            };
            console.log(record_files_or_tags);
            tagsreflash(ctrl);
            //TODO: 
        };
    });
};
//TODO:
