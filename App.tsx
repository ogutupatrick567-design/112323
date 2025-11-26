import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Play, Download, AlertCircle, Loader2 } from 'lucide-react';
import { readExcelToText, exportToExcel } from './services/excelService';
import { extractDataFromText } from './services/geminiService';
import { StudentProfile, ProcessingStats } from './types';
import { DataTable } from './components/DataTable';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<StudentProfile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(!process.env.API_KEY);

  const stats: ProcessingStats = {
    total: results.length,
    processed: results.filter(r => r.status === 'success' || r.status === 'error').length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      setFiles(newFiles);
      
      // Initialize results with pending state and all fields null
      const initialResults: StudentProfile[] = newFiles.map(f => ({
        fileName: f.name,
        name: null, gender: null,
        packageName: null, singleCourse: null,
        phone: null, parentPhone: null,
        school: null, grade: null,
        targetCountry: null, targetDegree: null,
        targetScore: null, submissionTime: null,
        currentScore: null, accountInfo: null,
        entryTestScore: null, cetScore: null,
        origin: null, isFullTime: null,
        enrollmentDate: null, enrollmentAmount: null,
        discount: null, isKOL: null,
        coursePlan: null, studentPersonality: null,
        classTimePreference: null, examPlan: null, specialRequests: null,
        campus: null, consultant: null, studyManager: null,
        status: 'pending'
      }));
      setResults(initialResults);
    }
  };

  const processBatch = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    // Create a copy to work with
    let currentResults = [...results];

    // Process sequentially to manage rate limits comfortably
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to processing
      currentResults[i] = { ...currentResults[i], status: 'processing' };
      setResults([...currentResults]);

      try {
        // 1. Read Excel to Text (CSV)
        const csvText = await readExcelToText(file);
        
        // 2. Send to Gemini
        const data = await extractDataFromText(csvText, file.name);

        // 3. Update Result
        currentResults[i] = {
          ...currentResults[i],
          ...data,
          status: 'success'
        };
      } catch (error: any) {
        console.error(`Error processing ${file.name}:`, error);
        currentResults[i] = {
          ...currentResults[i],
          status: 'error',
          errorMessage: error.message || "Extraction failed"
        };
      }
      
      // Update state after each file processing
      setResults([...currentResults]);
      
      // Small delay to be nice to the API rate limiter
      await new Promise(r => setTimeout(r, 500)); 
    }

    setIsProcessing(false);
  }, [files, results]);

  const handleExport = () => {
    exportToExcel(results);
  };

  if (apiKeyMissing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">未配置 API Key</h2>
          <p className="text-gray-600 mb-4">
            该程序需要 Google Gemini API Key 才能运行。请确保在环境中设置了 <code>process.env.API_KEY</code>。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">学员画像智能提取器 (全字段版)</h1>
              <p className="text-xs text-gray-500">基于 Google Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex gap-4">
             {stats.success > 0 && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                导出 Excel
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. 选择 Excel 文件 (支持多选)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">选择文件 ({files.length} 个)</span>
                  <input 
                    type="file" 
                    multiple 
                    accept=".xlsx, .xls" 
                    onChange={handleFileChange}
                    className="hidden" 
                    disabled={isProcessing}
                  />
                </label>
                {files.length > 0 && !isProcessing && stats.processed === 0 && (
                   <button 
                   onClick={processBatch}
                   className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                 >
                   <Play className="w-4 h-4" />
                   开始提取
                 </button>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-blue-600 px-4 py-2 bg-blue-50 rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">正在分析中...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
               <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500 uppercase">总文件</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                    <div className="text-xs text-gray-500 uppercase">提取成功</div>
                  </div>
                  <div>
                     {/* Show percentage */}
                     <div className="text-2xl font-bold text-blue-600">
                        {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
                     </div>
                     <div className="text-xs text-gray-500 uppercase">进度</div>
                  </div>
               </div>
               {/* Progress Bar */}
               <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.total > 0 ? (stats.processed / stats.total) * 100 : 0}%` }}
                  ></div>
               </div>
            </div>

          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4">分析结果预览 <span className="text-sm font-normal text-gray-500">(完整信息请导出 Excel)</span></h2>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <FileSpreadsheet className="w-12 h-12 mb-2 opacity-50" />
              <p>请上传 Excel 文件开始分析</p>
            </div>
          ) : (
            <DataTable data={results} />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;