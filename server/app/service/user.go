package service

import (
	"errors"
	"fmt"
	"strings"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/pkg/hash"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"golang.org/x/crypto/bcrypt"
)

type user struct {
	model.User
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
	// start := time.Now()
	PasswordErr = bcrypt.CompareHashAndPassword([]byte(userModel.Password), []byte(password))
	// latency := time.Since(start)
	// log.Infof("耗时=================>: %s", latency)
	if userModel.ID == 0 {
		return userModel, 1002
	}

	if PasswordErr != nil {
		return userModel, 100
	}
	// 被封禁用户禁止登录（MVP 先以 is_lock 控制登录）
	if userModel.IsLock {
		return userModel, 1003
	}
	return userModel, 0
}

// Create 新增
func (u *user) Create(model *model.User) (err error) {
	if b, _ := u.isUserExist(model.UserName); b {
		return errors.New("用户已经存在了")
	}
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
		return res.Error
	}
	return
}

// Get 用户信息 函数又有返回参数以及有return就可返回
func (u *user) Get(id int) (user *model.User, err error) {
	user = &model.User{}
	err = db.Mysql.Find(user, id).Error
	return
}

//	type nUser struct {
//		model.User
//	}
//
// GetByUserId 根据userId搜索
func (u *user) GetByUserId(userId string) (user *model.User, err error) {
	user = &model.User{}
	err = db.Mysql.Where("user_Id = ?", userId).First(&user).Error
	return
}

// List 获取 user 列表
func (u *user) List(Page int, PageSize int, q string) ([]model.User, int64) {
	var users []model.User
	var total int64
	// Preload("Moments") // 查询一个用户，多个动态。
	db.Mysql.Where("user_name LIKE ? ", "%"+q+"%").Or("nick_name LIKE ? ", "%"+q+"%").Offset((Page - 1) * PageSize).Limit(PageSize).Find(&users)
	db.Mysql.Model(&users).Count(&total)

	return users, total
}

// Update 修改
func (u *user) Update(id int, model *model.UpdateUser) (err error) {
	// gorm 用 struct Updates 默认不会更新零值（例如 gender=0），这里显式 Select 以保证女(0)也能写入
	err = db.Mysql.
		Table("z_user").
		Where("id = ? ", id).
		Select("avatar", "nick_name", "intro", "email", "gender").
		Updates(model).Error
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

// IsAdminByUserId 判断用户是否管理员
func (u *user) IsAdminByUserId(userId string) (bool, error) {
	if userId == "" {
		return false, errors.New("用户id不能为空")
	}
	var out struct {
		IsAdmin bool
	}
	err := db.Mysql.Table("z_user").Select("is_admin").Where("user_id = ?", userId).First(&out).Error
	if err != nil {
		return false, err
	}
	return out.IsAdmin, nil
}

// AdminList 管理端用户列表（支持关键字、状态、分页）
func (u *user) AdminList(page int, pageSize int, query *model.AdminUserListQuery) ([]model.User, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.Model(&model.User{})
	if query != nil {
		if strings.TrimSpace(query.Keyword) != "" {
			keyword := "%" + strings.TrimSpace(query.Keyword) + "%"
			sql = sql.Where("user_name LIKE ? OR nick_name LIKE ? OR user_id LIKE ?", keyword, keyword, keyword)
		}
		if query.Status == 0 || query.Status == 1 {
			sql = sql.Where("is_lock = ?", query.Status == 1)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.User
	if err := sql.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// GetByUID 根据 userId 查询用户
func (u *user) GetByUID(userId string) (*model.User, error) {
	user := &model.User{}
	if err := db.Mysql.Where("user_id = ?", strings.TrimSpace(userId)).First(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// SetUserLockByUID 按 userId 设置用户封禁状态
func (u *user) SetUserLockByUID(userId string, isLock bool) error {
	return db.Mysql.Model(&model.User{}).Where("user_id = ?", strings.TrimSpace(userId)).Update("is_lock", isLock).Error
}
