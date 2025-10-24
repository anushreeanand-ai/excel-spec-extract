import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";

export interface AttributeData {
  attributeName: string;
  attributeCode: string;
  type: string;
  allowedValues: string[];
  mandatory: string;
}

interface DataTableProps {
  data: AttributeData[];
}

export const DataTable = ({ data }: DataTableProps) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ROWS = 5;

  if (data.length === 0) {
    return null;
  }

  const displayedData = showAll ? data : data.slice(0, INITIAL_ROWS);
  const hasMore = data.length > INITIAL_ROWS;

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `amazon-attributes-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleDownloadJSON}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download JSON
        </Button>
      </div>
      
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">
                  Attribute Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Attribute Code
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Type
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Allowed Values
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Mandatory
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{row.attributeName}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {row.attributeCode}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {row.allowedValues.length > 0 ? (
                        row.allowedValues.slice(0, 3).map((value, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {value}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No restrictions
                        </span>
                      )}
                      {row.allowedValues.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{row.allowedValues.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.mandatory === "TRUE" ? "default" : "outline"}
                      className={
                        row.mandatory === "TRUE"
                          ? "bg-secondary text-secondary-foreground"
                          : ""
                      }
                    >
                      {row.mandatory}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasMore && !showAll && (
          <div className="border-t border-border/50 bg-muted/20 p-4 flex justify-center">
            <Button
              onClick={() => setShowAll(true)}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              View More ({data.length - INITIAL_ROWS} more)
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
