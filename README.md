# QpenForm

意思是**Q**uick O**pen** **Form**

前后端可分离，基于mdui和markdown-it，支持markdown语法

通过自定义语法增加控件

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
  "to": "后端地址，将会post过去"
}
```

## 控件语法

在行首加上`&-->`后加上json格式的控件数据

```json
{
    "type": "控件类型",
    "id": "控件id",
    "config": "控件配置",
    "req": true // 是否必填
}
```

### 控件id

控件id用于在提交时获取值，在html中将作为元素的id

### 控件类型与配置

- 单行输入框

type: `text`

config: `{'holder': '输入框提示文字', "type":[], "range": []}`

> type: 输入框类型
>
> 包括 text password int float mail url date time
>
> range: 输入框范围（可选）
>
> int为两个项，float为三个项，第三个为分度值，url为一个项，限定域名

- 多行输入框

type: `textarea`

config: `{'holder': '输入框提示文字'}`

- 标签输入框

type: `tagsinput`

config: `{"pinnedtags": true, tags: ["标签","标签"], "holder": "输入框提示文字",max: 2}`

> max: 最多可选数量
>
> pinnedtags: 是否固定标签

- 单选框

type: `radios`

config: `{"opt": ["选项","选项"]}`

- 多选框

type: `checkboxs`

config: `{"opt": ["选项","选项"], max: 2}`

> max: 最多可选数量

- 下拉列表

type: `select`

config: `{"opt": ["选项","选项"]}`

- 文件

type: `files`

config: `{"max": 2, "accept": ["media", "all"], "withtext": true}`

> max: 最多可选数量
>
> accept: 可选文件类型，media只允许媒体文件，all允许所有文件


- 表格选项

type: `table`

config: `{“column”: [“列名”,”列名”], “row”: [“行名”,”行名”]}`
