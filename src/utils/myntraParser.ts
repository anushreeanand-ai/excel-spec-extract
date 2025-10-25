import * as XLSX from "xlsx";
import { AttributeData } from "@/types/attributeData";

// Myntra parser - assuming similar structure to Amazon for now
// Can be customized based on actual Myntra template structure
export const parseMyntraFile = async (
  arrayBuffer: ArrayBuffer
): Promise<AttributeData[]> => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // For now, using Amazon-like parsing
  // This can be updated based on actual Myntra template format
  const templateSheet = workbook.Sheets["Template"];
  const validValuesSheet = workbook.Sheets["Valid Values"];
  const dataDefinitionsSheet = workbook.Sheets["Data Definitions"];

  if (!templateSheet) {
    throw new Error("Template sheet not found in Myntra file.");
  }

  const templateData = XLSX.utils.sheet_to_json(templateSheet, {
    header: 1,
    defval: "",
  }) as string[][];

  const validValuesData = validValuesSheet
    ? (XLSX.utils.sheet_to_json(validValuesSheet, {
        header: 1,
        defval: "",
      }) as string[][])
    : [];

  const dataDefinitionsData = dataDefinitionsSheet
    ? (XLSX.utils.sheet_to_json(dataDefinitionsSheet, {
        header: 1,
        defval: "",
      }) as string[][])
    : [];

  const attributes: AttributeData[] = [];
  const columnCount = templateData[0]?.length || 0;

  for (let col = 0; col < columnCount; col++) {
    const attributeName = templateData[1]?.[col]?.toString().trim();
    const attributeCode = templateData[2]?.[col]?.toString().trim();

    if (!attributeName || !attributeCode) continue;

    const allowedValues: string[] = [];

    for (const row of validValuesData) {
      const validValuesAttributeName = row[1]?.toString().trim();
      if (!validValuesAttributeName) continue;

      const isMatch = validValuesAttributeName
        .toLowerCase()
        .startsWith(attributeName.toLowerCase());

      if (isMatch) {
        for (let i = 2; i < row.length; i++) {
          const value = row[i]?.toString().trim();
          if (value && value !== "") {
            allowedValues.push(value);
          }
        }
        break;
      }
    }

    const type = allowedValues.length > 0 ? "List" : "Short Text";

    let mandatory = "FALSE";
    for (let i = 3; i < dataDefinitionsData.length; i++) {
      const row = dataDefinitionsData[i];
      if (row[1]?.toString().trim() === attributeCode) {
        const mandatoryStatus = row[6]?.toString().trim().toLowerCase();
        mandatory =
          mandatoryStatus === "required" || mandatoryStatus === "preferred"
            ? "TRUE"
            : "FALSE";
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

  return attributes;
};
