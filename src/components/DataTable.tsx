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

export interface AttributeData {
  attributeName: string;
  attributeCode: string;
  type: string;
  allowedValues: string[];
  mandatory: boolean;
}

interface DataTableProps {
  data: AttributeData[];
}

export const DataTable = ({ data }: DataTableProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/50">
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
            {data.map((row, index) => (
              <TableRow
                key={index}
                className="hover:bg-accent/30 transition-colors"
              >
                <TableCell className="font-medium">{row.attributeName}</TableCell>
                <TableCell className="text-muted-foreground">
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
                    variant={row.mandatory ? "default" : "outline"}
                    className={
                      row.mandatory
                        ? "bg-secondary text-secondary-foreground"
                        : ""
                    }
                  >
                    {row.mandatory ? "Required" : "Optional"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
