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

    // Skip macOS system files
    if (path.includes("__MACOSX") || path.includes(".DS_Store")) {
      continue;
    }

    const pathParts = path.split("/");
    const fileName = pathParts[pathParts.length - 1];

    // Only process Excel files
    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".xlsm")
    ) {
      continue;
    }

    // Determine marketplace from filename or folder structure
    let marketplace: "Amazon" | "Flipkart" | "Myntra" | null = null;
    
    // Check if path or filename contains marketplace identifier (case-insensitive)
    const pathLower = path.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    if (pathLower.includes("amazon") || fileNameLower.includes("amazon")) {
      marketplace = "Amazon";
    } else if (pathLower.includes("flipkart") || fileNameLower.includes("flipkart")) {
      marketplace = "Flipkart";
    } else if (pathLower.includes("myntra") || fileNameLower.includes("myntra")) {
      marketplace = "Myntra";
    }

    console.log(`Processing file: ${fileName}, Path: ${path}, Detected marketplace: ${marketplace}`);

    // If no marketplace identified, skip this file
    if (!marketplace) {
      console.log(`Skipping file ${fileName} - no marketplace detected`);
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
