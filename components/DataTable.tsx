import React from 'react';
import { StudentProfile } from '../types';

interface DataTableProps {
  data: StudentProfile[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">状态</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">文件名</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">姓名</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">电话</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">学校</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">套餐名称</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">意向国家</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">目标分数</th>
            <th scope="col" className="px-6 py-3 min-w-[200px]">学员画像/性格</th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">顾问</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, index) => (
            <tr key={index} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {student.status === 'success' && <span className="text-green-600 font-bold">● 完成</span>}
                {student.status === 'processing' && <span className="text-blue-600 animate-pulse">● 处理中...</span>}
                {student.status === 'error' && <span className="text-red-600" title={student.errorMessage}>● 失败</span>}
                {student.status === 'pending' && <span className="text-gray-400">● 等待</span>}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap max-w-[150px] truncate" title={student.fileName}>
                {student.fileName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{student.name || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{student.phone || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{student.school || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate" title={student.packageName || ''}>{student.packageName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{student.targetCountry || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{student.targetScore || '-'}</td>
              <td className="px-6 py-4 truncate max-w-[250px]" title={student.studentPersonality || ''}>
                {student.studentPersonality || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{student.consultant || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};