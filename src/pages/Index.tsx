import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataTable, AttributeData } from "@/components/DataTable";
import { parseExcelFile } from "@/utils/excelParser";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<AttributeData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const data = await parseExcelFile(file);
      setExtractedData(data);
      
      toast({
        title: "Success!",
        description: `Extracted ${data.length} attributes from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse Excel file",
        variant: "destructive",
      });
      setExtractedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setExtractedData([]);
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary p-3 shadow-sm">
              <FileSpreadsheet className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Amazon Attribute Extractor
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Extract and manage product attributes from Excel templates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload Section */}
          {extractedData.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />
              
              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Processing {fileName}...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Success Message */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-secondary/10 p-3">
                      <CheckCircle2 className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Successfully Extracted
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {extractedData.length} attributes from {fileName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    size="sm"
                  >
                    Upload New File
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Extracted Attributes
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {extractedData.length} attributes
                  </p>
                </div>
                <DataTable data={extractedData} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
