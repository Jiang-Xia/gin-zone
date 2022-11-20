package tip

// 常用提示信息map
var MsgFlags = map[int]string{
	Success:             "操作成功",
	InternalServerError: "操作失败",
	InvalidParams:       "请求参数错误",

	ErrorInsert:          "新增失败",
	ErrorUpdate:          "修改失败",
	ErrorDelete:          "删除失败",
	ErrorQuery:           "查询失败",
	ErrorVerifyCode:      "图片验证码错误",
	ErrorExistTag:        "已存在该标签名称",
	ErrorNotExistTag:     "该标签不存在",
	ErrorNotExistArticle: "该文章不存在",

	Auth:                    "Token错误",
	AuthToken:               "Token生成失败",
	AuthUserPasswordError:   "用户名密码不正确",
	AuthUserNotFound:        "用户不存在",
	AuthFailedGenerateToken: "生成token失败",
	AuthLoginSuccess:        "登录成功",
	AuthSignInSuccess:       "注册成功",
	AuthTokenNoEmpty:        "Token不能为空",
	AuthCheckTokenFail:      "Token鉴权失败",
	AuthCheckTokenTimeout:   "Token已超时",
	AuthFail:                "演示模式，权限不足",
}
