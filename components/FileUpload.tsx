import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploadProps {
    onDataLoaded: (data: any[][], fileName: string) => void;
    currentFileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, currentFileName }) => {
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) throw new Error("Failed to read file");
                
                const workbook = XLSX.read(data, { type: 'array' });
                if (workbook.SheetNames.length === 0) throw new Error("Excel file is empty");
                
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
                
                if (jsonData.length < 1) throw new Error("No data found in sheet");

                onDataLoaded(jsonData, file.name);
            } catch (err) {
                console.error(err);
                setError("Invalid file format. Please try another .xlsx or .csv file.");
            }
        };
        reader.onerror = () => setError("Error reading file.");
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div 
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ease-in-out cursor-pointer
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".xlsx,.csv" 
                    onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center justify-center space-y-2">
                    {currentFileName ? (
                        <div className="bg-green-100 p-3 rounded-full">
                            <FileSpreadsheet className="h-6 w-6 text-green-600" />
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-3 rounded-full">
                            <UploadCloud className="h-6 w-6 text-gray-500" />
                        </div>
                    )}
                    
                    <div className="text-sm font-medium text-gray-900">
                        {currentFileName || "Click or drag file here"}
                    </div>
                    <p className="text-xs text-gray-500">
                        Supports .xlsx, .csv
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
};