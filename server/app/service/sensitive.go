package service

import (
	"context"
	"encoding/json"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/cloudflare/ahocorasick"
	"gorm.io/gorm"
)

const systemSensitiveOperator = "system:sensitive"
const sensitiveWordsRedisKey = "z_sensitive_words_enabled"
const sensitiveWordsRedisTTL = 10 * time.Minute
const (
	SensitiveLevelLow    = 1
	SensitiveLevelMedium = 2
	SensitiveLevelHigh   = 3
)

type sensitiveWordRule struct {
	Word  string `json:"word"`
	Level int    `json:"level"`
}

var sensitiveMatcherState = struct {
	mu      sync.RWMutex
	version string
	words   []sensitiveWordRule
	matcher *ahocorasick.Matcher
}{}

// SensitiveProcessResult 敏感词处理结果
type SensitiveProcessResult struct {
	HitWords     []string // 本次命中的敏感词集合
	HitLevel     int      // 本次命中词中的最高等级
	AutoRevoked  bool     // 是否已触发系统自动撤回
	OriginalText string   // 原始消息文本（用于必要时审计）
}

// SensitiveWordList 敏感词列表
func SensitiveWordList(page int, pageSize int, query *model.SensitiveWordQuery) ([]model.SensitiveWord, int64, error) {
	// 管理端分页查询敏感词，支持按词和状态筛选
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.Model(&model.SensitiveWord{})
	if query != nil {
		if strings.TrimSpace(query.Word) != "" {
			sql = sql.Where("word LIKE ?", "%"+strings.TrimSpace(query.Word)+"%")
		}
		if query.Status == 0 || query.Status == 1 {
			sql = sql.Where("status = ?", query.Status)
		}
		if query.Level >= SensitiveLevelLow && query.Level <= SensitiveLevelHigh {
			sql = sql.Where("level = ?", query.Level)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.SensitiveWord
	if err := sql.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// CreateSensitiveWord 新增敏感词
func CreateSensitiveWord(req *model.SensitiveWordCreateReq) error {
	// 新增后立即失效缓存，保证检测链路及时生效
	word := strings.TrimSpace(req.Word)
	status := req.Status
	if status != 0 && status != 1 {
		status = 1
	}
	level := req.Level
	if level < SensitiveLevelLow || level > SensitiveLevelHigh {
		level = SensitiveLevelHigh
	}
	item := &model.SensitiveWord{
		Word:   word,
		Status: status,
		Level:  level,
		Remark: strings.TrimSpace(req.Remark),
	}
	if err := db.Mysql.Create(item).Error; err != nil {
		return err
	}
	InvalidateSensitiveWordsCache()
	return nil
}

// UpdateSensitiveWord 更新敏感词
func UpdateSensitiveWord(id int, req *model.SensitiveWordUpdateReq) error {
	// 编辑后失效缓存，避免继续使用旧词库
	updates := map[string]interface{}{}
	if strings.TrimSpace(req.Word) != "" {
		updates["word"] = strings.TrimSpace(req.Word)
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Level != nil && *req.Level >= SensitiveLevelLow && *req.Level <= SensitiveLevelHigh {
		updates["level"] = *req.Level
	}
	updates["remark"] = strings.TrimSpace(req.Remark)
	if err := db.Mysql.Model(&model.SensitiveWord{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return err
	}
	InvalidateSensitiveWordsCache()
	return nil
}

// DeleteSensitiveWord 删除敏感词
func DeleteSensitiveWord(id int) error {
	// 删除后失效缓存，避免已删除词仍命中
	if err := db.Mysql.Where("id = ?", id).Delete(&model.SensitiveWord{}).Error; err != nil {
		return err
	}
	InvalidateSensitiveWordsCache()
	return nil
}

// SensitiveHitLogList 命中日志列表
func SensitiveHitLogList(page int, pageSize int, query *model.SensitiveHitLogQuery) ([]model.SensitiveHitLog, int64, error) {
	// 分页查询命中日志，供管理端审计/回溯使用
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.Model(&model.SensitiveHitLog{})
	if query != nil {
		if strings.TrimSpace(query.Word) != "" {
			sql = sql.Where("word LIKE ?", "%"+strings.TrimSpace(query.Word)+"%")
		}
		if strings.TrimSpace(query.SenderID) != "" {
			sql = sql.Where("sender_id = ?", strings.TrimSpace(query.SenderID))
		}
		if query.GroupID > 0 {
			sql = sql.Where("group_id = ?", query.GroupID)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.SensitiveHitLog
	if err := sql.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// getEnabledSensitiveWordsFromDB 从数据库读取启用中的敏感词
func getEnabledSensitiveWordsFromDB() ([]sensitiveWordRule, error) {
	var rows []model.SensitiveWord
	if err := db.Mysql.Select("word,level").Where("status = ?", 1).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]sensitiveWordRule, 0, len(rows))
	for _, row := range rows {
		word := strings.TrimSpace(row.Word)
		if word != "" {
			level := row.Level
			if level < SensitiveLevelLow || level > SensitiveLevelHigh {
				level = SensitiveLevelHigh
			}
			out = append(out, sensitiveWordRule{
				Word:  word,
				Level: level,
			})
		}
	}
	return out, nil
}

func normalizeSensitiveRules(words []sensitiveWordRule) []sensitiveWordRule {
	// 统一去重去空并排序，便于缓存版本稳定比较
	out := make([]sensitiveWordRule, 0, len(words))
	seen := make(map[string]int, len(words))
	for _, item := range words {
		word := strings.TrimSpace(item.Word)
		if word == "" {
			continue
		}
		level := item.Level
		if level < SensitiveLevelLow || level > SensitiveLevelHigh {
			level = SensitiveLevelHigh
		}
		if oldLevel, ok := seen[word]; ok {
			// 同词取最高风险等级，确保处置策略从严
			if level > oldLevel {
				seen[word] = level
			}
			continue
		}
		seen[word] = level
	}
	for word, level := range seen {
		out = append(out, sensitiveWordRule{Word: word, Level: level})
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].Word < out[j].Word
	})
	return out
}

func getEnabledSensitiveWords() ([]sensitiveWordRule, error) {
	// 优先走 Redis 词库缓存，未命中时回源数据库并回填缓存
	redisClient := db.Redis()
	if redisClient != nil {
		raw, err := redisClient.Get(context.Background(), sensitiveWordsRedisKey).Result()
		if err == nil && strings.TrimSpace(raw) != "" {
			var cached []sensitiveWordRule
			if jsonErr := json.Unmarshal([]byte(raw), &cached); jsonErr == nil {
				return normalizeSensitiveRules(cached), nil
			}
		}
	}
	words, err := getEnabledSensitiveWordsFromDB()
	if err != nil {
		return nil, err
	}
	normalized := normalizeSensitiveRules(words)
	if redisClient != nil {
		if bs, jsonErr := json.Marshal(normalized); jsonErr == nil {
			_ = redisClient.Set(context.Background(), sensitiveWordsRedisKey, string(bs), sensitiveWordsRedisTTL).Err()
		}
	}
	return normalized, nil
}

func getSensitiveRulesVersion(rules []sensitiveWordRule) string {
	parts := make([]string, 0, len(rules))
	for _, rule := range rules {
		parts = append(parts, rule.Word+":"+strconv.Itoa(rule.Level))
	}
	return strings.Join(parts, "\x00")
}

func getOrBuildSensitiveMatcher(words []sensitiveWordRule) ([]sensitiveWordRule, *ahocorasick.Matcher) {
	// 词库版本不变时复用 matcher，降低高并发下重复构建开销
	normalized := normalizeSensitiveRules(words)
	if len(normalized) == 0 {
		return normalized, nil
	}
	version := getSensitiveRulesVersion(normalized)
	sensitiveMatcherState.mu.RLock()
	if sensitiveMatcherState.version == version && sensitiveMatcherState.matcher != nil {
		wordsCopy := append([]sensitiveWordRule(nil), sensitiveMatcherState.words...)
		matcher := sensitiveMatcherState.matcher
		sensitiveMatcherState.mu.RUnlock()
		return wordsCopy, matcher
	}
	sensitiveMatcherState.mu.RUnlock()

	dictionary := make([]string, 0, len(normalized))
	for _, item := range normalized {
		dictionary = append(dictionary, item.Word)
	}
	matcher := ahocorasick.NewStringMatcher(dictionary)
	sensitiveMatcherState.mu.Lock()
	sensitiveMatcherState.version = version
	sensitiveMatcherState.words = append([]sensitiveWordRule(nil), normalized...)
	sensitiveMatcherState.matcher = matcher
	sensitiveMatcherState.mu.Unlock()
	return normalized, matcher
}

// InvalidateSensitiveWordsCache 失效敏感词 Redis 与进程内 matcher 缓存
func InvalidateSensitiveWordsCache() {
	redisClient := db.Redis()
	if redisClient != nil {
		_ = redisClient.Del(context.Background(), sensitiveWordsRedisKey).Err()
	}
	sensitiveMatcherState.mu.Lock()
	sensitiveMatcherState.version = ""
	sensitiveMatcherState.words = nil
	sensitiveMatcherState.matcher = nil
	sensitiveMatcherState.mu.Unlock()
}

// WarmupSensitiveMatcher 启动预热敏感词缓存和 matcher（失败不阻断主流程）
func WarmupSensitiveMatcher() {
	words, err := getEnabledSensitiveWords()
	if err != nil {
		log.Warn("敏感词预热失败: " + err.Error())
		return
	}
	_, matcher := getOrBuildSensitiveMatcher(words)
	if matcher == nil {
		log.Info("敏感词预热完成：当前无启用词")
		return
	}
	log.Info("敏感词预热完成：已构建 matcher，词数=" + strconv.Itoa(len(words)))
}

// hitSensitiveWordsFromContent 基于缓存的 Aho-Corasick 检测文本命中词（同词只记录一次）
func hitSensitiveWordsFromContent(content string, words []sensitiveWordRule) ([]string, int) {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, 0
	}
	matcherWords, matcher := getOrBuildSensitiveMatcher(words)
	if len(matcherWords) == 0 || matcher == nil {
		return nil, 0
	}
	matchIdx := matcher.Match([]byte(content))
	if len(matchIdx) == 0 {
		return nil, 0
	}
	uniq := make(map[int]struct{}, len(matchIdx))
	out := make([]string, 0, len(matchIdx))
	maxLevel := SensitiveLevelLow
	for _, idx := range matchIdx {
		if idx < 0 || idx >= len(matcherWords) {
			continue
		}
		if _, ok := uniq[idx]; ok {
			continue
		}
		uniq[idx] = struct{}{}
		out = append(out, matcherWords[idx].Word)
		if matcherWords[idx].Level > maxLevel {
			maxLevel = matcherWords[idx].Level
		}
	}
	return out, maxLevel
}

// RecordSensitiveHitsByMessage 按消息内容记录敏感词命中日志
func RecordSensitiveHitsByMessage(chatLog *model.ChatLog) error {
	// 仅记录命中日志，不做自动处置（适配只审计场景）
	if chatLog == nil || chatLog.ID <= 0 {
		return nil
	}
	words, err := getEnabledSensitiveWords()
	if err != nil {
		return err
	}
	hitWords, _ := hitSensitiveWordsFromContent(chatLog.Content, words)
	if len(hitWords) == 0 {
		return nil
	}
	logs := make([]model.SensitiveHitLog, 0, len(hitWords))
	for _, word := range hitWords {
		logs = append(logs, model.SensitiveHitLog{
			Word:      word,
			MessageID: chatLog.ID,
			SenderID:  chatLog.SenderId,
			GroupID:   chatLog.GroupId,
			Content:   chatLog.Content,
		})
	}
	return db.Mysql.Create(&logs).Error
}

// getSensitiveAutoRevokeEnabled 读取 ini 中“敏感词自动撤回”开关（默认开启）
func getSensitiveAutoRevokeEnabled() bool {
	if config.App == nil {
		return true
	}
	return config.App.SensitiveAutoRevoke
}

// ProcessSensitiveMessage 处理消息敏感词：记录命中并触发系统自动撤回
func ProcessSensitiveMessage(chatLog *model.ChatLog) (*SensitiveProcessResult, error) {
	result := &SensitiveProcessResult{}
	if chatLog == nil || chatLog.ID <= 0 {
		return result, nil
	}
	result.OriginalText = chatLog.Content
	words, err := getEnabledSensitiveWords()
	if err != nil {
		return nil, err
	}
	hitWords, hitLevel := hitSensitiveWordsFromContent(chatLog.Content, words)
	if len(hitWords) == 0 {
		return result, nil
	}
	result.HitLevel = hitLevel
	logs := make([]model.SensitiveHitLog, 0, len(hitWords))
	for _, word := range hitWords {
		logs = append(logs, model.SensitiveHitLog{
			Word:      word,
			MessageID: chatLog.ID,
			SenderID:  chatLog.SenderId,
			GroupID:   chatLog.GroupId,
			Content:   chatLog.Content,
		})
	}
	err = db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&logs).Error; err != nil {
			return err
		}
		// 通过系统配置控制是否自动撤回，兼容“只记录不拦截”模式
		// 仅高危词（3级）且开关开启时自动撤回；中低危仅记录命中
		if !getSensitiveAutoRevokeEnabled() || hitLevel < SensitiveLevelHigh {
			return nil
		}
		if err := tx.Model(&model.ChatLog{}).Where("id = ?", chatLog.ID).Updates(map[string]interface{}{
			"is_revoked": true,
			"operate_by": systemSensitiveOperator,
		}).Error; err != nil {
			return err
		}
		result.AutoRevoked = true
		return nil
	})
	if err != nil {
		return nil, err
	}
	result.HitWords = hitWords
	if result.AutoRevoked {
		chatLog.IsRevoked = true
		chatLog.OperateBy = systemSensitiveOperator
	}
	return result, nil
}
