package service

import (
	"errors"
	"fmt"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"golang.org/x/crypto/bcrypt"
)

type user struct {
}

var User *user

type UserInfoMap map[string]interface {
}

func NewUserInfoMap() UserInfoMap {
	return make(UserInfoMap)
}

func (um UserInfoMap) GetUserName() string {
	if um["username"] == nil {
		return ""
	}

	return um["username"].(string)
}

func (u *user) Login(username, password string) (userModel *model.User, err error) {
	userModel = &model.User{}
	db.Mysql.Where("username=?", username).Find(userModel)

	if userModel.Id > 0 {
		fmt.Println("password = ", password)
		/*
			if userModel.Password != password {
				userModel = nil
				err = errors.New("账号或密码错误")
				return
			}
		*/
	} else {
		userModel = nil
		err = errors.New("账号或密码错误")
	}

	return
}

// SignIn 登录校验
func (u *user) SignIn(username string, password string) (userModel *model.User, code int) {
	userModel = &model.User{}
	var PasswordErr error

	db.Mysql.Where("username = ?", username).First(userModel)
	PasswordErr = bcrypt.CompareHashAndPassword([]byte(userModel.Password), []byte(password))

	// sess := sessions.Default(c)
	// sess.Set(consts.SessionKeyUser, userInfo)
	// err = sess.Save()

	if userModel.Id == 0 {
		return userModel, 1002
	}

	if PasswordErr != nil {
		return userModel, 100
	}

	return userModel, 0
}

// Create 新增
func (u *user) Create(model *model.User) (err error) {
	err = db.Mysql.Create(model).Error

	return err
}

// Get 用户信息
func (u *user) Get(id int) (user *model.User, err error) {
	user = &model.User{}
	err = db.Mysql.Find(user, id).Error
	return
}

// List 获取 user 列表
func (u *user) List(PageNum int, PageSize int, maps interface{}) ([]model.User, int64) {
	var users []model.User
	var total int64

	db.Mysql.Where(maps).Offset((PageNum - 1) * PageSize).Limit(PageSize).Find(&users)
	db.Mysql.Model(&users).Count(&total)

	return users, total
}

// Update 修改
func (u *user) Update(id string, model *model.User) (err error) {
	err = db.Mysql.Model(&model).Where("id = ? ", id).Updates(model).Error

	return err
}

// Delete 删除
func (u *user) Delete(id string) bool {
	db.Mysql.Where("id = ?", id).Delete(&user{})

	return true
}
