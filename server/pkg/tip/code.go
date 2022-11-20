package tip

// 自定义常量状态码
const (
	Success             = 200 // 通用模块
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

func Msg(code int) string {
	msg, ok := MsgFlags[code]
	if ok {
		return msg
	}
	return MsgFlags[InternalServerError]
}
