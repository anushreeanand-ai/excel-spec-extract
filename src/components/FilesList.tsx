import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileData } from "@/types/attributeData";
import { FileText, Download, Edit } from "lucide-react";

interface FilesListProps {
  filesData: FileData[];
  onEdit: (fileData: FileData) => void;
  onDownload: (fileData: FileData) => void;
}

export const FilesList = ({ filesData, onEdit, onDownload }: FilesListProps) => {
  const getMarketplaceBadgeVariant = (marketplace: string) => {
    switch (marketplace) {
      case "Amazon":
        return "default";
      case "Flipkart":
        return "secondary";
      case "Myntra":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-2xl font-semibold flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          Extracted Files
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {filesData.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {fileData.fileName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {fileData.attributes.length} attributes extracted
                  </p>
                </div>
                <Badge variant={getMarketplaceBadgeVariant(fileData.marketplace)}>
                  {fileData.marketplace}
                </Badge>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(fileData)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onDownload(fileData)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
