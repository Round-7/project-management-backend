import * as ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import { prisma } from '../config'
import { logger } from '../utils/logger'
import type { ProjectCreateData } from '../types'

export interface ExcelProcessResult {
  data: ProjectCreateData[]
  successCount: number
  failCount: number
}

export const processExcelFile = async (
  file: File
): Promise<ExcelProcessResult> => {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('无法读取Excel表格')
  }

  const headers = worksheet.getRow(1).values as string[]
  const nameIndex = headers.findIndex(
    h => typeof h === 'string' && h.toLowerCase().includes('项目名称')
  )

  if (nameIndex === -1) {
    throw new Error('无法识别项目名称列')
  }

  const projectData: ProjectCreateData[] = []
  let successCount = 0
  let failCount = 0

  // 从第2行开始处理数据（跳过表头）
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber)
    if (!row.values || (row.values as Array<string>).length <= 1) continue

    const name = String(row.getCell(nameIndex).value || '')

    // 验证数据
    if (!name) {
      failCount++
      continue
    }

    projectData.push({ name })
    successCount++
  }

  return {
    data: projectData,
    successCount,
    failCount
  }
}

/**
 * 导出项目数据到Excel
 * @param query 查询条件
 * @returns Excel工作簿
 */
export const exportProjectsToExcel = async (
  query?: string
): Promise<Buffer> => {
  // 构建查询条件
  const where = query
    ? {
        name: {
          contains: query
        }
      }
    : {}

  // 查询项目数据
  let projects
  try {
    projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
  } catch (err) {
    logger.error('查询项目数据失败:', err)
    throw err
  }

  // 格式化数据
  const formattedProjects = projects.map(project => ({
    ID: project.id,
    项目名称: project.name,
    创建时间: project.createdAt.toLocaleString(),
    更新时间: project.updatedAt.toLocaleString()
  }))

  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(formattedProjects)

  // 设置列宽
  const columnWidths = [
    { wch: 36 }, // ID
    { wch: 30 }, // 项目名称
    { wch: 20 }, // 创建时间
    { wch: 20 } // 更新时间
  ]
  worksheet['!cols'] = columnWidths

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '项目列表')

  // 生成Excel文件
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return excelBuffer
}
