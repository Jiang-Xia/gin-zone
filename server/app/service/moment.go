package service

import (
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"strings"
	"time"

	"gorm.io/gorm"
)

type moment struct {
}

// Moment 结构体实例化
var Moment *moment

// List 获取 moment 列表
func (m *moment) List(Page int, PageSize int, maps interface{}) ([]model.Moment, int64, error) {
	var moments []model.Moment
	var total int64
	// Joins("User") 会把关联的用户信息查询出来（用于动态列表展示头像/昵称等）
	query := db.Mysql.Where(maps).Model(&model.Moment{})
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.
		// 按发布时间倒序；同一时间戳下再按主键倒序，保证最新发布稳定置顶
		Order("created_at desc, id desc").
		Offset((Page - 1) * PageSize).
		Limit(PageSize).
		Joins("User").
		Find(&moments).Error; err != nil {
		return nil, 0, err
	}
	// 评论数以评论表实时聚合为准，避免历史数据漂移导致展示不准确
	if err := m.fillMomentCommentStatsAndPreview(moments); err != nil {
		return nil, 0, err
	}
	return moments, total, nil
}

// fillMomentCommentStatsAndPreview 回填评论总数 + 默认 3 条评论预览
func (m *moment) fillMomentCommentStatsAndPreview(moments []model.Moment) error {
	if len(moments) == 0 {
		return nil
	}
	momentIDs := make([]int, 0, len(moments))
	for _, item := range moments {
		momentIDs = append(momentIDs, item.ID)
	}

	// commentCount 实时统计（仅统计未删除）
	type countRow struct {
		MomentId int   `gorm:"column:moment_id"`
		Total    int64 `gorm:"column:total"`
	}
	var countRows []countRow
	if err := db.Mysql.Model(&model.MomentComment{}).
		Select("moment_id, COUNT(1) as total").
		Where("moment_id IN ? AND is_deleted = ?", momentIDs, false).
		Group("moment_id").
		Scan(&countRows).Error; err != nil {
		return err
	}
	countMap := map[int]int64{}
	for _, row := range countRows {
		countMap[row.MomentId] = row.Total
	}

	// 取出这些动态的评论（倒序），再裁剪每条动态最新 3 条
	var allComments []model.MomentComment
	if err := db.Mysql.
		Where("moment_id IN ? AND is_deleted = ?", momentIDs, false).
		Order("created_at desc").
		Joins("User").
		Joins("ReplyToUser").
		Find(&allComments).Error; err != nil {
		return err
	}
	previewMap := map[int][]model.MomentComment{}
	for _, comment := range allComments {
		list := previewMap[comment.MomentId]
		if len(list) >= 3 {
			continue
		}
		previewMap[comment.MomentId] = append(list, comment)
	}

	// 回填到 moments（预览按时间升序展示更符合阅读习惯）
	for i := range moments {
		momentID := moments[i].ID
		moments[i].CommentCount = countMap[momentID]
		preview := previewMap[momentID]
		for l, r := 0, len(preview)-1; l < r; l, r = l+1, r-1 {
			preview[l], preview[r] = preview[r], preview[l]
		}
		moments[i].CommentPreview = preview
	}
	return nil
}

// CreateMoment 新增
func (m *moment) CreateMoment(moment *model.Moment) (err error) {
	// 评论关闭时，回复必须同步关闭，避免状态自相矛盾
	allowReply := moment.AllowReply
	if !moment.AllowComment {
		allowReply = false
	}
	// 动态创建时显式写入时间与计数字段，避免自定义 Time/库默认值差异导致出现 NULL
	now := model.Time(time.Now())
	createPayload := map[string]interface{}{
		"created_at":    now,
		"updated_at":    now,
		"content":       moment.Content,
		"urls":          moment.Urls,
		"user_id":       moment.UserId,
		"location":      moment.Location,
		"likes":         int64(0),
		"views":         int64(0),
		"allow_comment": moment.AllowComment,
		"allow_reply":   allowReply,
		"comment_count": int64(0),
	}
	return db.Mysql.Model(&model.Moment{}).Create(createPayload).Error
}

// Update 修改
func (m *moment) Update(id int, patch *model.Moment) (err error) {
	return db.Mysql.Model(&model.Moment{}).Where("id = ? ", id).Updates(patch).Error
}
func (m *moment) Find(id int) (moment *model.Moment, err error) {
	var momentModel model.Moment
	if err := db.Mysql.Where("id = ? ", id).First(&momentModel).Error; err != nil {
		return nil, err
	}
	return &momentModel, nil
}

// ListComments 获取动态评论/回复列表（按创建时间升序）
func (m *moment) ListComments(momentId int) ([]model.MomentComment, error) {
	var comments []model.MomentComment
	err := db.Mysql.
		Where("moment_id = ? AND is_deleted = ?", momentId, false).
		Order("created_at asc").
		Joins("User").
		Joins("ReplyToUser").
		Find(&comments).Error
	return comments, err
}

// CreateComment 新增动态评论/回复，并同步评论总数
func (m *moment) CreateComment(comment *model.MomentComment) error {
	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(comment).Error; err != nil {
			return err
		}
		return tx.Model(&model.Moment{}).
			Where("id = ?", comment.MomentId).
			UpdateColumn("comment_count", gorm.Expr("comment_count + 1")).Error
	})
}

// GetCommentByID 查询单条评论
func (m *moment) GetCommentByID(id int) (*model.MomentComment, error) {
	var comment model.MomentComment
	if err := db.Mysql.Where("id = ?", id).First(&comment).Error; err != nil {
		return nil, err
	}
	return &comment, nil
}

// ListCommentForAdmin 管理端评论检索
func (m *moment) ListCommentForAdmin(page int, pageSize int, keyword string, momentId int) ([]model.MomentComment, int64, error) {
	var list []model.MomentComment
	var total int64
	query := db.Mysql.Model(&model.MomentComment{}).Where("is_deleted = ?", false)
	if momentId > 0 {
		query = query.Where("moment_id = ?", momentId)
	}
	if strings.TrimSpace(keyword) != "" {
		query = query.Where("content LIKE ?", "%"+strings.TrimSpace(keyword)+"%")
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.
		Order("created_at desc").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Joins("User").
		Joins("ReplyToUser").
		Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// DeleteComment 软删除评论，并同步评论总数
func (m *moment) DeleteComment(id int) error {
	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		var comment model.MomentComment
		if err := tx.Where("id = ? AND is_deleted = ?", id, false).First(&comment).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.MomentComment{}).Where("id = ?", id).Update("is_deleted", true).Error; err != nil {
			return err
		}
		return tx.Model(&model.Moment{}).
			Where("id = ? AND comment_count > 0", comment.MomentId).
			UpdateColumn("comment_count", gorm.Expr("comment_count - 1")).Error
	})
}

// IncCounter 动态计数原子自增（避免先查再改导致并发覆盖）
func (m *moment) IncCounter(id int, field string, delta int64) (bool, error) {
	// 注释：只允许自增 likes/views 两个字段，防止被滥用更新任意列
	var column string
	switch field {
	case "likes":
		column = "likes"
	case "views":
		column = "views"
	default:
		return false, gorm.ErrInvalidField
	}
	res := db.Mysql.Model(&model.Moment{}).
		Where("id = ?", id).
		UpdateColumn(column, gorm.Expr(column+" + ?", delta))
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}
