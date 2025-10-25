import JSZip from "jszip";
import { FileData } from "@/types/attributeData";
import { parseExcelFile } from "./excelParser";
import { parseFlipkartFile } from "./flipkartParser";
import { parseMyntraFile } from "./myntraParser";

export const parseZipFile = async (file: File): Promise<FileData[]> => {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);
  const filesData: FileData[] = [];

  // Process each folder
  for (const [path, zipEntry] of Object.entries(zipContent.files)) {
    if (zipEntry.dir) continue;

    // Determine marketplace from path
    const pathParts = path.split("/");
    if (pathParts.length < 2) continue;

    const marketplace = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];

    // Only process Excel files
    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".xlsm")
    ) {
      continue;
    }

    // Only process files in the three target folders
    if (
      marketplace !== "Amazon" &&
      marketplace !== "Flipkart" &&
      marketplace !== "Myntra"
    ) {
      continue;
    }

    try {
      const arrayBuffer = await zipEntry.async("arraybuffer");

      let attributes;
      if (marketplace === "Amazon") {
        // Convert ArrayBuffer to File for Amazon parser
        const blob = new Blob([arrayBuffer]);
        const excelFile = new File([blob], fileName);
        attributes = await parseExcelFile(excelFile);
      } else if (marketplace === "Flipkart") {
        attributes = await parseFlipkartFile(arrayBuffer);
      } else if (marketplace === "Myntra") {
        attributes = await parseMyntraFile(arrayBuffer);
      } else {
        continue;
      }

      filesData.push({
        fileName,
        marketplace: marketplace as "Amazon" | "Flipkart" | "Myntra",
        attributes,
      });
    } catch (error) {
      console.error(`Error parsing file ${fileName}:`, error);
      // Continue processing other files
    }
  }

  return filesData;
};
