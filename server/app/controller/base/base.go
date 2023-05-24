package base

import (
	"gitee.com/jiang-xia/gin-zone/server/config"
	"os"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type Base struct {
}

type FileInfo struct {
	Filename string `json:"filename"`
	Url      string `json:"url"`
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
	//fmt.Printf("fileInfo%+v", file)
	date := time.Now().Format("2006-01")
	//当前文件路径加文件名
	pathName := "/uploads/" + date + "/" + file.Filename
	//目录路径
	dirName := config.App.PublicPath + "/uploads/" + date
	//fmt.Println(dirName)
	// 根据当天日期创建文件夹
	err = os.MkdirAll(dirName, 0755)
	if err != nil {
		response.Fail(c, "服务器错误", nil)
		panic(err)
		return
	}
	//统一响应返回的url资源路径
	urlPathName := "/public" + pathName
	//保存到本地的文件路径
	savePathName := config.App.PublicPath + pathName
	fileInfo := &FileInfo{
		Filename: file.Filename,
		Url:      urlPathName,
	}

	// 根据路劲保存文件
	c.SaveUploadedFile(file, savePathName)
	// fmt.Printf("fileInfo%+v", fileInfo)
	response.Success(c, fileInfo, "")
}
