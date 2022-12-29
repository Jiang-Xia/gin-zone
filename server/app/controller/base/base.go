package base

import (
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
	// 根据路劲保存文件
	// c.SaveUploadedFile(file, "."+filePathName)
	// fmt.Printf("fileInfo%+v", fileInfo)
	file, _ := c.FormFile("file")
	date := time.Now().Format("2006-01-02")
	pathName := "/public/uploads/" + date
	// 根据当天日期创建文件夹
	err := os.MkdirAll("."+pathName, 0755)
	if err != nil {
		response.Fail(c, "服务器错误", nil)
		return
	}
	filePathName := pathName + "/" + file.Filename
	fileInfo := &FileInfo{
		Filename: file.Filename,
		Url:      filePathName,
	}
	// fileInfo2 := &FileInfo{
	// 	Filename: "file.Filename",
	// 	Url:      "filePathName",
	// }
	// 根据路劲保存文件
	c.SaveUploadedFile(file, "."+filePathName)
	// fmt.Printf("fileInfo%+v", fileInfo)
	response.Success(c, fileInfo, "")
}
