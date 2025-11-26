export interface StudentProfile {
  fileName: string;
  // Row 1
  name: string | null; // 学员姓名
  gender: string | null; // 性别
  // Row 2
  packageName: string | null; // 所报套餐名称
  singleCourse: string | null; // 单独报名课程及课时
  // Row 3
  phone: string | null; // 学生电话
  parentPhone: string | null; // 家长电话
  // Row 4
  school: string | null; // 学校
  grade: string | null; // 年级
  // Row 5
  targetCountry: string | null; // 留学意向国家
  targetDegree: string | null; // 留学阶段
  // Row 6
  targetScore: string | null; // 目标分数
  submissionTime: string | null; // 递交成绩时间
  // Row 7
  currentScore: string | null; // 雅思/托福实考成绩
  accountInfo: string | null; // 雅思/托福账号
  // Row 8
  entryTestScore: string | null; // 入学测试成绩
  cetScore: string | null; // 大学四/六级成绩
  // Row 9
  origin: string | null; // 生源地
  isFullTime: string | null; // 是否脱产
  // Row 10
  enrollmentDate: string | null; // 报名日期
  enrollmentAmount: string | null; // 报名金额
  // Row 11
  discount: string | null; // 报名折扣
  isKOL: string | null; // 是否为KOL
  // Row 12
  coursePlan: string | null; // 课程规划方案
  // Row 14
  studentPersonality: string | null; // 学员情况介绍
  // Row 15 - Other Info
  classTimePreference: string | null; // 方便上课的时间
  examPlan: string | null; // 大体考试时间计划
  specialRequests: string | null; // 特殊要求
  // Footer
  campus: string | null; // 校区
  consultant: string | null; // 顾问
  studyManager: string | null; // 学管

  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

export interface ProcessingStats {
  total: number;
  processed: number;
  success: number;
  failed: number;
}