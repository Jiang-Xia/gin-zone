package base

import (
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type Base struct {
}

type FileInfo struct {
	// 原始文件名：用于业务侧检索和人工排查
	Filename string `json:"filename"`
	// 存储文件名：服务端落盘后的唯一文件名
	SavedName string `json:"savedName"`
	Url       string `json:"url"`
}

//	godoc
//
// @Summary     上传接口
// @Description 上传接口
// @Tags        基础模块
// @Accept      json
// @Produce     json
// @Success     200  {object} FileInfo
// @Router      /base/upload [POST]
func (t *Base) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, "文件上传失败", nil)
		return
	}
	//fmt.Printf("fileInfo%+v", file)
	date := time.Now().Format("2006-01")
	// 原始文件名：保持兼容并用于回显/检索
	originalName := strings.TrimSpace(file.Filename)
	if originalName == "" {
		response.Fail(c, "文件名无效", nil)
		return
	}
	// 生成唯一落盘文件名：避免同名覆盖历史文件
	safeName := filepath.Base(originalName)
	ext := strings.ToLower(filepath.Ext(safeName))
	nameOnly := strings.TrimSuffix(safeName, ext)
	if nameOnly == "" {
		nameOnly = "file"
	}
	storedName := fmt.Sprintf("%d_%s%s", time.Now().UnixMilli(), nameOnly, ext)
	//当前文件路径加文件名
	pathName := "/uploads/" + date + "/" + storedName
	//目录路径
	dirName := config.App.PublicPath + "/uploads/" + date
	//fmt.Println(dirName)
	// 根据当天日期创建文件夹
	err = os.MkdirAll(dirName, 0755)
	if err != nil {
		response.Fail(c, "服务器错误", nil)
		return
	}
	//统一响应返回的url资源路径
	urlPathName := "/public" + pathName
	//保存到本地的文件路径
	savePathName := config.App.PublicPath + pathName
	fileInfo := &FileInfo{
		Filename:  originalName,
		SavedName: storedName,
		Url:       urlPathName,
	}

	// 根据路劲保存文件
	if err = c.SaveUploadedFile(file, savePathName); err != nil {
		response.Fail(c, "文件保存失败", nil)
		return
	}
	// fmt.Printf("fileInfo%+v", fileInfo)
	response.Success(c, fileInfo, "")
}
