package middleware

import (
	"errors"
	"fmt"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
	jwtgo "github.com/golang-jwt/jwt/v4"
	"github.com/sirupsen/logrus"
)

type JWT struct {
	// 秘钥，用以加密 JWT，读取配置信息 app.key
	SignKey []byte

	// 刷新 Token 的最大过期时间
	MaxRefresh time.Duration
}

type JWTCustomClaims struct {
	ID       int    `json:"id"`
	UserId   string `json:"userId"`
	UserName string `json:"userName"`
	jwtgo.RegisteredClaims
}

// 定义错误
var (
	TokenExpired     error = errors.New("token已过期,请重新登录")
	TokenNotValidYet error = errors.New("token无效,请重新登录")
	TokenMalformed   error = errors.New("token不正确,请重新登录")
	TokenInvalid     error = errors.New("这不是一个token,请重新登录")
)

// JwtAuthMiddleware 登录验证中间件
// func JwtAuthMiddleware() func(c *gin.Context) {
// 	return func(c *gin.Context) {
// 		authHeader := c.Request.Header.Get("Authorization")
// 		fmt.Println("======== ", authHeader)
// 		c.Next()
// 	}
// }

// JWTAuth jwt中间件
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		// 没有token 直接中断
		if len(token) == 0 {
			response.Fail(c, "token不能为空", nil)
			c.Abort()
			return
		}

		// 解析token
		j := NewJWT()
		claims, err := j.ParseToken(token)

		if err != nil {
			logrus.Error(err)
			response.Fail(c, tip.Msg(tip.AuthCheckTokenFail), nil)
			c.Abort()
			return
		}
		//需判断解析后的token是否真是存在用户
		if claims.UserName == "" {
			response.Fail(c, "token无效", nil)
			c.Abort()
			return
		}
		fmt.Printf("JWTAuth:%v\n", claims)
		// 将用户信息存入 gin.context 里，后续 auth 包将从这里拿到当前用户数据
		c.Set("current_user", claims)
		c.Set("current_user_id", claims.UserId)
		c.Set("current_user_name", claims.UserName)

		c.Next()
	}
}

func NewJWT() *JWT {
	return &JWT{
		SignKey:    []byte(config.App.Key),
		MaxRefresh: time.Duration(10) * time.Minute,
	}
}

// CreateToken 生成token
func (jwt *JWT) CreateToken(claims JWTCustomClaims) (string, error) {
	token := jwtgo.NewWithClaims(jwtgo.SigningMethodHS256, claims)
	return token.SignedString(jwt.SignKey)
}

// ParseToken 解析token
func (jwt *JWT) ParseToken(token string) (*JWTCustomClaims, error) {
	tokenClaims, err := jwtgo.ParseWithClaims(token, &JWTCustomClaims{}, func(token *jwtgo.Token) (interface{}, error) {
		return jwt.SignKey, nil
	})

	if err != nil {
		logrus.Error("ParseToken的错误： ", err)
		// jwt.ValidationError 是一个无效token的错误结构
		if ve, ok := err.(*jwtgo.ValidationError); ok {
			// ValidationErrorMalformed是一个uint常量，表示token不可用
			if ve.Errors&jwtgo.ValidationErrorMalformed != 0 {
				return nil, TokenMalformed
				// ValidationErrorExpired表示Token过期
			} else if ve.Errors&jwtgo.ValidationErrorExpired != 0 {
				return nil, TokenExpired
				// ValidationErrorNotValidYet表示无效token
			} else if ve.Errors&jwtgo.ValidationErrorNotValidYet != 0 {
				return nil, TokenNotValidYet
			} else {
				return nil, TokenInvalid
			}
		}
	}

	if tokenClaims != nil {
		if claims, ok := tokenClaims.Claims.(*JWTCustomClaims); ok && tokenClaims.Valid {
			return claims, nil
		}
	}

	return nil, err
}
