package tip

// 自定义常量状态码
const (
	// 后端业务层 无聊报错与否，都会返回http状态200。然后用自定义code进行区分业务逻辑层是否成功与否。 因为 HTTP 是网络传输，不是业务逻辑层（业务层玉网络层分开）。
	Success             = 1
	Error               = 0
	InternalServerError = 500
	InvalidParams       = 400

	ErrorUpdate          = 10101 // 常用模块
	ErrorInsert          = 10102
	ErrorDelete          = 10103
	ErrorQuery           = 10104
	ErrorVerifyCode      = 10105
	ErrorExistTag        = 10001
	ErrorNotExistTag     = 10002
	ErrorNotExistArticle = 10003

	Auth                  = 20100 // 登录用户模块
	AuthCheckTokenFail    = 20001
	AuthCheckTokenTimeout = 20002
	AuthToken             = 20003

	AuthUserPasswordError   = 20101
	AuthFailedGenerateToken = 20102
	AuthLoginSuccess        = 20103
	AuthSignInSuccess       = 20104
	AuthTokenNoEmpty        = 20105
	AuthFail                = 20106
	AuthUserNotFound        = 20107
)

// key为声明常量的值
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

func Msg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}
	return MsgFlags[InternalServerError]
}
