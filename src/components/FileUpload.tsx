import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel"
        ) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all duration-300",
        isDragging
          ? "border-primary bg-accent/50 scale-[1.02]"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/30",
        isProcessing && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center px-6 py-12 cursor-pointer">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={cn(
              "rounded-full p-4 transition-all duration-300",
              isDragging
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-accent text-accent-foreground"
            )}
          >
            {isDragging ? (
              <FileSpreadsheet className="w-10 h-10" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? "Drop your Excel file here" : "Upload Excel File"}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .xlsx and .xls files
            </p>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};
