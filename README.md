# QpenForm

意思是**Q**uick O**pen** **Form**

前后端可分离，基于mdui和markdown-it，支持markdown语法

通过自定义语法增加控件

~~English: Tooooooooo loooooooooooog, I don't want to translate. Open your translate apps!~~

---

# 特点

- 通过query获取表单文件
- 
- 表单文件是markdown，自由度高，限制少
- 
- 10秒自动保存
- 
- Material You设计控件
- 
- 支持文件上传等控件
- 
- 支持防止重复提交（前后端都检测）
- 
- 后端使用SQLite存储数据

---

# 快速开始

## 打开网页

你可以去[这里](https://ftz-tools.netlify.app/form/index.html)或者其他地方访问前端部分

在url后面加上`?`和markdown文件链接即可

## 元数据语法

在第一行加上`!&-->`后加上json格式的元数据

```json
{
  "title": "网页标题",
  "theme": "颜色主题（可选），要十六进制颜色码",
  "to": "后端地址，将会post过去",
  "upload": "上传文件url",
  "norep": "验证重复的链接（不填则不验证）"
}
```

## 控件语法

在行首加上`&-->`后加上json格式的控件数据

```json
{
    "type": "控件类型",
    "id": "控件id",
    "config": "控件配置",
    "req": true /*是否必填*/
}
```

### 控件id

控件id用于在提交时获取值，在html中将作为元素的id

### 控件类型与配置

- 单行输入框

type: `text`

config: `{"holder": "输入框提示文字", "type":"text", "range": []}`

> type: 输入框类型
>
> 包括 text number email url date time
>

- 多行输入框

type: `textarea`

config: `{"holder": "输入框提示文字"}`

- 标签输入框

type: `tagsinput`

config: `{"pinnedtags": true, "tags": ["标签","标签"]}`

> pinnedtags: 是否固定标签，true时tags才有效

- 单选框

type: `radios`

config: `{"opt": ["选项","选项"], "br': true}`

> req无效
>
> br: 是否换行

- 多选框

type: `checkboxs`

config: `{"label": "标签", "br': true}`

> req无效
>
> br: 是否换行

- 下拉列表

type: `select`

config: `{"opt": ["选项","选项"]}`

> req无效

- 文件

type: `files`

config: `{"withtext": true, "accept": "image/png"}`

> withtext: 是否带有文本
>
> accept: 接受的文件类型（选填）

- 表格选项

type: `table`

config: `{“column”: [”列名”,”列名”], ”row”: [”行名”,”行名”]}`

---

## 后端

有一个`config.yaml`，是配置的

```yaml
save_files: f保存文件的位置（用于上传文件的）
no_repeat_db: 防止重复提交的后端部分数据库位置

forms:
    任意名字，好像没什么用:
        source: 前端url写的东西，也是md的路径
        relativepath: md相对于本程序的路径
        db: 存储数据库路径
    ...
```

很多地方没有完善，够自己用就行

新手第一次做这么大（相对于自己）的项目，花了我好几天的时间（算上在校有一个多月了）