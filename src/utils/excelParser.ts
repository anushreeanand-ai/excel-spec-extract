import * as XLSX from "xlsx";
import { AttributeData } from "@/components/DataTable";

export const parseExcelFile = async (file: File): Promise<AttributeData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Get the three required sheets
        const templateSheet = workbook.Sheets["Template"];
        const validValuesSheet = workbook.Sheets["Valid Values"];
        const dataDefinitionsSheet = workbook.Sheets["Data Definitions"];

        if (!templateSheet || !validValuesSheet || !dataDefinitionsSheet) {
          throw new Error(
            "Required sheets not found. Please ensure Template, Valid Values, and Data Definitions sheets exist."
          );
        }

        // Parse Template sheet
        const templateData = XLSX.utils.sheet_to_json(templateSheet, {
          header: 1,
          defval: "",
        }) as string[][];

        // Parse Valid Values sheet
        const validValuesData = XLSX.utils.sheet_to_json(validValuesSheet, {
          header: 1,
          defval: "",
        }) as string[][];

        // Parse Data Definitions sheet
        const dataDefinitionsData = XLSX.utils.sheet_to_json(
          dataDefinitionsSheet,
          { header: 1, defval: "" }
        ) as string[][];

        const attributes: AttributeData[] = [];

        // Get column count from template sheet (starting from column index 0)
        const columnCount = templateData[0]?.length || 0;

        for (let col = 0; col < columnCount; col++) {
          // Row index 1 = 2nd row (Attribute Name)
          const attributeName = templateData[1]?.[col]?.toString().trim();
          
          // Row index 2 = 3rd row (Attribute Code)
          const attributeCode = templateData[2]?.[col]?.toString().trim();

          // Skip if no attribute name or code
          if (!attributeName || !attributeCode) continue;

          // Row index 3 = 4th row (Data Type)
          // Check if there's a dropdown (data validation) in this column
          const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
          const cell = templateSheet[cellAddress];
          
          // Determine type based on data validation
          let type = "short text";
          if (cell && cell.v && typeof cell.v === "string") {
            // If the cell contains specific indicators or if we can detect validation
            // For simplicity, we'll check if there are corresponding allowed values
            const hasAllowedValues = validValuesData.some(
              (row) => row[1]?.toString().trim() === attributeName
            );
            if (hasAllowedValues) {
              type = "list";
            }
          }

          // Get allowed values from Valid Values sheet
          const allowedValues: string[] = [];
          
          for (const row of validValuesData) {
            // Column B (index 1) has the attribute name
            const validValuesAttributeName = row[1]?.toString().trim();
            
            if (!validValuesAttributeName) continue;
            
            // Check if Valid Values attribute name starts with Template attribute name
            // e.g., "Update Delete" matches "Update Delete - [ dress ]"
            const isMatch = validValuesAttributeName.toLowerCase().startsWith(attributeName.toLowerCase());
            
            if (isMatch) {
              // Columns C onwards (index 2+) have the allowed values
              for (let i = 2; i < row.length; i++) {
                const value = row[i]?.toString().trim();
                if (value && value !== "") {
                  allowedValues.push(value);
                }
              }
              break; // Stop after finding the matching attribute
            }
          }

          // Get mandatory status from Data Definitions sheet
          let mandatory = false;
          // Starting from row 4 (index 3)
          for (let i = 3; i < dataDefinitionsData.length; i++) {
            const row = dataDefinitionsData[i];
            // Column B (index 1) has Attribute Code
            // Column G (index 6) has mandatory status
            if (row[1]?.toString().trim() === attributeCode) {
              const mandatoryStatus = row[6]?.toString().trim().toLowerCase();
              mandatory =
                mandatoryStatus === "required" ||
                mandatoryStatus === "preferred";
              break;
            }
          }

          attributes.push({
            attributeName,
            attributeCode,
            type,
            allowedValues,
            mandatory,
          });
        }

        resolve(attributes);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
};
