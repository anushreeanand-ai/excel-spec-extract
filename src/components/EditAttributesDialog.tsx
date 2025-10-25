import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileData, AttributeData } from "@/types/attributeData";
import { Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditAttributesDialogProps {
  fileData: FileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fileData: FileData) => void;
}

export const EditAttributesDialog = ({
  fileData,
  open,
  onOpenChange,
  onSave,
}: EditAttributesDialogProps) => {
  const [editedAttributes, setEditedAttributes] = useState<AttributeData[]>([]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && fileData) {
      setEditedAttributes(JSON.parse(JSON.stringify(fileData.attributes)));
    }
    onOpenChange(isOpen);
  };

  const handleSave = () => {
    if (!fileData) return;

    const updatedFileData: FileData = {
      ...fileData,
      attributes: editedAttributes,
    };

    onSave(updatedFileData);
    toast({
      title: "Changes Saved",
      description: `Updated ${fileData.fileName} successfully.`,
    });
    onOpenChange(false);
  };

  const updateAttribute = (
    index: number,
    field: keyof AttributeData,
    value: string
  ) => {
    const updated = [...editedAttributes];
    if (field === "allowedValues") {
      updated[index][field] = value.split(",").map((v) => v.trim());
    } else {
      updated[index][field] = value as any;
    }
    setEditedAttributes(updated);
  };

  if (!fileData) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            Edit Attributes - {fileData.fileName}
            <Badge variant="outline">{fileData.marketplace}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {editedAttributes.map((attr, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-muted/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Attribute {index + 1}</h3>
                  <Badge variant={attr.mandatory === "TRUE" ? "default" : "secondary"}>
                    {attr.mandatory === "TRUE" ? "Mandatory" : "Optional"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Attribute Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={attr.attributeName}
                      onChange={(e) =>
                        updateAttribute(index, "attributeName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`code-${index}`}>Attribute Code</Label>
                    <Input
                      id={`code-${index}`}
                      value={attr.attributeCode}
                      onChange={(e) =>
                        updateAttribute(index, "attributeCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`}>Type</Label>
                    <Input
                      id={`type-${index}`}
                      value={attr.type}
                      onChange={(e) =>
                        updateAttribute(index, "type", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`mandatory-${index}`}>Mandatory</Label>
                    <select
                      id={`mandatory-${index}`}
                      value={attr.mandatory}
                      onChange={(e) =>
                        updateAttribute(index, "mandatory", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="TRUE">TRUE</option>
                      <option value="FALSE">FALSE</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`allowed-${index}`}>
                      Allowed Values (comma-separated)
                    </Label>
                    <Input
                      id={`allowed-${index}`}
                      value={attr.allowedValues.join(", ")}
                      onChange={(e) =>
                        updateAttribute(index, "allowedValues", e.target.value)
                      }
                      placeholder="value1, value2, value3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
