import * as XLSX from "xlsx";
import { AttributeData } from "@/types/attributeData";

export const parseFlipkartFile = async (
  arrayBuffer: ArrayBuffer
): Promise<AttributeData[]> => {
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellStyles: true });

  // Get required sheets
  const sheet2 = workbook.Sheets[workbook.SheetNames[1]]; // 2nd sheet (index 1)
  const sheet3 = workbook.Sheets[workbook.SheetNames[2]]; // 3rd sheet (index 2)

  if (!sheet2 || !sheet3) {
    throw new Error("Required sheets not found in Flipkart template.");
  }

  const attributes: AttributeData[] = [];

  // Parse sheet3 to get all attributes from column G
  const sheet3Data = XLSX.utils.sheet_to_json(sheet3, {
    header: 1,
    defval: "",
  }) as any[][];

  // Parse sheet2 for allowed values
  const sheet2Data = XLSX.utils.sheet_to_json(sheet2, {
    header: 1,
    defval: "",
  }) as any[][];

  // Column G is index 6
  const columnGData: any[] = [];
  for (let row = 0; row < sheet3Data.length; row++) {
    if (sheet3Data[row][6]) {
      columnGData.push({
        row,
        value: sheet3Data[row][6],
        cell: `G${row + 1}`,
      });
    }
  }

  // Process attributes in pairs (row n: attribute name/code, row n+1: data type)
  for (let i = 0; i < columnGData.length; i += 2) {
    if (i + 1 >= columnGData.length) break;

    const attributeNameCode = columnGData[i].value?.toString().trim();
    const dataType = columnGData[i + 1].value?.toString().trim();

    if (!attributeNameCode || !dataType) continue;

    // Get allowed values from sheet2
    const allowedValues: string[] = [];
    for (let row = 1; row < sheet2Data.length; row++) {
      // Column D is index 3
      const sheet2AttributeName = sheet2Data[row][3]?.toString().trim();
      if (
        sheet2AttributeName &&
        sheet2AttributeName.toLowerCase() === attributeNameCode.toLowerCase()
      ) {
        // Get values from next rows in column D
        for (let j = row + 1; j < sheet2Data.length; j++) {
          const value = sheet2Data[j][3]?.toString().trim();
          if (value && value !== "") {
            allowedValues.push(value);
          } else {
            break; // Stop when empty cell is found
          }
        }
        break;
      }
    }

    // Get cell style to determine mandatory status
    const cellAddress = columnGData[i].cell;
    const cell = sheet3[cellAddress];
    let mandatory = "FALSE";

    if (cell && cell.s && cell.s.fgColor) {
      const bgColor = cell.s.fgColor.rgb;
      // Blue/Purple colors are mandatory, Green is not
      // Approximate RGB values for blue/purple vs green detection
      if (bgColor) {
        const colorHex = bgColor.toLowerCase();
        // Blue/Purple typically have higher blue component
        // Green has higher green component
        const isBlueOrPurple =
          colorHex.includes("00") || colorHex.includes("ff");
        const isGreen = colorHex.includes("0f") || colorHex.includes("9");

        if (isBlueOrPurple && !isGreen) {
          mandatory = "TRUE";
        }
      }
    }

    attributes.push({
      attributeName: attributeNameCode,
      attributeCode: attributeNameCode,
      type: dataType,
      allowedValues,
      mandatory,
    });
  }

  return attributes;
};
