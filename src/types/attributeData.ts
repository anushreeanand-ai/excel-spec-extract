export interface AttributeData {
  attributeName: string;
  attributeCode: string;
  type: string;
  allowedValues: string[];
  mandatory: string;
}

export interface FileData {
  fileName: string;
  marketplace: "Amazon" | "Flipkart" | "Myntra";
  attributes: AttributeData[];
}
