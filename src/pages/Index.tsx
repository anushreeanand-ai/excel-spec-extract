import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { FilesList } from "@/components/FilesList";
import { EditAttributesDialog } from "@/components/EditAttributesDialog";
import { parseZipFile } from "@/utils/zipParser";
import { FileData } from "@/types/attributeData";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filesData, setFilesData] = useState<FileData[]>([]);
  const [editingFile, setEditingFile] = useState<FileData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const extracted = await parseZipFile(file);
      
      if (extracted.length === 0) {
        toast({
          title: "No Files Found",
          description: "No valid Excel files found in the ZIP. Please ensure files are in Amazon, Flipkart, or Myntra folders.",
          variant: "destructive",
        });
      } else {
        setFilesData(extracted);
        toast({
          title: "Success!",
          description: `Extracted ${extracted.length} file(s) from ${file.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process ZIP file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (fileData: FileData) => {
    setEditingFile(fileData);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdits = (updatedFileData: FileData) => {
    setFilesData((prev) =>
      prev.map((f) =>
        f.fileName === updatedFileData.fileName &&
        f.marketplace === updatedFileData.marketplace
          ? updatedFileData
          : f
      )
    );
  };

  const handleDownload = (fileData: FileData) => {
    const jsonData = {
      fileName: fileData.fileName,
      marketplace: fileData.marketplace,
      attributes: fileData.attributes,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileData.fileName.replace(/\.[^/.]+$/, "")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Downloading ${fileData.fileName} as JSON`,
    });
  };

  const handleReset = () => {
    setFilesData([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Marketplace Attribute Extractor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extract and manage product attributes from Amazon, Flipkart, and
              Myntra templates
            </p>
          </div>

          {/* Content */}
          {filesData.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />
              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Processing ZIP file...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filesData.length} file{filesData.length !== 1 ? "s" : ""}{" "}
                  extracted successfully
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Upload New ZIP
                </Button>
              </div>
              <FilesList
                filesData={filesData}
                onEdit={handleEdit}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>
      </div>

      <EditAttributesDialog
        fileData={editingFile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdits}
      />
    </div>
  );
};

export default Index;
