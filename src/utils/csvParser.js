// 简单的CSV解析工具
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n')
  if (lines.length < 2) {
    throw new Error('CSV文件内容为空或格式不正确')
  }

  // 获取表头
  const headers = lines[0].split(',').map(h => h.trim())
  
  // 验证表头是否正确
  const requiredHeaders = ['用户名', '密码', '角色(0-管理员1-教师2-学生)', '真实姓名']
  requiredHeaders.forEach(header => {
    if (!headers.includes(header)) {
      throw new Error(`CSV文件缺少必要的列：${header}`)
    }
  })

  // 解析数据行
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(',')
    const row = {}

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      switch (header) {
        case '用户名':
          row.username = value
          break
        case '密码':
          row.password = value
          break
        case '角色(0-管理员1-教师2-学生)':
          row.role = value
          break
        case '真实姓名':
          row.realName = value
          break
        case '学号(学生)':
          row.studentId = value
          break
        case '班级(学生)':
          row.className = value
          break
        case '工号(教师)':
          row.teacherId = value
          break
        case '部门(教师)':
          row.department = value
          break
        case '邮箱':
          row.email = value
          break
        case '电话':
          row.phone = value
          break
      }
    })

    data.push(row)
  }

  return data
}