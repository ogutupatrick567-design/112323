import { GoogleGenAI, Type } from "@google/genai";
import { StudentProfile } from "../types";

// Helper to sanitize output, removing Markdown code blocks if present
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const extractDataFromText = async (csvData: string, fileName: string): Promise<Partial<StudentProfile>> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Define the schema for strict JSON output matching the full form
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "学员姓名" },
      gender: { type: Type.STRING, description: "性别" },
      packageName: { type: Type.STRING, description: "所报套餐名称" },
      singleCourse: { type: Type.STRING, description: "单独报名课程及课时 (非套餐)" },
      phone: { type: Type.STRING, description: "学生电话" },
      parentPhone: { type: Type.STRING, description: "家长电话" },
      school: { type: Type.STRING, description: "学校" },
      grade: { type: Type.STRING, description: "年级" },
      targetCountry: { type: Type.STRING, description: "留学意向国家" },
      targetDegree: { type: Type.STRING, description: "留学阶段" },
      targetScore: { type: Type.STRING, description: "目标分数" },
      submissionTime: { type: Type.STRING, description: "递交成绩时间" },
      currentScore: { type: Type.STRING, description: "雅思/托福实考成绩" },
      accountInfo: { type: Type.STRING, description: "雅思/托福账号" },
      entryTestScore: { type: Type.STRING, description: "入学测试成绩" },
      cetScore: { type: Type.STRING, description: "大学四/六级成绩" },
      origin: { type: Type.STRING, description: "生源地" },
      isFullTime: { type: Type.STRING, description: "是否脱产" },
      enrollmentDate: { type: Type.STRING, description: "报名日期" },
      enrollmentAmount: { type: Type.STRING, description: "报名金额" },
      discount: { type: Type.STRING, description: "报名折扣" },
      isKOL: { type: Type.STRING, description: "是否为KOL" },
      coursePlan: { type: Type.STRING, description: "课程规划方案 (summary of text)" },
      studentPersonality: { type: Type.STRING, description: "学员情况介绍/学员性格 (summary of text)" },
      classTimePreference: { type: Type.STRING, description: "方便上课的时间" },
      examPlan: { type: Type.STRING, description: "大体考试时间计划" },
      specialRequests: { type: Type.STRING, description: "家长/学生的特殊要求" },
      campus: { type: Type.STRING, description: "校区" },
      consultant: { type: Type.STRING, description: "顾问" },
      studyManager: { type: Type.STRING, description: "学管" }
    },
    required: ["name", "school"], 
  };

  const prompt = `
    You are a data extraction specialist. 
    I will provide the text content of a "Student Handover Form" (Excel export). 
    
    Extract ALL personal information fields defined in the schema.
    The data comes from a spreadsheet, so labels might be separated from values by commas or newlines.
    
    Notes:
    1. If a field is explicitly "无" (None), return "无".
    2. If a field is missing, return null.
    3. For long text blocks like "Student Personality" or "Course Plan", keep the original text but clean up excessive newlines.
    4. "Current Score" might be labeled as "雅思/托福实考成绩".
    
    Here is the data:
    ---
    ${csvData.substring(0, 20000)} 
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(cleanJson(text));
    
    return {
      fileName,
      ...json
    };

  } catch (error) {
    console.error("Gemini Extraction Error", error);
    throw error;
  }
};