import * as XLSX from 'xlsx';
import { StudentProfile } from '../types';

/**
 * Reads an Excel file and converts the first sheet to a CSV string.
 * This preserves the textual layout which the AI can then parse.
 */
export const readExcelToText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to CSV to keep spatial context for the LLM
        const csvText = XLSX.utils.sheet_to_csv(worksheet);
        resolve(csvText);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Exports the processed data array to a new Excel file
 */
export const exportToExcel = (data: StudentProfile[]) => {
  // Filter out internal status fields for the export
  const exportData = data.map(item => ({
    '文件名': item.fileName,
    '学员姓名': item.name,
    '性别': item.gender,
    '所报套餐名称': item.packageName,
    '单独报名课程': item.singleCourse,
    '学生电话': item.phone,
    '家长电话': item.parentPhone,
    '学校': item.school,
    '年级': item.grade,
    '意向国家': item.targetCountry,
    '留学阶段': item.targetDegree,
    '目标分数': item.targetScore,
    '递交成绩时间': item.submissionTime,
    '实考成绩': item.currentScore,
    '考试账号': item.accountInfo,
    '入学测试成绩': item.entryTestScore,
    '四六级成绩': item.cetScore,
    '生源地': item.origin,
    '是否脱产': item.isFullTime,
    '报名日期': item.enrollmentDate,
    '报名金额': item.enrollmentAmount,
    '报名折扣': item.discount,
    '是否KOL': item.isKOL,
    '课程规划方案': item.coursePlan,
    '学员画像/性格': item.studentPersonality,
    '方便上课时间': item.classTimePreference,
    '考试计划': item.examPlan,
    '特殊要求': item.specialRequests,
    '校区': item.campus,
    '顾问': item.consultant,
    '学管': item.studyManager,
    '处理状态': item.status === 'success' ? '成功' : '失败'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "学员画像汇总");
  
  // Generate filename with timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `学员画像汇总_全字段_${dateStr}.xlsx`);
};