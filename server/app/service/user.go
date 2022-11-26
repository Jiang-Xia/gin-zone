package service

import (
	"fmt"
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type user struct {
}

var User *user

type UserInfoMap map[string]interface{}

func NewUserInfoMap() UserInfoMap {
	return make(UserInfoMap)
}

func (um UserInfoMap) GetUserName() string {
	if um["username"] == nil {
		return ""
	}

	return um["username"].(string)
}

// SignIn 登录校验
func (u *user) SignIn(username string, password string) (userModel *model.User, code int) {
	userModel = &model.User{}
	var PasswordErr error
	result := db.Mysql.Where("user_name = ?", username).First(userModel) // 将查询结果赋值给结构体
	// 用户不存在
	if result.RowsAffected == 0 {
		return userModel, tip.AuthUserNotFound
	}
	fmt.Println("result", userModel.Password, password)
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
	logrus.Info(model, "Create.User")
	model.UserId = utils.GenId() //唯一id
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// Get 用户信息
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

// Delete 删除
func (u *user) Delete(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&user{})
	return true
}
