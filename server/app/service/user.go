package service

import (
	"errors"
	"fmt"
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/pkg/hash"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"golang.org/x/crypto/bcrypt"
)

type user struct {
}

var User *user

type UserInfoMap map[string]interface{}

func NewUserInfoMap() UserInfoMap {
	return make(UserInfoMap)
}

// 校验用户是否存在
func (u *user) isUserExist(username string) (bool, *model.User) {
	userModel := &model.User{}
	result := db.Mysql.Where("user_name = ?", username).First(userModel) // 将查询结果赋值给结构体
	// 用户不存在
	if result.RowsAffected == 0 {
		return false, userModel
	} else {
		return true, userModel
	}
}

// IsUserOauthExist 校验用户是否授权过
func (u *user) IsUserOauthExist(openid string) (bool, *model.User) {
	userModel := &model.User{}
	result := db.Mysql.Where("wx_open_id = ?", openid).First(userModel) // 将查询结果赋值给结构体
	// 用户不存在
	if result.RowsAffected == 0 {
		return false, userModel
	} else {
		return true, userModel
	}
}

// SignIn 登录校验
func (u *user) SignIn(username string, password string) (userModel *model.User, code int) {
	var (
		PasswordErr error
		b           bool
	)
	b, userModel = u.isUserExist(username)
	if !b {
		return userModel, tip.AuthUserNotFound
	}
	//fmt.Println("result", userModel.Password, password)
	// 比较密码
	PasswordErr = bcrypt.CompareHashAndPassword([]byte(userModel.Password), []byte(password))

	if userModel.ID == 0 {
		return userModel, 1002
	}

	if PasswordErr != nil {
		return userModel, 100
	}

	return userModel, 0
}

// Create 新增
func (u *user) Create(model *model.User) (err error) {
	if b, _ := u.isUserExist(model.UserName); b {
		return errors.New("用户已经存在了")
	}
	model.UserId = utils.GenId() //唯一id
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// Get 用户信息 函数又有返回参数以及有return就可返回
func (u *user) Get(id int) (user *model.User, err error) {
	user = &model.User{}
	err = db.Mysql.Find(user, id).Error
	return
}

// List 获取 user 列表
func (u *user) List(Page int, PageSize int, maps interface{}) ([]model.User, int64) {
	var users []model.User
	var total int64

	db.Mysql.Where(maps).Offset((Page - 1) * PageSize).Limit(PageSize).Find(&users)
	db.Mysql.Model(&users).Count(&total)

	return users, total
}

// Update 修改
func (u *user) Update(id int, model *model.User) (err error) {
	err = db.Mysql.Model(&model).Where("id = ? ", id).Updates(model).Error
	return err
}

// UpdatePassword 修改密码
func (u *user) UpdatePassword(id int, password string) (err error) {
	var model model.User // *声明指针类型变量 &为取指针地址
	password = hash.BcryptHash(password)
	err = db.Mysql.Model(&model).Select("password").Where("id = ?", id).Updates(map[string]interface{}{"password": password}).Error
	return
}

// Delete 删除
func (u *user) Delete(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&user{})
	return true
}
