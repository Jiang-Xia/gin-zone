package base

import (
	"encoding/json"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/spf13/cast"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/middleware"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	"github.com/gin-gonic/gin"
	jwtgo "github.com/golang-jwt/jwt/v4"
	"github.com/sirupsen/logrus"
)

// User 类，go类的写法
type User struct {
	model.User
}

// Register godoc
//
// @Summary     注册接口
// @Description 用户注册接口
// @Tags        用户模块
// @Accept      json
// @Produce     json
// @Param       user body     model.MainUser true "需要上传的json"
// @Success     200  {object} User
// @Router      /base/users [post]
func (u *User) Register(c *gin.Context) {
	user := &model.User{}
	if err := c.ShouldBindJSON(&user); err != nil {
		// 字段参数校验
		translate.Individual(err, c)
		return
	}

	err := service.User.Create(user)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}

	response.Success(c, user.ID, "")
}

// UpdateUser godoc
//
// @Summary     修改用户信息
// @Description 修改用户接口
// @Tags        用户模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id   path     int            true  "User.ID"
// @Param       user body   model.UpdateUser true "需要上传的json"
// @Success     200  {object} model.UpdateUser
// @Router      /base/users/{id} [patch]
func (u *User) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	aid, err := strconv.Atoi(id)
	user := &model.User{}

	if err := c.ShouldBindJSON(&user); err != nil {
		translate.Individual(err, c) // 字段参数校验
		return
	}
	//更新
	err = service.User.Update(aid, user)
	//更新失败
	if err != nil {
		response.Fail(c, tip.Msg(tip.ErrorUpdate), err)
		return
	}
	response.Success(c, user.ID, "")
}

// Login godoc
//
// @Summary     登录接口
// @Description 用户登录接口
// @Tags        用户模块
// @Accept      json
// @Produce     json
// @Param       LoginForm body     model.LoginForm true "需要上传的json"
// @Success     200  {object} response.ResType
// @Router      /base/users/login [post]
func (u *User) Login(c *gin.Context) {
	logrus.Info("登录》》》》》》")
	login := &model.LoginForm{}
	if err := c.ShouldBind(&login); err != nil {
		translate.Individual(err, c)
		return
	}
	user, errCode := service.User.SignIn(login.UserName, login.Password)
	log.Info(login)

	if errCode == 0 {
		generateToken(c, user)
	} else if errCode == tip.AuthUserNotFound {
		response.Fail(c, tip.Msg(tip.AuthUserNotFound), "")
	} else {
		response.Fail(c, tip.Msg(tip.AuthUserPasswordError), "")
	}
}

// ChangePassword godoc
//
// @Summary     修改密码
// @Description 修改密码接口
// @Tags        用户模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       LoginForm body     model.ChangePassword true "需要上传的json"
// @Success     200  {object} response.ResType
// @Router      /base/users/password [post]
func (u *User) ChangePassword(c *gin.Context) {
	var err error
	changeForm := &model.ChangePassword{}
	if err = c.ShouldBind(&changeForm); err != nil {
		translate.Individual(err, c)
		return
	}
	id := model.GetUserID(c)
	_, err = service.User.Get(id)
	if err != nil {
		response.Fail(c, tip.Msg(tip.AuthUserNotFound), err)
	}
	if changeForm.Password == changeForm.NewPassword {
		response.Fail(c, "新密码不能和旧密码一样", nil)
	}
	err = service.User.UpdatePassword(id, changeForm.NewPassword)
	if err != nil {
		response.Fail(c, "修改密码失败-"+err.Error(), nil)
		return
	}
	response.Success(c, true, "修改密码成功")
}

// UserInfo godoc
//
// @Summary     用户信息
// @Description 用户信息接口
// @Tags        用户模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Success     200 {object} User
// @Router      /base/users/info [get]
func (u *User) UserInfo(c *gin.Context) {
	id := model.GetUserID(c)
	user, err := service.User.Get(id)
	user.Password = ""
	if err != nil {
		logrus.Error(err)
	}
	response.Success(c, user, "")
}

// UserList godoc
//
// @Summary     用户列表
// @Description 用户列表接口
// @Tags        用户模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       q   query    string false "username search by q" Format(email)
// @Success     200 {array} User
// @Router      /base/users [get]
func (u *User) UserList(c *gin.Context) {
	users, total := service.User.List(1, 20, "")
	data := model.ListRes{List: users, Total: total}
	response.Success(c, data, "")
}

// DeleteUser godoc
//
// @Summary     删除用户
// @Description 删除用户接口
// @Tags        用户模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id  path     int true "用户id"
// @Success     200 {object} User
// @Router      /base/users/{id} [delete]
func (u *User) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	aid, _ := strconv.Atoi(id)
	response.Success(c, service.User.Delete(aid), "")
}

// WeiXinLogin godoc
//
// @Summary     微信授权登录
// @Description 微信授权登录
// @Tags        用户模块
// @Accept      json
// @Produce     json
// @Param       code  query    string true "用户apiid"
// @Success     200 {object} User
// @Router      /base/auth/wxlogin [get]
func (u *User) WeiXinLogin(c *gin.Context) {
	var err error
	//嵌套map
	bodyData := make(map[string]interface{})
	authData := make(map[string]interface{})
	c.ShouldBind(&bodyData)
	//强制转为字符串
	code := cast.ToString(bodyData["code"])
	//log.Info("bodyData", bodyData)
	var appid string
	var secret string
	sec := config.Config.Section("app")
	appid = sec.Key("wechat_app_id").String()
	secret = sec.Key("wechat_app_secret").String()
	url := "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code"
	resp, err := http.Get(url)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		response.Fail(c, "系统错误", nil)
		return
	}
	json.Unmarshal(body, &authData)
	openid := cast.ToString(authData["openid"])
	var user = &model.User{}
	//fmt.Println("authData=========================", authData)
	// .点结构体赋值
	user.Avatar = cast.ToString(bodyData["avatarUrl"])
	user.NickName = cast.ToString(bodyData["nickName"])
	user.Gender = cast.ToInt(bodyData["Gender"])
	//存在直接生成token 终止函数
	if b, user_ := service.User.IsUserOauthExist(openid); b {
		// struct 数据有多少个只会更新对应字段
		service.User.Update(user_.ID, user)
		user = user_
		generateToken(c, user)
		log.Info("用户已经存在,直接生成token")
		return
	}
	sId := utils.GenId()
	user.MainUser = model.MainUser{
		UserId:   sId,
		Password: "123456",
		WxOpenId: openid,
	}
	fmt.Printf("新增用户信息%v\n", user)
	generateToken(c, user)
	if err != nil {
		return
	} else {
		err = service.User.Create(user)
	}
}

// RefreshAuthUserInfo 刷新授权信息
func (u *User) RefreshAuthUserInfo() {

}

// generateToken 生成token
func generateToken(c *gin.Context, user *model.User) {
	data := map[string]interface{}{} // 任意接口
	now := time.Now()

	j := middleware.NewJWT()
	claims := middleware.JWTCustomClaims{
		ID:       user.ID,
		UserId:   strconv.Itoa(int(user.UserId)),
		UserName: user.UserName,
		RegisteredClaims: jwtgo.RegisteredClaims{
			IssuedAt:  jwtgo.NewNumericDate(now),                                               // 签发时间
			ExpiresAt: jwtgo.NewNumericDate(time.Now().Add(12 * time.Hour * time.Duration(1))), // 过期时间12小时
		},
	}

	token, err := j.CreateToken(claims)

	if err != nil {
		response.Fail(c, tip.Msg(tip.AuthFailedGenerateToken), err)
		return
	}

	data["token"] = token

	response.Success(c, data, "")
}
