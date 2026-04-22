package service

import (
	"encoding/json"
	"strings"
	"time"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
)

// AdminAuditPayload 审计日志写入参数
type AdminAuditPayload struct {
	OperatorUserId string
	Action         string
	TargetType     string
	TargetID       string
	Reason         string
	BeforeValue    interface{}
	AfterValue     interface{}
	IP             string
	UserAgent      string
}

// CreateAdminAuditLog 写入管理端审计日志（失败不影响主流程）
func CreateAdminAuditLog(payload *AdminAuditPayload) {
	if payload == nil || payload.OperatorUserId == "" || payload.Action == "" {
		return
	}
	toJSON := func(v interface{}) string {
		if v == nil {
			return ""
		}
		bs, err := json.Marshal(v)
		if err != nil {
			return ""
		}
		return string(bs)
	}
	log := &model.AdminAuditLog{
		OperatorUserId: payload.OperatorUserId,
		Action:         payload.Action,
		TargetType:     payload.TargetType,
		TargetID:       payload.TargetID,
		Reason:         payload.Reason,
		BeforeValue:    toJSON(payload.BeforeValue),
		AfterValue:     toJSON(payload.AfterValue),
		IP:             payload.IP,
		UserAgent:      payload.UserAgent,
	}
	_ = db.Mysql.Create(log).Error
}

func parseAuditQueryTime(value string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02 15:04:05", strings.TrimSpace(value), time.Local)
}

// QueryAdminAuditLogs 查询管理端审计日志
func QueryAdminAuditLogs(page int, pageSize int, query *model.AdminAuditLogQuery) ([]model.AdminAuditLog, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.Model(&model.AdminAuditLog{})
	if query != nil {
		if strings.TrimSpace(query.OperatorUserId) != "" {
			sql = sql.Where("operator_user_id = ?", strings.TrimSpace(query.OperatorUserId))
		}
		if strings.TrimSpace(query.Action) != "" {
			sql = sql.Where("action LIKE ?", "%"+strings.TrimSpace(query.Action)+"%")
		}
		if strings.TrimSpace(query.TargetType) != "" {
			sql = sql.Where("target_type = ?", strings.TrimSpace(query.TargetType))
		}
		if strings.TrimSpace(query.StartAt) != "" {
			startAt, err := parseAuditQueryTime(query.StartAt)
			if err != nil {
				return nil, 0, err
			}
			sql = sql.Where("created_at >= ?", startAt)
		}
		if strings.TrimSpace(query.EndAt) != "" {
			endAt, err := parseAuditQueryTime(query.EndAt)
			if err != nil {
				return nil, 0, err
			}
			sql = sql.Where("created_at <= ?", endAt)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.AdminAuditLog
	if err := sql.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}
